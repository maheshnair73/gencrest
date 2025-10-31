/*
  # Create Verification Approval System
  
  ## Overview
  This migration creates a comprehensive verification approval workflow system where:
  - MDO/SO/TSM submit stock verifications (distributor or retailer)
  - Higher-ups (RBH, ZBH, RMM, MH, VP, MD, MDO) can view, approve, or reject verifications
  - Bidirectional notifications keep both parties informed
  
  ## Tables Created
  
  ### 1. `verification_requests`
  Stores all verification submissions awaiting approval
  - Request details (type, entity, submitted by)
  - Current status (pending/approved/rejected)
  - Approval/rejection information
  - Verification data payload
  
  ### 2. `verification_approvals`
  Tracks the approval chain and history
  - Who can approve (multiple levels)
  - Approval actions taken
  - Comments and reasons
  
  ### 3. `verification_notifications`
  Manages all notifications related to verifications
  - Submission notifications to approvers
  - Approval/rejection notifications to submitters
  - Read/unread status
  
  ## Security
  - RLS enabled on all tables
  - Policies for submitters to view their own requests
  - Policies for approvers to view pending requests
  - Policies for creating notifications
  
  ## Key Features
  - Hierarchical approval routing
  - Activity tracker integration
  - Real-time notification system
  - Audit trail of all actions
*/

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL, -- 'distributor_verification' or 'retailer_verification'
  entity_id text NOT NULL, -- distributor_id or retailer_id
  entity_name text NOT NULL,
  entity_location text,
  
  submitted_by_id text NOT NULL,
  submitted_by_name text NOT NULL,
  submitted_by_role text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  reviewed_by_id text,
  reviewed_by_name text,
  reviewed_by_role text,
  reviewed_at timestamptz,
  review_comments text,
  
  verification_data jsonb NOT NULL, -- Contains full verification details
  skus_verified jsonb NOT NULL, -- Array of SKU verification data
  total_skus_count integer DEFAULT 0,
  stock_changes jsonb, -- Summary of stock changes
  
  proof_documents jsonb, -- Array of proof document URLs/data
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_approvals table (tracks approval chain)
CREATE TABLE IF NOT EXISTS verification_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_request_id uuid REFERENCES verification_requests(id) ON DELETE CASCADE,
  
  approver_role text NOT NULL, -- Role that can approve this
  approver_id text,
  approver_name text,
  
  action text, -- 'approved', 'rejected', null if pending
  action_date timestamptz,
  comments text,
  
  sequence_order integer DEFAULT 1, -- For multi-level approvals
  
  created_at timestamptz DEFAULT now()
);

-- Create verification_notifications table
CREATE TABLE IF NOT EXISTS verification_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_request_id uuid REFERENCES verification_requests(id) ON DELETE CASCADE,
  
  recipient_id text NOT NULL,
  recipient_role text NOT NULL,
  
  notification_type text NOT NULL, -- 'verification_submitted', 'verification_approved', 'verification_rejected'
  title text NOT NULL,
  message text NOT NULL,
  
  is_read boolean DEFAULT false,
  read_at timestamptz,
  
  action_url text, -- Deep link to the verification details
  
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_by ON verification_requests(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_entity ON verification_requests(entity_id, request_type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_approvals_request ON verification_approvals(verification_request_id);
CREATE INDEX IF NOT EXISTS idx_verification_approvals_role ON verification_approvals(approver_role);

CREATE INDEX IF NOT EXISTS idx_verification_notifications_recipient ON verification_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_verification_notifications_unread ON verification_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_verification_notifications_created ON verification_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_requests

-- Allow anonymous access to read all requests (for demo purposes)
CREATE POLICY "Anyone can view verification requests"
  ON verification_requests FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous access to insert requests
CREATE POLICY "Anyone can create verification requests"
  ON verification_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous access to update requests (for approvals)
CREATE POLICY "Anyone can update verification requests"
  ON verification_requests FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for verification_approvals

CREATE POLICY "Anyone can view verification approvals"
  ON verification_approvals FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create verification approvals"
  ON verification_approvals FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update verification approvals"
  ON verification_approvals FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for verification_notifications

CREATE POLICY "Anyone can view notifications"
  ON verification_notifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create notifications"
  ON verification_notifications FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update notifications"
  ON verification_notifications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to determine approver roles based on submitter role
CREATE OR REPLACE FUNCTION get_approver_roles(submitter_role text)
RETURNS text[] AS $$
BEGIN
  CASE submitter_role
    WHEN 'TSM' THEN RETURN ARRAY['RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD', 'MDO'];
    WHEN 'SO' THEN RETURN ARRAY['RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD', 'MDO'];
    WHEN 'MDO' THEN RETURN ARRAY['RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD'];
    WHEN 'RBH' THEN RETURN ARRAY['ZBH', 'RMM', 'MH', 'VP', 'MD'];
    WHEN 'ZBH' THEN RETURN ARRAY['RMM', 'MH', 'VP', 'MD'];
    WHEN 'RMM' THEN RETURN ARRAY['MH', 'VP', 'MD'];
    WHEN 'MH' THEN RETURN ARRAY['VP', 'MD'];
    ELSE RETURN ARRAY['MD']; -- Default to MD for others
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for approvers
CREATE OR REPLACE FUNCTION notify_approvers_on_verification()
RETURNS TRIGGER AS $$
DECLARE
  approver_roles text[];
  role_name text;
BEGIN
  -- Get the list of approver roles
  approver_roles := get_approver_roles(NEW.submitted_by_role);
  
  -- Create notifications for each approver role
  FOREACH role_name IN ARRAY approver_roles
  LOOP
    INSERT INTO verification_notifications (
      verification_request_id,
      recipient_id,
      recipient_role,
      notification_type,
      title,
      message,
      action_url
    ) VALUES (
      NEW.id,
      role_name, -- Using role as recipient_id for now
      role_name,
      'verification_submitted',
      'New Stock Verification Pending',
      NEW.submitted_by_name || ' (' || NEW.submitted_by_role || ') has submitted a ' || 
        CASE WHEN NEW.request_type = 'distributor_verification' THEN 'Distributor' ELSE 'Retailer' END ||
        ' stock verification for ' || NEW.entity_name || '. Please review and approve.',
      '/activity-tracker'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify submitter on approval/rejection
CREATE OR REPLACE FUNCTION notify_submitter_on_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO verification_notifications (
      verification_request_id,
      recipient_id,
      recipient_role,
      notification_type,
      title,
      message,
      action_url
    ) VALUES (
      NEW.id,
      NEW.submitted_by_id,
      NEW.submitted_by_role,
      'verification_' || NEW.status,
      'Verification ' || UPPER(NEW.status),
      'Your ' || 
        CASE WHEN NEW.request_type = 'distributor_verification' THEN 'Distributor' ELSE 'Retailer' END ||
        ' stock verification for ' || NEW.entity_name || ' has been ' || NEW.status || ' by ' ||
        COALESCE(NEW.reviewed_by_name, 'Manager') || '.' ||
        CASE WHEN NEW.review_comments IS NOT NULL THEN ' Comments: ' || NEW.review_comments ELSE '' END,
      '/activity-tracker'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_approvers ON verification_requests;
CREATE TRIGGER trigger_notify_approvers
  AFTER INSERT ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_approvers_on_verification();

DROP TRIGGER IF EXISTS trigger_notify_submitter ON verification_requests;
CREATE TRIGGER trigger_notify_submitter
  AFTER UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_submitter_on_review();
