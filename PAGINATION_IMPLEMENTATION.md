# API-Based Pagination & Search Implementation

## Overview

This document describes the comprehensive API-based pagination and search system implemented across the platform. All pagination and search operations are handled server-side, with page numbers and search keys passed to the API.

## Architecture Components

### 1. API Service (`src/services/apiService.ts`)

#### Generic Pagination Function

```typescript
fetchPaginatedData<T>(
  tableName: string,
  params: PaginationParams,
  searchColumns: string[],
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>>
```

**Features:**
- Generic function that works with any Supabase table
- Server-side pagination using `range()` method
- Multi-column search with `ilike` operator
- Additional filters support
- Sorting by any column
- Returns total count and metadata

**Parameters:**
- `tableName`: Name of the Supabase table
- `params`: `{ page, pageSize, searchKey, sortBy, sortOrder }`
- `searchColumns`: Array of column names to search across
- `filters`: Optional additional filters (status, territory, etc.)

#### Specialized API Functions

Convenience functions for common tables:

```typescript
// Distributors with pagination
fetchPaginatedDistributors(params: PaginationParams)

// Retailers with pagination
fetchPaginatedRetailers(params: PaginationParams, distributorId?: string)

// Reports with pagination
fetchPaginatedReports(params: PaginationParams, reportType?: string)
```

### 2. Custom Hook (`src/hooks/usePaginatedData.ts`)

Manages all pagination state and API calls:

```typescript
const {
  data,              // Current page data
  loading,           // Loading state
  error,             // Error message
  currentPage,       // Current page number
  pageSize,          // Items per page
  searchKey,         // Current search term
  total,             // Total items
  totalPages,        // Total pages
  sortBy,            // Current sort column
  sortOrder,         // Sort direction ('asc' | 'desc')
  handlePageChange,
  handlePageSizeChange,
  handleSearch,
  handleSort,
  refresh
} = usePaginatedData({
  fetchFunction: fetchPaginatedDistributors,
  initialPageSize: 10,
  additionalParams: []
});
```

**Features:**
- Automatic data fetching on parameter changes
- Loading and error state management
- Debounced search (500ms)
- Sort toggling
- Refresh capability

### 3. UI Components

#### PaginatedTable Component (`src/components/PaginatedTable.tsx`)

Reusable table component with built-in pagination, search, and sorting:

```typescript
<PaginatedTable
  data={data}
  columns={columns}
  loading={loading}
  error={error}
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  total={total}
  searchPlaceholder="Search..."
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  onSearch={handleSearch}
  onSort={handleSort}
  sortBy={sortBy}
  sortOrder={sortOrder}
  emptyMessage="No data found"
/>
```

**Features:**
- Responsive table with overflow handling
- Sortable columns (click header to toggle)
- Loading skeleton
- Error display
- Empty state message
- Custom cell rendering

#### SearchBar Component (`src/components/SearchBar.tsx`)

Debounced search input with clear button:

```typescript
<SearchBar
  placeholder="Search..."
  onSearch={handleSearch}
  debounceMs={500}
  initialValue=""
/>
```

#### PaginationControls Component (`src/components/PaginationControls.tsx`)

Full-featured pagination controls:

```typescript
<PaginationControls
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  total={total}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

**Features:**
- First/Last page buttons
- Previous/Next page buttons
- Smart page number display with ellipsis
- Page size selector (10, 25, 50, 100)
- Shows "X to Y of Z results"

## Implementation Guide

### Step 1: Create API Function

Add a paginated function for your table in `apiService.ts`:

```typescript
export const fetchPaginatedYourTable = async (params: PaginationParams) => {
  return fetchPaginatedData<YourType>(
    'your_table_name',
    params,
    ['column1', 'column2', 'column3'], // Search columns
    { status: 'Active' } // Optional filters
  );
};
```

### Step 2: Define Table Columns

```typescript
const columns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (item) => (
      <span className={`badge ${item.status === 'Active' ? 'bg-green' : 'bg-red'}`}>
        {item.status}
      </span>
    )
  }
];
```

### Step 3: Use Hook and Component

```typescript
import { usePaginatedData } from '../hooks/usePaginatedData';
import { PaginatedTable } from '../components/PaginatedTable';
import { fetchPaginatedYourTable } from '../services/apiService';

const YourPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    totalPages,
    sortBy,
    sortOrder,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort
  } = usePaginatedData({
    fetchFunction: fetchPaginatedYourTable,
    initialPageSize: 25
  });

  return (
    <PaginatedTable
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      total={total}
      searchPlaceholder="Search your data..."
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
      onSort={handleSort}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
};
```

## Example Implementation

See `/pagination-example` route for a working demonstration with distributors table.

## Database Requirements

### Enable Row Level Security

All tables must have RLS enabled:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### Create Appropriate Policies

Example policy for authenticated users:

```sql
CREATE POLICY "Users can view their data"
  ON your_table
  FOR SELECT
  TO authenticated
  USING (
    -- Add your access control logic here
    auth.uid() = user_id
  );
```

## Performance Optimization

### Indexing

Create indexes on frequently searched and sorted columns:

```sql
CREATE INDEX idx_distributors_name ON distributors(name);
CREATE INDEX idx_distributors_code ON distributors(code);
CREATE INDEX idx_distributors_territory ON distributors(territory);
CREATE INDEX idx_distributors_created_at ON distributors(created_at);
```

### Search Optimization

For better full-text search performance, consider using PostgreSQL's full-text search:

```sql
-- Add tsvector column
ALTER TABLE distributors ADD COLUMN search_vector tsvector;

-- Create trigger to update search vector
CREATE TRIGGER distributors_search_vector_update
BEFORE INSERT OR UPDATE ON distributors
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', name, code, territory);

-- Create GIN index
CREATE INDEX idx_distributors_search ON distributors USING GIN(search_vector);
```

## API Request Flow

1. User types in search box → Debounced (500ms)
2. Hook calls API with `{ page, pageSize, searchKey, sortBy, sortOrder }`
3. API constructs Supabase query:
   - Applies search filter: `or('name.ilike.%search%,code.ilike.%search%')`
   - Applies additional filters: `eq('status', 'Active')`
   - Applies sorting: `order(sortBy, { ascending: sortOrder === 'asc' })`
   - Applies pagination: `range(from, to)`
4. Supabase returns data + total count
5. Component renders table and pagination controls

## Testing Pagination

### Manual Testing Checklist

- [ ] Navigate to first/last page
- [ ] Navigate to previous/next page
- [ ] Click specific page numbers
- [ ] Change page size (10, 25, 50, 100)
- [ ] Search with various terms
- [ ] Clear search
- [ ] Sort by different columns
- [ ] Toggle sort direction
- [ ] Test with empty results
- [ ] Test with single result
- [ ] Test with many results (100+)

### Edge Cases

1. **No Results**: Shows empty state message
2. **Single Page**: Pagination controls adjust accordingly
3. **Search Returns No Results**: Shows "No results found" message
4. **API Error**: Shows error message with retry option
5. **Large Datasets**: Pagination ensures performance

## Troubleshooting

### Search Not Working

1. Check if search columns are spelled correctly
2. Verify columns exist in database
3. Check RLS policies allow reading those columns

### Pagination Not Loading

1. Check network tab for API errors
2. Verify Supabase connection
3. Check RLS policies
4. Verify table name is correct

### Slow Performance

1. Add indexes to search and sort columns
2. Reduce page size
3. Optimize RLS policies
4. Consider materialized views for complex queries

## Future Enhancements

- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Column visibility toggle
- [ ] Advanced filters panel
- [ ] Saved filter presets
- [ ] Bulk actions
- [ ] Inline editing
- [ ] Virtual scrolling for large datasets
- [ ] Server-side column filtering

## Summary

The pagination system provides:

✅ **Server-side pagination** - Page number sent to API
✅ **API-based search** - Search key sent to API
✅ **Multi-column search** - Search across multiple fields
✅ **Sorting** - Click headers to sort
✅ **Flexible page sizes** - 10, 25, 50, 100
✅ **Reusable components** - Use anywhere
✅ **Type-safe** - Full TypeScript support
✅ **Loading states** - User feedback during API calls
✅ **Error handling** - Graceful error display
✅ **Responsive** - Works on all screen sizes

Navigate to `/pagination-example` in the app to see it in action!
