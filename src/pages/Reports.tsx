import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, X, Package, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ZONE_LIST, STATE_LIST } from '../constants/geography';
import { ReportsHeader } from '../components/reports/ReportsHeader';
import { ReportsFilters } from '../components/reports/ReportsFilters';
import { ProductReportTable } from '../components/reports/ProductReportTable';
import { DistributorReportTable } from '../components/reports/DistributorReportTable';
import { CustomerReportTable } from '../components/reports/CustomerReportTable';
import { Pagination } from '../components/Pagination';
import { MOCK_MDO_DATA, MOCK_PRODUCT_DATA } from '../data/mockReportsData';
import * as XLSX from 'xlsx';

interface OutletTransaction {
  id: string;
  outlet_id: string;
  outlet_code: string;
  outlet_name: string;
  owner_name: string;
  transaction_date: string;
  opening_stock: number;
  opening_stock_units?: number;
  purchases: number;
  sales: number;
  sales_units?: number;
  liquidation: number;
  liquidation_units?: number;
  balance_stock: number;
  balance_stock_units?: number;
  updated_at: string;
}

interface MDOSummary {
  mdo_id: string;
  mdo_name: string;
  zone: string;
  region: string;
  territory: string;
  state?: string;
  opening_stock: number;
  ytd_sales: number;
  liquidation: number;
  balance_stock: number;
  outlet_count: number;
  updated_at: string;
  outlets: OutletTransaction[];
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ProductSKUData {
  product_code: string;
  product_name: string;
  category?: string;
  sku_code: string;
  sku_name: string;
  customer_name?: string;
  customer_code?: string;
  customer_type?: string;
  zone?: string;
  region?: string;
  state?: string;
  territory?: string;
  opening_stock: number;
  opening_stock_units: number;
  ytd_sales: number;
  ytd_sales_units: number;
  liquidation?: number;
  liquidation_units?: number;
  balance_stock: number;
  balance_stock_units: number;
  unit: string;
}

const ITEMS_PER_PAGE = 20;

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('2025-04-01');
  const [dateTo, setDateTo] = useState('2025-10-15');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [expandedMDOs, setExpandedMDOs] = useState<Set<string>>(new Set());
  const isRMMOrAbove = ['RMM', 'RBH', 'ZBH', 'VP', 'CFO', 'CHRO', 'MH', 'MD', 'ADMIN'].includes(user?.role || '');
  const [viewMode, setViewMode] = useState<'mdo' | 'outlet' | 'product'>('product');
  const [selectedViews, setSelectedViews] = useState<string[]>(['product']);
  const [loading, setLoading] = useState(true);
  const [mdoData, setMdoData] = useState<MDOSummary[]>([]);
  const [productData, setProductData] = useState<ProductSKUData[]>([]);
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
    { key: 'name', label: 'Customer / Product / SKU', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'region', label: 'Region', visible: true },
    { key: 'territory', label: 'State / Territory', visible: true },
    { key: 'openingStockValue', label: 'Opening Stock - Value (Rs. L)', visible: true },
    { key: 'openingStockUnits', label: 'Opening Stock - Volume (Kg/Ltr)', visible: true },
    { key: 'ytdSalesValue', label: 'YTD Sales - Value (Rs. L)', visible: true },
    { key: 'ytdSalesUnits', label: 'YTD Sales - Volume (Kg/Ltr)', visible: true },
    { key: 'liquidationValue', label: 'Farmer Liquidation - Retailer - Value (Rs. L)', visible: true },
    { key: 'liquidationUnits', label: 'Farmer Liquidation - Retailer - Volume (Kg/Ltr)', visible: true },
    { key: 'liquidationPercent', label: 'Farmer Liquidation - Retailer - %', visible: true },
    { key: 'balanceStockValue', label: 'Stock at Distributor - Value (Rs. L)', visible: true },
    { key: 'balanceStockUnits', label: 'Stock at Distributor - Volume (Kg/Ltr)', visible: true }
  ]);

  const fetchProductData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('product_liquidation_transactions')
        .select(`
          product_code,
          product_name,
          sku_code,
          sku_name,
          customer_code,
          customer_name,
          customer_type,
          zone,
          region,
          state,
          territory,
          opening_stock_value,
          opening_stock_units,
          ytd_sales_value,
          ytd_sales_units,
          liquidation_value,
          liquidation_units,
          balance_stock_value,
          balance_stock_units,
          period_start,
          period_end,
          product_categories!inner(name)
        `)
        .gte('period_start', dateFrom)
        .lte('period_end', dateTo);

      const { data, error } = await query;

      if (error) throw error;

      const productSKUData: ProductSKUData[] = (data || []).map(item => ({
        product_code: item.product_code,
        product_name: item.product_name,
        category: (item.product_categories as any)?.name || '',
        sku_code: item.sku_code,
        sku_name: item.sku_name,
        customer_name: item.customer_name,
        customer_code: item.customer_code,
        customer_type: item.customer_type,
        zone: item.zone,
        region: item.region,
        state: item.state,
        territory: item.territory,
        opening_stock: Number(item.opening_stock_value) || 0,
        opening_stock_units: Number(item.opening_stock_units) || 0,
        ytd_sales: Number(item.ytd_sales_value) || 0,
        ytd_sales_units: Number(item.ytd_sales_units) || 0,
        liquidation: Number(item.liquidation_value) || 0,
        liquidation_units: Number(item.liquidation_units) || 0,
        balance_stock: Number(item.balance_stock_value) || 0,
        balance_stock_units: Number(item.balance_stock_units) || 0,
        unit: 'kg'
      }));

      setProductData(productSKUData.length > 0 ? productSKUData : MOCK_PRODUCT_DATA);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching product data:', error);
      console.log('Using mock product data due to error');
      setProductData(MOCK_PRODUCT_DATA);
    } finally {
      setLoading(false);
    }
  }, [user, dateFrom, dateTo]);

  const fetchReportData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let mdoQuery = supabase
        .from('mdo_summary')
        .select('*')
        .gte('period_start', dateFrom)
        .lte('period_end', dateTo);

      if (user.role === 'TSM') {
        mdoQuery = mdoQuery.eq('tsm_id', user.employeeCode);
      } else if (user.role === 'RBH') {
        mdoQuery = mdoQuery.eq('rbh_id', user.employeeCode);
      } else if (user.role === 'ZBH') {
        mdoQuery = mdoQuery.eq('zbh_id', user.employeeCode);
      } else if (user.role === 'MDO') {
        mdoQuery = mdoQuery.eq('mdo_id', user.employeeCode);
      }

      const { data: summaries, error: summaryError } = await mdoQuery;

      if (summaryError) throw summaryError;

      if (summaries && summaries.length > 0) {
        const mdoIds = summaries.map(s => s.mdo_id);

        let outletQuery = supabase
          .from('outlet_transactions')
          .select(`
            *,
            outlets:outlet_id (
              outlet_code,
              outlet_name,
              owner_name,
              zone,
              region,
              territory,
              state
            )
          `)
          .in('mdo_id', mdoIds);

        const { data: transactions, error: transError } = await outletQuery;

        if (transError) throw transError;

        const enrichedData: MDOSummary[] = summaries.map(summary => {
          const mdoOutlets = (transactions || [])
            .filter(t => t.mdo_id === summary.mdo_id)
            .map(t => ({
              id: t.id,
              outlet_id: t.outlet_id,
              outlet_code: t.outlets?.outlet_code || '',
              outlet_name: t.outlets?.outlet_name || '',
              owner_name: t.outlets?.owner_name || '',
              transaction_date: t.transaction_date,
              opening_stock: parseFloat(t.opening_stock || 0),
              purchases: parseFloat(t.purchases || 0),
              sales: parseFloat(t.sales || 0),
              liquidation: parseFloat(t.liquidation || 0),
              balance_stock: parseFloat(t.balance_stock || 0),
              updated_at: t.updated_at
            }));

          const firstOutlet = (transactions || []).find(t => t.mdo_id === summary.mdo_id);
          const state = firstOutlet?.outlets?.state;

          return {
            mdo_id: summary.mdo_id,
            mdo_name: summary.mdo_name,
            zone: summary.zone,
            region: summary.region,
            territory: summary.territory,
            state: state,
            opening_stock: parseFloat(summary.opening_stock || 0),
            ytd_sales: parseFloat(summary.ytd_sales || 0),
            liquidation: parseFloat(summary.liquidation || 0),
            balance_stock: parseFloat(summary.balance_stock || 0),
            outlet_count: summary.outlet_count,
            updated_at: summary.updated_at,
            outlets: mdoOutlets
          };
        });

        setMdoData(enrichedData);
      } else {
        console.log('No data from Supabase, using mock data');
        setMdoData(MOCK_MDO_DATA);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching report data:', error);
      console.log('Using mock data due to error');
      setMdoData(MOCK_MDO_DATA);
    } finally {
      setLoading(false);
    }
  }, [user, dateFrom, dateTo]);

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
    return ZONE_LIST.map(z => z.value);
  }, []);

  const uniqueRegions = useMemo(() => {
    let filteredData = mdoData;
    if (selectedZones.length > 0) {
      filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
    }
    const regions = new Set(filteredData.map(mdo => mdo.region).filter(Boolean));
    return Array.from(regions).sort();
  }, [mdoData, selectedZones]);

  const uniqueStates = useMemo(() => {
    return STATE_LIST.map(s => s.value);
  }, []);

  const uniqueTerritories = useMemo(() => {
    let filteredData = mdoData;
    if (selectedZones.length > 0) {
      filteredData = filteredData.filter(mdo => selectedZones.includes(mdo.zone));
    }
    if (selectedRegions.length > 0) {
      filteredData = filteredData.filter(mdo => selectedRegions.includes(mdo.region));
    }
    if (selectedStates.length > 0) {
      filteredData = filteredData.filter(mdo => selectedStates.includes(mdo.state || ''));
    }
    const territories = new Set(filteredData.map(mdo => mdo.territory).filter(Boolean));
    return Array.from(territories).sort();
  }, [mdoData, selectedZones, selectedRegions, selectedStates]);

  const uniqueCategories = useMemo(() => {
    // Get unique category names from the category field
    const categories = new Set(productData.map(p => p.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [productData]);

  const uniqueProducts = useMemo(() => {
    const products = new Set(productData.map(p => p.product_name));
    return Array.from(products).sort();
  }, [productData]);

  const uniqueOutlets = useMemo(() => {
    const allOutlets = mdoData.flatMap(mdo => mdo.outlets);
    const outlets = new Set(allOutlets.map(o => o.outlet_name).filter(Boolean));
    return Array.from(outlets).sort();
  }, [mdoData]);

  const uniqueDistributors = useMemo(() => {
    const distributors = new Set(mdoData.map(mdo => mdo.mdo_name).filter(Boolean));
    return Array.from(distributors).sort();
  }, [mdoData]);

  const zoneOptions = useMemo(() => uniqueZones.map(z => ({ value: z, label: z })), [uniqueZones]);
  const stateOptions = useMemo(() => uniqueStates.map(s => ({ value: s, label: s })), [uniqueStates]);
  const regionOptions = useMemo(() => uniqueRegions.map(r => ({ value: r, label: r })), [uniqueRegions]);
  const territoryOptions = useMemo(() => uniqueTerritories.map(t => ({ value: t, label: t })), [uniqueTerritories]);
  const categoryOptions = useMemo(() => uniqueCategories.map(c => ({ value: c, label: c })), [uniqueCategories]);
  const productOptions = useMemo(() => uniqueProducts.map(p => ({ value: p, label: p })), [uniqueProducts]);
  const outletOptions = useMemo(() => uniqueOutlets.map(o => ({ value: o, label: o })), [uniqueOutlets]);
  const distributorOptions = useMemo(() => uniqueDistributors.map(d => ({ value: d, label: d })), [uniqueDistributors]);

  const filteredProductData = useMemo(() => {
    let filtered = productData;

    if (selectedZones.length > 0) {
      filtered = filtered.filter(p => p.zone && selectedZones.includes(p.zone));
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter(p => p.region && selectedRegions.includes(p.region));
    }

    if (selectedStates.length > 0) {
      filtered = filtered.filter(p => p.state && selectedStates.includes(p.state));
    }

    if (selectedTerritories.length > 0) {
      filtered = filtered.filter(p => p.territory && selectedTerritories.includes(p.territory));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.some(cat => p.product_name.includes(cat)));
    }

    if (selectedProducts.length > 0) {
      filtered = filtered.filter(p => selectedProducts.includes(p.product_name));
    }

    return filtered;
  }, [productData, selectedZones, selectedRegions, selectedStates, selectedTerritories, selectedCategories, selectedProducts]);

  const filteredMdoData = useMemo(() => {
    let filtered = mdoData;

    if (selectedZones.length > 0) {
      filtered = filtered.filter(mdo => selectedZones.includes(mdo.zone));
    }

    if (selectedStates.length > 0) {
      filtered = filtered.filter(mdo => selectedStates.includes(mdo.state || ''));
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter(mdo => selectedRegions.includes(mdo.region));
    }

    if (selectedTerritories.length > 0) {
      filtered = filtered.filter(mdo => selectedTerritories.includes(mdo.territory));
    }

    if (selectedDistributors.length > 0) {
      filtered = filtered.filter(mdo => selectedDistributors.includes(mdo.mdo_name));
    }

    if (selectedOutlets.length > 0) {
      filtered = filtered.filter(mdo =>
        mdo.outlets.some(outlet => selectedOutlets.includes(outlet.outlet_name))
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mdo =>
        mdo.mdo_name.toLowerCase().includes(query) ||
        mdo.outlets.some(outlet => outlet.outlet_name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [mdoData, selectedZones, selectedStates, selectedRegions, selectedTerritories, selectedDistributors, selectedOutlets, searchQuery]);

  const flattenedOutletData = useMemo(() => {
    const outlets = filteredMdoData.flatMap(mdo =>
      mdo.outlets.map(outlet => ({
        id: outlet.id,
        outlet_name: outlet.outlet_name,
        zone: mdo.zone,
        region: mdo.region,
        territory: mdo.territory,
        opening_stock: outlet.opening_stock,
        opening_stock_units: outlet.opening_stock_units || 0,
        sales: outlet.sales,
        sales_units: outlet.sales_units || 0,
        liquidation: outlet.liquidation,
        liquidation_units: outlet.liquidation_units || 0,
        balance_stock: outlet.balance_stock,
        balance_stock_units: outlet.balance_stock_units || 0,
        updated_at: outlet.updated_at
      }))
    );
    return outlets;
  }, [filteredMdoData]);

  const paginatedProductData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProductData.slice(startIndex, endIndex);
  }, [filteredProductData, currentPage]);

  const paginatedMdoData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMdoData.slice(startIndex, endIndex);
  }, [filteredMdoData, currentPage]);

  const paginatedOutletData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return flattenedOutletData.slice(startIndex, endIndex);
  }, [flattenedOutletData, currentPage]);

  const totalPages = useMemo(() => {
    const dataLength = viewMode === 'product' ? filteredProductData.length : flattenedOutletData.length;
    return Math.ceil(dataLength / ITEMS_PER_PAGE);
  }, [viewMode, filteredProductData.length, flattenedOutletData.length]);

  const hierarchicalData = useMemo(() => {
    if (!['RBH', 'ZBH'].includes(user?.role || '')) return new Map();

    const hierarchy = new Map<string, Map<string, { tsmName: string; mdos: MDOSummary[] }>>();

    filteredMdoData.forEach(mdo => {
      if (!hierarchy.has(mdo.zone)) {
        hierarchy.set(mdo.zone, new Map());
      }
      const zoneMap = hierarchy.get(mdo.zone)!;

      const tsmId = `tsm_${mdo.territory}`;
      if (!zoneMap.has(tsmId)) {
        zoneMap.set(tsmId, { tsmName: `TSM - ${mdo.territory}`, mdos: [] });
      }
      zoneMap.get(tsmId)!.mdos.push(mdo);
    });

    return hierarchy;
  }, [filteredMdoData, user?.role]);

  const groupedData = useMemo(() => {
    if (['RBH', 'ZBH'].includes(user?.role || '')) return new Map();

    const grouped = new Map<string, MDOSummary[]>();

    filteredMdoData.forEach(mdo => {
      if (!grouped.has(mdo.zone)) {
        grouped.set(mdo.zone, []);
      }
      grouped.get(mdo.zone)!.push(mdo);
    });

    return grouped;
  }, [filteredMdoData, user?.role]);

  const mdoMetrics = useMemo(() => {
    const totals = filteredMdoData.reduce((acc, mdo) => ({
      openingStock: acc.openingStock + mdo.opening_stock,
      ytdSales: acc.ytdSales + mdo.ytd_sales,
      liquidation: acc.liquidation + mdo.liquidation,
      balanceStock: acc.balanceStock + mdo.balance_stock
    }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

    const distributorLiquidation = totals.liquidation;
    const retailerLiquidation = totals.ytdSales;
    const stockAtRetailer = totals.balanceStock;
    const stockAtDistributor = totals.openingStock - totals.liquidation - totals.ytdSales;

    return {
      openingStock: totals.openingStock,
      netYtdSales: totals.ytdSales,
      distributorLiquidation,
      retailerLiquidation,
      stockAtRetailer,
      stockAtDistributor
    };
  }, [filteredMdoData]);

  const productMetrics = useMemo(() => {
    const totals = filteredProductData.reduce((acc, product) => ({
      openingStock: acc.openingStock + product.opening_stock,
      ytdSales: acc.ytdSales + product.ytd_sales,
      balanceStock: acc.balanceStock + product.balance_stock
    }), { openingStock: 0, ytdSales: 0, balanceStock: 0 });

    const distributorLiquidation = totals.ytdSales;
    const retailerLiquidation = totals.ytdSales * 0.5;
    const stockAtRetailer = totals.balanceStock * 0.3;
    const stockAtDistributor = totals.balanceStock * 0.7;

    return {
      openingStock: totals.openingStock,
      netYtdSales: totals.ytdSales,
      distributorLiquidation,
      retailerLiquidation,
      stockAtRetailer,
      stockAtDistributor
    };
  }, [filteredProductData]);

  const metrics = viewMode === 'product' ? productMetrics : mdoMetrics;

  const hasActiveFilters = selectedZones.length > 0 || selectedStates.length > 0 || selectedRegions.length > 0 ||
    selectedTerritories.length > 0 || selectedCategories.length > 0 || selectedProducts.length > 0 ||
    selectedOutlets.length > 0 || selectedDistributors.length > 0 || searchQuery !== '';

  const clearAllFilters = () => {
    setSelectedZones([]);
    setSelectedStates([]);
    setSelectedRegions([]);
    setSelectedTerritories([]);
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedOutlets([]);
    setSelectedDistributors([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const toggleZone = (zone: string) => {
    setExpandedMDOs(prev => {
      const next = new Set(prev);
      if (next.has(zone)) {
        next.delete(zone);
      } else {
        next.add(zone);
      }
      return next;
    });
  };

  const toggleTSM = (zone: string, tsmId: string) => {
    setExpandedMDOs(prev => {
      const next = new Set(prev);
      const key = `tsm_${zone}_${tsmId}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleMDO = (mdoId: string) => {
    setExpandedMDOs(prev => {
      const next = new Set(prev);
      const key = `mdo_${mdoId}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const generateExcelFile = () => {
    let data: any[] = [];
    let worksheetName = '';

    if (selectedViews.includes('product')) {
      worksheetName = 'Product Report';
      data = filteredProductData.map(product => ({
        'Customer Code': product.customer_code || 'N/A',
        'Customer Name': product.customer_name || 'N/A',
        'Customer Type': product.customer_type || 'N/A',
        'Product Code': product.product_code,
        'Product Name': product.product_name,
        'SKU Code': product.sku_code,
        'SKU Name': product.sku_name,
        'Zone': product.zone || 'N/A',
        'Region': product.region || 'N/A',
        'State': product.state || 'N/A',
        'Territory': product.territory || 'N/A',
        'Opening Stock Value (Rs. L)': `₹${(product.opening_stock / 100000).toFixed(2)}L`,
        'Opening Stock Volume (Kg/Ltr)': product.opening_stock_units.toFixed(2),
        'YTD Sales Value (Rs. L)': `₹${(product.ytd_sales / 100000).toFixed(2)}L`,
        'YTD Sales Volume (Kg/Ltr)': product.ytd_sales_units.toFixed(2),
        'Liquidation Value (Rs. L)': `₹${((product.liquidation || product.ytd_sales) / 100000).toFixed(2)}L`,
        'Liquidation Volume (Kg/Ltr)': (product.liquidation_units || product.ytd_sales_units).toFixed(2),
        'Liquidation %': product.opening_stock > 0 ? (((product.liquidation || product.ytd_sales) / product.opening_stock) * 100).toFixed(1) + '%' : '0%',
        'Balance Stock Value (Rs. L)': `₹${(product.balance_stock / 100000).toFixed(2)}L`,
        'Balance Stock Volume (Kg/Ltr)': product.balance_stock_units.toFixed(2)
      }));
    } else if (selectedViews.includes('outlet')) {
      worksheetName = 'Customer Report';
      data = filteredProductData.map(product => ({
        'Customer Code': product.customer_code || 'N/A',
        'Customer Name': product.customer_name || 'N/A',
        'Customer Type': product.customer_type || 'N/A',
        'Product Code': product.product_code,
        'Product Name': product.product_name,
        'SKU Code': product.sku_code,
        'SKU Name': product.sku_name,
        'Zone': product.zone || 'N/A',
        'Region': product.region || 'N/A',
        'State': product.state || 'N/A',
        'Territory': product.territory || 'N/A',
        'Opening Stock Value (Rs. L)': `₹${(product.opening_stock / 100000).toFixed(2)}L`,
        'Opening Stock Volume (Kg/Ltr)': product.opening_stock_units.toFixed(2),
        'YTD Sales Value (Rs. L)': `₹${(product.ytd_sales / 100000).toFixed(2)}L`,
        'YTD Sales Volume (Kg/Ltr)': product.ytd_sales_units.toFixed(2),
        'Liquidation Value (Rs. L)': `₹${((product.liquidation || product.ytd_sales) / 100000).toFixed(2)}L`,
        'Liquidation Volume (Kg/Ltr)': (product.liquidation_units || product.ytd_sales_units).toFixed(2),
        'Liquidation %': product.opening_stock > 0 ? (((product.liquidation || product.ytd_sales) / product.opening_stock) * 100).toFixed(1) + '%' : '0%',
        'Balance Stock Value (Rs. L)': `₹${(product.balance_stock / 100000).toFixed(2)}L`,
        'Balance Stock Volume (Kg/Ltr)': product.balance_stock_units.toFixed(2)
      }));
    } else if (selectedViews.includes('mdo')) {
      worksheetName = 'Distributor Report';
      // For MDO view, also include all nested outlet data
      const allMdoData: any[] = [];
      filteredMdoData.forEach(mdo => {
        // Add MDO summary row
        allMdoData.push({
          'Type': 'MDO Summary',
          'MDO ID': mdo.mdo_id,
          'MDO Name': mdo.mdo_name,
          'Zone': mdo.zone,
          'Region': mdo.region,
          'Territory': mdo.territory,
          'Opening Stock (Rs. L)': `₹${(mdo.opening_stock / 100000).toFixed(2)}L`,
          'YTD Sales (Rs. L)': `₹${(mdo.ytd_sales / 100000).toFixed(2)}L`,
          'Liquidation (Rs. L)': `₹${(mdo.liquidation / 100000).toFixed(2)}L`,
          'Balance Stock (Rs. L)': `₹${(mdo.balance_stock / 100000).toFixed(2)}L`,
          'Outlet Count': mdo.outlet_count
        });
        // Add outlet detail rows
        if (mdo.outlets && mdo.outlets.length > 0) {
          mdo.outlets.forEach(outlet => {
            allMdoData.push({
              'Type': 'Outlet Detail',
              'MDO ID': mdo.mdo_id,
              'MDO Name': mdo.mdo_name,
              'Outlet/Customer': outlet.outlet_name || outlet.customer_name || 'N/A',
              'Zone': outlet.zone || mdo.zone,
              'Region': outlet.region || mdo.region,
              'Territory': outlet.territory || outlet.state || mdo.territory,
              'Opening Stock (Rs. L)': `₹${(outlet.opening_stock / 100000).toFixed(2)}L`,
              'YTD Sales (Rs. L)': `₹${(outlet.ytd_sales / 100000).toFixed(2)}L`,
              'Liquidation (Rs. L)': `₹${(outlet.liquidation || outlet.ytd_sales / 100000).toFixed(2)}L`,
              'Balance Stock (Rs. L)': `₹${(outlet.balance_stock / 100000).toFixed(2)}L`,
              'Outlet Count': ''
            });
          });
        }
      });
      data = allMdoData.length > 0 ? allMdoData : filteredMdoData.map(mdo => ({
        'MDO ID': mdo.mdo_id,
        'MDO Name': mdo.mdo_name,
        'Zone': mdo.zone,
        'Region': mdo.region,
        'Territory': mdo.territory,
        'Opening Stock (Rs. L)': `₹${(mdo.opening_stock / 100000).toFixed(2)}L`,
        'YTD Sales (Rs. L)': `₹${(mdo.ytd_sales / 100000).toFixed(2)}L`,
        'Liquidation (Rs. L)': `₹${(mdo.liquidation / 100000).toFixed(2)}L`,
        'Balance Stock (Rs. L)': `₹${(mdo.balance_stock / 100000).toFixed(2)}L`,
        'Outlet Count': mdo.outlet_count
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const downloadExcel = () => {
    const blob = generateExcelFile();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const reportType = selectedViews.includes('product') ? 'Product' : selectedViews.includes('outlet') ? 'Customer' : 'Distributor';
    link.download = `${reportType}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const shareViaWhatsApp = async () => {
    const blob = generateExcelFile();
    const reportType = selectedViews.includes('product') ? 'Product' : selectedViews.includes('outlet') ? 'Customer' : 'Distributor';
    const file = new File([blob], `${reportType}_Report_${new Date().toISOString().split('T')[0]}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `${reportType} Report`,
          text: `Please find the attached ${reportType.toLowerCase()} report.`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Please download the file first, then share it manually via WhatsApp.');
        downloadExcel();
      }
    } else {
      alert('Please download the file first, then share it manually via WhatsApp.');
      downloadExcel();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <ReportsHeader
        userRole={user?.role}
        userName={user?.name}
        userTerritory={user?.territory}
        userZone={user?.zone}
        lastRefresh={lastRefresh}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
        showColumnFilter={showColumnFilter}
        setShowColumnFilter={setShowColumnFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        fetchReportData={viewMode === 'product' ? fetchProductData : fetchReportData}
        columns={columns}
        toggleColumn={toggleColumn}
        selectedViews={selectedViews}
        setSelectedViews={setSelectedViews}
      />

      {showFilters && (
        <>
          <ReportsFilters
            viewMode={viewMode}
            userRole={user?.role}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
            selectedStates={selectedStates}
            setSelectedStates={setSelectedStates}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedTerritories={selectedTerritories}
            setSelectedTerritories={setSelectedTerritories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            selectedOutlets={selectedOutlets}
            setSelectedOutlets={setSelectedOutlets}
            selectedDistributors={selectedDistributors}
            setSelectedDistributors={setSelectedDistributors}
            zoneOptions={zoneOptions}
            stateOptions={stateOptions}
            regionOptions={regionOptions}
            territoryOptions={territoryOptions}
            categoryOptions={categoryOptions}
            productOptions={productOptions}
            outletOptions={outletOptions}
            distributorOptions={distributorOptions}
            uniqueTerritories={uniqueTerritories}
            uniqueRegions={uniqueRegions}
            isRMMOrAbove={isRMMOrAbove}
          />

          {hasActiveFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Active Filters:</span>
                  {selectedZones.length > 0 && <span className="ml-2">Zones ({selectedZones.length})</span>}
                  {selectedStates.length > 0 && <span className="ml-2">States ({selectedStates.length})</span>}
                  {selectedRegions.length > 0 && <span className="ml-2">Regions ({selectedRegions.length})</span>}
                  {selectedTerritories.length > 0 && <span className="ml-2">Territories ({selectedTerritories.length})</span>}
                  {selectedCategories.length > 0 && <span className="ml-2">Categories ({selectedCategories.length})</span>}
                  {selectedProducts.length > 0 && <span className="ml-2">Products ({selectedProducts.length})</span>}
                  {selectedDistributors.length > 0 && <span className="ml-2">Distributors ({selectedDistributors.length})</span>}
                  {selectedOutlets.length > 0 && <span className="ml-2">Customers ({selectedOutlets.length})</span>}
                  {searchQuery && <span className="ml-2">Search: "{searchQuery}"</span>}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-emerald-900">Opening Stock</h3>
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{(metrics.openingStock / 100000).toFixed(2)}L</p>
          <p className="text-xs text-emerald-700 mt-1">{(metrics.openingStock / 1000).toFixed(3)} Kg/Ltr</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-900">Net YTD Sales</h3>
            <Package className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-cyan-600">₹{(metrics.netYtdSales / 100000).toFixed(2)}L</p>
          <p className="text-xs text-cyan-700 mt-1">{(metrics.netYtdSales / 1000).toFixed(3)} Kg/Ltr</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Farmer Liquidation - Distributor</h3>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">₹{(metrics.distributorLiquidation / 100000).toFixed(2)}L</p>
          <p className="text-xs text-blue-700 mt-1">{(metrics.distributorLiquidation / 1000).toFixed(3)} Kg/Ltr</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Farmer Liquidation - Retailer</h3>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">₹{(metrics.retailerLiquidation / 100000).toFixed(2)}L</p>
          <p className="text-xs text-green-700 mt-1">{(metrics.retailerLiquidation / 1000).toFixed(3)} Kg/Ltr</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900">Stock at Retailer</h3>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">₹{(metrics.stockAtRetailer / 100000).toFixed(2)}L</p>
          <p className="text-xs text-orange-700 mt-1">{(metrics.stockAtRetailer / 1000).toFixed(3)} Kg/Ltr</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-rose-900">Stock at Distributor</h3>
            <Package className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">₹{(metrics.stockAtDistributor / 100000).toFixed(2)}L</p>
          <p className="text-xs text-rose-700 mt-1">{(metrics.stockAtDistributor / 1000).toFixed(3)} Kg/Ltr</p>
        </div>
      </div>

      <div className="space-y-6">
        {selectedViews.includes('product') && (
          <>
            <ProductReportTable
              productData={paginatedProductData}
              onDownloadExcel={downloadExcel}
              onShareWhatsApp={shareViaWhatsApp}
              columns={columns}
            />
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {selectedViews.includes('outlet') && (
          <>
            {hasActiveFilters && filteredProductData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No results found</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <CustomerReportTable
                  productData={paginatedProductData}
                  onDownloadExcel={downloadExcel}
                  onShareWhatsApp={shareViaWhatsApp}
                  columns={columns}
                />
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Reports;
