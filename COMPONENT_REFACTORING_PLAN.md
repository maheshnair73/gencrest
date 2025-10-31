# Component Refactoring Plan

## Executive Summary
Four extremely large components have been identified that need to be split into smaller, more maintainable pieces:

| File | Size | Lines | Priority |
|------|------|-------|----------|
| MobileApp.tsx | 163KB | 3,458 | HIGH |
| TSMDashboard.tsx | 79KB | 1,957 | HIGH |
| Entity360View.tsx | 79KB | ~2,000 | HIGH |
| VisitManager.tsx | 65KB | ~1,700 | MEDIUM |

**Total:** ~9,115 lines of code that violate the single responsibility principle.

---

## 1. MobileApp.tsx Refactoring (3,458 lines → ~500 lines)

### Current Status
✅ Created foundational components:
- `mobile/MobileHomeTab.tsx` (117 lines)
- `mobile/MobileHeader.tsx` (122 lines)
- `mobile/MobileBottomNav.tsx` (49 lines)
- `mobile/README.md` (documentation)

### Required Components

#### Tab Components (Primary Views)
1. **mobile/MobileLiquidationTab.tsx** (~500 lines)
   - Liquidation metrics display
   - Distributor/Retailer list with pagination
   - Filter controls
   - Stock verification workflow

2. **mobile/MobileActivityTrackerTab.tsx** (~115 lines)
   - Activity list with status filters
   - Activity cards with icons
   - Navigation to full tracker

3. **mobile/MobileTeamTab.tsx** (~30 lines)
   - Team member list
   - Performance indicators

4. **mobile/MobileOrdersTab.tsx** (~30 lines)
   - Order list display
   - Order status indicators

5. **mobile/MobileTasksTab.tsx** (~35 lines)
   - Task list with priorities
   - Completion status

6. **mobile/MobileReportsTab.tsx** (~35 lines)
   - Report categories
   - Quick access links

7. **mobile/MobileDocsTab.tsx** (~200 lines)
   - API documentation links
   - Business logic guides
   - Developer resources

8. **mobile/MobileMoreTab.tsx** (~40 lines)
   - Settings menu
   - Profile access
   - Logout option

#### Modal Components
9. **mobile/MobileStockVerificationModal.tsx** (~400 lines)
   - Multi-step verification flow
   - SKU quantity inputs
   - Signature capture integration
   - Photo upload functionality
   - Letterhead preview

10. **mobile/MobileMetricModal.tsx** (~300 lines)
    - Detailed metric breakdown
    - Stock update interface
    - Product/SKU accordion
    - Verification proof upload

11. **mobile/Mobile360ViewWrapper.tsx** (~50 lines)
    - Wrapper for Entity360View
    - Mobile-optimized display
    - Tab navigation

#### Utility Components
12. **mobile/MobileLiveMeetings.tsx** (~100 lines)
    - Live meeting cards
    - Timer display
    - Meeting end functionality

13. **mobile/MobileMonthlyPlan.tsx** (~80 lines)
    - Monthly targets display
    - Progress visualization
    - Expandable details

### Implementation Steps
1. Extract each tab component with its own file
2. Extract modal components
3. Create proper TypeScript interfaces in `src/types/mobile.ts`
4. Update MobileApp.tsx to import and use extracted components
5. Remove duplicate code
6. Test all functionality
7. Update imports across the application

### Expected File Structure
```
src/components/mobile/
├── README.md (✅ Done)
├── MobileApp.tsx (main container - 500 lines)
├── MobileHeader.tsx (✅ Done)
├── MobileBottomNav.tsx (✅ Done)
├── MobileHomeTab.tsx (✅ Done)
├── MobileLiquidationTab.tsx
├── MobileActivityTrackerTab.tsx
├── MobileTeamTab.tsx
├── MobileOrdersTab.tsx
├── MobileTasksTab.tsx
├── MobileReportsTab.tsx
├── MobileDocsTab.tsx
├── MobileMoreTab.tsx
├── MobileStockVerificationModal.tsx
├── MobileMetricModal.tsx
├── Mobile360ViewWrapper.tsx
├── MobileLiveMeetings.tsx
└── MobileMonthlyPlan.tsx
```

---

## 2. TSMDashboard.tsx Refactoring (1,957 lines → ~300 lines)

### Analysis
Contains multiple sections:
- Team overview metrics
- Meeting management
- Approval workflow
- Activity tracking
- Performance analytics
- Task management

### Required Components

1. **dashboard/tsm/TSMMetricsOverview.tsx** (~150 lines)
   - Key performance indicators
   - Team statistics
   - Achievement rates

2. **dashboard/tsm/TSMMeetingManager.tsx** (~400 lines)
   - Meeting list display
   - Meeting creation/editing
   - Status management
   - Calendar integration

3. **dashboard/tsm/TSMApprovalQueue.tsx** (~300 lines)
   - Approval request list
   - Request details
   - Approve/reject actions
   - Filters and search

4. **dashboard/tsm/TSMTeamPerformance.tsx** (~250 lines)
   - Team member performance cards
   - Activity charts
   - Comparison metrics

5. **dashboard/tsm/TSMActivityFeed.tsx** (~200 lines)
   - Real-time activity updates
   - Activity filtering
   - Activity details

6. **dashboard/tsm/TSMMeetingModal.tsx** (~350 lines)
   - Meeting creation form
   - Meeting details view
   - Attendee management
   - Document attachments

7. **dashboard/tsm/TSMApprovalModal.tsx** (~250 lines)
   - Approval details view
   - Supporting documents
   - Action buttons
   - Comments/notes

### Expected File Structure
```
src/components/dashboard/tsm/
├── TSMDashboard.tsx (main container - 300 lines)
├── TSMMetricsOverview.tsx
├── TSMMeetingManager.tsx
├── TSMApprovalQueue.tsx
├── TSMTeamPerformance.tsx
├── TSMActivityFeed.tsx
├── TSMMeetingModal.tsx
└── TSMApprovalModal.tsx
```

---

## 3. Entity360View.tsx Refactoring (~2,000 lines → ~200 lines)

### Analysis
Comprehensive entity view with multiple tabs and data sections.

### Required Components

1. **entity/Entity360Container.tsx** (~200 lines)
   - Main container
   - Tab navigation
   - Data loading

2. **entity/Entity360ContactTab.tsx** (~150 lines)
   - Contact information
   - Communication history
   - Quick actions

3. **entity/Entity360FinancialTab.tsx** (~250 lines)
   - Financial metrics
   - Credit utilization
   - Payment history
   - Outstanding balance

4. **entity/Entity360PerformanceTab.tsx** (~300 lines)
   - Sales performance
   - Order history
   - Growth trends
   - Charts and graphs

5. **entity/Entity360HistoryTab.tsx** (~350 lines)
   - Activity timeline
   - Visit history
   - Order history
   - Document history

6. **entity/Entity360InventoryTab.tsx** (~250 lines)
   - Stock levels
   - SKU details
   - Stock movements
   - Verification status

7. **entity/Entity360NotesTab.tsx** (~150 lines)
   - Notes list
   - Note creation
   - Note editing
   - Attachments

8. **entity/Entity360Header.tsx** (~100 lines)
   - Entity name and code
   - Status indicators
   - Quick actions
   - Rating display

### Expected File Structure
```
src/components/entity/
├── Entity360Container.tsx (main - 200 lines)
├── Entity360Header.tsx
├── Entity360ContactTab.tsx
├── Entity360FinancialTab.tsx
├── Entity360PerformanceTab.tsx
├── Entity360HistoryTab.tsx
├── Entity360InventoryTab.tsx
└── Entity360NotesTab.tsx
```

---

## 4. VisitManager.tsx Refactoring (~1,700 lines → ~250 lines)

### Analysis
Visit planning and execution management with multiple modals and forms.

### Required Components

1. **visits/VisitManagerContainer.tsx** (~250 lines)
   - Main visit list
   - Filter controls
   - Visit creation trigger

2. **visits/VisitListItem.tsx** (~100 lines)
   - Visit card display
   - Status indicators
   - Quick actions

3. **visits/VisitCreationModal.tsx** (~350 lines)
   - Visit planning form
   - Date/time selection
   - Location selection
   - Objective setting

4. **visits/VisitExecutionModal.tsx** (~400 lines)
   - Visit check-in
   - Activity recording
   - Photo capture
   - Signature capture
   - Notes entry

5. **visits/VisitDetailsModal.tsx** (~250 lines)
   - Visit summary
   - Activity details
   - Proof documents
   - Outcome display

6. **visits/VisitLocationVerification.tsx** (~150 lines)
   - GPS verification
   - Location accuracy check
   - Manual override (for authorized roles)

7. **visits/VisitFarmerDataModal.tsx** (~200 lines)
   - Farmer information form
   - Stock decrease tracking
   - Farmer contact details

### Expected File Structure
```
src/components/visits/
├── VisitManagerContainer.tsx (main - 250 lines)
├── VisitListItem.tsx
├── VisitCreationModal.tsx
├── VisitExecutionModal.tsx
├── VisitDetailsModal.tsx
├── VisitLocationVerification.tsx
└── VisitFarmerDataModal.tsx
```

---

## Implementation Priority

### Phase 1: Critical Splits (Week 1)
1. ✅ Create mobile base components (Done)
2. ⏳ Split MobileLiquidationTab (largest section)
3. ⏳ Split Entity360View tabs
4. ⏳ Update main components to use extracted pieces

### Phase 2: TSM Dashboard (Week 2)
1. Extract TSM metrics components
2. Extract TSM meeting manager
3. Extract TSM approval queue
4. Test and validate

### Phase 3: Visit Manager (Week 3)
1. Extract visit modals
2. Extract visit list components
3. Test end-to-end visit flow
4. Validate location verification

### Phase 4: Finalization (Week 4)
1. Complete any remaining extractions
2. Remove duplicate code
3. Add comprehensive TypeScript types
4. Update documentation
5. Performance testing
6. Code review

---

## Benefits

### Maintainability
- Each file has a single, clear responsibility
- Easier to locate and fix bugs
- Simpler code reviews

### Performance
- Smaller bundle sizes per route
- Better code splitting opportunities
- Faster compilation times
- Improved hot module replacement

### Developer Experience
- Easier onboarding for new developers
- More intuitive file organization
- Better IDE performance
- Clearer dependency relationships

### Testing
- Easier unit testing (smaller components)
- More focused integration tests
- Better test coverage potential

### Collaboration
- Multiple developers can work simultaneously
- Reduced merge conflicts
- Clearer ownership of components

---

## Estimated Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Largest File | 3,458 lines | ~500 lines | 85% reduction |
| Avg File Size | ~2,000 lines | ~250 lines | 87% reduction |
| Total Files | 4 files | ~45 files | Better organization |
| Build Time | ~10s | ~7s | ~30% faster (estimated) |
| Hot Reload | ~3s | ~1s | ~66% faster (estimated) |

---

## Next Steps

1. Review and approve this plan
2. Create feature branch: `refactor/split-large-components`
3. Begin Phase 1 implementation
4. Regular progress updates and reviews
5. Merge to main after thorough testing

---

## Notes

- All existing functionality must be preserved
- No breaking changes to public APIs
- Maintain backward compatibility
- Document any new component interfaces
- Add JSDoc comments to new components
- Follow existing code style and conventions
