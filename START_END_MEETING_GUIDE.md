# Start/End Meeting & Activity Flow

## Overview

Users can now start and end their scheduled activities directly from the Work Plan page. This guide explains how the feature works and the complete user journey.

---

## User Journey

### 1. **View Work Plans**
Navigate to **Work Plans** page to see all monthly work plans.

### 2. **Expand a Work Plan**
Click on any work plan heading to expand and view:
- Summary cards (MDO Activities, Employee Activities)
- List of scheduled activities with dates, times, and locations

### 3. **Start an Activity**

When an activity status is **Pending**:
- A green **"Start"** button appears on the right side
- Click the button to begin the activity
- Status changes to **"In Progress"** (blue badge)
- Database is updated with the new status

**Visual Changes:**
- Status badge: Yellow (Pending) → Blue (In Progress)
- Button: Green "Start" → Red "End"

### 4. **End an Activity**

When an activity status is **In Progress**:
- A red **"End"** button appears
- Click the button to complete the activity
- Status changes to **"Completed"** (green badge)
- Database is updated

**Visual Changes:**
- Status badge: Blue (In Progress) → Green (Completed)
- Button: Red "End" → Gray "Done" (disabled)

### 5. **Completed Activities**

When an activity is **Completed**:
- A gray **"Done"** indicator appears (non-clickable)
- No action buttons available
- Activity is marked as completed in the system

---

## Activity Status Flow

```
PENDING (Yellow)
    ↓ [Click "Start"]
IN PROGRESS (Blue)
    ↓ [Click "End"]
COMPLETED (Green)
```

---

## Button Types

| Status | Button | Color | Icon | Action |
|--------|--------|-------|------|--------|
| Pending | Start | Green | Play icon | Starts the activity |
| In Progress | End | Red | Square icon | Completes the activity |
| Completed | Done | Gray | CheckCircle icon | No action (informational) |
| Cancelled | - | Red | - | No buttons shown |

---

## Activity Card Layout

Each scheduled activity card displays:

**Left Side (Activity Details):**
- Status badge (color-coded)
- Activity type name
- Date (with day of week)
- Time
- Location
- Village/Area
- Distributor/Retailer names
- Expected outcome
- Notes

**Right Side (Action Buttons):**
- Start button (if pending)
- End button (if in progress)
- Done indicator (if completed)

---

## Database Updates

### When Starting an Activity:
```sql
UPDATE scheduled_activities
SET status = 'in_progress'
WHERE id = [activity_id]
```

### When Ending an Activity:
```sql
UPDATE scheduled_activities
SET status = 'completed'
WHERE id = [activity_id]
```

---

## Features

### ✅ Real-time Status Updates
- Clicking Start/End buttons immediately updates the database
- Page refreshes to show updated status
- Status badges change color accordingly

### ✅ User-Specific Actions
- Only the activity owner can start/end their activities
- RLS policies ensure data security

### ✅ Visual Feedback
- Color-coded status badges
- Clear button labels
- Icon indicators for each action

### ✅ Activity Tracking
- Full history maintained in database
- Can track when activities were started and completed
- Integration with activity logs system

---

## Next Steps to Complete the Flow

### Recommended Enhancements:

1. **Timestamp Tracking**
   - Add `started_at` timestamp when activity is started
   - Add `completed_at` timestamp when activity is ended
   - Display duration of activity

2. **Activity Log Creation**
   - When "End" is clicked, prompt user to add:
     - Photos
     - Notes
     - Actual outcome
     - GPS coordinates
   - Automatically create entry in `activity_logs` table

3. **Geofencing**
   - Verify user is at the correct location before allowing start
   - Use GPS coordinates to validate

4. **Push Notifications**
   - Remind user 15 minutes before scheduled time
   - Alert supervisor when activities are completed

5. **Attendance Integration**
   - Link activities to daily attendance records
   - Track total working hours

6. **Mobile App Integration**
   - Provide same Start/End functionality in mobile view
   - Enable offline mode for field users

---

## Technical Implementation

### Components Modified:
- `/src/pages/WorkPlan.tsx`

### Functions Added:
- `handleStartActivity(activityId)` - Updates status to "in_progress"
- `handleEndActivity(activityId)` - Updates status to "completed"

### Database Table:
- `scheduled_activities` - stores all scheduled activities with status

### RLS Policies:
- Users can only start/end their own activities
- Supervisors can view all activities but cannot modify

---

## User Experience

**Before:**
- Users could only view scheduled activities
- No way to track execution status
- Had to manually update elsewhere

**After:**
- One-click start/end for activities
- Real-time status tracking
- Clear visual indicators of progress
- Integrated with work plan system
