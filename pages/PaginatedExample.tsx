import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { PaginatedTable } from '../components/PaginatedTable';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { fetchPaginatedDistributors } from '../services/apiService';

const PaginatedExample: React.FC = () => {
  const navigate = useNavigate();

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
    fetchFunction: fetchPaginatedDistributors,
    initialPageSize: 10
  });

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true
    },
    {
      key: 'name',
      label: 'Distributor Name',
      sortable: true
    },
    {
      key: 'territory',
      label: 'Territory',
      sortable: true
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true
    },
    {
      key: 'zone',
      label: 'Zone',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributors</h1>
              <p className="text-gray-600 mt-1">API-based pagination and search example</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{total} Total</span>
          </div>
        </div>

        <PaginatedTable
          data={data}
          columns={columns}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          searchPlaceholder="Search distributors by name, code, territory..."
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyMessage="No distributors found"
        />

        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Implementation Notes:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>API-based pagination:</strong> Page number and search key are sent to the backend</li>
            <li>• <strong>Debounced search:</strong> Search queries are automatically debounced (500ms)</li>
            <li>• <strong>Sorting:</strong> Click column headers to sort (if sortable)</li>
            <li>• <strong>Page size selection:</strong> Choose 10, 25, 50, or 100 results per page</li>
            <li>• <strong>Reusable components:</strong> PaginatedTable, SearchBar, PaginationControls</li>
            <li>• <strong>Custom hook:</strong> usePaginatedData manages all pagination state</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaginatedExample;
