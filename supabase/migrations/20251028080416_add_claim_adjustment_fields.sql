/*
  # Add Claim Adjustment Fields
  
  ## Changes
  1. Add fields to travel_claims to track amount adjustments
  2. Add adjustment fields to claim_approvals for manager modifications
  
  ## New Columns
  - `original_amount` - The amount employee originally claimed
  - `adjusted_amount` - The amount approved by manager (can be different)
  - `adjustment_reason` - Why the amount was changed
  
  ## Use Case
  Manager can reduce/adjust claim amount during approval if:
  - Distance calculation is incorrect
  - Rate applied is wrong
  - Some expenses don't qualify
  - Policy limits exceeded
*/

-- Add adjustment fields to travel_claims
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'travel_claims' AND column_name = 'original_amount'
  ) THEN
    ALTER TABLE travel_claims ADD COLUMN original_amount numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'travel_claims' AND column_name = 'adjusted_amount'
  ) THEN
    ALTER TABLE travel_claims ADD COLUMN adjusted_amount numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'travel_claims' AND column_name = 'adjustment_reason'
  ) THEN
    ALTER TABLE travel_claims ADD COLUMN adjustment_reason text;
  END IF;
END $$;

-- Update existing claims to set original_amount from amount
UPDATE travel_claims 
SET original_amount = amount 
WHERE original_amount IS NULL;

-- Add adjustment fields to claim_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claim_approvals' AND column_name = 'adjusted_amount'
  ) THEN
    ALTER TABLE claim_approvals ADD COLUMN adjusted_amount numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claim_approvals' AND column_name = 'adjustment_reason'
  ) THEN
    ALTER TABLE claim_approvals ADD COLUMN adjustment_reason text;
  END IF;
END $$;

-- Update the approval trigger to handle amount adjustments
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
      adjusted_amount = COALESCE(NEW.adjusted_amount, amount),
      adjustment_reason = NEW.adjustment_reason,
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
      'Your travel claim has been approved' ||
      CASE 
        WHEN NEW.adjusted_amount IS NOT NULL AND NEW.adjusted_amount != tc.amount 
        THEN ': Amount adjusted to ₹' || NEW.adjusted_amount::text || ' (Original: ₹' || tc.amount::text || ')'
        ELSE ': ₹' || tc.amount::text
      END
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
      CASE 
        WHEN NEW.adjusted_amount IS NOT NULL 
        THEN 'Amount adjusted: ' || COALESCE(NEW.adjustment_reason, 'No reason provided') || '. ' || COALESCE(NEW.comments, '')
        ELSE NEW.comments
      END,
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