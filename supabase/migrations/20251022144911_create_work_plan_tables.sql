/*
  # Create Work Plan and Activity Tracking Tables

  1. New Tables
    - `work_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users)
      - `month` (text, format: 'YYYY-MM')
      - `year` (integer)
      - `status` (text: 'draft', 'submitted', 'approved', 'rejected')
      - `created_by` (uuid, reference to auth.users - TSM who created it)
      - `approved_by` (uuid, reference to auth.users - supervisor who approved)
      - `total_planned` (integer)
      - `total_completed` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `approved_at` (timestamptz)

    - `activity_types`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text: 'mdo_activity', 'employee_activity')
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `planned_activities`
      - `id` (uuid, primary key)
      - `work_plan_id` (uuid, reference to work_plans)
      - `activity_type_id` (uuid, reference to activity_types)
      - `planned_count` (integer)
      - `completed_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `activity_logs`
      - `id` (uuid, primary key)
      - `work_plan_id` (uuid, reference to work_plans)
      - `activity_type_id` (uuid, reference to activity_types)
      - `user_id` (uuid, reference to auth.users)
      - `date` (date)
      - `location` (text)
      - `distributor_name` (text)
      - `retailer_name` (text, optional)
      - `village_name` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `notes` (text)
      - `photos` (jsonb, array of photo URLs)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users)
      - `date` (date)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `start_latitude` (decimal)
      - `start_longitude` (decimal)
      - `end_latitude` (decimal)
      - `end_longitude` (decimal)
      - `total_hours` (decimal)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for supervisors to view/approve subordinate work plans
*/

-- Create work_plans table
CREATE TABLE IF NOT EXISTS work_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  total_planned integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  UNIQUE(user_id, month, year)
);

ALTER TABLE work_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own work plans"
  ON work_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = created_by OR auth.uid() = approved_by);

CREATE POLICY "Users can create own work plans"
  ON work_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work plans"
  ON work_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own draft work plans"
  ON work_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft');

-- Create activity_types table
CREATE TABLE IF NOT EXISTS activity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('mdo_activity', 'employee_activity')),
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active activity types"
  ON activity_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create planned_activities table
CREATE TABLE IF NOT EXISTS planned_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_plan_id uuid REFERENCES work_plans(id) ON DELETE CASCADE NOT NULL,
  activity_type_id uuid REFERENCES activity_types(id) NOT NULL,
  planned_count integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(work_plan_id, activity_type_id)
);

ALTER TABLE planned_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for their work plans"
  ON planned_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = planned_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid() OR work_plans.approved_by = auth.uid())
    )
  );

CREATE POLICY "Users can create activities for their work plans"
  ON planned_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = planned_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can update activities for their work plans"
  ON planned_activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = planned_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = planned_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can delete activities for their work plans"
  ON planned_activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = planned_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
      AND work_plans.status = 'draft'
    )
  );

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_plan_id uuid REFERENCES work_plans(id) ON DELETE CASCADE NOT NULL,
  activity_type_id uuid REFERENCES activity_types(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  location text DEFAULT '',
  distributor_name text DEFAULT '',
  retailer_name text DEFAULT '',
  village_name text DEFAULT '',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  notes text DEFAULT '',
  photos jsonb DEFAULT '[]'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs"
  ON activity_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs"
  ON activity_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  start_time timestamptz,
  end_time timestamptz,
  start_latitude decimal(10, 8),
  start_longitude decimal(11, 8),
  end_latitude decimal(10, 8),
  end_longitude decimal(11, 8),
  total_hours decimal(5, 2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default activity types
INSERT INTO activity_types (name, category, description) VALUES
  ('Farmer Meeting - Small', 'mdo_activity', 'Small group farmer meeting'),
  ('Farmer Meeting - Large', 'mdo_activity', 'Large group farmer meeting'),
  ('Demo - Organised', 'mdo_activity', 'Organized product demonstration'),
  ('Demo - Spot Demo', 'mdo_activity', 'On-the-spot product demonstration'),
  ('Jeep Campaign', 'mdo_activity', 'Mobile jeep campaign'),
  ('Field Days', 'mdo_activity', 'Field day event'),
  ('Individual Farmer Connect', 'mdo_activity', 'One-on-one farmer connection'),
  ('Farmer Meeting - Small', 'employee_activity', 'Small group farmer meeting'),
  ('Farmer Meeting - Large', 'employee_activity', 'Large group farmer meeting'),
  ('Demo - Organised', 'employee_activity', 'Organized product demonstration'),
  ('Demo - Spot Demo', 'employee_activity', 'On-the-spot product demonstration'),
  ('Jeep Campaign', 'employee_activity', 'Mobile jeep campaign'),
  ('Field Days', 'employee_activity', 'Field day event'),
  ('Individual Farmer Connect', 'employee_activity', 'One-on-one farmer connection'),
  ('Team Meeting', 'employee_activity', 'Team meeting with colleagues'),
  ('Distributor Meeting', 'employee_activity', 'Meeting with distributor'),
  ('Retailer Meeting', 'employee_activity', 'Meeting with retailer')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_plans_user_id ON work_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_work_plans_status ON work_plans(status);
CREATE INDEX IF NOT EXISTS idx_work_plans_month_year ON work_plans(month, year);
CREATE INDEX IF NOT EXISTS idx_planned_activities_work_plan_id ON planned_activities(work_plan_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);