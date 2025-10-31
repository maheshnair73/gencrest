# Customer-wise Report Filters by Role

This document describes the filters available in the Customer-wise view of the Reports page based on user role.

## Filter Hierarchy by Role

### TSM (Territory Sales Manager)
**Filters shown:**
1. Territory (their territory only)
2. Customer

**Access Level:** Limited to their assigned territory

---

### RMM (Regional Marketing Manager)
**Filters shown:**
1. Territory
2. Region
3. Customer

**Access Level:** Can view across multiple territories and regions

---

### RBH (Regional Business Head)
**Filters shown:**
1. Territory
2. Region
3. State
4. Zone
5. Customer

**Access Level:** Region-specific access with visibility into states and zones within their region

---

### ZBH (Zonal Business Head) and Above
**Includes:** ZBH, VP, CFO, CHRO, MH, MD

**Filters shown:**
1. Territory (all)
2. Region (all)
3. State (all)
4. Zone (all)
5. Customer

**Access Level:** Full access across all territories, regions, states, and zones

---

## Implementation Details

### File Location
- **Component:** `src/pages/Reports.tsx`
- **View Mode:** `outlet` (Customer-wise)

### Filter Order
The filters appear in a consistent order from most specific (Territory) to most general (Zone):
1. Territory
2. Region
3. State
4. Zone
5. Customer

### Multi-select Support
All filters support multi-select using the `react-select` component, allowing users to:
- Select multiple items at once
- Search/filter within the dropdown
- Clear selections easily

### Conditional Rendering
The filters are conditionally rendered based on:
1. **User Role** - Only shows filters appropriate for the user's access level
2. **Data Availability** - Only shows filters when data is available (e.g., `uniqueTerritories.length > 0`)

### Role Detection
The role-based logic uses:
```typescript
user?.role === 'TSM'   // Territory Sales Manager
user?.role === 'RMM'   // Regional Marketing Manager
user?.role === 'RBH'   // Regional Business Head
user?.role === 'ZBH' || isRMMOrAbove  // Zonal and above
```

Where `isRMMOrAbove` includes: RMM, RBH, ZBH, VP, CFO, CHRO, MH, MD

## Usage Example

When an RBH logs in and navigates to Reports → Customer-wise, they will see:
1. A Territory dropdown (multi-select)
2. A Region dropdown (multi-select)
3. A State dropdown (multi-select)
4. A Zone dropdown (multi-select)
5. A Customer dropdown (multi-select)

They can select any combination of these filters to narrow down the customer data they want to view.

## Design Considerations

### Responsive Grid
The filters use a responsive grid layout:
- Mobile (< 768px): 1 column
- Tablet (768-1024px): 2 columns
- Desktop (> 1024px): 4 columns

### User Experience
- Filters cascade naturally from broad to specific
- Multi-select allows flexible filtering
- Clear All Filters button for quick reset
- Placeholders guide users on what to select
- Only relevant filters are shown based on role
