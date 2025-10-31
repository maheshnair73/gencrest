# Approval Workflow Options Documentation

## Current Implementation: Option C - Flexible Approval Rights ✅

This document outlines three different approaches to handling approval workflows in the system. **Option C is currently implemented**, but Options A and B are documented here for future reference or if business requirements change.

---

## Overview of All Options

| Feature | Option A | Option B | Option C (Current) |
|---------|----------|----------|-------------------|
| **Primary Approach** | Out-of-Office Delegation | Auto-Escalation | Flexible Approval Rights |
| **Manager Absence Handling** | Manual delegation | Automatic after timeout | Multiple approvers available |
| **Notification Strategy** | Immediate to assigned approver | Progressive with reminders | Immediate to Level 1, visible to all |
| **Approval Authority** | Only assigned approver | Escalates after timeout | Any in chain can approve |
| **Complexity** | Medium | High | Low |
| **Flexibility** | Low | Medium | High |
| **User Action Required** | Managers must set OOO | None | None |

---

## Option A: Out-of-Office Delegation

### How It Works
When managers are unavailable, they can explicitly designate a temporary approver who will handle their approval responsibilities.

### Key Features
1. **OOO Settings Page**
   - Managers mark themselves as "Out of Office"
   - Set start and end dates for absence
   - Designate a delegate (can be their manager or a peer)

2. **Automatic Routing**
   - During OOO period, all approvals automatically route to delegate
   - Delegate receives notifications as if they were the primary approver
   - Original manager receives FYI notifications

3. **Audit Trail**
   - System records who approved on behalf of whom
   - Shows delegation chain in approval history
   - Approved by: "John Doe (on behalf of Jane Smith)"

### Database Schema (Not Implemented)
```sql
CREATE TABLE user_ooo_settings (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  delegate_id uuid REFERENCES users,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  reason text,
  created_at timestamptz DEFAULT now()
);
```

### Workflow
```
1. Claim submitted → Check if manager is OOO
2. If OOO → Route to delegate
3. If not OOO → Route to manager
4. Delegate approves → Claim approved
5. Record shows: "Approved by Delegate (for Manager)"
```

### Pros
- Clear accountability and explicit delegation
- Manager maintains control over who handles their work
- Good for planned absences (vacation, business travel)

### Cons
- Requires manager action to set up
- Doesn't handle unexpected absences
- Delegate might also be unavailable
- Additional UI complexity for OOO management

---

## Option B: Auto-Escalation Rules

### How It Works
If the immediate manager doesn't respond within a defined timeframe, the system automatically escalates the approval to the next level in the hierarchy.

### Key Features
1. **Time-Based Escalation**
   - Day 0: Claim submitted → Notify Level 1 manager
   - Day 2: Reminder sent to Level 1 manager
   - Day 3: Warning to Level 1 + notification to Level 2
   - Day 4: Auto-escalate to Level 2 manager

2. **Notification Cadence**
   ```
   New Claim → Immediate notification to L1
   Day 1 → No action
   Day 2 → Reminder to L1 (Yellow status)
   Day 3 → Escalation warning to L1, FYI to L2 (Orange status)
   Day 4 → Escalated to L2 (Red status)
   ```

3. **Dashboard Indicators**
   - Color coding: Green (new) → Yellow (reminder) → Orange (warning) → Red (escalated)
   - Escalated claims highlighted for higher-ups
   - Original approver can still see escalated claims

### Database Schema (Not Implemented)
```sql
CREATE TABLE escalation_rules (
  id uuid PRIMARY KEY,
  claim_type text NOT NULL,
  level_1_timeout_hours integer DEFAULT 48,
  level_2_timeout_hours integer DEFAULT 72,
  level_3_timeout_hours integer DEFAULT 96,
  reminder_before_escalation_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE escalation_history (
  id uuid PRIMARY KEY,
  claim_id uuid REFERENCES travel_claims,
  from_level integer,
  to_level integer,
  escalated_at timestamptz DEFAULT now(),
  reason text DEFAULT 'Timeout',
  original_approver uuid REFERENCES users,
  new_approver uuid REFERENCES users
);
```

### Workflow
```
1. Claim submitted at T=0
2. L1 Manager notified immediately
3. T+48h: If not approved → Reminder to L1
4. T+72h: If not approved → Warning to L1, notify L2
5. T+96h: If not approved → Escalate to L2
6. L2 approves → Claim approved
7. Record: "Escalated from L1 to L2 due to timeout"
```

### Pros
- No manager action required
- Handles both expected and unexpected absences
- Built-in SLAs for approvals
- Clear escalation trail

### Cons
- May escalate unnecessarily if manager just needs more time
- Complex notification logic
- Requires background job/scheduler
- May feel punitive to managers ("Big brother watching")
- Higher-ups may receive many escalations

---

## Option C: Flexible Approval Rights (CURRENT IMPLEMENTATION) ✅

### How It Works
Claims route to the immediate manager by default, but anyone in the approval chain (up to 2-3 levels up) can see and approve the claim at any time.

### Key Features
1. **Multi-Level Visibility**
   - Immediate manager (Level 1) is primary approver
   - Their manager (Level 2) can also see and approve
   - Their manager's manager (Level 3) can also see and approve
   - All receive visibility, Level 1 gets active notification

2. **Dashboard Views**
   - Level 1 Manager sees: Claims assigned to them
   - Level 2 Manager sees: Their claims + all Level 1 subordinate claims
   - Level 3 Manager sees: Their claims + all Level 2 + all Level 1 claims
   - Higher-ups can filter by: My direct reports | All subordinates

3. **Approval Logic**
   - Any authorized person in the chain can approve
   - First approval wins (others marked as "Skipped")
   - System tracks who approved and at what level
   - No time limits or escalation needed

### Database Schema (Currently Implemented)
```sql
-- Organizational hierarchy
CREATE TABLE user_hierarchy (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL,
  reports_to uuid REFERENCES user_hierarchy(user_id),
  level integer NOT NULL DEFAULT 1,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Tracks who can approve each claim
CREATE TABLE claim_approvals (
  id uuid PRIMARY KEY,
  claim_id uuid REFERENCES travel_claims ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  approver_level integer NOT NULL DEFAULT 1,
  can_approve boolean DEFAULT true,
  status text DEFAULT 'Pending',  -- Pending/Approved/Rejected/Skipped
  approved_at timestamptz,
  comments text,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Workflow
```
1. Claim submitted by Employee (reports to Manager A)
2. System calculates approval chain:
   - Level 1: Manager A (immediate boss)
   - Level 2: Director B (Manager A's boss)
   - Level 3: VP C (Director B's boss)
3. Create approval records for all 3 levels (can_approve=true)
4. Notify Manager A immediately
5. All 3 can see the claim in their dashboard
6. Whoever approves first → Claim approved
7. Others' approvals automatically marked "Skipped"
```

### Real-World Example
```
Employee: Rajesh (TSM)
├─ L1: Amit (RBH) - Immediate manager, gets notification
├─ L2: Suresh (ZBH) - Can also approve
└─ L3: Priya (VP) - Can also approve

Scenario 1: Normal flow
- Rajesh submits claim
- Amit sees it and approves ✓
- Suresh and Priya's approvals marked "Skipped"

Scenario 2: Manager busy
- Rajesh submits claim
- Amit is in meetings all day
- Suresh (L2) sees it's pending and approves ✓
- Amit and Priya's approvals marked "Skipped"

Scenario 3: Urgent approval
- Rajesh submits high-priority claim
- Priya (VP) sees it needs immediate attention
- Priya approves directly ✓
- Amit and Suresh's approvals marked "Skipped"
```

### Pros
- ✅ No manager action required to set up
- ✅ No time-based rules or escalation logic
- ✅ Handles manager absence automatically
- ✅ Higher-ups maintain visibility
- ✅ Flexible - anyone in chain can respond
- ✅ Simple to implement and understand
- ✅ Works for both planned and unplanned absences
- ✅ No "punishment" feeling for delays

### Cons
- May bypass immediate manager if higher-up approves first
- Requires clear hierarchy data
- Higher-ups may feel overwhelmed seeing all subordinate claims
- Less formal than explicit delegation

---

## Comparison Matrix

### When to Use Each Option

#### Use Option A (OOO Delegation) when:
- Managers take regular planned time off
- Organization prefers explicit delegation
- Audit trail needs to show delegation clearly
- Managers want control over who handles their work
- Predictable absence patterns

#### Use Option B (Auto-Escalation) when:
- Organization has strict SLAs for approvals
- Need to enforce response times
- Want to identify bottlenecks in approval process
- Have dedicated ops team to manage escalations
- Compliance requires time-bound approvals

#### Use Option C (Flexible Approval) when: ✅ **CURRENT**
- Managers may be unexpectedly unavailable
- Organization values speed over strict hierarchy
- Higher-ups are comfortable approving subordinate requests
- Want simple, low-maintenance system
- Trust-based culture where anyone can step in
- Startup/fast-paced environment

---

## Implementation Status

### ✅ Currently Implemented (Option C)
- [x] `user_hierarchy` table
- [x] `claim_approvals` table with multi-level tracking
- [x] `approval_notifications` for tracking notifications
- [x] `get_approval_chain()` function to calculate hierarchy
- [x] Triggers to auto-create approval records on submission
- [x] Triggers to update claim status on approval/rejection
- [x] Travel Claim Approvals page (`/travel-approvals`)
- [x] Approval action buttons (Approve/Reject)
- [x] Filter by status (Pending/Approved/Rejected)
- [x] Dashboard visibility for all levels

### ⏳ Future Enhancements (If Needed)
- [ ] Add Option A (OOO settings page)
- [ ] Add Option B (Escalation rules and scheduler)
- [ ] Email/SMS notifications (currently in-app only)
- [ ] Mobile app push notifications
- [ ] Analytics dashboard for approval metrics
- [ ] Export approval history reports
- [ ] Bulk approve functionality
- [ ] Approval templates for common scenarios

---

## How Higher-Ups Know What to Approve

### Visibility Rules (Option C - Current)

1. **Dashboard View**
   - Managers see claims where they are listed as an approver
   - Claims are grouped by status: Pending / Approved / Rejected
   - Each claim shows: Submitter name, amount, date, status

2. **Why They See It**
   - When a claim is submitted, system calculates approval chain
   - Creates approval record for each level (L1, L2, L3)
   - Each approver gets a record with `can_approve=true`
   - Level 1 gets immediate notification
   - Levels 2 & 3 see it in dashboard but no notification

3. **When to Approve**
   - **Level 1**: Approves during normal workflow
   - **Level 2**: Approves if:
     - They know Level 1 is unavailable
     - Claim is time-sensitive
     - Level 1 asked them to handle it
   - **Level 3**: Approves if:
     - Emergency or high-priority situation
     - Both L1 and L2 are unavailable
     - Special circumstances require senior approval

4. **No Approval Needed**
   - Once anyone approves, others' approvals are skipped
   - No action needed from other approvers
   - System automatically handles the rest

---

## FAQs

### Q: What if immediate manager is on vacation?
**Option A**: Manager sets delegate before leaving
**Option B**: System escalates after timeout
**Option C**: Next level manager can approve immediately ✅

### Q: What if multiple levels are unavailable?
**Option A**: Delegate might also delegate (chain)
**Option B**: Continues escalating up the chain
**Option C**: Keep escalating until available manager found ✅

### Q: How does the higher-up know they need to approve?
**Option A**: They only see if delegated to them
**Option B**: They get notified when escalated
**Option C**: They see it in dashboard, can choose to act ✅

### Q: Can a claim be approved by someone not in the chain?
**Answer**: No, only those in the calculated approval chain can approve

### Q: What if approval chain is not set up?
**Answer**: System requires user_hierarchy data. Claims without hierarchy will show error.

### Q: Can an employee see who can approve their claim?
**Answer**: Yes, approval chain can be displayed on claim details page

---

## Next Steps

1. **Set Up User Hierarchy**
   - Import organizational structure into `user_hierarchy` table
   - Define reporting relationships for all users
   - Set department and level information

2. **Test Approval Flow**
   - Submit test claims
   - Verify approvers can see claims
   - Test approve/reject functionality
   - Check notifications are created

3. **User Training**
   - Explain how Option C works
   - Show managers their dashboard
   - Demonstrate when higher-ups should step in

4. **Monitor Usage**
   - Track approval times
   - Identify any bottlenecks
   - Gather user feedback
   - Consider adding Options A or B if needed

---

## Contact

For questions about the approval workflow system, please refer to:
- Database schema: `supabase/migrations/add_user_hierarchy_and_update_approval_workflow.sql`
- Travel Approvals page: `src/pages/TravelClaimApprovals.tsx`
- Approval card component: `src/components/approvals/TravelClaimApprovalCard.tsx`

---

*Last Updated: [Current Date]*
*Current Implementation: Option C - Flexible Approval Rights*
