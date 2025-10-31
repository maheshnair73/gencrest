import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PaginationControls } from './PaginationControls';
import { SearchBar } from './SearchBar';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  searchPlaceholder?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearch?: (searchKey: string) => void;
  onSort?: (column: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  emptyMessage?: string;
}

export const PaginatedTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  currentPage,
  totalPages,
  pageSize,
  total,
  searchPlaceholder = 'Search...',
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'No data available'
}: PaginatedTableProps<T>) => {
  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null;

    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp className="w-4 h-4 ml-1" />
      ) : (
        <ArrowDown className="w-4 h-4 ml-1" />
      );
    }

    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {onSearch && (
        <div className="p-4 border-b border-gray-200">
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={onSearch}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  }`}
                  onClick={() => column.sortable && onSort && onSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-red-600">
                    <p className="font-semibold">Error loading data</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && data.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};
