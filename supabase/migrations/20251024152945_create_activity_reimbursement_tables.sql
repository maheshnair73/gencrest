/*
  # Create Activity Reimbursement Tables

  1. New Tables
    - `activity_reimbursements`
      - `id` (uuid, primary key)
      - `employee_id` (text, references user who submitted)
      - `employee_name` (text)
      - `activity_name` (text)
      - `activity_type` (text) - Farmer Meeting, Dealer Meet, Product Demo, etc.
      - `activity_date` (date)
      - `attendees` (text) - Description of attendees
      - `attendee_count` (integer) - Number of attendees
      - `outcome` (text) - Description of activity outcome
      - `amount` (decimal) - Reimbursement amount
      - `status` (text) - Pending, Approved, Rejected
      - `submitted_date` (timestamptz)
      - `approved_by` (text, nullable)
      - `approved_date` (timestamptz, nullable)
      - `remarks` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `activity_reimbursements` table
    - Add policies for users to manage their own reimbursements
    - Add policies for managers to view and approve reimbursements
*/

-- Create activity_reimbursements table
CREATE TABLE IF NOT EXISTS activity_reimbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  activity_name text NOT NULL,
  activity_type text NOT NULL,
  activity_date date NOT NULL,
  attendees text NOT NULL,
  attendee_count integer NOT NULL DEFAULT 0,
  outcome text NOT NULL,
  amount decimal(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  submitted_date timestamptz NOT NULL DEFAULT now(),
  approved_by text,
  approved_date timestamptz,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activity_reimbursements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity reimbursements
CREATE POLICY "Users can view own activity reimbursements"
  ON activity_reimbursements
  FOR SELECT
  TO authenticated
  USING (employee_id = current_setting('request.jwt.claims', true)::json->>'employee_code');

-- Policy: Users can insert their own activity reimbursements
CREATE POLICY "Users can insert own activity reimbursements"
  ON activity_reimbursements
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = current_setting('request.jwt.claims', true)::json->>'employee_code');

-- Policy: Users can update their own pending activity reimbursements
CREATE POLICY "Users can update own pending activity reimbursements"
  ON activity_reimbursements
  FOR UPDATE
  TO authenticated
  USING (
    employee_id = current_setting('request.jwt.claims', true)::json->>'employee_code'
    AND status = 'Pending'
  )
  WITH CHECK (
    employee_id = current_setting('request.jwt.claims', true)::json->>'employee_code'
    AND status = 'Pending'
  );

-- Policy: Users can delete their own pending activity reimbursements
CREATE POLICY "Users can delete own pending activity reimbursements"
  ON activity_reimbursements
  FOR DELETE
  TO authenticated
  USING (
    employee_id = current_setting('request.jwt.claims', true)::json->>'employee_code'
    AND status = 'Pending'
  );

-- Policy: Managers can view all activity reimbursements in their hierarchy
CREATE POLICY "Managers can view team activity reimbursements"
  ON activity_reimbursements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.employee_code = current_setting('request.jwt.claims', true)::json->>'employee_code'
      AND users.role IN ('TSM', 'RBH', 'ZBH', 'RMM', 'VP', 'CFO', 'CHRO', 'MH', 'MD')
    )
  );

-- Policy: Managers can update activity reimbursement status
CREATE POLICY "Managers can approve/reject activity reimbursements"
  ON activity_reimbursements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.employee_code = current_setting('request.jwt.claims', true)::json->>'employee_code'
      AND users.role IN ('TSM', 'RBH', 'ZBH', 'RMM', 'VP', 'CFO', 'CHRO', 'MH', 'MD')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.employee_code = current_setting('request.jwt.claims', true)::json->>'employee_code'
      AND users.role IN ('TSM', 'RBH', 'ZBH', 'RMM', 'VP', 'CFO', 'CHRO', 'MH', 'MD')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_reimbursements_employee_id ON activity_reimbursements(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_reimbursements_status ON activity_reimbursements(status);
CREATE INDEX IF NOT EXISTS idx_activity_reimbursements_activity_date ON activity_reimbursements(activity_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_activity_reimbursements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_reimbursements_updated_at
  BEFORE UPDATE ON activity_reimbursements
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_reimbursements_updated_at();
