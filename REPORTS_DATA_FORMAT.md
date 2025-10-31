# Reports Page - API Data Format

This document describes the exact data format required for the Reports page to function properly.

## Overview

The Reports page supports three view modes:
1. **Product View** - Shows product/SKU level data
2. **MDO View** - Shows MDO summary with expandable outlets
3. **Outlet View** - Shows flat list of all outlets

## Data Structures

### 1. Product/SKU Data Format

**Endpoint**: Your API should return this when `viewMode === 'product'`

```typescript
interface ProductSKUData {
  product_code: string;        // e.g., "FGCMGM0092"
  product_name: string;         // e.g., "Samta NPK 6-0-18"
  sku_code: string;            // e.g., "SKU001"
  sku_name: string;            // e.g., "Samta NPK 6-0-18 fortified with Ca,Mg & Zn - 1 Ltr"
  opening_stock: number;        // Value in rupees, e.g., 700000
  opening_stock_units: number;  // Quantity in units, e.g., 10
  ytd_sales: number;           // Value in rupees, e.g., 630000
  ytd_sales_units: number;     // Quantity in units, e.g., 84
  balance_stock: number;        // Value in rupees, e.g., 567000
  balance_stock_units: number;  // Quantity in units, e.g., 420
  unit: string;                // e.g., "kg", "ltr", "ml"
  category?: string;           // Optional: e.g., "Fertilizer", "Biostimulant"
}
```

**Sample API Response for Product View:**
```json
{
  "success": true,
  "data": [
    {
      "product_code": "FGCMGM0092",
      "product_name": "Samta NPK 6-0-18",
      "sku_code": "SKU001",
      "sku_name": "Samta NPK 6-0-18 fortified with Ca,Mg & Zn - 1 Ltr",
      "opening_stock": 700000,
      "opening_stock_units": 10,
      "ytd_sales": 630000,
      "ytd_sales_units": 84,
      "balance_stock": 567000,
      "balance_stock_units": 420,
      "unit": "ltr",
      "category": "Fertilizer"
    },
    {
      "product_code": "FGCMGM0127",
      "product_name": "Agropurna AP Gr.6",
      "sku_code": "SKU002",
      "sku_name": "Agropurna AP Gr.6 - 1 Ltr",
      "opening_stock": 630000,
      "opening_stock_units": 10,
      "ytd_sales": 813000,
      "ytd_sales_units": 6500,
      "balance_stock": 775000,
      "balance_stock_units": 6200,
      "unit": "ltr",
      "category": "Biostimulant"
    }
  ],
  "lastUpdated": "2025-10-27T10:30:00Z"
}
```

---

### 2. MDO Summary Data Format

**Endpoint**: Your API should return this when `viewMode === 'mdo'`

```typescript
interface OutletTransaction {
  id: string;                  // Unique transaction ID
  outlet_id: string;           // Outlet ID
  outlet_code: string;         // e.g., "OUT001"
  outlet_name: string;         // e.g., "Shri Sai Ganesh Enterprises"
  owner_name: string;          // e.g., "Rajesh Kumar"
  transaction_date: string;    // ISO date string
  opening_stock: number;       // Value in rupees
  opening_stock_units?: number; // Optional: quantity
  purchases: number;           // Value in rupees
  sales: number;              // Value in rupees
  sales_units?: number;       // Optional: quantity
  liquidation: number;        // Value in rupees
  liquidation_units?: number; // Optional: quantity
  balance_stock: number;      // Value in rupees
  balance_stock_units?: number; // Optional: quantity
  zone?: string;              // Optional: "North Zone"
  region?: string;            // Optional: "Delhi NCR"
  territory?: string;         // Optional: "Green Valley"
  state?: string;             // Optional: "Delhi"
  updated_at: string;         // ISO date string
}

interface MDOSummary {
  mdo_id: string;             // e.g., "MDO001"
  mdo_name: string;           // e.g., "Rajesh Kumar"
  zone: string;               // e.g., "North Zone"
  region: string;             // e.g., "Delhi NCR"
  territory: string;          // e.g., "Green Valley"
  state?: string;             // Optional: "Delhi"
  opening_stock: number;      // Aggregate value in rupees
  ytd_sales: number;          // Aggregate value in rupees
  liquidation: number;        // Aggregate value in rupees
  balance_stock: number;      // Aggregate value in rupees
  outlet_count: number;       // Number of outlets under this MDO
  updated_at: string;         // ISO date string
  outlets: OutletTransaction[]; // Array of outlet transactions
}
```

**Sample API Response for MDO View:**
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
      "updated_at": "2025-10-27T10:30:00Z",
      "outlets": [
        {
          "id": "TXN001",
          "outlet_id": "OUT001",
          "outlet_code": "1325",
          "outlet_name": "Shri Sai Ganesh Enterprises",
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

---

### 3. Outlet View Data Format

**Endpoint**: Your API should return this when `viewMode === 'outlet'`

For outlet view, you can return the same MDO data structure, and the component will flatten the outlets from all MDOs into a single list.

Alternatively, you can return a flat array of `OutletTransaction[]` objects.

---

## API Integration Points

### Props Interface

The refactored Reports component expects these props:

```typescript
interface ReportsProps {
  // Function to fetch product data
  fetchProductData?: (filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    categories?: string[];
    products?: string[];
  }) => Promise<ProductSKUData[]>;

  // Function to fetch MDO/Outlet data
  fetchMDOData?: (filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    outlets?: string[];
    distributors?: string[];
  }) => Promise<MDOSummary[]>;

  // Optional: Initial data to render
  initialProductData?: ProductSKUData[];
  initialMDOData?: MDOSummary[];
}
```

### Example Usage

```typescript
import Reports from './pages/Reports';
import { myApiService } from './services/myApi';

function App() {
  const handleFetchProductData = async (filters) => {
    const response = await myApiService.getProductReports(filters);
    return response.data;
  };

  const handleFetchMDOData = async (filters) => {
    const response = await myApiService.getMDOReports(filters);
    return response.data;
  };

  return (
    <Reports
      fetchProductData={handleFetchProductData}
      fetchMDOData={handleFetchMDOData}
    />
  );
}
```

---

## Filter Parameters

When calling your API endpoints, the following filters will be passed:

```typescript
{
  dateFrom: string;           // Format: "YYYY-MM-DD"
  dateTo: string;             // Format: "YYYY-MM-DD"
  zones?: string[];           // e.g., ["North Zone", "South Zone"]
  regions?: string[];         // e.g., ["Delhi NCR", "Mumbai"]
  states?: string[];          // e.g., ["Delhi", "Maharashtra"]
  territories?: string[];     // e.g., ["Green Valley", "Blue Hills"]
  categories?: string[];      // For product view only
  products?: string[];        // For product view only
  outlets?: string[];         // For MDO/outlet view only
  distributors?: string[];    // For MDO/outlet view only
}
```

---

## Export Functionality

The Reports page includes export functionality (Excel/PDF). The export will use the currently displayed data after all filters are applied.

No special API integration is needed for exports - they work automatically with the data provided to the component.

---

## Notes

1. **Dates**: All dates should be in ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
2. **Numbers**: All monetary values should be in rupees (without decimals for simplicity)
3. **Units**: Use standard units: "kg", "ltr", "ml", "gm"
4. **Aggregation**: For MDO view, the `opening_stock`, `ytd_sales`, `liquidation`, and `balance_stock` should be pre-aggregated from all outlets
5. **Pagination**: The component handles pagination on the client side (20 items per page by default)
6. **Search**: The component handles search filtering on the client side
7. **Role-based filtering**: Pass appropriate data based on user role (handled on API side)

---

## Testing Data

See `src/data/mockReportsData.ts` for sample data you can use for testing during API development.
