/*
  # Create Admin and User Management System
  
  ## Overview
  This migration creates a comprehensive admin system with:
  - sfaadmin super user with MD-level access to all India data
  - User management (enable/disable users)
  - User data reassignment (transfer data from old user to new user)
  - User activity tracking and login history
  - Usage reports and analytics
  
  ## Tables Created
  
  ### 1. `system_users`
  Manages all system users with their status and permissions
  - User details (email, name, role, territory, etc.)
  - Status (active/inactive)
  - Admin flags
  - Hierarchy information
  
  ### 2. `user_login_history`
  Tracks all user login sessions
  - Login/logout timestamps
  - Session duration
  - Device/browser information
  - IP address
  
  ### 3. `user_activity_logs`
  Tracks user actions and activities
  - Action type (view, create, update, delete)
  - Module/page accessed
  - Timestamp and duration
  - Metadata
  
  ### 4. `user_data_reassignments`
  Tracks data transfers between users
  - Old user → New user mapping
  - Data types transferred
  - Reassignment reason and date
  - Performed by (admin)
  
  ## Key Features
  - sfaadmin can see all India data like MD
  - Enable/disable any user
  - Reassign user data to new assignee
  - View login history and usage reports
  - Comprehensive audit trail
*/

-- Create system_users table
CREATE TABLE IF NOT EXISTS system_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL, -- Auth user ID or custom ID
  email text UNIQUE NOT NULL,
  password_hash text, -- For custom auth
  full_name text NOT NULL,
  role text NOT NULL, -- MD, VP, MH, RMM, ZBH, RBH, MDO, SO, TSM, sfaadmin
  
  -- Hierarchy and Territory
  territory text,
  zone text,
  state text,
  region text,
  branch text,
  
  -- Status and Permissions
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  is_super_admin boolean DEFAULT false, -- For sfaadmin
  
  -- Reporting Structure
  reports_to_user_id text,
  
  -- Metadata
  phone_number text,
  employee_code text,
  joining_date timestamptz DEFAULT now(),
  last_login_at timestamptz,
  login_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  disabled_at timestamptz,
  disabled_by text,
  disable_reason text
);

-- Create user_login_history table
CREATE TABLE IF NOT EXISTS user_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  
  login_time timestamptz DEFAULT now(),
  logout_time timestamptz,
  session_duration integer, -- in seconds
  
  -- Device/Browser Info
  device_type text, -- mobile, tablet, desktop
  browser text,
  operating_system text,
  ip_address text,
  
  -- Location (if available)
  login_location text,
  latitude numeric,
  longitude numeric,
  
  created_at timestamptz DEFAULT now()
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  
  action_type text NOT NULL, -- view, create, update, delete, login, logout
  module text NOT NULL, -- dashboard, liquidation, reports, etc.
  page_path text,
  
  action_details jsonb, -- Additional metadata about the action
  
  timestamp timestamptz DEFAULT now(),
  session_id text,
  
  created_at timestamptz DEFAULT now()
);

-- Create user_data_reassignments table
CREATE TABLE IF NOT EXISTS user_data_reassignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  old_user_id text NOT NULL,
  old_user_email text NOT NULL,
  old_user_name text NOT NULL,
  old_user_role text NOT NULL,
  
  new_user_id text NOT NULL,
  new_user_email text NOT NULL,
  new_user_name text NOT NULL,
  new_user_role text NOT NULL,
  
  reassignment_type text NOT NULL, -- 'full_transfer', 'partial_transfer', 'backup'
  data_types_transferred text[], -- Array: ['work_plans', 'liquidations', 'verifications', 'travel_claims']
  
  reason text NOT NULL,
  notes text,
  
  performed_by_id text NOT NULL,
  performed_by_name text NOT NULL,
  reassignment_date timestamptz DEFAULT now(),
  
  -- Affected records count
  records_transferred jsonb, -- {"work_plans": 10, "liquidations": 25, etc.}
  
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_user_id ON system_users(user_id);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users(role);
CREATE INDEX IF NOT EXISTS idx_system_users_is_active ON system_users(is_active);
CREATE INDEX IF NOT EXISTS idx_system_users_reports_to ON system_users(reports_to_user_id);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON user_login_history(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON user_login_history(email);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON user_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON user_activity_logs(module);

CREATE INDEX IF NOT EXISTS idx_reassignments_old_user ON user_data_reassignments(old_user_id);
CREATE INDEX IF NOT EXISTS idx_reassignments_new_user ON user_data_reassignments(new_user_id);
CREATE INDEX IF NOT EXISTS idx_reassignments_date ON user_data_reassignments(reassignment_date DESC);

-- Enable Row Level Security
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data_reassignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_users

CREATE POLICY "Anyone can view system users"
  ON system_users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert system users"
  ON system_users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update system users"
  ON system_users FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_login_history

CREATE POLICY "Anyone can view login history"
  ON user_login_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert login history"
  ON user_login_history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update login history"
  ON user_login_history FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_activity_logs

CREATE POLICY "Anyone can view activity logs"
  ON user_activity_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert activity logs"
  ON user_activity_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for user_data_reassignments

CREATE POLICY "Anyone can view reassignments"
  ON user_data_reassignments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create reassignments"
  ON user_data_reassignments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert sfaadmin super user
INSERT INTO system_users (
  user_id,
  email,
  password_hash,
  full_name,
  role,
  territory,
  zone,
  state,
  region,
  is_active,
  is_admin,
  is_super_admin,
  employee_code
) VALUES (
  'sfaadmin',
  'sfaadmin@gencrest.com',
  'sfaadmin', -- In production, this should be properly hashed
  'SFA Administrator',
  'sfaadmin',
  'All India',
  'All Zones',
  'All States',
  'All Regions',
  true,
  true,
  true,
  'ADMIN001'
) ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  is_super_admin = true,
  updated_at = now();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for system_users
DROP TRIGGER IF EXISTS update_system_users_updated_at ON system_users;
CREATE TRIGGER update_system_users_updated_at
  BEFORE UPDATE ON system_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id text,
  p_email text,
  p_role text,
  p_action_type text,
  p_module text,
  p_page_path text DEFAULT NULL,
  p_action_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    email,
    role,
    action_type,
    module,
    page_path,
    action_details
  ) VALUES (
    p_user_id,
    p_email,
    p_role,
    p_action_type,
    p_module,
    p_page_path,
    p_action_details
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_logins', COUNT(DISTINCT l.id),
    'last_login', MAX(l.login_time),
    'total_activities', (SELECT COUNT(*) FROM user_activity_logs WHERE user_id = p_user_id),
    'active_days', COUNT(DISTINCT DATE(l.login_time)),
    'avg_session_duration', AVG(l.session_duration),
    'most_used_module', (
      SELECT module 
      FROM user_activity_logs 
      WHERE user_id = p_user_id 
      GROUP BY module 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  ) INTO result
  FROM user_login_history l
  WHERE l.user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Seed some sample users for testing
INSERT INTO system_users (user_id, email, full_name, role, territory, zone, state, region, is_active, employee_code) VALUES
  ('user_md_001', 'md@gencrest.com', 'Managing Director', 'MD', 'All India', 'All Zones', 'All States', 'All Regions', true, 'MD001'),
  ('user_vp_001', 'vp@gencrest.com', 'Vice President', 'VP', 'All India', 'All Zones', 'All States', 'All Regions', true, 'VP001'),
  ('user_mh_001', 'mh@gencrest.com', 'Marketing Head', 'MH', 'North India', 'North Zone', 'All States', 'North Region', true, 'MH001'),
  ('user_rmm_001', 'rmm@gencrest.com', 'Regional Marketing Manager', 'RMM', 'North India', 'North Zone', 'Delhi', 'North Region', true, 'RMM001'),
  ('user_zbh_001', 'zbh@gencrest.com', 'Zonal Business Head', 'ZBH', 'North India', 'North Zone', 'Delhi', 'North Region', true, 'ZBH001'),
  ('user_rbh_001', 'rbh@gencrest.com', 'Regional Business Head', 'RBH', 'North India', 'North Zone', 'Delhi', 'Delhi NCR', true, 'RBH001'),
  ('user_mdo_001', 'mdo1@gencrest.com', 'Market Development Officer 1', 'MDO', 'North Delhi', 'North Zone', 'Delhi', 'Delhi NCR', true, 'MDO001'),
  ('user_mdo_002', 'mdo2@gencrest.com', 'Market Development Officer 2', 'MDO', 'South Delhi', 'North Zone', 'Delhi', 'Delhi NCR', true, 'MDO002'),
  ('user_so_001', 'so1@gencrest.com', 'Sales Officer 1', 'SO', 'East Delhi', 'North Zone', 'Delhi', 'Delhi NCR', true, 'SO001'),
  ('user_tsm_001', 'tsm1@gencrest.com', 'Territory Sales Manager 1', 'TSM', 'West Delhi', 'North Zone', 'Delhi', 'Delhi NCR', true, 'TSM001')
ON CONFLICT (email) DO NOTHING;
