/*
  # Create Advanced Work Plan (AWP) System
  
  1. New Tables
    - `activity_categories`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., 'Internal Meetings', 'Farmer BTL Engagement', 'Channel BTL Engagement'
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `activity_heads`
      - `id` (uuid, primary key)
      - `category_id` (uuid, reference to activity_categories)
      - `name` (text) - e.g., 'Team Meetings', 'Field Days', 'Trade Merchandise'
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `awp_activities`
      - `id` (uuid, primary key)
      - `created_by` (uuid, reference to auth.users - TSM/RMM who created)
      - `assigned_to` (uuid, reference to auth.users - MDO/TSM who will execute)
      - `activity_head_id` (uuid, reference to activity_heads)
      - `date` (date)
      - `time` (text)
      - `location` (text)
      - `village` (text)
      - `distributor` (text)
      - `retailer` (text, optional)
      - `target_numbers` (text) - e.g., 'number of dealers, retailers, farmers'
      - `notes` (text)
      - `status` (text: 'pending', 'approved', 'rejected', 'completed')
      - `approved_by` (uuid, reference to auth.users)
      - `approved_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - TSM/RMM can create AWP for their MDOs
    - MDOs can view their assigned AWPs
    - TSM needs approval from RMM/RBH/ZBH for their own activities
    
  3. Data
    - Insert activity categories and heads from the document
*/

-- Create activity_categories table
CREATE TABLE IF NOT EXISTS activity_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active activity categories"
  ON activity_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create activity_heads table
CREATE TABLE IF NOT EXISTS activity_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES activity_categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

ALTER TABLE activity_heads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active activity heads"
  ON activity_heads FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create awp_activities table
CREATE TABLE IF NOT EXISTS awp_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  assigned_to uuid REFERENCES auth.users(id) NOT NULL,
  activity_head_id uuid REFERENCES activity_heads(id) NOT NULL,
  date date NOT NULL,
  time text DEFAULT '',
  location text DEFAULT '',
  village text DEFAULT '',
  distributor text DEFAULT '',
  retailer text DEFAULT '',
  target_numbers text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE awp_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned AWP activities"
  ON awp_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to OR auth.uid() = created_by OR auth.uid() = approved_by);

CREATE POLICY "TSM/RMM can create AWP activities"
  ON awp_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "TSM/RMM can update their created AWP activities"
  ON awp_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = approved_by)
  WITH CHECK (auth.uid() = created_by OR auth.uid() = approved_by);

CREATE POLICY "TSM/RMM can delete pending AWP activities"
  ON awp_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'pending');

-- Insert activity categories
INSERT INTO activity_categories (name) VALUES
  ('Internal Meetings'),
  ('Farmer BTL Engagement'),
  ('Channel BTL Engagement')
ON CONFLICT (name) DO NOTHING;

-- Insert activity heads for Internal Meetings
INSERT INTO activity_heads (category_id, name)
SELECT id, 'Team Meetings' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Farmer Meets – Small' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Farmer Meets – Large' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Farm level demos' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Wall Paintings' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Jeep Campaigns' FROM activity_categories WHERE name = 'Internal Meetings'
ON CONFLICT DO NOTHING;

-- Insert activity heads for Farmer BTL Engagement
INSERT INTO activity_heads (category_id, name)
SELECT id, 'Field Days' FROM activity_categories WHERE name = 'Farmer BTL Engagement'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Distributor Day Training Program (25 dealers max)' FROM activity_categories WHERE name = 'Farmer BTL Engagement'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Retailer Day Training Program (50 retailers max)' FROM activity_categories WHERE name = 'Farmer BTL Engagement'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Distributor Connect Meeting (Overnight Stay)' FROM activity_categories WHERE name = 'Farmer BTL Engagement'
ON CONFLICT DO NOTHING;

INSERT INTO activity_heads (category_id, name)
SELECT id, 'Dealer/Retailer Store Branding' FROM activity_categories WHERE name = 'Farmer BTL Engagement'
ON CONFLICT DO NOTHING;

-- Insert activity heads for Channel BTL Engagement
INSERT INTO activity_heads (category_id, name)
SELECT id, 'Trade Merchandise' FROM activity_categories WHERE name = 'Channel BTL Engagement'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_heads_category_id ON activity_heads(category_id);
CREATE INDEX IF NOT EXISTS idx_awp_activities_assigned_to ON awp_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_awp_activities_created_by ON awp_activities(created_by);
CREATE INDEX IF NOT EXISTS idx_awp_activities_date ON awp_activities(date);
CREATE INDEX IF NOT EXISTS idx_awp_activities_status ON awp_activities(status);
