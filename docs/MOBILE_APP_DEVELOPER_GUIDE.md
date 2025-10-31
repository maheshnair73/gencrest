# Mobile App Developer Guide

## Overview

This guide provides comprehensive documentation for developers working on the Gencrest Activity Tracker mobile application. The mobile app is built using React and provides field teams with tools for managing visits, liquidation tracking, stock updates, and more.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Features](#key-features)
3. [Component Structure](#component-structure)
4. [Liquidation Management](#liquidation-management)
5. [Stock Update Flow](#stock-update-flow)
6. [Geolocation & Geofencing](#geolocation--geofencing)
7. [Entity 360° View](#entity-360-view)
8. [Data Models](#data-models)
9. [API Integration](#api-integration)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### Tech Stack
- **Frontend Framework**: React 18.3+ with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useContext)
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Geolocation**: Browser Geolocation API

### File Structure
```
src/
├── components/
│   ├── MobileApp.tsx          # Main mobile app component
│   ├── Entity360View.tsx      # 360° entity view modal
│   ├── SignatureCapture.tsx   # E-signature capture
│   └── ...
├── hooks/
│   ├── useGeolocation.ts      # Real-time location tracking
│   ├── useLiquidationCalculation.ts  # Liquidation metrics
│   └── useOfflineSync.ts      # Offline data sync
├── pages/
│   └── MobileAppPage.tsx      # Mobile app page wrapper
├── contexts/
│   └── AuthContext.tsx        # Authentication context
└── lib/
    └── supabase.ts            # Supabase client config
```

---

## Key Features

### 1. **Home Dashboard**
- Live meetings tracker with active/completed status
- Monthly work plan with daily target tracking
- Quick action buttons (Add Visit, View Contacts, Stock Check, etc.)
- Performance metrics display

### 2. **Contacts Management**
- Distributor and Retailer search
- Entity 360° view integration
- Contact details with quick actions (Call, Email)
- Linked entities tracking

### 3. **Liquidation Tracking**
- Real-time liquidation metrics
- SKU-wise stock breakdown
- Invoice-wise transaction history
- Stock update workflow with verification
- Product-level aggregations

### 4. **Visit Management**
- Geofenced visit check-in/check-out
- Photo capture and upload
- Visit notes and feedback
- Visit history tracking

### 5. **Task Management**
- Priority-based task list
- Status tracking (Pending, In Progress, Completed)
- Due date management

### 6. **Reports**
- Sales reports
- Visit reports
- Performance analytics

---

## Component Structure

### Main Component: `MobileApp.tsx`

```typescript
const MobileApp: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('home');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [metricModalTab, setMetricModalTab] = useState<'details' | 'update' | 'verification'>('details');

  // Hooks
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { overallMetrics } = useLiquidationCalculation();

  // Component logic...
}
```

### Tab Navigation
The app uses a bottom navigation bar with the following tabs:
- **Home**: Dashboard with live meetings and work plan
- **Contacts**: Distributor/Retailer management
- **Liquidation**: Stock tracking and updates
- **Tasks**: Task management
- **Reports**: Analytics and reports

---

## Liquidation Management

### Overview
The liquidation module provides comprehensive stock tracking at SKU and invoice levels.

### Data Structure

```typescript
interface Distributor {
  id: string;
  name: string;
  code: string;
  product: string;
  territory: string;
  region: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';
  openingStock: { value: number; percentage: number };
  ytdNetSales: { value: number; percentage: number };
  liquidation: { value: number; percentage: number };
  balanceStock: { value: number; percentage: number };
  address: string;
  phone: string;
  email: string;
}
```

### Liquidation Metrics Display

Each distributor card shows 4 key metrics in a grid:

```tsx
<div className="grid grid-cols-4 gap-2">
  {/* Opening Stock */}
  <div className="bg-orange-50 rounded p-2">
    <div className="text-xs text-orange-600">Opening</div>
    <div className="text-lg font-bold text-orange-800">₹{value}L</div>
    <button onClick={handleOpenMetric}>View Details</button>
  </div>

  {/* YTD Sales */}
  <div className="bg-blue-50 rounded p-2">...</div>

  {/* Liquidation */}
  <div className="bg-green-50 rounded p-2">...</div>

  {/* Balance Stock */}
  <div className="bg-purple-50 rounded p-2">...</div>
</div>
```

### Color Coding
- **Orange**: Opening Stock
- **Blue**: YTD Net Sales
- **Green**: Liquidation %
- **Purple**: Balance Stock

---

## Stock Update Flow

### Three-Tab Modal System

When a user clicks on any metric, a modal opens with three tabs:

#### 1. **Stock Details Tab**
Displays comprehensive SKU and invoice-level information.

```typescript
// Product structure with SKUs and transactions
{
  product: 'DAP (Di-Ammonium Phosphate)',
  productCode: 'DAP',
  skus: [
    {
      name: 'DAP 25kg Bag',
      code: 'DAP-25KG',
      transactions: [
        { invoiceDate: '2024-12-15', type: 'Sale', quantity: 50, value: 67500 },
        { invoiceDate: '2024-12-10', type: 'Sale', quantity: 80, value: 108000 }
      ]
    }
  ]
}
```

**Features:**
- Expandable product accordions
- SKU-level breakdown within each product
- Invoice-wise transaction table
- Date, Sale/Return type, Quantity, and Value for each transaction
- Product-level value aggregation

#### 2. **Update Stock Tab** ⭐ NEW
Allows field teams to update current stock quantities.

```typescript
// SKU quantity state management
const [skuQuantities, setSkuQuantities] = useState<Record<string, number>>({});

// Update handler
const handleQuantityChange = (skuCode: string, newQuantity: number) => {
  setSkuQuantities(prev => ({
    ...prev,
    [skuCode]: Math.max(0, newQuantity)
  }));
};
```

**Features:**
- Product-wise SKU organization
- Each SKU shows:
  - Opening Stock (baseline)
  - Current Stock (editable)
  - Net Change (calculated difference)
- Three update methods:
  - **Minus button**: Decrease by 1
  - **Plus button**: Increase by 1
  - **Direct input**: Enter exact quantity
- Color-coded net change:
  - Green: Increase (+)
  - Red: Decrease (-)
  - Gray: No change (0)
- Geofence validation before save
- Auto-navigation to verification tab after save

**Implementation Example:**

```tsx
<div className="flex items-center space-x-2">
  {/* Decrease Button */}
  <button
    onClick={() => handleDecrement(sku.code)}
    className="w-10 h-10 bg-red-500 text-white rounded-lg"
  >
    <Minus className="w-5 h-5" />
  </button>

  {/* Quantity Input */}
  <input
    type="number"
    value={currentQty}
    onChange={(e) => handleQuantityChange(sku.code, parseInt(e.target.value))}
    className="flex-1 text-center text-xl font-bold border-2"
  />

  {/* Increase Button */}
  <button
    onClick={() => handleIncrement(sku.code)}
    className="w-10 h-10 bg-green-500 text-white rounded-lg"
  >
    <Plus className="w-5 h-5" />
  </button>
</div>

{/* Net Change Display */}
<div className={`p-2 rounded-lg ${difference > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
  <p className="text-xs text-gray-600">Net Change</p>
  <p className="text-lg font-bold">
    {difference > 0 ? '+' : ''}{difference} {sku.unit}
  </p>
</div>
```

#### 3. **Verification Tab**
Captures proof and validates location.

**Features:**
- Photo upload button
- E-signature capture button
- View/Hide letter preview
- Letter auto-generation with:
  - Date, time, and user details
  - Distributor information
  - Stock verification statement
- Copy to clipboard functionality
- Uploaded proof management (view & delete)
- Real-time geofence validation
- Location status indicator
- Submit verification button

**Geofence Validation:**

```typescript
const isWithinGeofence = (): { valid: boolean; distance: number; message: string } => {
  if (!latitude || !longitude) {
    return {
      valid: false,
      distance: -1,
      message: 'Unable to determine your location. Please enable location services.'
    };
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    OUTLET_LOCATION.latitude,
    OUTLET_LOCATION.longitude
  );

  if (distance <= GEOFENCE_RADIUS) {
    return {
      valid: true,
      distance,
      message: `You are ${Math.round(distance)}m from ${OUTLET_LOCATION.name}`
    };
  }

  return {
    valid: false,
    distance,
    message: `You are ${Math.round(distance)}m away. You must be within ${GEOFENCE_RADIUS}m.`
  };
};
```

---

## Geolocation & Geofencing

### Hook: `useGeolocation.ts`

```typescript
export const useGeolocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => setError(error.message),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { latitude, longitude, error };
};
```

### Geofence Configuration

```typescript
const OUTLET_LOCATION = {
  latitude: 28.5355,   // Example: Delhi coordinates
  longitude: 77.3910,
  name: 'Green Valley Outlet'
};

const GEOFENCE_RADIUS = 1000; // meters
```

### Distance Calculation (Haversine Formula)

```typescript
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
```

---

## Entity 360° View

### Component: `Entity360View.tsx`

Provides comprehensive information about distributors/retailers.

### Features

#### 1. **Contact Tab**
- Name, code, business type
- Phone, email with quick action buttons
- Address with map link
- Territory and region

#### 2. **Financial Tab**
- Credit limit vs outstanding
- Payment terms
- Last payment date and amount
- Payment history

#### 3. **Performance Tab**
- Sales trends (MTD, YTD)
- Achievement vs target
- Growth percentages
- Top selling products

#### 4. **History Tab**
- Visit history with dates
- Order history
- Payment history
- Activity timeline

### Usage

```tsx
<Entity360View
  isOpen={show360View}
  onClose={() => setShow360View(false)}
  entity={selectedDistributor}
  entityType="distributor" // or "retailer"
/>
```

---

## Data Models

### Distributor/Retailer Model

```typescript
interface Entity {
  id: string;
  name: string;
  code: string;
  businessType: string;
  product: string;
  territory: string;
  region: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';

  // Contact Info
  phone: string;
  email: string;
  address: string;

  // Financial Metrics
  openingStock: { value: number; percentage: number };
  ytdNetSales: { value: number; percentage: number };
  liquidation: { value: number; percentage: number };
  balanceStock: { value: number; percentage: number };

  // Location
  latitude?: number;
  longitude?: number;
}
```

### Product & SKU Model

```typescript
interface Product {
  productName: string;
  productCode: string;
  category: string;
  skus: SKU[];
}

interface SKU {
  code: string;
  name: string;
  unit: string; // 'Kg', 'Litre', 'Nos'
  openingStock: number;
  currentStock: number;
  transactions?: Transaction[];
}

interface Transaction {
  invoiceDate: string;
  type: 'Sale' | 'Return';
  quantity: number;
  value: number;
}
```

### Visit Model

```typescript
interface Visit {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'distributor' | 'retailer';
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  latitude: number;
  longitude: number;
  purpose: string;
  notes: string;
  photos: string[];
  status: 'scheduled' | 'in-progress' | 'completed';
}
```

### Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedBy: string;
  category: string;
}
```

---

## API Integration

### Supabase Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Tables

#### 1. **distributors**
```sql
CREATE TABLE distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  business_type TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  territory TEXT,
  region TEXT,
  zone TEXT,
  status TEXT DEFAULT 'Active',
  priority TEXT DEFAULT 'Medium',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. **retailer_inventory**
```sql
CREATE TABLE retailer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES retailers(id),
  product_code TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  opening_stock DECIMAL(10, 2),
  current_stock DECIMAL(10, 2),
  unit TEXT,
  last_updated TIMESTAMPTZ DEFAULT now()
);
```

#### 3. **stock_transactions**
```sql
CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'distributor' or 'retailer'
  product_code TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'Sale' or 'Return'
  invoice_date DATE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. **visits**
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  purpose TEXT,
  notes TEXT,
  photos TEXT[], -- Array of photo URLs
  status TEXT DEFAULT 'in-progress',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### API Functions

#### Fetch Distributors

```typescript
const fetchDistributors = async () => {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('status', 'Active')
    .order('name');

  if (error) throw error;
  return data;
};
```

#### Update Stock

```typescript
const updateStock = async (
  entityId: string,
  skuCode: string,
  newQuantity: number
) => {
  const { data, error } = await supabase
    .from('retailer_inventory')
    .update({
      current_stock: newQuantity,
      last_updated: new Date().toISOString()
    })
    .eq('retailer_id', entityId)
    .eq('sku_code', skuCode);

  if (error) throw error;
  return data;
};
```

#### Create Visit

```typescript
const createVisit = async (visitData: Partial<Visit>) => {
  const { data, error } = await supabase
    .from('visits')
    .insert([{
      user_id: user?.id,
      entity_id: visitData.entityId,
      entity_type: visitData.entityType,
      check_in_time: new Date().toISOString(),
      latitude: latitude,
      longitude: longitude,
      purpose: visitData.purpose,
      status: 'in-progress'
    }])
    .select();

  if (error) throw error;
  return data[0];
};
```

#### Submit Verification

```typescript
const submitVerification = async (
  entityId: string,
  metricType: string,
  proofUrls: string[],
  stockUpdates: Record<string, number>
) => {
  // 1. Update stock quantities
  const stockPromises = Object.entries(stockUpdates).map(([skuCode, quantity]) =>
    supabase
      .from('retailer_inventory')
      .update({ current_stock: quantity })
      .eq('retailer_id', entityId)
      .eq('sku_code', skuCode)
  );

  // 2. Save verification proof
  const { data: verification, error: verifyError } = await supabase
    .from('verifications')
    .insert([{
      entity_id: entityId,
      metric_type: metricType,
      proof_urls: proofUrls,
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
      latitude: latitude,
      longitude: longitude
    }]);

  await Promise.all(stockPromises);

  if (verifyError) throw verifyError;
  return verification;
};
```

---

## Best Practices

### 1. **State Management**

```typescript
// ✅ Good: Lift state to parent component
const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

// ❌ Bad: Duplicate state in child components
```

### 2. **Error Handling**

```typescript
// ✅ Good: Always handle errors
try {
  const data = await fetchDistributors();
  setDistributors(data);
} catch (error) {
  console.error('Failed to fetch distributors:', error);
  alert('Failed to load data. Please try again.');
}

// ❌ Bad: Unhandled promises
fetchDistributors().then(data => setDistributors(data));
```

### 3. **Geolocation Checks**

```typescript
// ✅ Good: Check geofence before sensitive operations
const handleSubmit = () => {
  const check = isWithinGeofence();
  if (!check.valid) {
    alert(`Location verification failed: ${check.message}`);
    return;
  }
  // Proceed with submission
};

// ❌ Bad: Skip location validation
```

### 4. **Loading States**

```typescript
// ✅ Good: Show loading indicators
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
  } finally {
    setIsLoading(false);
  }
};

return (
  <button disabled={isLoading}>
    {isLoading ? 'Saving...' : 'Save'}
  </button>
);
```

### 5. **Data Validation**

```typescript
// ✅ Good: Validate user input
const handleQuantityChange = (value: string) => {
  const num = parseInt(value);
  if (isNaN(num) || num < 0) {
    alert('Please enter a valid positive number');
    return;
  }
  setQuantity(num);
};

// ❌ Bad: Trust user input directly
```

### 6. **Optimistic Updates**

```typescript
// ✅ Good: Update UI immediately, rollback on error
const handleUpdate = async (id: string, newValue: number) => {
  const oldValue = quantities[id];

  // Optimistic update
  setQuantities(prev => ({ ...prev, [id]: newValue }));

  try {
    await updateStock(id, newValue);
  } catch (error) {
    // Rollback on error
    setQuantities(prev => ({ ...prev, [id]: oldValue }));
    alert('Update failed. Please try again.');
  }
};
```

### 7. **Memory Management**

```typescript
// ✅ Good: Cleanup subscriptions
useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(callback);
  return () => navigator.geolocation.clearWatch(watchId);
}, []);

// ❌ Bad: Memory leaks
useEffect(() => {
  navigator.geolocation.watchPosition(callback);
}, []);
```

### 8. **Accessibility**

```tsx
// ✅ Good: Semantic HTML and ARIA labels
<button
  aria-label="Increase quantity"
  onClick={handleIncrement}
>
  <Plus className="w-5 h-5" />
</button>

// ❌ Bad: Non-semantic divs
<div onClick={handleIncrement}>+</div>
```

---

## Testing Checklist

### Stock Update Flow
- [ ] Can view stock details with SKU breakdown
- [ ] Can view invoice-wise transactions
- [ ] Can update SKU quantities using +/- buttons
- [ ] Can update SKU quantities via direct input
- [ ] Net change calculations are correct
- [ ] Color coding reflects increase/decrease
- [ ] Geofence validation blocks invalid locations
- [ ] Success flow navigates to verification tab
- [ ] Stock updates persist to database

### Verification Flow
- [ ] Photo capture works on mobile devices
- [ ] Letter preview displays correctly
- [ ] Letter can be copied to clipboard
- [ ] Location status updates in real-time
- [ ] Cannot submit without being in geofence
- [ ] Cannot submit without uploading proof
- [ ] Uploaded proofs display correctly
- [ ] Can remove uploaded proofs
- [ ] Submission success shows confirmation

### Entity 360° View
- [ ] All tabs load correctly
- [ ] Contact actions (call/email) work
- [ ] Financial data displays accurately
- [ ] Performance charts render
- [ ] History timeline shows all events
- [ ] Modal can be closed properly

### Performance
- [ ] App loads within 3 seconds
- [ ] Smooth scrolling on long lists
- [ ] No lag when updating quantities
- [ ] Images load progressively
- [ ] Works offline (with cached data)

---

## Troubleshooting

### Location Issues

**Problem**: "Unable to determine your location"

**Solutions**:
1. Check browser permissions for location access
2. Ensure HTTPS connection (required for geolocation)
3. Verify GPS is enabled on device
4. Check `useGeolocation` hook configuration

### Database Connection Issues

**Problem**: Data not loading

**Solutions**:
1. Check `.env` file has correct Supabase credentials
2. Verify RLS policies allow access
3. Check network connectivity
4. Review browser console for error messages

### Modal Not Closing

**Problem**: Modal remains open after action

**Solutions**:
1. Ensure all state setters are called
2. Check for event propagation issues
3. Verify modal close handlers

---

## Future Enhancements

### Planned Features
1. **Offline Mode**: Full offline data sync with queue
2. **Barcode Scanner**: Quick SKU scanning
3. **Voice Notes**: Audio recording for visit notes
4. **Push Notifications**: Real-time task alerts
5. **Analytics Dashboard**: Visual charts and trends
6. **Multi-language Support**: Regional language options
7. **Dark Mode**: Eye-friendly night mode
8. **Export Reports**: PDF/Excel export capability

### Performance Optimizations
1. Implement virtual scrolling for long lists
2. Add image compression before upload
3. Use React.memo for expensive components
4. Implement code splitting by route
5. Add service worker for PWA capabilities

---

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev)

### Internal Resources
- Project README: `/README.md`
- Business Logic: `/docs/business-logic.md`
- Stock Transfer Guide: `/STOCK_TRANSFER_IMPLEMENTATION.md`

### Contact
For questions or issues, contact the development team or submit an issue in the project repository.

---

**Last Updated**: October 17, 2025
**Version**: 1.0.0
**Maintained By**: Gencrest Development Team
