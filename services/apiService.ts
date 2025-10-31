/**
 * API Service Template
 *
 * This file demonstrates how to replace mock data with real API calls.
 * Uncomment and implement these functions when connecting to Supabase or other backend.
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// PAGINATION & SEARCH TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  searchKey?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// GENERIC PAGINATION & SEARCH UTILITY
// ============================================================================

/**
 * Generic function to fetch paginated data with search from any table
 * @param tableName - Name of the Supabase table
 * @param params - Pagination and search parameters
 * @param searchColumns - Columns to search in
 * @param filters - Additional filters to apply
 * @returns Paginated response with data and metadata
 */
export const fetchPaginatedData = async <T>(
  tableName: string,
  params: PaginationParams,
  searchColumns: string[] = [],
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> => {
  const { page = 1, pageSize = 10, searchKey = '', sortBy = 'created_at', sortOrder = 'desc' } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' });

  if (searchKey && searchColumns.length > 0) {
    const searchConditions = searchColumns
      .map(col => `${col}.ilike.%${searchKey}%`)
      .join(',');
    query = query.or(searchConditions);
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(`Error fetching paginated data from ${tableName}:`, error);
    throw error;
  }

  return {
    data: (data || []) as T[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
};

// ============================================================================
// DISTRIBUTORS API
// ============================================================================

/**
 * Fetch all distributors from the database
 * @returns Array of distributor objects
 */
export const fetchDistributors = async () => {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('status', 'Active')
    .order('name');

  if (error) {
    console.error('Error fetching distributors:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch paginated distributors with search
 * @param params - Pagination and search parameters
 * @returns Paginated distributor data
 */
export const fetchPaginatedDistributors = async (params: PaginationParams) => {
  return fetchPaginatedData<any>(
    'distributors',
    params,
    ['name', 'code', 'territory', 'region', 'zone'],
    { status: 'Active' }
  );
};

/**
 * Fetch a single distributor by ID
 * @param id - Distributor ID
 * @returns Distributor object
 */
export const fetchDistributorById = async (id: string) => {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching distributor:', error);
    throw error;
  }

  return data;
};

/**
 * Update distributor information
 * @param id - Distributor ID
 * @param updates - Object with fields to update
 * @returns Updated distributor object
 */
export const updateDistributor = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('distributors')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating distributor:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// RETAILERS API
// ============================================================================

/**
 * Fetch all retailers from the database
 * @returns Array of retailer objects
 */
export const fetchRetailers = async () => {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')
    .eq('status', 'Active')
    .order('name');

  if (error) {
    console.error('Error fetching retailers:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch paginated retailers with search
 * @param params - Pagination and search parameters
 * @returns Paginated retailer data
 */
export const fetchPaginatedRetailers = async (params: PaginationParams, distributorId?: string) => {
  return fetchPaginatedData<any>(
    'retailers',
    params,
    ['name', 'code', 'distributor_name', 'territory', 'region'],
    distributorId ? { distributor_id: distributorId, status: 'Active' } : { status: 'Active' }
  );
};

/**
 * Fetch retailers for a specific distributor
 * @param distributorId - Distributor ID
 * @returns Array of retailer objects
 */
export const fetchRetailersByDistributor = async (distributorId: string) => {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')
    .eq('distributor_id', distributorId)
    .eq('status', 'Active');

  if (error) {
    console.error('Error fetching retailers:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// PRODUCTS & INVENTORY API
// ============================================================================

/**
 * Fetch inventory for a specific entity (distributor or retailer)
 * @param entityId - Entity ID
 * @returns Array of inventory items with product and SKU details
 */
export const fetchInventory = async (entityId: string) => {
  const { data, error } = await supabase
    .from('retailer_inventory')
    .select(`
      *,
      product:products(*),
      sku:skus(*)
    `)
    .eq('retailer_id', entityId);

  if (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch stock transactions for a specific entity
 * @param entityId - Entity ID
 * @param entityType - 'distributor' or 'retailer'
 * @returns Array of transaction records
 */
export const fetchStockTransactions = async (entityId: string, entityType: string) => {
  const { data, error } = await supabase
    .from('stock_transactions')
    .select('*')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType)
    .order('invoice_date', { ascending: false });

  if (error) {
    console.error('Error fetching stock transactions:', error);
    throw error;
  }

  return data;
};

/**
 * Update stock quantity for a specific SKU
 * @param inventoryId - Inventory record ID
 * @param newQuantity - New stock quantity
 * @returns Updated inventory record
 */
export const updateStockQuantity = async (inventoryId: string, newQuantity: number) => {
  const { data, error } = await supabase
    .from('retailer_inventory')
    .update({
      current_stock: newQuantity,
      last_updated: new Date().toISOString()
    })
    .eq('id', inventoryId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating stock quantity:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// VISITS API
// ============================================================================

/**
 * Create a new visit record
 * @param visitData - Visit information
 * @returns Created visit record
 */
export const createVisit = async (visitData: {
  entityId: string;
  entityType: 'distributor' | 'retailer';
  purpose: string;
  latitude?: number;
  longitude?: number;
}) => {
  const { data, error } = await supabase
    .from('visits')
    .insert([{
      entity_id: visitData.entityId,
      entity_type: visitData.entityType,
      check_in_time: new Date().toISOString(),
      latitude: visitData.latitude,
      longitude: visitData.longitude,
      purpose: visitData.purpose,
      status: 'in-progress'
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating visit:', error);
    throw error;
  }

  return data;
};

/**
 * Complete a visit (check-out)
 * @param visitId - Visit ID
 * @param notes - Visit notes
 * @returns Updated visit record
 */
export const completeVisit = async (visitId: string, notes: string) => {
  const { data, error } = await supabase
    .from('visits')
    .update({
      check_out_time: new Date().toISOString(),
      notes: notes,
      status: 'completed'
    })
    .eq('id', visitId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error completing visit:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch visits for a specific date range
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Array of visit records
 */
export const fetchVisits = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .gte('check_in_time', startDate)
    .lte('check_in_time', endDate)
    .order('check_in_time', { ascending: false });

  if (error) {
    console.error('Error fetching visits:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// TASKS API
// ============================================================================

/**
 * Fetch tasks for the current user
 * @param userId - User ID
 * @param status - Optional status filter
 * @returns Array of task records
 */
export const fetchTasks = async (userId: string, status?: string) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data;
};

/**
 * Update task status
 * @param taskId - Task ID
 * @param status - New status
 * @returns Updated task record
 */
export const updateTaskStatus = async (taskId: string, status: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// ORDERS API
// ============================================================================

/**
 * Fetch orders
 * @param distributorId - Optional distributor ID filter
 * @returns Array of order records
 */
export const fetchOrders = async (distributorId?: string) => {
  let query = supabase
    .from('orders')
    .select('*');

  if (distributorId) {
    query = query.eq('distributor_id', distributorId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data;
};

/**
 * Create a new order
 * @param orderData - Order information
 * @returns Created order record
 */
export const createOrder = async (orderData: {
  distributorId: string;
  items: Array<{ productCode: string; quantity: number; price: number }>;
  amount: number;
}) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      distributor_id: orderData.distributorId,
      items: orderData.items,
      amount: orderData.amount,
      date: new Date().toISOString(),
      status: 'Pending'
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// VERIFICATIONS API
// ============================================================================

/**
 * Submit verification proof for stock updates
 * @param verificationData - Verification information
 * @returns Created verification record
 */
export const submitVerification = async (verificationData: {
  entityId: string;
  metricType: string;
  proofUrls: string[];
  stockUpdates: Record<string, number>;
  latitude?: number;
  longitude?: number;
}) => {
  // 1. Update stock quantities
  const updatePromises = Object.entries(verificationData.stockUpdates).map(
    ([skuCode, quantity]) =>
      supabase
        .from('retailer_inventory')
        .update({ current_stock: quantity })
        .eq('retailer_id', verificationData.entityId)
        .eq('sku_code', skuCode)
  );

  await Promise.all(updatePromises);

  // 2. Save verification record
  const { data, error } = await supabase
    .from('verifications')
    .insert([{
      entity_id: verificationData.entityId,
      metric_type: verificationData.metricType,
      proof_urls: verificationData.proofUrls,
      verified_at: new Date().toISOString(),
      latitude: verificationData.latitude,
      longitude: verificationData.longitude
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error submitting verification:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// REPORTS API
// ============================================================================

/**
 * Fetch available reports
 * @param type - Optional report type filter
 * @returns Array of report records
 */
export const fetchReports = async (type?: string) => {
  let query = supabase
    .from('reports')
    .select('*');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch paginated reports with search
 * @param params - Pagination and search parameters
 * @returns Paginated report data
 */
export const fetchPaginatedReports = async (params: PaginationParams, reportType?: string) => {
  return fetchPaginatedData<any>(
    'reports',
    params,
    ['name', 'type', 'description'],
    reportType ? { type: reportType } : undefined
  );
};

/**
 * Generate a new report
 * @param reportType - Type of report to generate
 * @returns Generated report record
 */
export const generateReport = async (reportType: string) => {
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      type: reportType,
      date: new Date().toISOString(),
      status: 'Pending'
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error generating report:', error);
    throw error;
  }

  return data;
};

// ============================================================================
// USAGE EXAMPLE IN COMPONENTS
// ============================================================================

/**
 * Example: How to use in a React component
 *
 * import { fetchDistributors } from '../services/apiService';
 * import { MOCK_DISTRIBUTORS } from '../data/mockData';
 *
 * const MyComponent = () => {
 *   const [distributors, setDistributors] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *
 *   useEffect(() => {
 *     const loadDistributors = async () => {
 *       try {
 *         setLoading(true);
 *         setError(null);
 *
 *         // Use real API (comment out to use mock data)
 *         const data = await fetchDistributors();
 *
 *         // Use mock data (uncomment during development)
 *         // const data = MOCK_DISTRIBUTORS;
 *
 *         setDistributors(data);
 *       } catch (err) {
 *         console.error('Failed to load distributors:', err);
 *         setError(err.message);
 *
 *         // Fallback to mock data on error
 *         setDistributors(MOCK_DISTRIBUTORS);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *
 *     loadDistributors();
 *   }, []);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {distributors.map(dist => (
 *         <div key={dist.id}>{dist.name}</div>
 *       ))}
 *     </div>
 *   );
 * };
 */
