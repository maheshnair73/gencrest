# Cascading/Dependent Filters Implementation

## Overview
Implemented cascading filters that allow users to drill down from zones → regions → states → territories → customers/products, with each level filtering the options in the next level.

## How It Works

### Cascading Filter Flow

```
Select ZONES
    ↓ (filters available regions)
Select REGIONS  
    ↓ (filters available states)
Select STATES
    ↓ (filters available territories)
Select TERRITORIES
    ↓ (filters available customers & products)
Select CUSTOMERS/PRODUCTS
    ↓
Generate Report
```

### Filter Dependencies

1. **Zones** (Independent)
   - Shows all available zones
   - No dependencies

2. **Regions** (Depends on Zones)
   - If zones are selected → shows only regions in those zones
   - If no zones selected → shows all regions

3. **States** (Depends on Zones + Regions)
   - If zones selected → filters by zones
   - If regions selected → filters by regions
   - Shows only states within selected zones/regions

4. **Territories** (Depends on Zones + Regions + States)
   - Filters based on zones, regions, and states
   - Shows only territories within selected hierarchy

5. **Customers/Outlets** (Depends on All Above)
   - Shows only customers from selected zones/regions/states/territories
   - Customer labels include location context: "Shop Name (Zone - Region - State)"

6. **Products** (Can be filtered independently or by location)
   - Multi-select products
   - Future enhancement: filter products by locations where they're sold

## Example Use Cases

### Use Case 1: State-Specific Report
```
1. Select State: "Maharashtra"
   → Territories dropdown now shows only Maharashtra territories
   → Customers dropdown now shows only Maharashtra customers

2. Select specific customers from Maharashtra

3. Click "Generate"

4. Report shows data only for selected state and customers
```

### Use Case 2: Multi-Region Comparison
```
1. Select Zones: "North Zone", "South Zone"
   → Regions dropdown shows only regions in North and South zones

2. Select Regions: "Delhi NCR", "Karnataka"
   → States dropdown shows only states in these regions
   → Territories filtered accordingly

3. Select Products: "DAP", "Urea"

4. Click "Generate"

5. Report compares these products across selected regions
```

### Use Case 3: Territory-Level Deep Dive
```
1. Select Zone: "West Zone"
2. Select Region: "Mumbai Region"  
3. Select State: "Maharashtra"
4. Select Territory: "Thane"
   → Customers dropdown shows only Thane customers

5. Select all or specific customers in Thane

6. Generate detailed territory report
```

## Technical Implementation

### State Management
```typescript
const [selectedZones, setSelectedZones] = useState<string[]>([]);
const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
const [selectedStates, setSelectedStates] = useState<string[]>([]);
const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
```

### Cascading Logic
Each dropdown's options are computed based on selected values from parent filters:

```typescript
// Regions filtered by selected zones
const uniqueRegions = useMemo(() => {
  let filteredData = mdoData;
  if (selectedZones.length > 0) {
    filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
  }
  return Array.from(new Set(filteredData.map(mdo => mdo.region))).sort();
}, [mdoData, selectedZones]);

// States filtered by zones + regions
const uniqueStates = useMemo(() => {
  let filteredData = mdoData;
  if (selectedZones.length > 0) {
    filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
  }
  if (selectedRegions.length > 0) {
    filteredData = filteredData.filter(mdo => selectedRegions.includes(mdo.region));
  }
  return Array.from(new Set(filteredData.map(mdo => mdo.state))).sort();
}, [mdoData, selectedZones, selectedRegions]);

// And so on...
```

### Customer/Outlet Filtering
Customers are filtered through the entire hierarchy:

```typescript
const outletOptions = useMemo(() => {
  mdoData.forEach(mdo => {
    const matchesZone = selectedZones.length === 0 || selectedZones.includes(mdo.zone);
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(mdo.region);
    const matchesState = selectedStates.length === 0 || selectedStates.includes(mdo.state);
    const matchesTerritory = selectedTerritories.length === 0 || selectedTerritories.includes(mdo.territory);
    
    if (matchesZone && matchesRegion && matchesState && matchesTerritory) {
      // Add outlet to available options
    }
  });
}, [mdoData, selectedZones, selectedRegions, selectedStates, selectedTerritories]);
```

## UI/UX Features

1. **Visual Hierarchy**
   - Filters arranged left-to-right in logical order
   - Zones → Regions → States → Territories → Customers

2. **Dynamic Updates**
   - Options update immediately when parent filter changes
   - Previously selected values are cleared if no longer valid

3. **Smart Labels**
   - Customer dropdown shows: "Customer Name (Zone - Region - State)"
   - Provides context for each selection

4. **Responsive Grid**
   - 1 column on mobile
   - 2 columns on tablet
   - 3 columns on desktop

5. **Clear All**
   - One-click button to reset all filters

## Benefits

1. **Prevents Invalid Combinations**
   - Can't select territories from unselected zones
   - Ensures data consistency

2. **Reduces Clutter**
   - Only shows relevant options at each level
   - Easier to find specific items

3. **Flexible Reporting**
   - Start broad (zone level) or narrow (specific customers)
   - Mix and match any valid combination

4. **Better Performance**
   - Fewer options to render as you drill down
   - Faster search and selection

5. **Intuitive Flow**
   - Natural top-down geographic hierarchy
   - Matches how users think about data

## Files Modified
- `/src/pages/Reports.tsx`
  - Added state filtering
  - Implemented cascading filter logic
  - Updated UI with state dropdown
  - Enhanced customer/outlet filtering with full hierarchy

## Database Schema
Uses existing `outlets` table with:
- `zone`
- `region`
- `state` (already exists in schema)
- `territory`

All location data is already available in the database.
