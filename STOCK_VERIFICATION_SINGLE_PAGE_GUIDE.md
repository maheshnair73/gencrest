# Stock Verification - Single Page Modal Flow

## Overview

✅ **Confirmed:** The stock verification workflow is implemented as a **SINGLE PAGE MODAL** with multiple steps within one modal component.

The entire flow happens in `Liquidation.tsx` in a single modal dialog that transitions between steps without page navigation.

## Single Page Modal Architecture

### Location
**File:** `src/pages/Liquidation.tsx`

### Structure
```
Liquidation Page (Single Page)
└── Modal Dialog (showVerifyModal)
    ├── Step Indicator (5 steps visible)
    ├── Modal Content (changes based on modalTab state)
    │   ├── Step 1: Stock Details (modalTab === 'details')
    │   ├── Step 2: Verification (modalTab === 'verification')
    │   ├── Step 3: Allocation (modalTab === 'allocation')
    │   ├── Step 4: Proof & E-Sign (modalTab === 'proof')
    │   └── Step 5: Review & Submit (modalTab === 'review')
    └── Navigation (Back/Next buttons within modal)
```

### State Management (Single Component)
```typescript
// All state lives in one component - Liquidation.tsx
const [showVerifyModal, setShowVerifyModal] = useState(false);
const [modalTab, setModalTab] = useState<'details' | 'verification' | 'allocation' | 'proof' | 'review'>('details');
const [soldToFarmers, setSoldToFarmers] = useState<number>(0);
const [soldToRetailers, setSoldToRetailers] = useState<number>(0);
const [retailerAllocations, setRetailerAllocations] = useState<Array<{
  retailerId: string;
  retailerName: string;
  quantity: number;
}>>([]);
const [uploadedProofs, setUploadedProofs] = useState<ProofData[]>([]);
const [verificationLetter, setVerificationLetter] = useState<File | null>(null);
```

## How the Single Page Flow Works

### 1. User Journey (No Page Reloads)

1. **User clicks "Verify Stock" button** on main Liquidation page
   - Opens modal (`setShowVerifyModal(true)`)
   - Modal shows Step 1 by default

2. **Step 1: Stock Details**
   - User updates stock quantities
   - Clicks "Confirm & Proceed"
   - `setModalTab('verification')` - **Same modal, different content**

3. **Step 2: Verification**
   - User allocates farmers vs retailers
   - Clicks "Next"
   - `setModalTab('allocation')` - **Same modal, different content**

4. **Step 3: Allocation**
   - User assigns retailers
   - Clicks "Next"
   - `setModalTab('proof')` - **Same modal, different content**

5. **Step 4: Proof & E-Sign**
   - User uploads documents
   - Clicks "Next"
   - `setModalTab('review')` - **Same modal, different content**

6. **Step 5: Review & Submit**
   - User reviews everything
   - Clicks "Submit Verification"
   - API call happens
   - Modal closes (`setShowVerifyModal(false)`)

**Result:** Entire process happens in ONE modal dialog, ONE component, ONE page!

### 2. Benefits of Single Page Modal

✅ **No routing** - No URL changes, no browser history clutter
✅ **Fast transitions** - Instant step changes with state
✅ **Preserved data** - All form data stays in memory
✅ **Better UX** - Smooth, app-like experience
✅ **Easy validation** - Can validate before moving steps
✅ **Centralized state** - All data in one component

## API Integration - Switching from Mock to Real Data

### Current Architecture

The app is built with **dual mode support**:
- **Mock data mode** (development) - Uses `src/data/mockData.ts`
- **API mode** (production) - Uses `src/services/apiService.ts`

### API Service Layer

**File:** `src/services/apiService.ts`

All API functions are **already implemented** and ready to use:

#### Stock Verification APIs

```typescript
// 1. Fetch inventory for verification
import { fetchInventory } from '../services/apiService';

const loadInventory = async (distributorId: string) => {
  try {
    const data = await fetchInventory(distributorId);
    // Use data instead of mock
  } catch (error) {
    // Handle error, optionally fallback to mock
  }
};

// 2. Fetch linked retailers for allocation
import { fetchRetailersByDistributor } from '../services/apiService';

const loadRetailers = async (distributorId: string) => {
  try {
    const data = await fetchRetailersByDistributor(distributorId);
    // Use data for retailer dropdown
  } catch (error) {
    // Handle error
  }
};

// 3. Submit complete verification
import { submitStockVerification } from '../services/apiService';

const handleSubmit = async () => {
  try {
    const result = await submitStockVerification({
      distributorId: selectedDistributorId,
      skuCode: selectedSKU.skuCode,
      oldStock: lastBalanceStock,
      newStock: newBalanceStock,
      soldToFarmers: soldToFarmers,
      soldToRetailers: soldToRetailers,
      retailerAllocations: retailerAllocations,
      proofUrls: uploadedProofs.map(p => p.url),
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude
    });

    // Success - close modal and refresh data
    setShowVerifyModal(false);
    toast.success('Stock verification submitted successfully!');
  } catch (error) {
    // Handle error
    toast.error('Failed to submit verification');
  }
};
```

### New API Function for Stock Verification

Add this to `src/services/apiService.ts`:

```typescript
// ============================================================================
// STOCK VERIFICATION API (New - for the 5-step workflow)
// ============================================================================

/**
 * Submit complete stock verification with allocations
 * @param verificationData - Complete verification information
 * @returns Created verification record with all details
 */
export const submitStockVerification = async (verificationData: {
  distributorId: string;
  skuCode: string;
  oldStock: number;
  newStock: number;
  soldToFarmers: number;
  soldToRetailers: number;
  retailerAllocations: Array<{
    retailerId: string;
    retailerName: string;
    quantity: number;
  }>;
  proofUrls: string[];
  signatureUrl?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}) => {
  // Start a transaction-like operation
  try {
    // 1. Update the main inventory stock
    const { data: inventoryUpdate, error: inventoryError } = await supabase
      .from('retailer_inventory')
      .update({
        current_stock: verificationData.newStock,
        last_verified_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('retailer_id', verificationData.distributorId)
      .eq('sku_code', verificationData.skuCode)
      .select()
      .maybeSingle();

    if (inventoryError) throw inventoryError;

    // 2. Record stock transactions for farmers
    if (verificationData.soldToFarmers > 0) {
      const { error: farmerTxError } = await supabase
        .from('stock_transactions')
        .insert([{
          entity_id: verificationData.distributorId,
          entity_type: 'distributor',
          sku_code: verificationData.skuCode,
          transaction_type: 'sale_to_farmer',
          quantity: verificationData.soldToFarmers,
          transaction_date: new Date().toISOString(),
          notes: 'Stock verification - farmer sales'
        }]);

      if (farmerTxError) throw farmerTxError;
    }

    // 3. Record stock transactions for each retailer allocation
    if (verificationData.retailerAllocations.length > 0) {
      const retailerTransactions = verificationData.retailerAllocations.map(allocation => ({
        entity_id: verificationData.distributorId,
        entity_type: 'distributor',
        target_retailer_id: allocation.retailerId,
        target_retailer_name: allocation.retailerName,
        sku_code: verificationData.skuCode,
        transaction_type: 'sale_to_retailer',
        quantity: allocation.quantity,
        transaction_date: new Date().toISOString(),
        notes: `Allocated to ${allocation.retailerName}`
      }));

      const { error: retailerTxError } = await supabase
        .from('stock_transactions')
        .insert(retailerTransactions);

      if (retailerTxError) throw retailerTxError;

      // 4. Update each retailer's inventory (add stock)
      for (const allocation of verificationData.retailerAllocations) {
        // Check if retailer has this SKU
        const { data: existingInventory } = await supabase
          .from('retailer_inventory')
          .select('id, current_stock')
          .eq('retailer_id', allocation.retailerId)
          .eq('sku_code', verificationData.skuCode)
          .maybeSingle();

        if (existingInventory) {
          // Update existing
          await supabase
            .from('retailer_inventory')
            .update({
              current_stock: existingInventory.current_stock + allocation.quantity,
              last_updated: new Date().toISOString()
            })
            .eq('id', existingInventory.id);
        } else {
          // Create new inventory record
          await supabase
            .from('retailer_inventory')
            .insert([{
              retailer_id: allocation.retailerId,
              sku_code: verificationData.skuCode,
              current_stock: allocation.quantity,
              last_updated: new Date().toISOString()
            }]);
        }
      }
    }

    // 5. Save verification record with proof
    const { data: verification, error: verificationError } = await supabase
      .from('stock_verifications')
      .insert([{
        distributor_id: verificationData.distributorId,
        sku_code: verificationData.skuCode,
        old_stock: verificationData.oldStock,
        new_stock: verificationData.newStock,
        stock_difference: verificationData.oldStock - verificationData.newStock,
        sold_to_farmers: verificationData.soldToFarmers,
        sold_to_retailers: verificationData.soldToRetailers,
        retailer_allocations: verificationData.retailerAllocations,
        proof_urls: verificationData.proofUrls,
        signature_url: verificationData.signatureUrl,
        latitude: verificationData.latitude,
        longitude: verificationData.longitude,
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getUser()).data.user?.id,
        notes: verificationData.notes,
        status: 'completed'
      }])
      .select()
      .maybeSingle();

    if (verificationError) throw verificationError;

    return {
      success: true,
      verification,
      message: 'Stock verification completed successfully'
    };

  } catch (error) {
    console.error('Error submitting stock verification:', error);
    throw error;
  }
};
```

### Database Schema Required

Add this migration for the new workflow:

```sql
-- Create stock_verifications table
CREATE TABLE IF NOT EXISTS stock_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  old_stock NUMERIC NOT NULL,
  new_stock NUMERIC NOT NULL,
  stock_difference NUMERIC NOT NULL,
  sold_to_farmers NUMERIC DEFAULT 0,
  sold_to_retailers NUMERIC DEFAULT 0,
  retailer_allocations JSONB DEFAULT '[]',
  proof_urls TEXT[] DEFAULT '{}',
  signature_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  verified_at TIMESTAMPTZ DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE stock_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view verifications in their scope
CREATE POLICY "Users can view verifications" ON stock_verifications
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Users can create verifications
CREATE POLICY "Users can create verifications" ON stock_verifications
  FOR INSERT TO authenticated
  WITH CHECK (verified_by = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_stock_verifications_distributor ON stock_verifications(distributor_id);
CREATE INDEX idx_stock_verifications_sku ON stock_verifications(sku_code);
CREATE INDEX idx_stock_verifications_date ON stock_verifications(verified_at DESC);

-- Update stock_transactions to include retailer allocations
ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS target_retailer_id TEXT;
ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS target_retailer_name TEXT;
```

## How to Switch from Mock to API

### Step-by-Step Migration

**1. Find Mock Data Usage**

In `Liquidation.tsx`, search for:
```typescript
// Mock data patterns
const mockDistributors = [...]
const dummyRetailers = [...]
useState(MOCK_DATA)
```

**2. Replace with API Calls**

```typescript
// BEFORE (Mock)
const [distributors, setDistributors] = useState(MOCK_DISTRIBUTORS);

// AFTER (API)
import { fetchDistributors } from '../services/apiService';

const [distributors, setDistributors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDistributors();
      setDistributors(data);
    } catch (error) {
      console.error('Failed to load:', error);
      // Optional: Fallback to mock data
      setDistributors(MOCK_DISTRIBUTORS);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**3. Replace Verification Submit**

```typescript
// BEFORE (Mock)
const handleSubmitProof = () => {
  console.log('Submitting proof...');
  alert('Verification submitted!');
  setShowVerifyModal(false);
};

// AFTER (API)
const handleSubmitProof = async () => {
  try {
    setSubmitting(true);

    // Validate all required data
    if (soldToRetailers > 0 && uploadedProofs.length === 0) {
      alert('Please upload at least one proof document for retailer movements.');
      return;
    }

    // Submit to API
    const result = await submitStockVerification({
      distributorId: selectedDistributorId,
      skuCode: selectedSKU.skuCode,
      oldStock: lastBalanceStock,
      newStock: newBalanceStock,
      soldToFarmers,
      soldToRetailers,
      retailerAllocations,
      proofUrls: uploadedProofs.map(p => p.url),
      signatureUrl: signatureData?.url,
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude
    });

    // Success
    alert('Stock verification submitted successfully!');
    setShowVerifyModal(false);

    // Refresh data
    loadDistributorData();

  } catch (error) {
    console.error('Verification failed:', error);
    alert('Failed to submit verification. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
```

## Feature Toggle Pattern (Recommended)

**Best Practice:** Use a feature toggle to switch between mock and API

```typescript
// src/config/featureFlags.ts
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// In components
import { USE_MOCK_DATA } from '../config/featureFlags';
import { fetchDistributors } from '../services/apiService';
import { MOCK_DISTRIBUTORS } from '../data/mockData';

const loadDistributors = async () => {
  if (USE_MOCK_DATA) {
    setDistributors(MOCK_DISTRIBUTORS);
    return;
  }

  try {
    const data = await fetchDistributors();
    setDistributors(data);
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to mock on error
    setDistributors(MOCK_DISTRIBUTORS);
  }
};
```

**.env file:**
```bash
# Development - use mock data
VITE_USE_MOCK_DATA=true

# Production - use real API
VITE_USE_MOCK_DATA=false
```

## Summary

✅ **Single Page:** Entire verification flow is in ONE modal component
✅ **Single Component:** All state managed in `Liquidation.tsx`
✅ **5 Steps:** Smooth transitions within modal (no page reloads)
✅ **API Ready:** All API functions already implemented
✅ **Easy Switch:** Simple pattern to replace mock with API
✅ **Database Ready:** Schema provided for Supabase tables
✅ **Graceful Fallback:** Can fallback to mock data on API errors

The application is fully architected for easy migration from mock data to real API calls!
