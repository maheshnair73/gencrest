/*
  # User Hierarchy and Flexible Approval Workflow (Option C)
  
  ## Overview
  Implements Option C: Flexible Approval Rights where:
  - Claims route to immediate reporting manager by default
  - Anyone in approval chain (up to 2-3 levels) can see and approve claims
  - Higher-ups have visibility into all pending approvals in their hierarchy
  - System dynamically calculates approval chain based on organizational structure
  
  ## Changes
  1. Create user_hierarchy table for organizational structure
  2. Create claim_approvals table for tracking who can approve
  3. Add triggers for automatic approval chain creation
  4. Add functions to calculate approval hierarchy
  
  ## Important Notes
  - Option C (Flexible Approval Rights) is currently implemented
  - See APPROVAL_WORKFLOW_OPTIONS.md for alternatives (Option A & B)
*/

-- Create user_hierarchy table
CREATE TABLE IF NOT EXISTS user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  reports_to uuid REFERENCES user_hierarchy(user_id),
  level integer NOT NULL DEFAULT 1,
  department text,
  can_approve_for text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create claim_approvals table
CREATE TABLE IF NOT EXISTS claim_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES travel_claims(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  approver_level integer NOT NULL DEFAULT 1,
  can_approve boolean DEFAULT true,
  status text NOT NULL DEFAULT 'Pending',
  approved_at timestamptz,
  comments text,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_user_id ON user_hierarchy(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_reports_to ON user_hierarchy(reports_to);
CREATE INDEX IF NOT EXISTS idx_claim_approvals_claim_id ON claim_approvals(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_approvals_approver_id ON claim_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_claim_approvals_status ON claim_approvals(status);

-- Enable RLS
ALTER TABLE user_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_hierarchy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_hierarchy' AND policyname = 'Anyone can view hierarchy'
  ) THEN
    CREATE POLICY "Anyone can view hierarchy"
      ON user_hierarchy FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_hierarchy' AND policyname = 'System can manage hierarchy'
  ) THEN
    CREATE POLICY "System can manage hierarchy"
      ON user_hierarchy FOR ALL
      USING (true);
  END IF;
END $$;

-- RLS Policies for claim_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'claim_approvals' AND policyname = 'Anyone can view claim approvals'
  ) THEN
    CREATE POLICY "Anyone can view claim approvals"
      ON claim_approvals FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'claim_approvals' AND policyname = 'System can create approvals'
  ) THEN
    CREATE POLICY "System can create approvals"
      ON claim_approvals FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'claim_approvals' AND policyname = 'Approvers can update status'
  ) THEN
    CREATE POLICY "Approvers can update status"
      ON claim_approvals FOR UPDATE
      USING (true);
  END IF;
END $$;

-- Function to get approval chain for a user
CREATE OR REPLACE FUNCTION get_approval_chain(p_user_id uuid)
RETURNS TABLE (
  approver_id uuid,
  approver_level integer,
  approver_name text
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE approval_chain AS (
    -- Start with immediate manager (level 1)
    SELECT 
      uh.reports_to as approver_id,
      1 as approver_level
    FROM user_hierarchy uh
    WHERE uh.user_id = p_user_id
    
    UNION ALL
    
    -- Get next level managers (up to level 3)
    SELECT 
      uh.reports_to as approver_id,
      ac.approver_level + 1 as approver_level
    FROM approval_chain ac
    JOIN user_hierarchy uh ON uh.user_id = ac.approver_id
    WHERE ac.approver_level < 3
    AND uh.reports_to IS NOT NULL
  )
  SELECT 
    ac.approver_id,
    ac.approver_level,
    'Manager Level ' || ac.approver_level::text as approver_name
  FROM approval_chain ac
  WHERE ac.approver_id IS NOT NULL
  ORDER BY ac.approver_level;
END;
$$ LANGUAGE plpgsql;

-- Function to create approval records when claim is submitted
CREATE OR REPLACE FUNCTION create_approval_records_for_claims()
RETURNS TRIGGER AS $$
DECLARE
  approver_record RECORD;
BEGIN
  -- Only create approval records when status changes to 'Submitted'
  IF NEW.status = 'Submitted' AND (OLD IS NULL OR OLD.status != 'Submitted') THEN
    -- Get approval chain and create records
    FOR approver_record IN 
      SELECT * FROM get_approval_chain(NEW.user_id)
    LOOP
      INSERT INTO claim_approvals (
        claim_id,
        approver_id,
        approver_level,
        can_approve,
        status,
        notified_at
      ) VALUES (
        NEW.id,
        approver_record.approver_id,
        approver_record.approver_level,
        true,  -- All in chain can approve (Option C)
        'Pending',
        CASE WHEN approver_record.approver_level = 1 THEN now() ELSE NULL END
      )
      ON CONFLICT DO NOTHING;
      
      -- Send notification to immediate manager only
      IF approver_record.approver_level = 1 THEN
        INSERT INTO approval_notifications (
          claim_id,
          claim_type,
          recipient_id,
          notification_type,
          message
        ) VALUES (
          NEW.id,
          'travel_claim',
          approver_record.approver_id,
          'New',
          'New travel claim submitted for approval: ₹' || NEW.amount::text
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic approval record creation
DROP TRIGGER IF EXISTS create_approval_records_for_claims_trigger ON travel_claims;
CREATE TRIGGER create_approval_records_for_claims_trigger
  AFTER INSERT OR UPDATE ON travel_claims
  FOR EACH ROW
  EXECUTE FUNCTION create_approval_records_for_claims();

-- Function to update claim status when approved/rejected
CREATE OR REPLACE FUNCTION update_claim_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When any approver approves, update claim status
  IF NEW.status = 'Approved' AND (OLD IS NULL OR OLD.status != 'Approved') THEN
    UPDATE travel_claims
    SET 
      status = 'Approved',
      approved_at = now(),
      approved_by = NEW.approver_id,
      updated_at = now()
    WHERE id = NEW.claim_id;
    
    -- Mark other pending approvals as skipped
    UPDATE claim_approvals
    SET status = 'Skipped'
    WHERE claim_id = NEW.claim_id
    AND id != NEW.id
    AND status = 'Pending';
    
    -- Notify the claim submitter
    INSERT INTO approval_notifications (
      claim_id,
      claim_type,
      recipient_id,
      notification_type,
      message
    )
    SELECT 
      NEW.claim_id,
      'travel_claim',
      tc.user_id,
      'Approved',
      'Your travel claim has been approved: ₹' || tc.amount::text
    FROM travel_claims tc
    WHERE tc.id = NEW.claim_id;
    
    -- Log in approval history
    INSERT INTO approval_history (
      claim_id,
      claim_type,
      action,
      action_by,
      approver_level,
      comments,
      previous_status,
      new_status
    ) VALUES (
      NEW.claim_id,
      'travel_claim',
      'Approved',
      NEW.approver_id,
      NEW.approver_level,
      NEW.comments,
      OLD.status,
      'Approved'
    );
  END IF;
  
  -- When any approver rejects, update claim status
  IF NEW.status = 'Rejected' AND (OLD IS NULL OR OLD.status != 'Rejected') THEN
    UPDATE travel_claims
    SET 
      status = 'Rejected',
      rejection_reason = NEW.comments,
      updated_at = now()
    WHERE id = NEW.claim_id;
    
    -- Mark other pending approvals as skipped
    UPDATE claim_approvals
    SET status = 'Skipped'
    WHERE claim_id = NEW.claim_id
    AND id != NEW.id
    AND status = 'Pending';
    
    -- Notify the claim submitter
    INSERT INTO approval_notifications (
      claim_id,
      claim_type,
      recipient_id,
      notification_type,
      message
    )
    SELECT 
      NEW.claim_id,
      'travel_claim',
      tc.user_id,
      'Rejected',
      'Your travel claim has been rejected' || 
      CASE WHEN NEW.comments IS NOT NULL THEN ': ' || NEW.comments ELSE '' END
    FROM travel_claims tc
    WHERE tc.id = NEW.claim_id;
    
    -- Log in approval history
    INSERT INTO approval_history (
      claim_id,
      claim_type,
      action,
      action_by,
      approver_level,
      comments,
      previous_status,
      new_status
    ) VALUES (
      NEW.claim_id,
      'travel_claim',
      'Rejected',
      NEW.approver_id,
      NEW.approver_level,
      NEW.comments,
      OLD.status,
      'Rejected'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for claim status update on approval
DROP TRIGGER IF EXISTS update_claim_status_on_approval_trigger ON claim_approvals;
CREATE TRIGGER update_claim_status_on_approval_trigger
  AFTER UPDATE ON claim_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_status_on_approval();