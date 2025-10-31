# Mock Data Centralization Guide

## Overview

All mock data has been centralized into a single location for easy management and API replacement. This guide explains where the data is located and how to replace it with real API calls.

---

## File Locations

### 1. **Mock Data Source**
**Location:** `src/data/mockData.ts`

This file contains all mock data used throughout the application:
- Distributors
- Retailers
- Products & SKUs
- Tasks
- Visits
- Reports
- Team Members
- Orders
- Meetings
- Work Plan
- Geofence Configuration

### 2. **API Service Template**
**Location:** `src/services/apiService.ts`

This file provides ready-to-use API functions for replacing mock data with Supabase calls.

---

## Mock Data Structure

### Available Data Sets

```typescript
// Distributors
MOCK_DISTRIBUTORS: MockDistributor[]
// 3 sample distributors with complete details

// Retailers
MOCK_RETAILERS: MockRetailer[]
// 2 sample retailers linked to distributors

// Products & SKUs
MOCK_PRODUCTS: MockProduct[]
// 3 products (DAP, NPK, Urea) with multiple SKUs and transaction history

// Tasks
MOCK_TASKS: MockTask[]
// 4 sample tasks with different priorities and statuses

// Visits
MOCK_VISITS: MockVisit[]
// 3 sample visits (completed, in-progress, scheduled)

// Reports
MOCK_REPORTS: MockReport[]
// 3 sample reports with different statuses

// Team Members
MOCK_TEAM_MEMBERS: MockTeamMember[]
// 4 team members with roles and territories

// Orders
MOCK_ORDERS: MockOrder[]
// 3 sample orders with line items

// Meetings
MOCK_MEETINGS: MockMeeting[]
// 3 sample meetings with different statuses

// Work Plan
MOCK_WORK_PLAN: MockWorkPlanDay[]
// 7 days of work plan data

// Geofence Config
MOCK_GEOFENCE_CONFIG
// Geofence radius and default location
```

---

## Components Using Mock Data

### MobileApp Component
**File:** `src/components/MobileApp.tsx`

**Imported Data:**
```typescript
import {
  MOCK_DISTRIBUTORS,
  MOCK_RETAILERS,
  MOCK_TASKS,
  MOCK_VISITS,
  MOCK_REPORTS,
  MOCK_TEAM_MEMBERS,
  MOCK_ORDERS,
  MOCK_MEETINGS,
  MOCK_WORK_PLAN,
  MOCK_PRODUCTS,
  MOCK_GEOFENCE_CONFIG
} from '../data/mockData';
```

**Usage:**
- **Distributors:** Used in liquidation tab for listing and 360° view
- **Retailers:** Used in contacts tab for retailer search
- **Products:** Used in stock verification modal
- **Tasks:** Displayed in tasks tab
- **Orders:** Shown in orders tab
- **Reports:** Listed in reports tab
- **Team Members:** Displayed in team tab
- **Geofence Config:** Used for location validation

---

## How to Replace with Real APIs

### Step 1: Use API Service Functions

The `src/services/apiService.ts` file provides pre-built functions for all data operations:

```typescript
// Example: Fetching distributors
import { fetchDistributors } from '../services/apiService';
import { MOCK_DISTRIBUTORS } from '../data/mockData';

const [distributors, setDistributors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      // Use real API
      const data = await fetchDistributors();

      // OR use mock data during development
      // const data = MOCK_DISTRIBUTORS;

      setDistributors(data);
    } catch (error) {
      console.error('Error loading distributors:', error);

      // Fallback to mock data on error
      setDistributors(MOCK_DISTRIBUTORS);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### Step 2: Available API Functions

**Distributors:**
- `fetchDistributors()` - Get all distributors
- `fetchDistributorById(id)` - Get single distributor
- `updateDistributor(id, updates)` - Update distributor

**Retailers:**
- `fetchRetailers()` - Get all retailers
- `fetchRetailersByDistributor(distributorId)` - Get retailers by distributor

**Inventory:**
- `fetchInventory(entityId)` - Get inventory for entity
- `fetchStockTransactions(entityId, entityType)` - Get transaction history
- `updateStockQuantity(inventoryId, quantity)` - Update stock

**Visits:**
- `createVisit(visitData)` - Create new visit
- `completeVisit(visitId, notes)` - Complete visit
- `fetchVisits(startDate, endDate)` - Get visits by date range

**Tasks:**
- `fetchTasks(userId, status?)` - Get tasks for user
- `updateTaskStatus(taskId, status)` - Update task status

**Orders:**
- `fetchOrders(distributorId?)` - Get orders
- `createOrder(orderData)` - Create new order

**Verifications:**
- `submitVerification(verificationData)` - Submit stock verification

**Reports:**
- `fetchReports(type?)` - Get reports
- `generateReport(reportType)` - Generate new report

### Step 3: Update Component Imports

**Before (using mock data):**
```typescript
import { MOCK_DISTRIBUTORS } from '../data/mockData';

const distributors = MOCK_DISTRIBUTORS;
```

**After (using API):**
```typescript
import { fetchDistributors } from '../services/apiService';

const [distributors, setDistributors] = useState([]);

useEffect(() => {
  fetchDistributors().then(setDistributors);
}, []);
```

### Step 4: Add Loading & Error States

Always add proper loading and error handling:

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDistributors();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

---

## Gradual Migration Strategy

### Phase 1: Development (Current)
- Use mock data from `src/data/mockData.ts`
- No API calls, fast development
- Easy to modify test data

### Phase 2: Testing
- Import both mock data and API functions
- Toggle between mock and real data with a flag:

```typescript
const USE_MOCK_DATA = false; // Set to true for testing

const data = USE_MOCK_DATA
  ? MOCK_DISTRIBUTORS
  : await fetchDistributors();
```

### Phase 3: Production
- Remove mock data imports
- Use only API functions
- Keep mock data file for reference and testing

---

## Benefits of Centralized Mock Data

### ✅ Easy to Find
All data in one file: `src/data/mockData.ts`

### ✅ Easy to Update
Change data structure in one place, reflects everywhere

### ✅ Easy to Replace
Clear separation between mock data and API calls

### ✅ Type Safety
TypeScript interfaces ensure data consistency

### ✅ Documentation
Comprehensive comments explain data structure and usage

### ✅ Helper Functions
Utility functions for common data operations

---

## Data Model Documentation

All TypeScript interfaces are defined in `src/data/mockData.ts`:

- `MockDistributor` - Distributor entity structure
- `MockRetailer` - Retailer entity structure
- `MockProduct` - Product with SKUs structure
- `MockSKU` - Individual SKU details
- `MockTransaction` - Transaction record structure
- `MockTask` - Task structure
- `MockVisit` - Visit record structure
- `MockReport` - Report structure
- `MockTeamMember` - Team member structure
- `MockOrder` - Order structure
- `MockMeeting` - Meeting structure
- `MockWorkPlanDay` - Work plan day structure

---

## Quick Reference

### Find Mock Data
📁 `src/data/mockData.ts`

### Find API Functions
📁 `src/services/apiService.ts`

### Components Using Mock Data
📁 `src/components/MobileApp.tsx` - Main mobile app
📁 Other components as needed

### Database Schema
📁 `supabase/migrations/` - Database migrations

---

## Support

For questions about data structure or API integration:
1. Check `src/data/mockData.ts` for data structure
2. Check `src/services/apiService.ts` for API examples
3. Check database migrations for schema details

---

**Last Updated:** October 17, 2025
**Maintained By:** Development Team
