# API Documentation for Unified Dashboard and Reports

This document defines all API endpoints, expected request/response formats, and data mappings for the unified dashboard and reports system.

## Base Configuration

```typescript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

All requests include:
- **Authorization**: `Bearer ${token}` (from localStorage)
- **Content-Type**: `application/json`

---

## Dashboard APIs

### 1. Get Complete Dashboard Data

**Endpoint**: `GET /api/v1/dashboard`

**Query Parameters**:
- `role` (required): User role code (e.g., MDO, TSM, RBH, etc.)

**Response Format**:
```json
{
  "metrics": [
    {
      "label": "Total Sales",
      "value": "₹4.5L",
      "change": 12.5,
      "trend": "up",
      "icon": "target",
      "color": "blue"
    }
  ],
  "charts": {
    "salesTrend": [
      { "label": "Jan", "value": 45000, "category": "sales" }
    ],
    "performanceByRegion": [
      { "label": "North", "value": 85, "category": "performance" }
    ]
  },
  "team": [
    {
      "id": "emp001",
      "name": "Rajesh Kumar",
      "role": "MDO",
      "avatar": "https://...",
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
      "title": "Client Visit",
      "description": "Met with distributor ABC",
      "timestamp": "2025-10-28T10:30:00Z",
      "user": "Rajesh Kumar",
      "status": "completed"
    }
  ],
  "alerts": [
    {
      "type": "warning",
      "message": "5 pending approvals require attention"
    }
  ]
}
```

**Data Mapping**:
- `metrics`: Array of KPI cards displayed at top
- `charts`: Key-value pairs of chart names to data arrays
- `team`: Team member performance cards
- `activities`: Recent activity timeline
- `alerts`: Important notifications

---

### 2. Get Metrics Only

**Endpoint**: `GET /api/v1/dashboard/metrics`

**Query Parameters**:
- `role` (required): User role code
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `zone` (optional): Zone filter
- `region` (optional): Region filter
- `territory` (optional): Territory filter

**Response Format**:
```json
[
  {
    "label": "Active Distributors",
    "value": 142,
    "change": 8.3,
    "trend": "up",
    "icon": "users",
    "color": "green"
  },
  {
    "label": "Pending Liquidations",
    "value": 23,
    "change": -15.2,
    "trend": "down",
    "icon": "activity",
    "color": "orange"
  }
]
```

**Supported Icons**:
- `users`, `target`, `activity`, `calendar`, `award`, `trending_up`, `trending_down`

**Supported Colors**:
- `blue`, `green`, `orange`, `purple`, `red`, `yellow`, `teal`, `pink`

---

### 3. Get Chart Data

**Endpoint**: `GET /api/v1/dashboard/charts`

**Query Parameters**:
- `chartType` (required): Type of chart (e.g., salesTrend, performanceByRegion)
- `role` (required): User role code
- Filters: Same as metrics endpoint

**Response Format**:
```json
[
  {
    "label": "Monday",
    "value": 12500,
    "category": "sales"
  },
  {
    "label": "Tuesday",
    "value": 15200,
    "category": "sales"
  }
]
```

---

### 4. Get Team Performance

**Endpoint**: `GET /api/v1/dashboard/team`

**Query Parameters**:
- `role` (required): User role code

**Response Format**:
```json
[
  {
    "id": "emp001",
    "name": "Priya Sharma",
    "role": "TSM",
    "avatar": "https://example.com/avatar.jpg",
    "metrics": [
      { "label": "Visits Completed", "value": 87 },
      { "label": "Target Achievement", "value": "92%" },
      { "label": "Liquidations", "value": 45 }
    ]
  }
]
```

---

### 5. Get Activities

**Endpoint**: `GET /api/v1/dashboard/activities`

**Query Parameters**:
- `role` (required): User role code
- `limit` (optional, default: 10): Number of activities to return

**Response Format**:
```json
[
  {
    "id": "act12345",
    "type": "liquidation",
    "title": "Stock Liquidated",
    "description": "Distributor ABC - 500kg fertilizer liquidated",
    "timestamp": "2025-10-28T14:23:00Z",
    "user": "Rajesh Kumar",
    "status": "verified"
  }
]
```

**Supported Activity Types**:
- `visit`, `order`, `payment`, `liquidation`, `approval`, `meeting`

**Supported Statuses**:
- `completed`, `pending`, `scheduled`, `cancelled`, `verified`

---

## Reports APIs

### 1. Get Report Data (Paginated)

**Endpoint**: `GET /api/v1/reports`

**Query Parameters**:
- `type` (required): Report type (`customer`, `distributor`, `product`)
- `page` (default: 1): Page number
- `limit` (default: 50): Items per page
- `search` (optional): Search term
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `zone` (optional): Zone filter
- `region` (optional): Region filter
- `territory` (optional): Territory filter
- `status` (optional): Status filter
- `category` (optional): Category filter

**Response Format**:
```json
{
  "data": [
    {
      "id": "dist001",
      "name": "ABC Distributors",
      "code": "D12345",
      "territory": "North Delhi",
      "status": "active",
      "total_sales": 450000,
      "outstanding": 125000,
      "last_order_date": "2025-10-25"
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

**Data Structure by Report Type**:

**Customer Report**:
```json
{
  "customer_id": "string",
  "customer_name": "string",
  "contact_person": "string",
  "phone": "string",
  "email": "string",
  "territory": "string",
  "region": "string",
  "zone": "string",
  "status": "string",
  "total_orders": "number",
  "total_value": "number",
  "last_order_date": "string"
}
```

**Distributor Report**:
```json
{
  "distributor_id": "string",
  "distributor_name": "string",
  "code": "string",
  "territory": "string",
  "credit_limit": "number",
  "credit_utilized": "number",
  "outstanding_amount": "number",
  "total_liquidation": "number",
  "status": "string"
}
```

**Product Report**:
```json
{
  "product_id": "string",
  "product_name": "string",
  "sku": "string",
  "category": "string",
  "units_sold": "number",
  "revenue": "number",
  "stock_level": "number",
  "reorder_level": "number"
}
```

---

### 2. Get Report Summary

**Endpoint**: `GET /api/v1/reports/summary`

**Query Parameters**:
- `type` (required): Report type
- Filters: Same as report data endpoint

**Response Format**:
```json
{
  "total_count": 250,
  "total_value": 12500000,
  "average_value": 50000,
  "active_count": 180,
  "inactive_count": 70
}
```

---

### 3. Export Report

**Endpoint**: `GET /api/v1/reports/export`

**Query Parameters**:
- `type` (required): Report type
- `format` (required): Export format (`excel`, `pdf`, `csv`)
- Filters: Same as report data endpoint

**Response**: Binary file (Excel/PDF/CSV)

**Content-Type Headers**:
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`
- CSV: `text/csv`

---

## Caching Strategy

### Cache Keys Format

Dashboard:
```
dashboard_{role}
dashboard_metrics_{role}_{filters_hash}
dashboard_charts_{chartType}_{role}_{filters_hash}
dashboard_team_{role}
dashboard_activities_{role}_{limit}
```

Reports:
```
reports_{type}_{page}_{limit}_{filters_json}
reports_summary_{type}_{filters_json}
```

### Cache Duration

- Dashboard complete data: 5 minutes
- Metrics: 5 minutes
- Charts: 5 minutes
- Team performance: 10 minutes
- Activities: 2 minutes
- Reports data: 3 minutes
- Reports summary: 5 minutes

### Cache Invalidation

Invalidate when:
- User changes filters
- User changes report type
- User manually refreshes
- Data mutation occurs (POST/PUT/DELETE)

Pattern matching:
```typescript
cache.invalidate('dashboard_');  // Invalidates all dashboard caches
cache.invalidate('reports_customer_');  // Invalidates customer report caches
```

---

## Error Handling

All endpoints should return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Role-Based Data Access

Different roles see different data scopes:

| Role | Data Scope |
|------|-----------|
| MDO  | Own territory data |
| TSM  | Territory and region data |
| RBH  | Region data |
| RMM  | Region data (marketing focused) |
| ZBH  | Zone data |
| MH   | Multi-zone data |
| VP   | National data |
| MD   | All data |
| CFO  | Financial data (all) |
| CHRO | HR data (all) |

The `role` parameter in API calls determines data filtering on the backend.

---

## Implementation Notes

1. **Authentication**: All requests require valid JWT token
2. **Rate Limiting**: Consider implementing rate limits (e.g., 100 requests/minute)
3. **Pagination**: Always implement pagination for large datasets
4. **Filtering**: Support multiple filters with AND logic
5. **Sorting**: Add `sortBy` and `sortOrder` parameters where applicable
6. **Search**: Implement full-text search across relevant fields
7. **Caching**: Use Redis or similar for server-side caching
8. **Compression**: Enable GZIP compression for responses
9. **CORS**: Configure appropriate CORS headers
10. **Monitoring**: Log all API calls for debugging and analytics
