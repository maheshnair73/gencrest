import React, { useState, useMemo, useCallback } from 'react';
import { Download, Filter, Search, FileText, Package, Users as UsersIcon } from 'lucide-react';
import { useCachedData, useDataCache } from '../contexts/DataCacheContext';
import { reportsApiService } from '../services/dashboardApiService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaginationControls from '../components/PaginationControls';

type ReportType = 'customer' | 'distributor' | 'product';

interface ReportFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  zone?: string;
  region?: string;
  territory?: string;
  status?: string;
  category?: string;
}

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'customer', label: 'Customer Report', icon: UsersIcon },
  { value: 'distributor', label: 'Distributor Report', icon: FileText },
  { value: 'product', label: 'Product Report', icon: Package },
];

const UnifiedReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('customer');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const cache = useDataCache();

  const cacheKey = useMemo(() => {
    const filterStr = JSON.stringify(filters);
    return `reports_${reportType}_${currentPage}_${pageSize}_${filterStr}`;
  }, [reportType, currentPage, pageSize, filters]);

  const { data: reportData, loading, error, refetch } = useCachedData(
    cacheKey,
    async () => {
      const result = await reportsApiService.getReportData(reportType, filters, currentPage, pageSize);
      if (!result.success) {
        throw new Error('Failed to fetch report data');
      }
      return result;
    },
    3 * 60 * 1000
  );

  const { data: summaryData } = useCachedData(
    `reports_summary_${reportType}_${JSON.stringify(filters)}`,
    async () => {
      const result = await reportsApiService.getReportSummary(reportType, filters);
      if (!result.success) {
        throw new Error('Failed to fetch summary');
      }
      return result.data;
    },
    5 * 60 * 1000
  );

  const handleFilterChange = useCallback((key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    cache.invalidate(`reports_${reportType}`);
  }, [reportType, cache]);

  const handleReportTypeChange = useCallback((type: ReportType) => {
    setReportType(type);
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(async (format: 'excel' | 'pdf' | 'csv') => {
    const result = await reportsApiService.exportReport(reportType, format, filters);
    if (result.success && result.data) {
      const url = window.URL.createObjectURL(result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [reportType, filters]);

  const renderTableHeaders = useMemo(() => {
    if (!reportData?.data || reportData.data.length === 0) return null;
    const headers = Object.keys(reportData.data[0]);
    return (
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header.replace(/_/g, ' ')}
            </th>
          ))}
        </tr>
      </thead>
    );
  }, [reportData?.data]);

  const renderTableRows = useMemo(() => {
    if (!reportData?.data || reportData.data.length === 0) return null;
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {reportData.data.map((row: any, idx: number) => (
          <tr key={idx} className="hover:bg-gray-50">
            {Object.values(row).map((cell: any, cellIdx: number) => (
              <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }, [reportData?.data]);

  const renderSummary = useMemo(() => {
    if (!summaryData) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(summaryData).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg p-4 card-shadow">
            <p className="text-sm text-gray-600 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
            <p className="text-2xl font-bold text-gray-900">{String(value)}</p>
          </div>
        ))}
      </div>
    );
  }, [summaryData]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export comprehensive reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          {REPORT_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleReportTypeChange(value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                reportType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ml-3"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {renderSummary}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : !reportData?.data || reportData.data.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available for the selected filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl card-shadow overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {renderTableHeaders}
                {renderTableRows}
              </table>
            </div>
          </div>

          {reportData.pagination && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={reportData.pagination.totalPages || 1}
              onPageChange={setCurrentPage}
              totalItems={reportData.pagination.total || 0}
              itemsPerPage={pageSize}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UnifiedReports;
