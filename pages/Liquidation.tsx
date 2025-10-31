import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiquidationCalculation } from '../hooks/useLiquidationCalculation';
import { useAuth } from '../contexts/AuthContext';
import { getDataScopeForRole } from '../utils/liquidationFilters';
import { LiquidationMetricsCards } from '../components/liquidation/LiquidationMetricsCards';
import { LiquidationFilters } from '../components/liquidation/LiquidationFilters';
import { DistributorEntryCard } from '../components/liquidation/DistributorEntryCard';
import { DetailedMetricsModal } from '../components/liquidation/DetailedMetricsModal';
import { VerifyStockModal } from '../components/liquidation/VerifyStockModal';
import { PaginationControls } from '../components/PaginationControls';
import Entity360View from '../components/Entity360View';

const Liquidation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    overallMetrics,
    distributorMetrics,
    productData
  } = useLiquidationCalculation();

  const [searchType, setSearchType] = useState<'distributor' | 'retailer'>('distributor');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [show360View, setShow360View] = useState(false);
  const [selected360Entity, setSelected360Entity] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredDistributors = useMemo(() => {
    if (!user) return distributorMetrics;

    const scope = getDataScopeForRole(user.role);
    let result = distributorMetrics;

    switch (scope) {
      case 'territory':
        result = distributorMetrics.filter(d => d.territory === user.territory);
        break;
      case 'state':
        result = distributorMetrics.filter(d => d.state === user.state);
        break;
      case 'zone':
        result = distributorMetrics.filter(d => d.zone === user.zone);
        break;
      case 'all':
      default:
        result = distributorMetrics;
    }

    if (searchQuery) {
      result = result.filter(d =>
        d.distributorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.distributorCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter(d => d.priority === priorityFilter);
    }

    return result;
  }, [distributorMetrics, user, searchQuery, statusFilter, priorityFilter]);

  const paginatedDistributors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDistributors.slice(startIndex, endIndex);
  }, [filteredDistributors, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDistributors.length / pageSize);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const filteredMetrics = useMemo(() => {
    if (filteredDistributors.length === 0) {
      return overallMetrics;
    }

    const totalVolume = filteredDistributors.reduce((sum, d) =>
      sum + d.metrics.openingStock.volume + d.metrics.ytdNetSales.volume, 0
    );
    const liquidatedVolume = filteredDistributors.reduce((sum, d) =>
      sum + d.metrics.liquidation.volume, 0
    );
    const liquidationPercentage = totalVolume > 0
      ? Math.round((liquidatedVolume / totalVolume) * 100)
      : 0;

    return {
      openingStock: {
        volume: filteredDistributors.reduce((sum, d) => sum + d.metrics.openingStock.volume, 0),
        value: filteredDistributors.reduce((sum, d) => sum + d.metrics.openingStock.value, 0)
      },
      ytdNetSales: {
        volume: filteredDistributors.reduce((sum, d) => sum + d.metrics.ytdNetSales.volume, 0),
        value: filteredDistributors.reduce((sum, d) => sum + d.metrics.ytdNetSales.value, 0)
      },
      liquidation: {
        volume: liquidatedVolume,
        value: filteredDistributors.reduce((sum, d) => sum + d.metrics.liquidation.value, 0)
      },
      balanceStock: {
        volume: filteredDistributors.reduce((sum, d) => sum + d.metrics.balanceStock.volume, 0),
        value: filteredDistributors.reduce((sum, d) => sum + d.metrics.balanceStock.value, 0)
      },
      liquidationPercentage,
      lastUpdated: new Date().toISOString()
    };
  }, [filteredDistributors, overallMetrics]);

  const handleViewDetails = useCallback((metric: string) => {
    setSelectedMetric(metric);
    setShowDetailModal(true);
  }, []);

  const handleVerifyStock = useCallback((distributorId: string) => {
    setSelectedDistributorId(distributorId);
    setShowVerifyModal(true);
  }, []);

  const handleDistributorViewDetails = useCallback((distributorId: string, metric: string) => {
    setSelectedDistributorId(distributorId);
    setSelectedMetric(metric);
    setShowDetailModal(true);
  }, []);

  const handleView360 = useCallback((distributorId: string) => {
    const distributor = distributorMetrics.find(d => d.id === distributorId);
    if (distributor) {
      setSelected360Entity(distributor);
      setShow360View(true);
    }
  }, [distributorMetrics]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handlePriorityFilterChange = useCallback((priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Stock Liquidation</h1>
          <p className="text-gray-600 mt-1">Track and manage stock liquidation across distributors & retailers</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Last updated: {new Date(filteredMetrics.lastUpdated).toLocaleDateString()}</div>
          {user && (
            <div className="text-sm text-blue-600 mt-1">
              Viewing: {user.territory} (Territory)
            </div>
          )}
        </div>
      </div>

      <LiquidationMetricsCards
        metrics={filteredMetrics}
        onViewDetails={handleViewDetails}
      />

      <LiquidationFilters
        searchType={searchType}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchTypeChange={setSearchType}
        onSearchQueryChange={handleSearchQueryChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPriorityFilterChange={handlePriorityFilterChange}
      />

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredDistributors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredDistributors.length)} of{' '}
            {filteredDistributors.length} distributors
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDistributors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No distributors found matching your filters</p>
          </div>
        ) : (
          paginatedDistributors.map(distributor => (
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
              onVerifyStock={() => handleVerifyStock(distributor.id)}
              onViewDetails={(metric) => handleDistributorViewDetails(distributor.id, metric)}
              onView360={() => handleView360(distributor.id)}
            />
          ))
        )}
      </div>

      {filteredDistributors.length > 0 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            total={filteredDistributors.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {showDetailModal && selectedMetric && (
        <DetailedMetricsModal
          selectedMetric={selectedMetric}
          selectedDistributorId={selectedDistributorId}
          distributorMetrics={distributorMetrics}
          userTerritory={user?.territory}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDistributorId(null);
          }}
        />
      )}

      {showVerifyModal && selectedDistributorId && (() => {
        const distributor = distributorMetrics.find(d => d.id === selectedDistributorId);
        if (!distributor) return null;
        return (
          <VerifyStockModal
            distributorId={distributor.id}
            distributorName={distributor.distributorName}
            distributorCode={distributor.distributorCode}
            salesStaffName={user?.name || user?.email || 'Sales Representative'}
            productData={productData}
            onClose={() => {
              setShowVerifyModal(false);
              setSelectedDistributorId(null);
            }}
          />
        );
      })()}

      {show360View && selected360Entity && (
        <Entity360View
          entity={selected360Entity}
          onClose={() => {
            setShow360View(false);
            setSelected360Entity(null);
          }}
        />
      )}
    </div>
  );
};

export default Liquidation;
