# Backend API Response Formats

This document defines the exact JSON response formats expected from backend APIs for Dashboard and Reports functionality.

## Dashboard API Endpoints

### 1. GET /api/dashboard/metrics
Returns key performance metrics for the dashboard overview.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalLiquidation": {
      "value": 5000000000,
      "label": "Total Liquidation",
      "currency": "INR",
      "trend": {
        "direction": "up",
        "percentage": 1
      }
    },
    "ytdSales": {
      "value": 18000000000,
      "label": "YTD Sales",
      "currency": "INR",
      "trend": {
        "direction": "up",
        "percentage": 2
      }
    },
    "balanceStock": {
      "value": 600000,
      "label": "Balance Stock",
      "unit": "Units",
      "trend": {
        "direction": "down",
        "percentage": 0
      }
    },
    "activeMDOs": {
      "value": 471,
      "label": "Active MDOs",
      "trend": {
        "direction": "neutral",
        "percentage": 0
      }
    }
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 2. GET /api/dashboard/team-performance
Returns team member performance data.

**Query Parameters:**
- `userId` (optional): Filter by specific user
- `role` (optional): Filter by role (TSM, MDO, etc.)
- `limit` (optional): Number of results (default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_001",
      "name": "Rajesh Kumar",
      "role": "TSM",
      "avatar": null,
      "liquidationPercentage": 85,
      "visitsCompleted": 60,
      "visitsTarget": 70,
      "territory": "North Delhi",
      "region": "Delhi NCR",
      "zone": "North Zone"
    },
    {
      "id": "user_002",
      "name": "Priya Sharma",
      "role": "TSM",
      "avatar": null,
      "liquidationPercentage": 92,
      "visitsCompleted": 68,
      "visitsTarget": 70,
      "territory": "South Delhi",
      "region": "Delhi NCR",
      "zone": "North Zone"
    },
    {
      "id": "user_003",
      "name": "Amit Singh",
      "role": "MDO",
      "avatar": null,
      "liquidationPercentage": 78,
      "visitsCompleted": 110,
      "visitsTarget": 120,
      "territory": "East Delhi",
      "region": "Delhi NCR",
      "zone": "North Zone"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 3. GET /api/dashboard/recent-activities
Returns recent activities across the organization.

**Query Parameters:**
- `limit` (optional): Number of activities (default: 20)
- `type` (optional): Filter by activity type
- `userId` (optional): Filter by user

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_001",
      "type": "liquidation_verified",
      "title": "Liquidation Verified",
      "description": "LIQ-2024-001 by Rajesh Kumar",
      "timestamp": "2025-10-29T13:12:00Z",
      "status": "verified",
      "user": {
        "id": "user_001",
        "name": "Rajesh Kumar",
        "role": "TSM"
      },
      "metadata": {
        "liquidationId": "LIQ-2024-001",
        "amount": 150000,
        "verifiedBy": "Priya Sharma (TSM)"
      }
    },
    {
      "id": "activity_002",
      "type": "visit_completed",
      "title": "Visit Completed",
      "description": "Visit to Agrosatva Traders",
      "timestamp": "2025-10-29T12:17:00Z",
      "status": "completed",
      "user": {
        "id": "user_003",
        "name": "Amit Singh",
        "role": "MDO"
      },
      "metadata": {
        "outletName": "Agrosatva Traders",
        "location": "South Delhi",
        "visitDuration": 45
      }
    },
    {
      "id": "activity_003",
      "type": "stock_mismatch",
      "title": "Stock Mismatch",
      "description": "Discrepancy found at Dev Shree Enterprises",
      "timestamp": "2025-10-29T11:30:00Z",
      "status": "pending",
      "user": {
        "id": "user_004",
        "name": "Kavita Verma",
        "role": "TSM"
      },
      "metadata": {
        "outletName": "Dev Shree Enterprises",
        "expectedStock": 50,
        "actualStock": 45,
        "difference": -5
      }
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 4. GET /api/dashboard/pending-approvals
Returns count of pending approvals for the user.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "count": 8,
    "breakdown": {
      "travelClaims": 3,
      "activityReimbursements": 2,
      "workPlans": 2,
      "stockTransfers": 1
    }
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

## Reports API Endpoints

### 1. GET /api/reports/distributors
Returns distributor performance reports.

**Query Parameters:**
- `zone` (optional): Filter by zone
- `region` (optional): Filter by region
- `state` (optional): Filter by state
- `territory` (optional): Filter by territory
- `startDate` (optional): Start date for date range
- `endDate` (optional): End date for date range
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dist_001",
      "name": "Ram Kumar Distributors",
      "code": "DIS-001",
      "location": "Green Valley, Sector 12",
      "territory": "North Delhi",
      "region": "Delhi NCR",
      "zone": "North Zone",
      "state": "Delhi",
      "openingStock": {
        "value": 150000,
        "volume": 25,
        "unit": "Kg/Ltr"
      },
      "ytdSales": {
        "value": 1200000,
        "volume": 200,
        "unit": "Kg/Ltr"
      },
      "liquidation": {
        "value": 180000,
        "volume": 30,
        "unit": "Kg/Ltr",
        "percentage": 85
      },
      "balanceStock": {
        "value": 20000,
        "volume": 5,
        "unit": "Kg/Ltr"
      },
      "outstandingAmount": 50000,
      "overdueAmount": 10000,
      "status": "active",
      "lastUpdated": "2025-10-29T06:00:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "pageSize": 10,
    "totalPages": 13
  },
  "summary": {
    "totalOpeningStock": 18750000,
    "totalYTDSales": 150000000,
    "totalLiquidation": 22500000,
    "totalBalanceStock": 2500000,
    "averageLiquidationRate": 82
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 2. GET /api/reports/products
Returns product-wise sales and stock reports.

**Query Parameters:**
- `productId` (optional): Filter by product
- `category` (optional): Filter by category
- `zone` (optional): Filter by zone
- `startDate` (optional): Start date for date range
- `endDate` (optional): End date for date range
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "AgroPurna MP Gr-1",
      "code": "FGASM00094",
      "category": "Fertilizer",
      "packSize": "1 Ltr",
      "openingStock": {
        "value": 500000,
        "volume": 500,
        "unit": "Ltr"
      },
      "ytdSales": {
        "value": 4000000,
        "volume": 4000,
        "unit": "Ltr"
      },
      "liquidation": {
        "value": 600000,
        "volume": 600,
        "unit": "Ltr",
        "percentage": 88
      },
      "balanceStock": {
        "value": 100000,
        "volume": 100,
        "unit": "Ltr"
      },
      "averagePrice": 1000,
      "distributionCoverage": {
        "totalDistributors": 50,
        "activeDistributors": 45
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  },
  "summary": {
    "totalProducts": 45,
    "totalOpeningStock": 22500000,
    "totalYTDSales": 180000000,
    "totalLiquidation": 27000000,
    "totalBalanceStock": 4500000
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 3. GET /api/reports/customers
Returns customer (outlet/retailer) reports.

**Query Parameters:**
- `type` (optional): Filter by type (retailer/distributor)
- `zone` (optional): Filter by zone
- `region` (optional): Filter by region
- `territory` (optional): Filter by territory
- `status` (optional): Filter by status (active/inactive)
- `startDate` (optional): Start date for date range
- `endDate` (optional): End date for date range
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_001",
      "name": "Rajesh General Store",
      "code": "RET-001",
      "type": "retailer",
      "location": "Lajpat Nagar Market",
      "territory": "South Delhi",
      "region": "Delhi NCR",
      "zone": "North Zone",
      "state": "Delhi",
      "pincode": "110024",
      "contact": {
        "phone": "+91 98765 43214",
        "email": "rajesh@example.com"
      },
      "purchases": {
        "ytdValue": 500000,
        "ytdVolume": 50,
        "unit": "Kg/Ltr",
        "frequency": "weekly"
      },
      "outstandingAmount": 25000,
      "creditLimit": 100000,
      "lastVisit": "2025-10-28T10:30:00Z",
      "status": "active",
      "geoTagged": true
    }
  ],
  "pagination": {
    "total": 850,
    "page": 1,
    "pageSize": 10,
    "totalPages": 85
  },
  "summary": {
    "totalCustomers": 850,
    "activeCustomers": 780,
    "totalPurchases": 425000000,
    "totalOutstanding": 12500000,
    "geoTaggedPercentage": 65
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

### 4. GET /api/reports/export
Exports report data in specified format.

**Query Parameters:**
- `type`: Report type (distributors/products/customers)
- `format`: Export format (excel/pdf/csv)
- All applicable filter parameters from the respective report endpoint

**Response Format:**
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (Excel)
- Content-Type: application/pdf (PDF)
- Content-Type: text/csv (CSV)
- Content-Disposition: attachment; filename="report-{type}-{timestamp}.{ext}"

## Common Error Response Format

All endpoints should return errors in this standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context if applicable"
    }
  },
  "timestamp": "2025-10-29T06:21:00Z"
}
```

## Error Codes

- `AUTH_REQUIRED`: User authentication required
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `INVALID_PARAMETERS`: Invalid query parameters
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `SERVER_ERROR`: Internal server error

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer {access_token}
```

## Rate Limiting

- Dashboard endpoints: 60 requests per minute
- Reports endpoints: 30 requests per minute
- Export endpoints: 10 requests per minute
