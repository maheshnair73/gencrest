# Implementation Guide: Unified Dashboard & Reports

This guide explains how to use the new unified dashboard and reports system.

## Overview

The new system provides:
- **Single unified Dashboard page** that dynamically renders based on user role
- **Single unified Reports page** with dynamic data loading
- **Efficient caching layer** to reduce API calls
- **No hard-coded data** - everything comes from APIs
- **Production-ready** with proper error handling and loading states

---

## File Structure

```
src/
├── contexts/
│   └── DataCacheContext.tsx         # Caching layer
├── services/
│   ├── apiService.ts                # Base API utilities
│   └── dashboardApiService.ts       # Dashboard & Reports APIs
├── pages/
│   ├── UnifiedDashboard.tsx         # New unified dashboard
│   └── UnifiedReports.tsx           # New unified reports
└── main.tsx                         # Updated with DataCacheProvider
```

---

## 1. Data Caching System

### Usage in Components

```typescript
import { useCachedData } from '../contexts/DataCacheContext';

const { data, loading, error, refetch } = useCachedData(
  'unique_cache_key',
  async () => {
    // Fetch function that returns data
    const result = await apiService.getData();
    return result.data;
  },
  5 * 60 * 1000 // Cache duration in ms (5 minutes)
);
```

### Cache Management

```typescript
import { useDataCache } from '../contexts/DataCacheContext';

const cache = useDataCache();

// Check if data exists in cache
if (cache.has('dashboard_MDO')) {
  const data = cache.get('dashboard_MDO');
}

// Manually set cache
cache.set('my_key', myData, 10 * 60 * 1000);

// Remove specific cache
cache.remove('my_key');

// Invalidate by pattern
cache.invalidate('dashboard_'); // Removes all dashboard caches

// Clear all caches
cache.clear();
```

---

## 2. Unified Dashboard

### Location
`src/pages/UnifiedDashboard.tsx`

### Features
- Automatically fetches data based on user role
- Displays metrics, charts, team performance, activities, and alerts
- Fully responsive and production-ready
- Efficient caching (5-minute default)

### How It Works

1. **Reads user role** from AuthContext
2. **Generates cache key** based on role: `dashboard_{role}`
3. **Fetches data** from `/api/v1/dashboard?role={role}`
4. **Renders components** dynamically based on response data

### Data Structure

The dashboard expects this response format:

```typescript
interface DashboardData {
  metrics: DashboardMetric[];      // Top KPI cards
  charts?: {                        // Chart data (optional)
    [chartName: string]: ChartDataPoint[];
  };
  team?: TeamMember[];             // Team performance cards (optional)
  activities?: Activity[];          // Activity timeline (optional)
  alerts?: Alert[];                // Important alerts (optional)
}
```

### Example API Response

```json
{
  "metrics": [
    {
      "label": "Total Visits",
      "value": 145,
      "change": 12.5,
      "trend": "up",
      "icon": "users",
      "color": "blue"
    }
  ],
  "team": [
    {
      "id": "emp001",
      "name": "Rajesh Kumar",
      "role": "MDO",
      "metrics": [
        { "label": "Visits", "value": 45 },
        { "label": "Sales", "value": "₹2.3L" }
      ]
    }
  ],
  "activities": [
    {
      "id": "act001",
      "type": "visit",
      "title": "Client Meeting",
      "description": "Met with distributor ABC",
      "timestamp": "2025-10-28T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

### Customization

To customize dashboard for different roles:

1. **Backend**: Return role-specific data from `/api/v1/dashboard?role={role}`
2. **No frontend changes needed** - dashboard automatically adapts

---

## 3. Unified Reports

### Location
`src/pages/UnifiedReports.tsx`

### Features
- Three report types: Customer, Distributor, Product
- Dynamic filtering and search
- Pagination support
- Export to Excel/CSV
- Summary metrics
- Efficient caching (3-minute default)

### How It Works

1. **User selects report type** (Customer/Distributor/Product)
2. **Applies filters** (search, dates, status, etc.)
3. **Generates cache key** based on type, page, filters
4. **Fetches data** from `/api/v1/reports?type={type}&page={page}&limit={limit}&filters...`
5. **Renders table** dynamically based on data structure

### Data Structure

Reports endpoint should return:

```typescript
interface ReportResponse {
  data: Record<string, any>[];  // Array of objects (table rows)
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Example API Response

```json
{
  "data": [
    {
      "distributor_id": "D001",
      "name": "ABC Traders",
      "territory": "North Delhi",
      "sales": 450000,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

### Dynamic Table Rendering

The reports page automatically:
- **Extracts column headers** from first data object keys
- **Renders all columns** dynamically
- **No need to define columns** manually

---

## 4. API Service Layer

### Dashboard APIs

```typescript
import { dashboardApiService } from '../services/dashboardApiService';

// Get complete dashboard data
const result = await dashboardApiService.getDashboardData('MDO');

// Get only metrics
const metrics = await dashboardApiService.getMetrics('MDO', {
  dateFrom: '2025-10-01',
  dateTo: '2025-10-31'
});

// Get chart data
const chartData = await dashboardApiService.getChartData('salesTrend', 'MDO');

// Get team performance
const team = await dashboardApiService.getTeamPerformance('MDO');

// Get activities
const activities = await dashboardApiService.getActivities('MDO', 10);
```

### Reports APIs

```typescript
import { reportsApiService } from '../services/dashboardApiService';

// Get paginated report data
const result = await reportsApiService.getReportData(
  'customer',
  { search: 'ABC', status: 'active' },
  1,  // page
  50  // limit
);

// Get summary metrics
const summary = await reportsApiService.getReportSummary('distributor', filters);

// Export report
const blob = await reportsApiService.exportReport('product', 'excel', filters);
```

---

## 5. Integrating with Existing App

### Option 1: Replace Current Dashboard

Update `src/App.tsx`:

```typescript
import UnifiedDashboard from './pages/UnifiedDashboard';

// Replace existing Dashboard import with:
// import Dashboard from './pages/Dashboard';  ❌
// import UnifiedDashboard from './pages/UnifiedDashboard';  ✅

<Route path="/dashboard" element={<UnifiedDashboard />} />
```

### Option 2: Add as New Route

```typescript
import UnifiedDashboard from './pages/UnifiedDashboard';
import UnifiedReports from './pages/UnifiedReports';

<Route path="/dashboard-v2" element={<UnifiedDashboard />} />
<Route path="/reports-v2" element={<UnifiedReports />} />
```

### Update Sidebar Links

```typescript
// In Sidebar.tsx, update navigation items:
{ path: '/dashboard', label: 'Dashboard', icon: Home }
{ path: '/reports', label: 'Reports', icon: FileText }
```

---

## 6. Backend Implementation Checklist

### Dashboard Endpoint

- [ ] Implement `GET /api/v1/dashboard`
- [ ] Accept `role` query parameter
- [ ] Return role-specific data
- [ ] Include metrics, team, activities, alerts
- [ ] Add proper error handling
- [ ] Implement caching (Redis recommended)

### Reports Endpoints

- [ ] Implement `GET /api/v1/reports`
- [ ] Accept `type`, `page`, `limit`, and filter parameters
- [ ] Return paginated data with metadata
- [ ] Implement `GET /api/v1/reports/summary`
- [ ] Implement `GET /api/v1/reports/export`
- [ ] Support Excel, PDF, CSV formats
- [ ] Add proper authorization checks

---

## 7. Testing

### Dashboard Testing

```typescript
// Test with different roles
const roles = ['MDO', 'TSM', 'RBH', 'ZBH', 'MH', 'VP', 'MD'];
roles.forEach(role => {
  // Switch user role
  // Navigate to dashboard
  // Verify correct data loads
});
```

### Reports Testing

```typescript
// Test report types
const types = ['customer', 'distributor', 'product'];
types.forEach(type => {
  // Select report type
  // Verify data loads
  // Test filtering
  // Test pagination
  // Test export
});
```

### Cache Testing

```typescript
// Verify caching works
// 1. Load dashboard - should fetch from API
// 2. Reload dashboard - should load from cache (fast)
// 3. Wait 5 minutes - should refetch from API
// 4. Change filters - should invalidate cache and refetch
```

---

## 8. Performance Optimization

### Current Optimizations

1. **Caching Layer**: Reduces redundant API calls
2. **useMemo**: Prevents unnecessary re-renders
3. **useCallback**: Optimizes function references
4. **Pagination**: Limits data transfer
5. **Lazy Loading**: Components render only when needed

### Additional Recommendations

1. **Virtual Scrolling**: For large tables (>1000 rows)
2. **Code Splitting**: Lazy load dashboard/reports
3. **Web Workers**: For heavy data processing
4. **CDN**: Serve static assets from CDN
5. **Compression**: Enable GZIP on server

---

## 9. Monitoring & Debugging

### Cache Monitoring

```typescript
// Add to component
useEffect(() => {
  console.log('Cache stats:', {
    hasData: cache.has('dashboard_MDO'),
    data: cache.get('dashboard_MDO')
  });
}, [cache]);
```

### API Monitoring

All API calls log automatically via `fetchWithAuth`:
- Request URL
- Response status
- Error details
- Timing information

### Performance Monitoring

```typescript
// Add performance markers
performance.mark('dashboard-start');
// ... load data ...
performance.mark('dashboard-end');
performance.measure('dashboard', 'dashboard-start', 'dashboard-end');
console.log(performance.getEntriesByName('dashboard'));
```

---

## 10. Migration Strategy

### Phase 1: Parallel Running (Recommended)
1. Keep old Dashboard and Reports pages
2. Deploy new UnifiedDashboard and UnifiedReports alongside
3. Test with beta users
4. Gather feedback
5. Fix any issues

### Phase 2: Gradual Rollout
1. Enable new pages for 10% of users
2. Monitor metrics and errors
3. Gradually increase to 50%, then 100%
4. Remove old pages

### Phase 3: Cleanup
1. Delete old dashboard component files
2. Remove unused API endpoints
3. Update documentation
4. Archive old code

---

## 11. Troubleshooting

### Dashboard Not Loading

**Check**:
1. Is user authenticated? (`useAuth()`)
2. Is API endpoint returning data?
3. Check browser console for errors
4. Verify cache is not corrupted: `cache.clear()`

### Reports Not Loading

**Check**:
1. Is report type valid? (customer/distributor/product)
2. Are filters causing no results?
3. Check pagination parameters
4. Verify API response format matches expected structure

### Cache Issues

**Solution**:
```typescript
// Clear all caches
cache.clear();

// Or invalidate specific pattern
cache.invalidate('dashboard_');
cache.invalidate('reports_');
```

### Slow Performance

**Check**:
1. Network tab - API response times
2. Cache hit rate - should be >80%
3. Re-render count - use React DevTools
4. Bundle size - should be <2MB

---

## 12. Future Enhancements

Potential improvements:

1. **Real-time Updates**: WebSocket integration for live data
2. **Offline Support**: Service worker + IndexedDB
3. **Customizable Dashboards**: User-defined widgets
4. **Advanced Filters**: Multi-select, ranges, autocomplete
5. **Saved Reports**: User can save filter combinations
6. **Scheduled Exports**: Automatic email reports
7. **Data Visualization**: More chart types
8. **Mobile App**: React Native version
9. **AI Insights**: Predictive analytics
10. **Multi-language**: i18n support

---

## Support

For questions or issues:
- Check API_DOCUMENTATION.md for API details
- Review error logs in browser console
- Check network tab for API responses
- Contact backend team for API issues
