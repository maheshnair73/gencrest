# Work Plan & Activity System Explained

## Overview

The Work Plan system has three distinct layers that work together:

### 1. **Work Plans** (Monthly Planning)
- Created monthly by users (MDO, TSM, etc.)
- Contains overall targets and status (draft, submitted, approved, rejected)
- Shows summary metrics: total planned, completed, percentages

### 2. **Planned Activities** (Activity Counts)
- Defines HOW MANY of each activity type will be performed
- Example: "5 Farmer Meetings", "3 Demos", "10 Retailer Visits"
- Grouped by category:
  - MDO Activities (field activities)
  - Employee Activities (internal tasks)
- Tracks: Planned count vs Completed count

### 3. **Scheduled Activities** (NEW - What, When, Where)
- Individual activities with specific details:
  - **Date**: When the activity will happen
  - **Time**: Specific time slot
  - **Location**: Venue/place name
  - **Village/Area**: Geographic location
  - **Distributor/Retailer**: Who is involved
  - **Expected Outcome**: What should be achieved
  - **Status**: Pending, In Progress, Completed, Cancelled

## How It Works Together

```
Work Plan (October 2025)
  ├── Planned Activities (Counts)
  │   ├── Farmer Meeting - Small: 5 planned / 2 completed
  │   ├── Demo - Organized: 3 planned / 1 completed
  │   └── Retailer Visit: 10 planned / 5 completed
  │
  └── Scheduled Activities (Detailed Calendar)
      ├── Oct 25, 10:00 AM - Farmer Meeting @ ABC Village
      ├── Oct 26, 2:00 PM - Demo @ XYZ Distributor
      ├── Oct 27, 11:00 AM - Retailer Visit @ DEF Store
      └── ...more activities with dates/times/locations
```

## Database Tables

### `work_plans`
- Monthly container for all activities
- User-specific
- Approval workflow

### `planned_activities`
- Links to work_plans
- Stores counts by activity type
- Summary level

### `scheduled_activities` (NEW)
- Links to work_plans and planned_activities
- Individual activity instances
- Full details: date, time, location, people involved
- Tracks execution status

### `activity_logs`
- Created when scheduled activities are completed
- Contains actual completion data, photos, GPS coordinates

## User Journey

1. **Create Work Plan** for the month
2. **Add Planned Activities**: "I plan to do 5 farmer meetings"
3. **Schedule Activities**:
   - Oct 25 at 10 AM - Farmer Meeting at Green Valley
   - Oct 27 at 2 PM - Farmer Meeting at Blue Hills
   - ...and so on
4. **Execute & Log**: When completed, create activity log with proof
5. **Track Progress**: System automatically updates counts

## Why the Calendar View Was Missing

Previously, when clicking on a Work Plan heading:
- ❌ Only showed counts: "3/5 activities completed"
- ❌ No dates, times, or locations visible
- ❌ Users couldn't see WHAT activities were planned WHEN

Now, when clicking on a Work Plan heading:
- ✅ Shows summary counts at the top
- ✅ Shows full list of scheduled activities with:
  - Date and time
  - Location and venue
  - People involved (distributor/retailer)
  - Expected outcomes
  - Current status
- ✅ Activities sorted by date
- ✅ Color-coded status badges

## Next Steps

To fully utilize this system:

1. **Create functionality to add scheduled activities** - A button/form to schedule new activities under a work plan
2. **Calendar view option** - Visual calendar showing activities by date
3. **Activity detail modal** - Click to see/edit full activity details
4. **Link to activity logs** - When completed, link scheduled activity to its log
5. **Mobile integration** - Allow field users to view daily schedule and mark activities complete

## Key Difference

- **Planned Activities** = Goals/Targets ("I will do 10 meetings")
- **Scheduled Activities** = Execution Plan ("Monday 10 AM @ Location X")
- **Activity Logs** = Actual Completion ("Completed with photos and notes")
