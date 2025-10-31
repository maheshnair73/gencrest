/*
  # Create Scheduled Activities Table

  1. Purpose
    - Bridge the gap between planned_activities (counts) and activity_logs (completed)
    - Store activities with specific dates, times, and locations BEFORE execution
    - Enable calendar view of upcoming activities

  2. New Tables
    - `scheduled_activities`
      - `id` (uuid, primary key)
      - `work_plan_id` (uuid, reference to work_plans)
      - `planned_activity_id` (uuid, reference to planned_activities)
      - `activity_type_id` (uuid, reference to activity_types)
      - `scheduled_date` (date) - when the activity is scheduled
      - `scheduled_time` (time) - time of day
      - `location` (text) - venue/location name
      - `village_name` (text) - village/area name
      - `distributor_name` (text, optional)
      - `retailer_name` (text, optional)
      - `expected_outcome` (text) - what is expected from this activity
      - `status` (text: 'pending', 'in_progress', 'completed', 'cancelled')
      - `activity_log_id` (uuid, reference to activity_logs) - links to completed log
      - `notes` (text) - additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on `scheduled_activities` table
    - Users can view/manage activities for their work plans
    - Supervisors can view subordinate activities
*/

-- Create scheduled_activities table
CREATE TABLE IF NOT EXISTS scheduled_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_plan_id uuid REFERENCES work_plans(id) ON DELETE CASCADE NOT NULL,
  planned_activity_id uuid REFERENCES planned_activities(id) ON DELETE CASCADE,
  activity_type_id uuid REFERENCES activity_types(id) NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  location text DEFAULT '',
  village_name text DEFAULT '',
  distributor_name text DEFAULT '',
  retailer_name text DEFAULT '',
  expected_outcome text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  activity_log_id uuid REFERENCES activity_logs(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scheduled activities for their work plans"
  ON scheduled_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = scheduled_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid() OR work_plans.approved_by = auth.uid())
    )
  );

CREATE POLICY "Users can create scheduled activities for their work plans"
  ON scheduled_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = scheduled_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can update scheduled activities for their work plans"
  ON scheduled_activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = scheduled_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = scheduled_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can delete scheduled activities for their work plans"
  ON scheduled_activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_plans
      WHERE work_plans.id = scheduled_activities.work_plan_id
      AND (work_plans.user_id = auth.uid() OR work_plans.created_by = auth.uid())
      AND status IN ('pending', 'cancelled')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_work_plan_id ON scheduled_activities(work_plan_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_scheduled_date ON scheduled_activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_status ON scheduled_activities(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_activity_type_id ON scheduled_activities(activity_type_id);
