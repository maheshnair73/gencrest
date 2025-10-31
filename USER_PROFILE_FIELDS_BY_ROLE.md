# User Profile Fields by Role

This document outlines which location-related fields are displayed in the user profile dropdown for each role.

## Field Display Rules

### MDO (Market Development Officer)
**Fields Shown:**
- Email
- Phone
- **Location** (e.g., "Rohini", "Anantapur City")
- **Territory** (e.g., "North Delhi", "Anantapur")
- **Region** (e.g., "NCR", "Rayalaseema")
- **State** (e.g., "Delhi", "Andhra Pradesh")
- **Zone** (e.g., "North", "ANDHRA PRADESH")

### TSM (Territory Sales Manager)
**Fields Shown:**
- Email
- Phone
- **Territory** (e.g., "Delhi Territory")
- **Region** (e.g., "NCR")
- **State** (e.g., "Delhi")
- **Zone** (e.g., "North")

### RBH (Regional Business Head) / RMM (Regional Marketing Manager)
**Fields Shown:**
- Email
- Phone
- **Region** (e.g., "NCR", "South")
- **State** (e.g., "Delhi", "Karnataka")
- **Zone** (e.g., "North", "South")

### ZBH (Zonal Business Head)
**Fields Shown:**
- Email
- Phone
- **Zone** (e.g., "North", "South", "East", "West")
- **State** (e.g., Multiple states within the zone)

### MH (Marketing Head) / VP / MD / CHRO / CFO
**Fields Shown:**
- Email
- Phone
- **Zone** (if assigned to specific zone)
- **Region** (if assigned to specific region)

## Implementation Details

The user profile dropdown (UserSwitcher component) dynamically shows fields based on the user's role. This ensures that:

1. Field-level employees see their complete location hierarchy
2. Mid-level managers see their area of responsibility
3. Senior executives see their strategic scope

## Data Structure

The `AuthUser` interface includes the following location fields:
```typescript
interface AuthUser {
  // ... other fields
  location?: string;    // Specific city/area
  territory?: string;   // Sales territory
  region?: string;      // Regional area
  zone?: string;        // Zonal area
  state?: string;       // State
  // ... other fields
}
```

All location fields are optional to accommodate different organizational levels.
