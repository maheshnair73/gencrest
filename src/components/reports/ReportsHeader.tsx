import React, { useEffect, useRef } from 'react';
import { Package, Store, Filter, ChevronUp, ChevronDown, Calendar, X } from 'lucide-react';

interface ReportsHeaderProps {
  userRole: string | undefined;
  userName: string | undefined;
  userTerritory: string | undefined;
  userZone: string | undefined;
  lastRefresh: Date;
  viewMode: 'mdo' | 'outlet' | 'product';
  setViewMode: (mode: 'mdo' | 'outlet' | 'product') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  showColumnFilter: boolean;
  setShowColumnFilter: (show: boolean) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  fetchReportData: () => void;
  columns: Array<{ key: string; label: string; visible: boolean }>;
  toggleColumn: (key: string) => void;
  selectedViews?: string[];
  setSelectedViews?: (views: string[]) => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  userRole,
  userName,
  userTerritory,
  userZone,
  lastRefresh,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  showDateFilter,
  setShowDateFilter,
  showColumnFilter,
  setShowColumnFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  fetchReportData,
  columns,
  toggleColumn,
  selectedViews = ['product'],
  setSelectedViews
}) => {
  const toggleView = (view: string) => {
    if (!setSelectedViews) {
      setViewMode(view as 'mdo' | 'outlet' | 'product');
      return;
    }

    if (selectedViews.includes(view)) {
      if (selectedViews.length > 1) {
        const newSelectedViews = selectedViews.filter(v => v !== view);
        setSelectedViews(newSelectedViews);
        setViewMode(newSelectedViews[0] as 'mdo' | 'outlet' | 'product');
      }
    } else {
      setSelectedViews([...selectedViews, view]);
      setViewMode(view as 'mdo' | 'outlet' | 'product');
    }
  };
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const columnFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
      if (columnFilterRef.current && !columnFilterRef.current.contains(event.target as Node)) {
        setShowColumnFilter(false);
      }
    };

    if (showDateFilter || showColumnFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateFilter, showColumnFilter, setShowDateFilter, setShowColumnFilter]);

  useEffect(() => {
    if (showColumnFilter && columnFilterRef.current) {
      const preventScroll = (e: Event) => {
        e.stopPropagation();
      };
      const dropdown = columnFilterRef.current.querySelector('.column-dropdown');
      dropdown?.addEventListener('scroll', preventScroll, true);

      return () => {
        dropdown?.removeEventListener('scroll', preventScroll, true);
      };
    }
  }, [showColumnFilter]);

  return (
    <>
      <div className="mb-3 sm:mb-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Liquidation Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {userRole === 'TSM' && `Territory: ${userTerritory} | Zone: ${userZone}`}
              {userRole === 'ZBH' && `Zone: ${userZone}`}
              {userRole === 'MDO' && `Welcome ${userName}`}
              {!userRole && 'All Locations'}
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">{lastRefresh.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3">
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => toggleView('product')}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${
                selectedViews.includes('product')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Product</span>
            </button>
            <button
              onClick={() => toggleView('outlet')}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${
                selectedViews.includes('outlet')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Customer</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
            <span className="sm:hidden">Filters</span>
            {showFilters ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-200">
          <div ref={dateFilterRef} className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-between sm:justify-start"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Date Range</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
            </button>

            {showDateFilter && (
              <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 sm:w-72">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Date Range</h3>
                  <button onClick={() => setShowDateFilter(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowDateFilter(false);
                      fetchReportData();
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={columnFilterRef} className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-between sm:justify-start"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Columns</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showColumnFilter ? 'rotate-180' : ''}`} />
            </button>

            {showColumnFilter && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
                <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
                  <h3 className="font-semibold text-gray-900">Show/Hide Columns</h3>
                  <button onClick={() => setShowColumnFilter(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="column-dropdown max-h-96 overflow-y-auto p-4 pt-3 space-y-2">
                  {columns.map(col => (
                    <label key={col.key} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 flex-1">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
