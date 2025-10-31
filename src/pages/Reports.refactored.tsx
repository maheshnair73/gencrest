import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ReportsHeader } from '../components/reports/ReportsHeader';
import { ReportsFilters } from '../components/reports/ReportsFilters';
import { ProductReportTable } from '../components/reports/ProductReportTable';
import { DistributorReportTable } from '../components/reports/DistributorReportTable';
import { Pagination } from '../components/Pagination';
import { MDOSummary, ProductSKUData, ColumnConfig } from '../types/reports';

const ITEMS_PER_PAGE = 20;

interface ReportsProps {
  fetchProductData?: (filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    categories?: string[];
    products?: string[];
  }) => Promise<ProductSKUData[]>;

  fetchMDOData?: (filters: {
    dateFrom: string;
    dateTo: string;
    zones?: string[];
    regions?: string[];
    states?: string[];
    territories?: string[];
    outlets?: string[];
    distributors?: string[];
  }) => Promise<MDOSummary[]>;

  initialProductData?: ProductSKUData[];
  initialMDOData?: MDOSummary[];
}

const Reports: React.FC<ReportsProps> = ({
  fetchProductData: externalFetchProductData,
  fetchMDOData: externalFetchMDOData,
  initialProductData = [],
  initialMDOData = []
}) => {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('2025-04-01');
  const [dateTo, setDateTo] = useState('2025-10-15');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [expandedMDOs, setExpandedMDOs] = useState<Set<string>>(new Set());
  const isRMMOrAbove = ['RMM', 'RBH', 'ZBH', 'VP', 'CFO', 'CHRO', 'MH', 'MD', 'ADMIN'].includes(user?.role || '');
  const [viewMode, setViewMode] = useState<'mdo' | 'outlet' | 'product'>('product');
  const [loading, setLoading] = useState(false);
  const [mdoData, setMdoData] = useState<MDOSummary[]>(initialMDOData);
  const [productData, setProductData] = useState<ProductSKUData[]>(initialProductData);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'name', label: viewMode === 'mdo' ? 'MDO Name' : 'Outlet Name', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'region', label: 'Region', visible: true },
    { key: 'territory', label: 'Territory', visible: true },
    { key: 'openingStock', label: 'Opening Stock (Value)', visible: true },
    { key: 'ytdSales', label: 'YTD Sales (Value)', visible: true },
    { key: 'liquidation', label: 'Liquidation (Value)', visible: true },
    { key: 'balanceStock', label: 'Balance Stock (Value)', visible: true },
    { key: 'lastUpdated', label: 'Last Updated', visible: true }
  ]);

  const fetchProductData = useCallback(async () => {
    if (!externalFetchProductData) {
      console.warn('fetchProductData function not provided. Using initial data.');
      return;
    }

    setLoading(true);
    try {
      const filters = {
        dateFrom,
        dateTo,
        zones: selectedZones,
        regions: selectedRegions,
        states: selectedStates,
        territories: selectedTerritories,
        categories: selectedCategories,
        products: selectedProducts
      };

      const data = await externalFetchProductData(filters);
      setProductData(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching product data:', error);
      setProductData([]);
    } finally {
      setLoading(false);
    }
  }, [externalFetchProductData, dateFrom, dateTo, selectedZones, selectedRegions, selectedStates, selectedTerritories, selectedCategories, selectedProducts]);

  const fetchReportData = useCallback(async () => {
    if (!externalFetchMDOData) {
      console.warn('fetchMDOData function not provided. Using initial data.');
      return;
    }

    setLoading(true);
    try {
      const filters = {
        dateFrom,
        dateTo,
        zones: selectedZones,
        regions: selectedRegions,
        states: selectedStates,
        territories: selectedTerritories,
        outlets: selectedOutlets,
        distributors: selectedDistributors
      };

      const data = await externalFetchMDOData(filters);
      setMdoData(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching MDO data:', error);
      setMdoData([]);
    } finally {
      setLoading(false);
    }
  }, [externalFetchMDOData, dateFrom, dateTo, selectedZones, selectedRegions, selectedStates, selectedTerritories, selectedOutlets, selectedDistributors]);

  useEffect(() => {
    if (viewMode === 'product') {
      fetchProductData();
    } else {
      fetchReportData();
    }
  }, [viewMode, fetchReportData, fetchProductData]);

  useEffect(() => {
    setColumns(prev => prev.map(col =>
      col.key === 'name'
        ? { ...col, label: viewMode === 'mdo' ? 'MDO Name' : 'Outlet Name' }
        : col
    ));
  }, [viewMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, selectedZones, selectedRegions, selectedStates, selectedTerritories, selectedCategories, selectedProducts, searchQuery]);

  const uniqueZones = useMemo(() => {
    const zones = new Set(mdoData.map(mdo => mdo.zone).filter(Boolean));
    return Array.from(zones).sort();
  }, [mdoData]);

  const uniqueRegions = useMemo(() => {
    let filteredData = mdoData;
    if (selectedZones.length > 0) {
      filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
    }
    const regions = new Set(filteredData.map(mdo => mdo.region).filter(Boolean));
    return Array.from(regions).sort();
  }, [mdoData, selectedZones]);

  const uniqueStates = useMemo(() => {
    let filteredData = mdoData;
    if (selectedZones.length > 0) {
      filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
    }
    if (selectedRegions.length > 0) {
      filteredData = filteredData.filter(mdo => selectedRegions.includes(mdo.region));
    }
    const states = new Set(filteredData.map(mdo => mdo.state).filter(Boolean));
    return Array.from(states).sort();
  }, [mdoData, selectedZones, selectedRegions]);

  const uniqueTerritories = useMemo(() => {
    let filteredData = mdoData;
    if (selectedZones.length > 0) {
      filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
    }
    if (selectedRegions.length > 0) {
      filteredData = filteredData.filter(mdo => selectedRegions.includes(mdo.region));
    }
    if (selectedStates.length > 0) {
      filteredData = filteredData.filter(mdo => mdo.state && selectedStates.includes(mdo.state));
    }
    const territories = new Set(filteredData.map(mdo => mdo.territory).filter(Boolean));
    return Array.from(territories).sort();
  }, [mdoData, selectedZones, selectedRegions, selectedStates]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(productData.map(p => p.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [productData]);

  const uniqueProducts = useMemo(() => {
    let filteredData = productData;
    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter(p => p.category && selectedCategories.includes(p.category));
    }
    const products = new Set(filteredData.map(p => p.product_name).filter(Boolean));
    return Array.from(products).sort();
  }, [productData, selectedCategories]);

  const uniqueOutlets = useMemo(() => {
    const outlets = new Set(mdoData.flatMap(mdo => mdo.outlets.map(o => o.outlet_name)).filter(Boolean));
    return Array.from(outlets).sort();
  }, [mdoData]);

  const uniqueDistributors = useMemo(() => {
    const distributors = new Set(mdoData.flatMap(mdo => mdo.outlets.map(o => o.outlet_name)).filter(Boolean));
    return Array.from(distributors).sort();
  }, [mdoData]);

  const filteredData = useMemo(() => {
    if (viewMode === 'product') {
      let filtered = productData;

      if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category));
      }

      if (selectedProducts.length > 0) {
        filtered = filtered.filter(p => selectedProducts.includes(p.product_name));
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.product_name.toLowerCase().includes(query) ||
          p.product_code.toLowerCase().includes(query) ||
          p.sku_name.toLowerCase().includes(query) ||
          p.sku_code.toLowerCase().includes(query)
        );
      }

      return filtered;
    } else {
      let filtered = mdoData;

      if (selectedZones.length > 0) {
        filtered = filtered.filter(mdo => selectedZones.includes(mdo.zone));
      }

      if (selectedRegions.length > 0) {
        filtered = filtered.filter(mdo => selectedRegions.includes(mdo.region));
      }

      if (selectedStates.length > 0) {
        filtered = filtered.filter(mdo => mdo.state && selectedStates.includes(mdo.state));
      }

      if (selectedTerritories.length > 0) {
        filtered = filtered.filter(mdo => selectedTerritories.includes(mdo.territory));
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (viewMode === 'mdo') {
          filtered = filtered.filter(mdo =>
            mdo.mdo_name.toLowerCase().includes(query) ||
            mdo.mdo_id.toLowerCase().includes(query)
          );
        }
      }

      return filtered;
    }
  }, [viewMode, productData, mdoData, selectedCategories, selectedProducts, selectedZones, selectedRegions, selectedStates, selectedTerritories, searchQuery]);

  const flattenedOutlets = useMemo(() => {
    if (viewMode !== 'outlet') return [];

    let outlets = mdoData.flatMap(mdo => mdo.outlets);

    if (selectedZones.length > 0) {
      outlets = outlets.filter(outlet => outlet.zone && selectedZones.includes(outlet.zone));
    }

    if (selectedRegions.length > 0) {
      outlets = outlets.filter(outlet => outlet.region && selectedRegions.includes(outlet.region));
    }

    if (selectedStates.length > 0) {
      outlets = outlets.filter(outlet => outlet.state && selectedStates.includes(outlet.state));
    }

    if (selectedTerritories.length > 0) {
      outlets = outlets.filter(outlet => outlet.territory && selectedTerritories.includes(outlet.territory));
    }

    if (selectedOutlets.length > 0) {
      outlets = outlets.filter(outlet => selectedOutlets.includes(outlet.outlet_name));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      outlets = outlets.filter(outlet =>
        outlet.outlet_name.toLowerCase().includes(query) ||
        outlet.outlet_code.toLowerCase().includes(query) ||
        outlet.owner_name.toLowerCase().includes(query)
      );
    }

    return outlets;
  }, [viewMode, mdoData, selectedZones, selectedRegions, selectedStates, selectedTerritories, selectedOutlets, searchQuery]);

  const totalPages = useMemo(() => {
    if (viewMode === 'product') {
      return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    } else if (viewMode === 'outlet') {
      return Math.ceil(flattenedOutlets.length / ITEMS_PER_PAGE);
    } else {
      return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    }
  }, [viewMode, filteredData, flattenedOutlets]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    if (viewMode === 'outlet') {
      return flattenedOutlets.slice(startIndex, endIndex);
    } else {
      return filteredData.slice(startIndex, endIndex);
    }
  }, [viewMode, filteredData, flattenedOutlets, currentPage]);

  const handleRefresh = () => {
    if (viewMode === 'product') {
      fetchProductData();
    } else {
      fetchReportData();
    }
  };

  const handleClearFilters = () => {
    setSelectedZones([]);
    setSelectedRegions([]);
    setSelectedStates([]);
    setSelectedTerritories([]);
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedOutlets([]);
    setSelectedDistributors([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleMDO = (mdoId: string) => {
    setExpandedMDOs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mdoId)) {
        newSet.delete(mdoId);
      } else {
        newSet.add(mdoId);
      }
      return newSet;
    });
  };

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  return (
    <div className="space-y-6 pb-20">
      <ReportsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        showDateFilter={showDateFilter}
        onToggleDateFilter={() => setShowDateFilter(!showDateFilter)}
        showColumnFilter={showColumnFilter}
        onToggleColumnFilter={() => setShowColumnFilter(!showColumnFilter)}
        columns={columns}
        onToggleColumn={toggleColumn}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        loading={loading}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        isRMMOrAbove={isRMMOrAbove}
      />

      {showFilters && (
        <ReportsFilters
          viewMode={viewMode}
          selectedZones={selectedZones}
          selectedRegions={selectedRegions}
          selectedStates={selectedStates}
          selectedTerritories={selectedTerritories}
          selectedCategories={selectedCategories}
          selectedProducts={selectedProducts}
          selectedOutlets={selectedOutlets}
          selectedDistributors={selectedDistributors}
          uniqueZones={uniqueZones}
          uniqueRegions={uniqueRegions}
          uniqueStates={uniqueStates}
          uniqueTerritories={uniqueTerritories}
          uniqueCategories={uniqueCategories}
          uniqueProducts={uniqueProducts}
          uniqueOutlets={uniqueOutlets}
          uniqueDistributors={uniqueDistributors}
          onZonesChange={setSelectedZones}
          onRegionsChange={setSelectedRegions}
          onStatesChange={setSelectedStates}
          onTerritoriesChange={setSelectedTerritories}
          onCategoriesChange={setSelectedCategories}
          onProductsChange={setSelectedProducts}
          onOutletsChange={setSelectedOutlets}
          onDistributorsChange={setSelectedDistributors}
          onClearFilters={handleClearFilters}
        />
      )}

      {viewMode === 'product' ? (
        <ProductReportTable
          data={paginatedData as ProductSKUData[]}
          columns={visibleColumns}
          loading={loading}
        />
      ) : (
        <DistributorReportTable
          data={paginatedData}
          columns={visibleColumns}
          loading={loading}
          viewMode={viewMode}
          expandedMDOs={expandedMDOs}
          onToggleMDO={toggleMDO}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={viewMode === 'outlet' ? flattenedOutlets.length : filteredData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName={viewMode === 'product' ? 'products' : viewMode === 'mdo' ? 'MDOs' : 'outlets'}
          />
        </div>
      )}
    </div>
  );
};

export default Reports;
