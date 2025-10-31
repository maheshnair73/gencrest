import { useState, useEffect, useCallback } from 'react';
import { PaginationParams, PaginatedResponse } from '../services/apiService';

interface UsePaginatedDataOptions<T> {
  fetchFunction: (params: PaginationParams, ...args: any[]) => Promise<PaginatedResponse<T>>;
  initialPageSize?: number;
  additionalParams?: any[];
}

export const usePaginatedData = <T>({
  fetchFunction,
  initialPageSize = 10,
  additionalParams = []
}: UsePaginatedDataOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchKey, setSearchKey] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: PaginationParams = {
        page: currentPage,
        pageSize,
        searchKey,
        sortBy,
        sortOrder
      };

      const response = await fetchFunction(params, ...additionalParams);

      setData(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error fetching paginated data:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchKey, sortBy, sortOrder, fetchFunction, additionalParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSearch = (key: string) => {
    setSearchKey(key);
    setCurrentPage(1);
  };

  const handleSort = (column: string, order?: 'asc' | 'desc') => {
    setSortBy(column);
    if (order) {
      setSortOrder(order);
    } else {
      setSortOrder(sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    searchKey,
    total,
    totalPages,
    sortBy,
    sortOrder,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort,
    refresh
  };
};
