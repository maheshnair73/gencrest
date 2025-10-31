# Zones and States Mapping

This document describes the geographical hierarchy used in the Gencrest Activity Tracker application.

## Zone Structure

The application uses 9 zones, each containing specific states:

### 1. North Zone
- Punjab
- Haryana
- UP
- J&K
- HP

### 2. Karnataka Zone
- Kerala
- Tamil Nadu
- Karnataka

### 3. Andhra Pradesh
- Andhra Pradesh

### 4. Gujarat
- Gujarat

### 5. Maharashtra
- Maharashtra

### 6. Chandigarh
- Chandigarh

### 7. Madhya Pradesh
- Madhya Pradesh

### 8. Rajasthan
- Rajasthan

### 9. Telangana
- Telangana

## Implementation

All zones and states are centrally defined in:
- **File**: `src/constants/geography.ts`

This file exports:
- `ZONES` - Object with zone constants
- `ZONE_LIST` - Array of zones for dropdowns
- `STATES` - Object with state constants
- `STATE_LIST` - Array of states for dropdowns
- `ZONE_STATE_MAPPING` - Mapping of zones to their states
- `STATE_ZONE_MAPPING` - Reverse mapping of states to zones
- `getStatesForZone(zone)` - Helper function to get states for a zone
- `getZoneForState(state)` - Helper function to get zone for a state

## Usage in Components

Import the constants in your components:

```typescript
import { ZONE_LIST, STATE_LIST, getStatesForZone } from '../constants/geography';
```

Example usage in dropdown:
```typescript
<select>
  <option value="">Select zone...</option>
  {ZONE_LIST.map(zone => (
    <option key={zone.value} value={zone.value}>{zone.label}</option>
  ))}
</select>
```

## Files Updated

The following files have been updated to use the new zone structure:
- `src/constants/geography.ts` (NEW)
- `src/pages/Reports.tsx`
- `src/pages/LiquidationReports.tsx`
- `src/contexts/AuthContext.tsx`
- `src/data/mockData.ts`

## Note

Some zones (Andhra Pradesh, Gujarat, Maharashtra, Chandigarh, Madhya Pradesh, Rajasthan, Telangana) are both zone names and state names, reflecting their single-state zone structure.
