# Mobile App - Role-Based Access Guide

## Overview

The Gencrest Mobile Activity Tracker provides a role-based mobile interface for field teams. Each role has access to specific features and data relevant to their responsibilities.

---

## Available Roles

The mobile app supports the following roles:

1. **MDO** (Market Development Officer)
2. **TSM** (Territory Sales Manager)
3. **RMM** (Regional Marketing Manager)
4. **ZBH** (Zonal Business Head)
5. **RBH** (Regional Business Head)
6. **MH** (Marketing Head)
7. **VP** (Vice President)
8. **CHRO** (Chief Human Resources Officer)
9. **CFO** (Chief Financial Officer)
10. **MD** (Managing Director)

---

## Mobile App Interface Structure

### 📱 Header Section (All Roles)
- **Profile Display**: Shows user's name and role
- **Location**: Displays current region/zone
- **Work Plan Assignment**: Monthly plan created by TSM, approved by supervisor
  - Day-wise activities
  - Village/territory assignments
  - Distributor targets
  - Status: Approved/Pending
- **Notification Icons**:
  - Tasks (Yellow)
  - Alerts (Red)
  - Messages (Blue)
  - Approvals (Green)

### 📊 Bottom Navigation Tabs

#### 1. **Home Tab** 🏠
**Available for: All Roles**

**MDO/TSM View:**
- Today's live meetings with countdown timers
- Meeting details (time, village, distributor, type)
- Quick action buttons
- Real-time location tracking

**Manager View (RMM, ZBH, RBH, MH, VP):**
- Team performance overview
- Territory-wise metrics
- Approval queues
- Dashboard summaries

**Executive View (CHRO, CFO, MD):**
- High-level analytics
- Strategic KPIs
- Department performance

#### 2. **Team Tab** 👥
**Available for: TSM and above**

Features:
- View team members
- Member status (Active/Inactive)
- Role and territory information
- Performance tracking
- Direct contact options

**Not visible for:** MDO (individual contributors)

#### 3. **Orders Tab** 🛒
**Available for: All Roles**

Features:
- Recent orders list
- Order status (Delivered, Approved, Pending)
- Order amounts and dates
- Distributor-wise orders
- Invoice numbers

#### 4. **Liquidation Tab** 💧
**Available for: All Roles**

**Key Features:**

**For MDO:**
- View distributor/retailer entries
- **Search and filter** by distributor or retailer
- **Batch Stock Update** button (NEW!)
- Detailed metrics cards:
  - Opening Stock (₹ value)
  - YTD Sales
  - Liquidation
  - Balance Stock
- **360° View** for each distributor
- **Verify Stock** button with:
  - SKU-wise breakdown
  - Product-wise liquidation
  - Proof upload (Photo/E-signature)
  - Geofencing validation
- Pagination for large data sets

**Liquidation Metrics Display:**
```
┌─────────────────────────────────┐
│ Opening Stock    │ ₹233.75L     │
│ YTD Sales       │ ₹55.52L      │
│ Liquidation     │ ₹55.52L      │
│ Balance Stock   │ ₹178.23L     │
└─────────────────────────────────┘
```

**Per Distributor Card:**
- Name, Code, Business Type
- Priority badge (High/Medium/Low)
- Territory, Region, Zone
- 4 metric boxes (Opening, YTD, Liquidation, Balance)
- Progress bar showing % Liquidation
- Action buttons:
  - **360° View**: Complete distributor information
  - **Verify Stock**: Update and verify stock with proof

**NEW: Batch Stock Update** (MDO/TSM)
1. Enter new stock values for multiple SKUs at once
2. Allocate quantities between Farmers and Retailers
3. Review all changes
4. Submit batch updates

**For TSM/Managers:**
- Aggregate team liquidation data
- Approval workflows for stock updates
- Territory-wise performance
- Anomaly detection

#### 5. **Tasks Tab** ✅
**Available for: All Roles**

Features:
- Today's tasks list
- Priority indicators (High/Medium/Low)
- Due dates
- Status (Pending/In Progress/Completed)
- Task categories

#### 6. **Reports Tab** 📄
**Available for: All Roles**

Features:
- Generated reports list
- Report status
- Download options
- Date filters
- Report types:
  - Daily Activity
  - Liquidation Summary
  - Visit Reports
  - Performance Analytics

---

## Role-Specific Features

### 🎯 MDO (Market Development Officer)

**Primary Responsibilities:**
- Field visits to distributors/retailers
- Stock verification and updates
- Liquidation tracking
- Meeting attendance
- Data collection

**Mobile App Access:**

**Home Tab:**
- Live meetings with countdown
- Daily work plan
- Village-wise schedule
- Quick actions

**Liquidation Tab:**
- Full distributor list with search
- **Batch Stock Update** for multiple SKUs
- Individual stock verification
- Proof upload (photo/e-signature)
- Geofencing enforcement
- 360° distributor view

**Stock Verification Flow:**
1. Select distributor
2. View SKU-wise stock details
3. Review transaction history (invoices)
4. Update quantities
5. Upload proof (photo or e-signature)
6. Location verification (must be within 1km geofence)
7. Submit for approval

**Tasks Tab:**
- Assigned tasks from TSM
- Visit completion tasks
- Data entry tasks

**Orders Tab:**
- View distributor orders
- Order status tracking

**Reports Tab:**
- Generate daily activity reports
- Submit visit reports

**Not Available for MDO:**
- Team management
- Approval workflows
- Strategic analytics

---

### 👨‍💼 TSM (Territory Sales Manager)

**Primary Responsibilities:**
- Team management (5-10 MDOs)
- Work plan creation
- Approval workflows
- Territory performance monitoring
- Training and support

**Mobile App Access:**

**All MDO features PLUS:**

**Home Tab:**
- Team performance dashboard
- Pending approvals
- Territory metrics
- Team member status

**Team Tab:**
- View all team members
- Member performance
- Activity tracking
- Direct communication

**Liquidation Tab:**
- Approve stock updates from MDOs
- Territory-wide liquidation view
- Batch approvals
- Anomaly alerts
- **Can also do batch stock updates**

**Work Plan Management:**
- Create monthly plans for MDOs
- Assign daily activities
- Set targets
- Submit for approval to RMM

**Approval Workflows:**
- Stock verification approvals
- Leave requests
- Expense claims
- Visit reports

---

### 📊 RMM (Regional Marketing Manager)

**Primary Responsibilities:**
- Manage multiple TSMs (3-5)
- Regional strategy
- Approve work plans
- Resource allocation
- Performance reviews

**Mobile App Access:**

**Home Tab:**
- Regional dashboard
- Multiple territory views
- Approval queue
- Strategic KPIs

**Team Tab:**
- All TSMs and their teams
- Region-wide org chart
- Performance comparisons

**Liquidation Tab:**
- Regional liquidation summary
- Territory comparisons
- Trend analysis
- Approve major stock adjustments

**Approvals:**
- TSM work plans
- Budget requests
- Territory transfers
- Performance reviews

---

### 🏢 ZBH/RBH/MH/VP (Senior Management)

**Primary Responsibilities:**
- Multi-region oversight
- Strategic planning
- High-level approvals
- Business analytics

**Mobile App Access:**

**Home Tab:**
- Executive dashboard
- Multi-region metrics
- Strategic alerts
- Approval summaries

**Team Tab:**
- Organizational hierarchy
- Regional performance
- Talent analytics

**Liquidation Tab:**
- Zone/Region/National view
- Comparative analytics
- Trend forecasting
- Exception reports

**Reports:**
- Executive summaries
- Business intelligence
- Strategic reports

---

### 👔 CHRO/CFO/MD (C-Suite)

**Primary Responsibilities:**
- Organization-wide oversight
- Strategic decisions
- Final approvals
- Business performance

**Mobile App Access:**

**Simplified Executive View:**

**Home Tab:**
- Key business metrics
- Strategic KPIs
- Critical alerts
- Decision dashboard

**Reports Tab:**
- Executive summaries
- Financial reports (CFO)
- HR analytics (CHRO)
- Business performance (MD)

**Liquidation Tab:**
- National overview
- Profitability metrics
- Strategic insights

---

## Key Mobile Features Across All Roles

### 1. **Geofencing & Location Tracking**
- Real-time GPS tracking
- Geofence radius: 1000m (1km)
- Location verification for stock updates
- Distance calculation from outlets
- Movement tracking during field visits

**Validation:**
- ✅ Green: Within geofence, actions allowed
- ❌ Red: Outside geofence, actions blocked
- Shows exact distance from outlet

### 2. **360° Distributor/Retailer View**
**Available for: All Roles**

**Tabs:**
1. **Contact**: Name, phone, email, address
2. **Financial**:
   - Credit limit
   - Total purchases
   - Balance credit
   - Payments
   - Ageing analysis (0-30, 31-60, 61-90, 90+ days)
3. **Performance**:
   - Liquidation progress
   - Credit utilization
   - Targets vs achievements
4. **History**:
   - Timeline view
   - Visits, Orders, Payments, Advances, Liquidations
   - Detailed activity logs
   - Performed by (user and role)
   - Status tracking

**Quick Actions:**
- Schedule Visit
- Create Order
- Record Payment
- Generate Report

### 3. **Stock Verification with Proof**

**Two Methods:**
1. **Photo Capture**: Take picture of stock/invoice
2. **E-Signature**: Digital signature on letterhead

**Letterhead Generation:**
- Auto-generates verification letter
- Includes all stock details
- Ready for signature and stamp
- Downloadable PDF

**Requirements:**
- Must be within geofence
- At least one proof required
- Location captured automatically
- Timestamp recorded

### 4. **Batch Stock Update** (NEW!)

**Step-by-Step Flow:**

**Step 1: Input**
- View all products and SKUs
- Enter new stock values for multiple items
- Visual indicators for increases/decreases
- Current stock shown for reference

**Step 2: Allocate**
- For each SKU, split quantities:
  - Farmers: Direct sales (recorded as liquidation)
  - Retailers: Transferred to retailers
- Use +/- buttons or direct input
- Real-time validation
- Progress bar across all SKUs

**Step 3: Review**
- Summary of all changes
- Farmer vs Retailer breakdown
- Visual confirmation before submit
- Edit capability

**Submit:**
- All updates processed together
- Success confirmation
- Auto-updates inventory

### 5. **Work Plan Assignment**

**Created by:** TSM
**Approved by:** RMM

**Contains:**
- Month/Week view
- Daily activities
- Village assignments
- Distributor names
- Target numbers
- Meeting schedules

**Status:**
- ✅ Approved (Green badge)
- ⏳ Pending (Orange badge)
- ❌ Rejected (Red badge)

**Mobile Display:**
- Expandable card
- Quick view of week's activities
- Created by and Approved by info
- Day-wise breakdown

### 6. **Search & Filters**

**Liquidation Tab:**
- Toggle: Distributor / Retailer
- Real-time search
- Search by:
  - Name
  - Code
  - Location
  - Territory

**Pagination:**
- 5 items per page (mobile)
- Navigation controls
- Total count display

---

## Bottom Navigation Summary

### For MDO:
```
[Home] [Orders] [Liquidation] [Tasks] [Reports]
  🏠      🛒        💧          ✅       📄
```

### For TSM and Managers:
```
[Home] [Team] [Orders] [Liquidation] [Tasks] [Reports]
  🏠     👥      🛒        💧          ✅       📄
```

### For Executives:
```
[Home] [Team] [Reports]
  🏠     👥      📄
```
(Simplified view with essential tabs only)

---

## Notification System

**4 Notification Types:**

1. **Tasks** (Yellow) 🟡
   - Pending task count
   - Due date alerts
   - Completion reminders

2. **Alerts** (Red) 🔴
   - Stock anomalies
   - Geofence violations
   - Critical updates

3. **Messages** (Blue) 🔵
   - Team communications
   - Announcements
   - Updates

4. **Approvals** (Green) 🟢
   - Pending approvals
   - Approval status
   - Workflow notifications

---

## Security & Permissions

### Data Access Levels:

**MDO:**
- Own territory data
- Assigned distributors/retailers
- Own tasks and reports
- Read-only on team data

**TSM:**
- Own team data (all MDOs)
- Territory-wide metrics
- Approval rights for team submissions
- Read-only on other territories

**RMM:**
- Regional data (all TSMs)
- Multi-territory access
- Higher approval authority
- Strategic planning tools

**Senior Management:**
- Multi-region access
- Comparative analytics
- Executive reports
- Limited field operations

**C-Suite:**
- Organization-wide access
- All reports and analytics
- Strategic dashboards
- No field operation access

---

## Offline Functionality

**Available for MDO:**
- Data caching for offline access
- Queue submissions when offline
- Auto-sync when connection restored
- Offline data entry
- Local proof storage

**Features:**
- Last synced timestamp
- Pending sync count
- Manual sync trigger
- Conflict resolution

---

## Technical Details

**Location Services:**
- GPS accuracy: ±10m
- Update frequency: 30 seconds
- Geofence radius: 1000m
- Haversine formula for distance calculation

**Data Sync:**
- Real-time updates via Supabase
- Row Level Security (RLS)
- Role-based data access
- Automatic conflict resolution

**Performance:**
- Optimized for 3G/4G
- Lazy loading
- Image compression
- Pagination

---

## Getting Started

### For MDO:
1. Login with credentials
2. Check work plan assignment
3. Navigate to Home tab for today's meetings
4. Go to Liquidation for stock updates
5. Use Batch Update for multiple SKUs
6. Complete tasks from Tasks tab
7. Submit reports

### For TSM:
1. Login with credentials
2. Review team dashboard
3. Check pending approvals
4. Create/approve work plans
5. Monitor territory performance
6. Support team members

### For Managers/Executives:
1. Login with credentials
2. Review dashboards
3. Analyze reports
4. Make approvals
5. Strategic planning

---

## Support & Training

**Available Resources:**
- In-app help guides
- Role-specific tutorials
- Video demonstrations
- Support contact

**Training Topics:**
- Navigation basics
- Stock verification
- Batch updates
- 360° view usage
- Proof upload
- Geofencing understanding

---

## Updates & Enhancements

**Recent Additions:**
✅ Batch Stock Update modal
✅ Multi-SKU verification
✅ Retailer selector with search
✅ Add new retailer capability
✅ Enhanced geofencing
✅ Improved pagination
✅ Mobile-optimized UI

**Planned Features:**
- 📱 Barcode scanning
- 📸 Multi-photo proof
- 📊 Offline analytics
- 🗺️ Route optimization
- 💬 In-app chat
- 📧 Push notifications

---

## Contact

For technical support or feature requests, contact the development team.

**Version:** 2.0.0
**Last Updated:** January 2024
**Platform:** React + Supabase
