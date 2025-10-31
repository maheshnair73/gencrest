# Plan: Remove All Hardcoded Data & Supabase Dependencies

## Current Status

### ✅ Completed
1. Added centralized interfaces to mockData.ts:
   - `LiveMeeting`
   - `DashboardStats`
   - `LiquidationMetrics`
   - `DistributorLiquidation`
   - `ProductData`

2. Added centralized mock data constants:
   - `MOCK_LIVE_MEETINGS`
   - `MOCK_DASHBOARD_STATS`
   - `MOCK_OVERALL_LIQUIDATION_METRICS`
   - `MOCK_DISTRIBUTOR_LIQUIDATION`
   - `MOCK_PRODUCT_DATA`

3. Updated MDODashboard.tsx to use centralized data

### 🔄 Remaining Work

## Files with Hardcoded Data

### Dashboard Components (9 files)
All these files have hardcoded `liveMeetings` and `stats`:

1. **TSMDashboard.tsx**
   - Has complex custom interfaces for `TSMMeeting`
   - Has hardcoded `meetings` array
   - Has hardcoded `approvalRequests` array
   - Has hardcoded `tasks` array

2. **RBHDashboard.tsx**
   - Hardcoded `liveMeetings` useState
   - Hardcoded `distributorPerformance` array
   - Hardcoded stats

3. **ZBHDashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded `regionData` array
   - Hardcoded stats

4. **RMMDashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded stats

5. **MHDashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded stats

6. **VPDashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded stats

7. **MDDashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded stats

8. **CFODashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded `financialMetrics` array
   - Hardcoded stats

9. **CHRODashboard.tsx**
   - Hardcoded `liveMeetings`
   - Hardcoded stats

### Page Components

10. **Reports.tsx**
    - Uses Supabase for data fetching
    - Needs to use MOCK_REPORTS from mockData.ts

11. **MobileApp.tsx**
    - Has hardcoded `liveMeetings`

## Files with Supabase Imports (Need Review)

1. **src/lib/supabase.ts** - Core Supabase client (can keep for future)
2. **src/services/apiService.ts** - Template file with Supabase imports (used for pagination)
3. **src/utils/stockTransferService.ts** - Uses Supabase for stock operations
4. **src/pages/Reports.tsx** - Uses Supabase to fetch reports
5. **src/data/mockData.ts** - No actual Supabase usage, just imports type

## Recommended Actions

### Phase 1: Add Missing Mock Data to mockData.ts

Add these new interfaces and constants:

```typescript
// For TSM Dashboard
export interface TSMMeeting {
  id: string;
  title: string;
  type: 'Field Visit' | 'Sales Order' | 'Liquidation' | 'Internal';
  date: string;
  time: string;
  location: string;
  customerName?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  // ... all other fields
}

export interface ApprovalRequest {
  id: string;
  type: string;
  submittedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  // ... all other fields
}

// For RBH/ZBH/Region Dashboards
export interface DistributorPerformance {
  id: string;
  name: string;
  territory: string;
  liquidation: number;
  target: number;
  achievement: number;
}

export interface RegionData {
  zone: string;
  regions: Array<{
    name: string;
    liquidation: number;
    target: number;
  }>;
}

// For CFO Dashboard
export interface FinancialMetrics {
  category: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

// Export constants
export const MOCK_TSM_MEETINGS: TSMMeeting[] = [...];
export const MOCK_APPROVAL_REQUESTS: ApprovalRequest[] = [...];
export const MOCK_DISTRIBUTOR_PERFORMANCE: DistributorPerformance[] = [...];
export const MOCK_REGION_DATA: RegionData[] = [...];
export const MOCK_FINANCIAL_METRICS: FinancialMetrics[] = [...];
```

### Phase 2: Update All Dashboard Components

For each dashboard file:

**Before:**
```typescript
const [liveMeetings, setLiveMeetings] = useState([
  { id: 'LM001', participantName: 'Ram Kumar', ... }
]);

const stats = {
  todayVisits: { planned: 5, completed: 2, pending: 3 },
  ...
};
```

**After:**
```typescript
import { MOCK_LIVE_MEETINGS, MOCK_DASHBOARD_STATS } from '../data/mockData';

const [liveMeetings, setLiveMeetings] = useState(MOCK_LIVE_MEETINGS);
const stats = MOCK_DASHBOARD_STATS;
```

### Phase 3: Replace Supabase Usage in Reports.tsx

**Before:**
```typescript
let mdoQuery = supabase.from('mdo_visits').select('*');
```

**After:**
```typescript
import { MOCK_REPORTS } from '../data/mockData';
// Use MOCK_REPORTS instead of Supabase query
```

### Phase 4: Handle stockTransferService.ts

Options:
1. Keep Supabase for actual data operations
2. Create mock functions that simulate the operations
3. Make it configurable with environment variable

### Phase 5: Clean Up apiService.ts

Since it's used for pagination, we should:
1. Keep the pagination utility functions
2. Remove or comment out Supabase-specific imports
3. Make functions work with mock data

## Benefits After Completion

✅ **Single Source of Truth**
- All data in mockData.ts
- Easy to find and modify
- No scattered hardcoded values

✅ **No Supabase Dependencies** (where not needed)
- Faster development
- No database setup required
- Works offline

✅ **Type Safety**
- All interfaces exported from mockData.ts
- Components import and use typed data
- Compile-time error checking

✅ **Easier Testing**
- Mock data readily available
- Consistent test data
- Predictable behavior

✅ **Cleaner Code**
- Components focus on logic
- Data separated from presentation
- Better maintainability

## Migration to Real API Later

When ready for production:
1. Keep all interfaces in mockData.ts
2. Create real API functions in apiService.ts
3. Use environment variable to switch between mock and real data
4. No component changes needed!

Example:
```typescript
// In component
const data = USE_MOCK_DATA
  ? MOCK_DISTRIBUTORS
  : await fetchDistributors();
```

## Estimated Impact

- **Files to Update**: 15+
- **Lines Removed**: ~500 hardcoded lines
- **Lines Added to mockData.ts**: ~300 centralized lines
- **Net Improvement**: Cleaner, more maintainable codebase
