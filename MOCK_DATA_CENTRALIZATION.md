# Mock Data Centralization & Metrics Structure Fix

## Overview

Completed comprehensive refactoring to centralize all mock data and fix metrics structure to use `{value, volume}` instead of `{value, percentage}`.

## Changes Made

### 1. Fixed Metrics Structure in mockData.ts

**Before:**
```typescript
openingStock: { value: number; percentage: number };
ytdNetSales: { value: number; percentage: number };
liquidation: { value: number; percentage: number };
balanceStock: { value: number; percentage: number };
```

**After:**
```typescript
openingStock: { value: number; volume: number };
ytdNetSales: { value: number; volume: number };
liquidation: { value: number; volume: number };
balanceStock: { value: number; volume: number };
```

### 2. Added Liquidation Interfaces to mockData.ts

Added three new interfaces for liquidation data:

```typescript
export interface LiquidationMetrics {
  openingStock: { volume: number; value: number };
  ytdNetSales: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
  lastUpdated: string;
}

export interface DistributorLiquidation {
  id: string;
  distributorName: string;
  distributorCode: string;
  metrics: LiquidationMetrics;
  territory: string;
  region: string;
  zone: string;
  state: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';
}

export interface ProductSKU {
  skuCode: string;
  skuName: string;
  unit: string;
  openingStock: number;
  ytdSales: number;
  liquidated: number;
  currentStock: number;
  unitPrice: number;
}

export interface ProductData {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  skus: ProductSKU[];
}
```

### 3. Added Centralized Mock Data Constants

Added three new constants to mockData.ts:

**MOCK_OVERALL_LIQUIDATION_METRICS:**
- Overall/aggregate liquidation metrics
- Used for top-level summary

**MOCK_DISTRIBUTOR_LIQUIDATION:**
- Array of 3 distributor liquidation records
- Includes metrics for Andhra Pradesh distributors
- Can be extended with more distributors as needed

**MOCK_PRODUCT_DATA:**
- Array of 2 products (DAP and MOP)
- Each product has multiple SKUs
- Includes opening stock, sales, liquidation data

### 4. Refactored useLiquidationCalculation Hook

**Before:** Embedded data directly in the hook (300+ lines of mock data)

**After:** Imports from centralized mockData.ts

```typescript
import {
  MOCK_OVERALL_LIQUIDATION_METRICS,
  MOCK_DISTRIBUTOR_LIQUIDATION,
  MOCK_PRODUCT_DATA,
  type LiquidationMetrics,
  type DistributorLiquidation,
  type ProductData
} from '../data/mockData';

// Then use them:
const [overallMetrics, setOverallMetrics] = useState<LiquidationMetrics>(
  MOCK_OVERALL_LIQUIDATION_METRICS
);
const [distributorMetrics, setDistributorMetrics] = useState<DistributorLiquidation[]>(
  MOCK_DISTRIBUTOR_LIQUIDATION
);
const [productData, setProductData] = useState<ProductData[]>(
  MOCK_PRODUCT_DATA
);
```

## Benefits

### 1. Single Source of Truth
- All mock data in one file (`src/data/mockData.ts`)
- Easy to find and modify test data
- Consistent data across application

### 2. Correct Metrics Structure
- `volume` represents quantity in Kg
- `value` represents monetary value in Lakhs INR
- No more confusion with `percentage` field

### 3. Type Safety
- Interfaces exported from mockData.ts
- Components and hooks import types
- TypeScript ensures correct usage

### 4. Easier Maintenance
- Change mock data in one place
- All components automatically use updated data
- No duplicate data definitions

### 5. Cleaner Code
- Hooks and components focus on logic
- No embedded data cluttering code
- Easier to read and understand

## Files Modified

### Updated Files:
1. **src/data/mockData.ts**
   - Fixed MockDistributor interface
   - Fixed MockRetailer interface
   - Added LiquidationMetrics interface
   - Added DistributorLiquidation interface
   - Added ProductSKU interface
   - Added ProductData interface
   - Added MOCK_OVERALL_LIQUIDATION_METRICS constant
   - Added MOCK_DISTRIBUTOR_LIQUIDATION constant
   - Added MOCK_PRODUCT_DATA constant

2. **src/hooks/useLiquidationCalculation.ts**
   - Removed embedded mock data (~300 lines)
   - Added imports from mockData.ts
   - Removed duplicate interface definitions
   - Now uses centralized constants

## Metrics Field Explanation

### value vs volume

**volume:**
- Physical quantity of product
- Measured in Kg (kilograms)
- Example: 18500 Kg of DAP

**value:**
- Monetary value
- Measured in Lakhs INR (1 Lakh = 100,000)
- Example: 92.50 Lakhs = ₹92,50,000

### Example:
```typescript
openingStock: {
  volume: 18500,  // 18,500 Kg of product
  value: 92.50    // Worth ₹92,50,000 (92.50 Lakhs)
}
```

## Data Structure

### Overall Metrics
```
Opening Stock: 211,820 Kg (₹1036.66 Lakhs)
YTD Net Sales: 145,844 Kg (₹693.06 Lakhs)
Liquidation: 115,942 Kg (₹594.90 Lakhs)
Balance Stock: 122,860 Kg (₹628.92 Lakhs)
Liquidation %: 65%
```

### Distributor Metrics (Example - Sri Lakshmi Seeds)
```
Opening Stock: 18,500 Kg (₹92.50 Lakhs)
YTD Net Sales: 12,800 Kg (₹64.20 Lakhs)
Liquidation: 10,240 Kg (₹52.80 Lakhs)
Balance Stock: 9,520 Kg (₹48.90 Lakhs)
Liquidation %: 68%
```

### Product Data (Example - DAP 50Kg)
```
Opening Stock: 45,000 Kg
YTD Sales: 28,000 Kg
Liquidated: 22,400 Kg
Current Stock: 23,600 Kg
Unit Price: ₹5.2/Kg
```

## Adding More Mock Data

To add more distributors or products:

### 1. Add to mockData.ts:
```typescript
export const MOCK_DISTRIBUTOR_LIQUIDATION: DistributorLiquidation[] = [
  // Existing distributors...
  {
    id: 'DIST004',
    distributorName: 'New Distributor',
    distributorCode: 'AP004',
    // ... rest of properties
  }
];
```

### 2. Data automatically appears everywhere
- No need to update hooks
- No need to update components
- Just refresh and it works!

## Testing

Build completed successfully:
```
✓ TypeScript compilation passed
✓ Vite build successful
✓ No errors or warnings
```

All components continue to work with the centralized data structure.

## Migration Path to Real API

When ready to replace with real API:

1. Keep interfaces in mockData.ts for type definitions
2. Create API service functions in `src/services/apiService.ts`
3. Update hooks to call API instead of using mock constants
4. Remove mock data constants (keep interfaces)

Example:
```typescript
// Before (mock):
const [distributorMetrics] = useState(MOCK_DISTRIBUTOR_LIQUIDATION);

// After (real API):
const [distributorMetrics, setDistributorMetrics] = useState([]);
useEffect(() => {
  fetchDistributorLiquidation().then(setDistributorMetrics);
}, []);
```

## Summary

✅ **All mock data centralized** in `src/data/mockData.ts`
✅ **Metrics structure fixed** to use `{value, volume}`
✅ **No embedded data** in hooks or components
✅ **Type-safe** with exported interfaces
✅ **Easier to maintain** - single source of truth
✅ **Build successful** - no breaking changes
✅ **Ready for API migration** - clean separation

The codebase is now better organized, more maintainable, and ready for production API integration!
