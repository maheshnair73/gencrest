/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LiquidationMetricsCards } from '../components/liquidation/LiquidationMetricsCards';
import LiquidationFilters from '../components/liquidation/LiquidationFilters';
import { DistributorEntryCard } from '../components/liquidation/DistributorEntryCard';
import { DetailedMetricsModal } from '../components/liquidation/DetailedMetricsModal';
import { VerifyStockModal } from '../components/liquidation/VerifyStockModal';
import { PaginationControls } from '../components/PaginationControls';
import { useLiquidation } from '../contexts/LiquidationContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Entity360View from '../components/Entity360View';

import { motion } from 'framer-motion';
// --- Stub for missing productData ---
// TODO: Replace this with your actual product data source
const productData: any[] = [];

const Liquidation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    overallMetrics,
    fetchDistributors,
    fetchOverallMetrics,
    distributors,
    pagination,
    loadingMetrics,
    loadingDistributors,
  } = useLiquidation();

  const [searchType, setSearchType] = useState<'distributor' | 'retailer'>('distributor');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [selectedDistributorCode, setSelectedDistributorCode] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [show360View, setShow360View] = useState(false);

  // Local state for page size, initialized from context
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);

  // Destructure pagination info from context
  const { currentPage, totalPages, totalCount } = pagination;
  const [locationType, setLocationType] = useState<"my assignments" | "territory" | "region" | "zone" | "state" | "all">('my assignments')
  // 1. Fetch metrics on mount
  useEffect(() => {
    fetchOverallMetrics('');
  }, [fetchOverallMetrics]);

  // 2. Fetch distributors on mount AND when filters or page size change
  // This effect handles resetting to page 1 for any filter change
  useEffect(() => {
    console.log('Liquidation page: fetching distributors...');
    const filters = {
      search: searchQuery,
      type: locationType
    };
    // Fetch page 1 with current filters and page size
    fetchDistributors(1, pageSize, filters);
  }, [fetchDistributors, searchQuery, pageSize, locationType]);

  // Debug: Log distributors state changes
  useEffect(() => {
    console.log('Liquidation page - distributors:', distributors);
    console.log('Liquidation page - loadingDistributors:', loadingDistributors);
    console.log('Liquidation page - pagination:', pagination);
  }, [distributors, loadingDistributors, pagination]);

  // 3. Handle page changes (does *not* reset to page 1)
  const handlePageChange = useCallback((page: number) => {
    const filters: any = { search: searchQuery, status: statusFilter, priority: priorityFilter };
    if (locationType && locationType !== 'my assignments') filters.type = locationType
    fetchDistributors(page, pageSize, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchDistributors, pageSize, searchQuery, statusFilter, priorityFilter, locationType]);

  // 4. Handle page size changes (triggers the effect in #2)
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
  }, []);

  // Handlers for filter state changes (triggers the effect in #2)
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handlePriorityFilterChange = useCallback((priority: string) => {
    setPriorityFilter(priority);
  }, []);


  // This memo is still correct: it recalculates totals for the *visible* distributors
  const filteredMetrics = useMemo(() => {
    // If no context metrics, or no distributors fetched, return null/empty
    if (!overallMetrics || distributors.length === 0) {
      return overallMetrics || {
        openingStock: { volume: 0, value: 0 },
        ytdNetSales: { volume: 0, value: 0 },
        liquidation: { volume: 0, value: 0 },
        balanceStock: { volume: 0, value: 0 },
        liquidationPercentage: 0,
        lastUpdated: '2025-04-01T00:00:00.000Z'
      };
    }
    return overallMetrics;

    // // If filters are applied, distributors list will be different.
    // // We calculate metrics based on the *fetched* (filtered) list.
    // const totalVolume = distributors.reduce((sum, d) =>
    //   sum + d.metrics.openingStock.volume + d.metrics.ytdNetSales.volume, 0
    // );
    // const liquidatedVolume = distributors.reduce((sum, d) =>
    //   sum + d.metrics.liquidation.volume, 0
    // );
    // const liquidationPercentage = totalVolume > 0
    //   ? Math.round((liquidatedVolume / totalVolume) * 100)
    //   : 0;

    // return {
    //   openingStock: {
    //     volume: distributors.reduce((sum, d) => sum + d.metrics.openingStock.volume, 0),
    //     value: distributors.reduce((sum, d) => sum + d.metrics.openingStock.value, 0)
    //   },
    //   ytdNetSales: {
    //     volume: distributors.reduce((sum, d) => sum + d.metrics.ytdNetSales.volume, 0),
    //     value: distributors.reduce((sum, d) => sum + d.metrics.ytdNetSales.value, 0)
    //   },
    //   liquidation: {
    //     volume: liquidatedVolume,
    //     value: distributors.reduce((sum, d) => sum + d.metrics.liquidation.value, 0)
    //   },
    //   balanceStock: {
    //     volume: distributors.reduce((sum, d) => sum + d.metrics.balanceStock.volume, 0),
    //     value: distributors.reduce((sum, d) => sum + d.metrics.balanceStock.value, 0)
    //   },
    //   liquidationPercentage,
    //   lastUpdated: overallMetrics.lastUpdated // Use lastUpdated from overall
    // };
  }, [distributors, overallMetrics]);

  const handleViewDetails = useCallback((metric: string) => {
    setSelectedMetric(metric);
    setShowDetailModal(true);
  }, []);

  const handleVerifyStock = useCallback(async (distributorId: string, distributorCode: string) => {
    setSelectedDistributorId(distributorId);
    setSelectedDistributorCode(distributorCode);

    // Check if location is already verified for this distributor
    const distributor = distributors.find(d => d.id === distributorId);

    console.log('=== handleVerifyStock Debug ===');
    console.log('Distributor ID:', distributorId);
    console.log('Distributor Code:', distributorCode);
    console.log('Found distributor:', distributor);
    console.log('Location verified status:', distributor?.location_verified);
    console.log('All distributors:', distributors);

    if (distributor && distributor.location_verified) {
      // Location already verified, go directly to stock verification
      console.log('✅ Location already verified, opening stock verification modal');
      setShowVerifyModal(true);
    } else {
      // Location not verified yet, open Entity360View for location verification
      console.log('❌ Location not verified, opening 360 view for location verification');
      setShow360View(true);
    }
  }, [distributors]);

  const handleDistributorViewDetails = useCallback((distributorId: string, metric: string) => {
    setSelectedDistributorId(distributorId);
    setSelectedMetric(metric);
    setShowDetailModal(true);
  }, []);

  // Use main skeleton only on initial metric load
  if (loadingMetrics) {
    // You can use your <LoadingSkeleton /> component here
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* ... (full page skeleton) ... */}
        <LoadingSkeleton type="card" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Stock Liquidation</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Verify and track Distributor inventory</p>
          {totalCount > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {totalCount} Distributor{totalCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600">
            Last Balance Stock updated on: 31st Aug 2025
          </div>
          {/* {user && (<>

            <div className="mt-2 text-sm">
              <motion.div
                className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 font-medium shadow-sm border border-blue-200"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="opacity-80">📍 Viewing:</span>

                {locationType === 'my assignments' ? (
                  <span className="font-semibold text-blue-600">My Assignments</span>
                ) : locationType === 'all' ? (
                  <span className="font-semibold text-indigo-600">All Locations</span>
                ) : (
                  <>
                    <span className="capitalize font-semibold text-blue-800">
                      {user?.[locationType] || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-600 bg-white/60 px-2 py-0.5 rounded-md border border-blue-100">
                      {locationType}
                    </span>
                  </>
                )}
              </motion.div>
            </div>
          
          </>
          )} */}
        </div>
      </div>

      <LiquidationMetricsCards
        metrics={filteredMetrics}
        onViewDetails={handleViewDetails}
      />

      <LiquidationFilters
        setSearchQuery={setSearchQuery}
        searchType={'distributor'}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchTypeChange={setSearchType}
        onSearchQueryChange={handleSearchQueryChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPriorityFilterChange={handlePriorityFilterChange}
      />

      {/* Verification Incomplete Alert */}
      {distributors.some(d => d.verification_status !== 'verified') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📝</span>
                <h3 className="font-semibold text-amber-900">Verification incomplete for {distributors.filter(d => d.verification_status !== 'verified').length} {distributors.filter(d => d.verification_status !== 'verified').length === 1 ? 'outlet' : 'outlets'}.</h3>
              </div>
              <p className="text-sm text-amber-800">
                Complete stock verification to update liquidation metrics and ensure accurate reporting.
              </p>
            </div>
            <button
              onClick={() => {
                const firstUnverified = distributors.find(d => d.verification_status !== 'verified');
                if (firstUnverified) handleVerifyStock(firstUnverified.id);
              }}
              className="ml-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm whitespace-nowrap"
            >
              Complete Now
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between w-full text-sm text-gray-600">
          <span>
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of{' '}
            {totalCount} distributors
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {loadingDistributors ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Loading distributors...</p>
          </div>
        ) : distributors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No distributors found matching your filters</p>
          </div>
        ) : (
          // Render the list from context directly
          distributors.map(distributor => (
            <DistributorEntryCard
              key={distributor.id}
              id={distributor.id}
              name={distributor.distributorName}
              code={distributor.distributorCode}
              territory={distributor.territory}
              updated={distributor.metrics.lastUpdated}
              status={distributor.status}
              priority={distributor.priority}
              metrics={distributor.metrics}
              onVerifyStock={() => handleVerifyStock(distributor.id, distributor.distributorCode)}
              onViewDetails={(metric) => handleDistributorViewDetails(distributor.id, metric)}
            />
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalCount > 0 && !loadingDistributors && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            total={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedMetric && (
        <DetailedMetricsModal
          selectedMetric={selectedMetric}
          selectedDistributorId={selectedDistributorId}
          distributorMetrics={distributors} // Pass the current page of distributors
          userTerritory={user?.territory}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDistributorId(null);
          }}
        />
      )}

      {showVerifyModal && selectedDistributorId && (() => {
        // Find from the *current page* of distributors
        const distributor = distributors.find(d => d.id === selectedDistributorId);
        if (!distributor) return null;
        return (
          <VerifyStockModal
            selectedMetric={selectedMetric}
            distributorId={distributor.id}
            distributorName={distributor.distributorName}
            distributorCode={distributor.distributorCode}
            salesStaffName={user?.name || user?.email || 'Sales Representative'}
            productData={productData} // Use the stubbed data
            distributorLatitude={(distributor as any).latitude}
            distributorLongitude={(distributor as any).longitude}
            onClose={() => {
              setShowVerifyModal(false);
              setSelectedDistributorId(null);
            }}
          />
        );
      })()}

      {show360View && selectedDistributorCode && (
        <Entity360View
          distributorCode={selectedDistributorCode}
          userRole={user?.role || 'MDO'}
          onClose={() => {
            setShow360View(false);
            setSelectedDistributorId(null);
            setSelectedDistributorCode('');
          }}
        />
      )}
    </div>
  );
};

export default Liquidation;