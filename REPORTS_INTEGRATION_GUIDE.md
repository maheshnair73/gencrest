# Reports Page Integration Guide

## Overview

The refactored Reports page has been designed to work with your API endpoints, with all Supabase dependencies removed and hardcoded data eliminated.

## Files Created

1. **`src/types/reports.ts`** - TypeScript interfaces for all data structures
2. **`src/pages/Reports.refactored.tsx`** - New Reports component ready for API integration
3. **`src/data/mockReportsData.ts`** - Sample mock data for testing
4. **`REPORTS_DATA_FORMAT.md`** - Complete API data format documentation

## Quick Start

### Step 1: Replace the old Reports.tsx

```bash
# Backup the old file
mv src/pages/Reports.tsx src/pages/Reports.backup.tsx

# Use the refactored version
mv src/pages/Reports.refactored.tsx src/pages/Reports.tsx
```

### Step 2: Create Your API Service

Create a new file `src/services/reportsApi.ts`:

```typescript
import { MDOSummary, ProductSKUData } from '../types/reports';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api.com';

export const reportsApiService = {
  async fetchProductData(filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    categories?: string[];
    products?: string[];
  }): Promise<ProductSKUData[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/products`, filters);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching product data:', error);
      throw error;
    }
  },

  async fetchMDOData(filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    outlets?: string[];
    distributors?: string[];
  }): Promise<MDOSummary[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/mdo`, filters);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching MDO data:', error);
      throw error;
    }
  }
};
```

### Step 3: Update Your App.tsx (or Routes)

```typescript
import Reports from './pages/Reports';
import { reportsApiService } from './services/reportsApi';

// Inside your component or route
<Reports
  fetchProductData={reportsApiService.fetchProductData}
  fetchMDOData={reportsApiService.fetchMDOData}
/>
```

## Testing with Mock Data (Development)

While your API is being developed, you can test with mock data:

```typescript
import Reports from './pages/Reports';
import { MOCK_PRODUCT_DATA, MOCK_MDO_DATA } from './data/mockReportsData';

// For testing
<Reports
  initialProductData={MOCK_PRODUCT_DATA}
  initialMDOData={MOCK_MDO_DATA}
/>
```

Or create mock API functions:

```typescript
import { MOCK_PRODUCT_DATA, MOCK_MDO_DATA } from './data/mockReportsData';

const mockApiService = {
  fetchProductData: async (filters) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCT_DATA;
  },

  fetchMDOData: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_MDO_DATA;
  }
};

<Reports
  fetchProductData={mockApiService.fetchProductData}
  fetchMDOData={mockApiService.fetchMDOData}
/>
```

## API Integration Details

### API Endpoints Expected

#### 1. Product Data Endpoint

**POST** `/reports/products`

**Request Body:**
```json
{
  "dateFrom": "2025-04-01",
  "dateTo": "2025-10-15",
  "zones": ["North Zone"],
  "regions": ["Delhi NCR"],
  "states": ["Delhi"],
  "territories": ["Green Valley"],
  "categories": ["Fertilizer"],
  "products": ["Samta NPK 6-0-18"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_code": "FGCMGM0092",
      "product_name": "Samta NPK 6-0-18",
      "sku_code": "fgsamf00050",
      "sku_name": "Samta NPK 6-0-18 fortified - 1 Ltr",
      "opening_stock": 700000,
      "opening_stock_units": 10,
      "ytd_sales": 630000,
      "ytd_sales_units": 84,
      "balance_stock": 567000,
      "balance_stock_units": 420,
      "unit": "Ltr",
      "category": "Fertilizer"
    }
  ],
  "lastUpdated": "2025-10-27T10:30:00Z"
}
```

#### 2. MDO/Outlet Data Endpoint

**POST** `/reports/mdo`

**Request Body:**
```json
{
  "dateFrom": "2025-04-01",
  "dateTo": "2025-10-15",
  "zones": ["North Zone"],
  "regions": ["Delhi NCR"],
  "states": ["Delhi"],
  "territories": ["Green Valley"],
  "outlets": [],
  "distributors": []
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "mdo_id": "MDO001",
      "mdo_name": "Rajesh Kumar",
      "zone": "North Zone",
      "region": "Delhi NCR",
      "territory": "Green Valley",
      "state": "Delhi",
      "opening_stock": 19000000,
      "ytd_sales": 4370000,
      "liquidation": 5552000,
      "balance_stock": 17823000,
      "outlet_count": 15,
      "updated_at": "2025-10-15T10:30:00Z",
      "outlets": [
        {
          "id": "TXN001",
          "outlet_id": "OUT001",
          "outlet_code": "1325",
          "outlet_name": "SRI RAMA SEEDS",
          "owner_name": "Ramesh Sharma",
          "transaction_date": "2025-10-15T00:00:00Z",
          "opening_stock": 2840000,
          "opening_stock_units": 210,
          "purchases": 0,
          "sales": 1130000,
          "sales_units": 84,
          "liquidation": 2840000,
          "liquidation_units": 210,
          "balance_stock": 5670000,
          "balance_stock_units": 420,
          "zone": "North Zone",
          "region": "Delhi NCR",
          "territory": "Green Valley",
          "state": "Delhi",
          "updated_at": "2025-10-15T10:30:00Z"
        }
      ]
    }
  ],
  "lastUpdated": "2025-10-27T10:30:00Z"
}
```

## Features Preserved

All existing features work exactly as before:

1. ✅ Three view modes (Product, MDO, Outlet)
2. ✅ Advanced filtering (Zone, Region, State, Territory, etc.)
3. ✅ Search functionality
4. ✅ Column show/hide
5. ✅ Date range filtering
6. ✅ Pagination (20 items per page)
7. ✅ Export to Excel/PDF
8. ✅ Expandable MDO rows
9. ✅ Refresh data
10. ✅ Role-based access control

## Environment Variables

Add to your `.env` file:

```bash
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Error Handling

The component includes built-in error handling. If API calls fail:
- Error is logged to console
- Empty array is set as data
- Loading state is cleared
- User can retry with refresh button

## TypeScript Support

Full TypeScript support with:
- Interface definitions in `src/types/reports.ts`
- Type-safe props
- Autocomplete for data structures

## Migration Checklist

- [ ] Backup old Reports.tsx
- [ ] Copy refactored version to Reports.tsx
- [ ] Create API service file
- [ ] Test with mock data first
- [ ] Connect real API endpoints
- [ ] Test all three view modes
- [ ] Test filtering and search
- [ ] Test pagination
- [ ] Test export functionality
- [ ] Deploy to production

## Support

For detailed data format specifications, see `REPORTS_DATA_FORMAT.md`

For sample data structures, see `src/data/mockReportsData.ts`

For type definitions, see `src/types/reports.ts`
