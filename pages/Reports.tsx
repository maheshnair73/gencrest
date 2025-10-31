import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Download, Mail, Share2, Calendar, Filter, ChevronDown, ChevronUp, X, Store, User, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OutletTransaction {
  id: string;
  outlet_id: string;
  outlet_code: string;
  outlet_name: string;
  owner_name: string;
  transaction_date: string;
  opening_stock: number;
  purchases: number;
  sales: number;
  liquidation: number;
  balance_stock: number;
  updated_at: string;
}

interface MDOSummary {
  mdo_id: string;
  mdo_name: string;
  zone: string;
  region: string;
  territory: string;
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

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('2025-04-01');
  const [dateTo, setDateTo] = useState('2025-10-15');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [expandedMDOs, setExpandedMDOs] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'mdo' | 'outlet'>('mdo');
  const [loading, setLoading] = useState(true);
  const [mdoData, setMdoData] = useState<MDOSummary[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'name', label: viewMode === 'mdo' ? 'MDO Name' : 'Outlet Name', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'region', label: 'Region', visible: true },
    { key: 'territory', label: 'Territory', visible: true },
    { key: 'openingStock', label: 'Opening Stock (₹)', visible: true },
    { key: 'ytdSales', label: 'YTD Sales (₹)', visible: true },
    { key: 'liquidation', label: 'Liquidation (₹)', visible: true },
    { key: 'balanceStock', label: 'Balance Stock (₹)', visible: true },
    { key: 'lastUpdated', label: 'Last Updated', visible: true }
  ]);

  const fetchReportData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching reports for user:', user.role, user.employeeCode);

      let mdoQuery = supabase
        .from('mdo_summary')
        .select('*')
        .gte('period_start', dateFrom)
        .lte('period_end', dateTo);

      if (user.role === 'TSM') {
        console.log('Filtering by TSM:', user.employeeCode);
        mdoQuery = mdoQuery.eq('tsm_id', user.employeeCode);
      } else if (user.role === 'RBH') {
        console.log('Filtering by RBH:', user.employeeCode);
        mdoQuery = mdoQuery.eq('rbh_id', user.employeeCode);
      } else if (user.role === 'ZBH') {
        console.log('Filtering by ZBH:', user.employeeCode);
        mdoQuery = mdoQuery.eq('zbh_id', user.employeeCode);
      } else if (user.role === 'MDO') {
        console.log('Filtering by MDO:', user.employeeCode);
        mdoQuery = mdoQuery.eq('mdo_id', user.employeeCode);
      }

      const { data: summaries, error: summaryError } = await mdoQuery;

      console.log('MDO Summaries received:', summaries?.length || 0, summaries);

      if (summaryError) {
        console.error('Error fetching summaries:', summaryError);
        throw summaryError;
      }

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
              territory
            )
          `)
          .in('mdo_id', mdoIds);

        const { data: transactions, error: transError } = await outletQuery;

        console.log('Outlet transactions received:', transactions?.length || 0);

        if (transError) {
          console.error('Error fetching transactions:', transError);
          throw transError;
        }

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

          return {
            mdo_id: summary.mdo_id,
            mdo_name: summary.mdo_name,
            zone: summary.zone,
            region: summary.region,
            territory: summary.territory,
            opening_stock: parseFloat(summary.opening_stock || 0),
            ytd_sales: parseFloat(summary.ytd_sales || 0),
            liquidation: parseFloat(summary.liquidation || 0),
            balance_stock: parseFloat(summary.balance_stock || 0),
            outlet_count: summary.outlet_count,
            updated_at: summary.updated_at,
            outlets: mdoOutlets
          };
        });

        console.log('Enriched data:', enrichedData);
        setMdoData(enrichedData);
      } else {
        console.log('No summaries found');
        setMdoData([]);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching report data:', error);
      setMdoData([]);
    } finally {
      setLoading(false);
    }
  }, [user, dateFrom, dateTo]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    setColumns(prev => prev.map(col =>
      col.key === 'name'
        ? { ...col, label: viewMode === 'mdo' ? 'MDO Name' : 'Outlet Name' }
        : col
    ));
  }, [viewMode]);

  const uniqueZones = useMemo(() => {
    const zones = new Set(mdoData.map(mdo => mdo.zone));
    return Array.from(zones).sort();
  }, [mdoData]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set(mdoData.map(mdo => mdo.region));
    return Array.from(regions).sort();
  }, [mdoData]);

  const uniqueTerritories = useMemo(() => {
    const territories = new Set(mdoData.map(mdo => mdo.territory));
    return Array.from(territories).sort();
  }, [mdoData]);

  const productCategories = ['all', 'Fertilizers', 'Pesticides', 'Seeds'];
  const productList = [
    'all',
    'DAP (Di-Ammonium Phosphate)',
    'Urea',
    'NPK Complex',
    'MOP (Muriate of Potash)',
    'SSP (Single Super Phosphate)',
    'Insecticide',
    'Herbicide',
    'Fungicide',
    'Hybrid Seeds',
    'Micronutrients'
  ];

  const filteredMdoData = useMemo(() => {
    let filtered = mdoData;

    // Apply zone filter
    if (selectedZone !== 'all') {
      filtered = filtered.filter(mdo => mdo.zone === selectedZone);
    }

    // Apply region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(mdo => mdo.region === selectedRegion);
    }

    // Apply territory filter
    if (selectedTerritory !== 'all') {
      filtered = filtered.filter(mdo => mdo.territory === selectedTerritory);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mdo =>
        mdo.mdo_name.toLowerCase().includes(query) ||
        mdo.mdo_id.toLowerCase().includes(query) ||
        mdo.tsm_name.toLowerCase().includes(query) ||
        mdo.territory.toLowerCase().includes(query) ||
        mdo.region.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [mdoData, searchQuery, selectedZone, selectedRegion, selectedTerritory]);

  const hierarchicalData = useMemo(() => {
    const hierarchy = new Map<string, Map<string, { tsmId: string; tsmName: string; mdos: MDOSummary[] }>>();

    filteredMdoData.forEach(item => {
      const zone = item.zone;
      const tsmId = item.tsm_id;
      const tsmName = item.tsm_name;

      if (!hierarchy.has(zone)) {
        hierarchy.set(zone, new Map());
      }

      const zoneMap = hierarchy.get(zone)!;
      if (!zoneMap.has(tsmId)) {
        zoneMap.set(tsmId, { tsmId, tsmName, mdos: [] });
      }

      zoneMap.get(tsmId)!.mdos.push(item);
    });

    console.log('Hierarchical data:', Array.from(hierarchy.entries()));
    return hierarchy;
  }, [filteredMdoData]);

  const groupedData = useMemo(() => {
    const groups = new Map<string, MDOSummary[]>();
    filteredMdoData.forEach(item => {
      const key = item.zone;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });
    console.log('Grouped data by zone:', Array.from(groups.entries()));
    return groups;
  }, [filteredMdoData]);

  const totals = useMemo(() => {
    return mdoData.reduce((acc, item) => ({
      openingStock: acc.openingStock + item.opening_stock,
      ytdSales: acc.ytdSales + item.ytd_sales,
      liquidation: acc.liquidation + item.liquidation,
      balanceStock: acc.balanceStock + item.balance_stock
    }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });
  }, [mdoData]);

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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedZone('all');
    setSelectedRegion('all');
    setSelectedTerritory('all');
    setSelectedCategory('all');
    setSelectedProduct('all');
  };

  const hasActiveFilters = searchQuery || selectedZone !== 'all' || selectedRegion !== 'all' || selectedTerritory !== 'all' || selectedCategory !== 'all' || selectedProduct !== 'all';

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

  const downloadExcel = () => {
    const visibleColumns = columns.filter(col => col.visible);
    const headers = visibleColumns.map(col => col.label).join(',');

    let rows = '';
    if (viewMode === 'mdo') {
      rows = mdoData.map(row =>
        visibleColumns.map(col => {
          switch(col.key) {
            case 'name': return `"${row.mdo_name}"`;
            case 'zone': return `"${row.zone}"`;
            case 'region': return `"${row.region}"`;
            case 'territory': return `"${row.territory}"`;
            case 'openingStock': return row.opening_stock;
            case 'ytdSales': return row.ytd_sales;
            case 'liquidation': return row.liquidation;
            case 'balanceStock': return row.balance_stock;
            case 'lastUpdated': return `"${new Date(row.updated_at).toLocaleDateString('en-IN')}"`;
            default: return '';
          }
        }).join(',')
      ).join('\n');
    } else {
      const allOutlets = mdoData.flatMap(mdo =>
        mdo.outlets.map(outlet => ({ ...outlet, mdo_name: mdo.mdo_name, zone: mdo.zone, region: mdo.region, territory: mdo.territory }))
      );
      rows = allOutlets.map(row =>
        visibleColumns.map(col => {
          switch(col.key) {
            case 'name': return `"${row.outlet_name}"`;
            case 'zone': return `"${row.zone}"`;
            case 'region': return `"${row.region}"`;
            case 'territory': return `"${row.territory}"`;
            case 'openingStock': return row.opening_stock;
            case 'ytdSales': return row.sales;
            case 'liquidation': return row.liquidation;
            case 'balanceStock': return row.balance_stock;
            case 'lastUpdated': return `"${new Date(row.updated_at).toLocaleDateString('en-IN')}"`;
            default: return '';
          }
        }).join(',')
      ).join('\n');
    }

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidation-report-${viewMode}-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Liquidation Report (${viewMode.toUpperCase()}): ${dateFrom} to ${dateTo}`);
    const body = encodeURIComponent(`Please find the liquidation report summary:\n\nTotal Opening Stock: ₹${(totals.openingStock / 100000).toFixed(2)}L\nTotal YTD Sales: ₹${(totals.ytdSales / 100000).toFixed(2)}L\nTotal Liquidation: ₹${(totals.liquidation / 100000).toFixed(2)}L\nTotal Balance Stock: ₹${(totals.balanceStock / 100000).toFixed(2)}L\n\nLast Updated: ${lastRefresh.toLocaleString('en-IN')}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`*Liquidation Report (${viewMode.toUpperCase()})*\n${dateFrom} to ${dateTo}\n\nTotal Opening Stock: ₹${(totals.openingStock / 100000).toFixed(2)}L\nTotal YTD Sales: ₹${(totals.ytdSales / 100000).toFixed(2)}L\nTotal Liquidation: ₹${(totals.liquidation / 100000).toFixed(2)}L\nTotal Balance Stock: ₹${(totals.balanceStock / 100000).toFixed(2)}L\n\nLast Updated: ${lastRefresh.toLocaleString('en-IN')}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const formatValue = (value: any, key: string) => {
    if (key === 'lastUpdated' && value) {
      return new Date(value).toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    }
    if (typeof value === 'number') {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Liquidation Reports</h1>
            <p className="text-gray-600">
              {user?.role === 'TSM' && `Territory: ${user?.territory} | Zone: ${user?.zone}`}
              {user?.role === 'ZBH' && `Zone: ${user?.zone}`}
              {user?.role === 'MDO' && `MDO: ${user?.name}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">{lastRefresh.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('mdo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'mdo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">MDO-wise</span>
            </button>
            <button
              onClick={() => setViewMode('outlet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'outlet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-sm font-medium">Outlet-wise</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Date Range</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
            </button>

            {showDateFilter && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-72">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Date Range</h3>
                  <button onClick={() => setShowDateFilter(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
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

          <div className="relative">
            <button
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Columns</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showColumnFilter ? 'rotate-180' : ''}`} />
            </button>

            {showColumnFilter && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Show/Hide Columns</h3>
                  <button onClick={() => setShowColumnFilter(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {columns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={fetchReportData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Refresh</span>
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Email</span>
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>

        {viewMode === 'mdo' && mdoData.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {(user?.role === 'RBH' || user?.role === 'ZBH') && uniqueZones.length > 1 && (
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Zones ({uniqueZones.length})</option>
                  {uniqueZones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              )}

              {(user?.role === 'RBH' || user?.role === 'ZBH' || user?.role === 'TSM') && uniqueRegions.length > 1 && (
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Regions ({uniqueRegions.length})</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              )}

              {(user?.role === 'RBH' || user?.role === 'ZBH' || user?.role === 'TSM') && uniqueTerritories.length > 1 && (
                <select
                  value={selectedTerritory}
                  onChange={(e) => setSelectedTerritory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Territories ({uniqueTerritories.length})</option>
                  {uniqueTerritories.map(territory => (
                    <option key={territory} value={territory}>{territory}</option>
                  ))}
                </select>
              )}

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                <option value="all">All Categories</option>
                {productCategories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                <option value="all">All Products</option>
                {productList.filter(p => p !== 'all').map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by MDO name, TSM name, territory, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <h3 className="text-sm font-medium text-orange-800 mb-1">Total Opening Stock</h3>
          <p className="text-2xl font-bold text-orange-900">₹{(totals.openingStock / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total YTD Sales</h3>
          <p className="text-2xl font-bold text-blue-900">₹{(totals.ytdSales / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Total Liquidation</h3>
          <p className="text-2xl font-bold text-purple-900">₹{(totals.liquidation / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-1">Total Balance Stock</h3>
          <p className="text-2xl font-bold text-green-900">₹{(totals.balanceStock / 100000).toFixed(2)}L</p>
        </div>
      </div>

      {viewMode === 'mdo' ? (
        <div className="space-y-4">
          {hasActiveFilters && filteredMdoData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No MDOs found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {hasActiveFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    <span className="font-semibold">{filteredMdoData.length}</span> of <span className="font-semibold">{mdoData.length}</span> MDOs
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                    {selectedZone !== 'all' && <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded">Zone: {selectedZone}</span>}
                    {selectedRegion !== 'all' && <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded">Region: {selectedRegion}</span>}
                    {selectedTerritory !== 'all' && <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded">Territory: {selectedTerritory}</span>}
                    {selectedCategory !== 'all' && <span className="ml-2 px-2 py-0.5 bg-green-100 rounded">Category: {selectedCategory}</span>}
                    {selectedProduct !== 'all' && <span className="ml-2 px-2 py-0.5 bg-green-100 rounded">Product: {selectedProduct}</span>}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {(user?.role === 'RBH' || user?.role === 'ZBH') ? (
                // Hierarchical view: Zone -> TSM -> MDO -> Outlets
                Array.from(hierarchicalData.entries()).map(([zone, tsmMap]) => {
                  const isZoneExpanded = expandedMDOs.has(zone);
                  const allMdos = Array.from(tsmMap.values()).flatMap(tsm => tsm.mdos);
                  const zoneTotals = allMdos.reduce((acc, mdo) => ({
                    openingStock: acc.openingStock + mdo.opening_stock,
                    ytdSales: acc.ytdSales + mdo.ytd_sales,
                    liquidation: acc.liquidation + mdo.liquidation,
                    balanceStock: acc.balanceStock + mdo.balance_stock
                  }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

                  return (
                    <div key={zone} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => toggleZone(zone)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isZoneExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{zone}</h3>
                            <p className="text-sm text-gray-600">{tsmMap.size} TSMs • {allMdos.length} MDOs</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Opening Stock</p>
                            <p className="font-semibold text-orange-600">₹{(zoneTotals.openingStock / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">YTD Sales</p>
                            <p className="font-semibold text-blue-600">₹{(zoneTotals.ytdSales / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Liquidation</p>
                            <p className="font-semibold text-purple-600">₹{(zoneTotals.liquidation / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Balance</p>
                            <p className="font-semibold text-green-600">₹{(zoneTotals.balanceStock / 100000).toFixed(2)}L</p>
                          </div>
                        </div>
                      </button>

                      {isZoneExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          {Array.from(tsmMap.entries()).map(([tsmId, tsmData]) => {
                            const isTsmExpanded = expandedMDOs.has(`tsm_${zone}_${tsmId}`);
                            const tsmTotals = tsmData.mdos.reduce((acc, mdo) => ({
                              openingStock: acc.openingStock + mdo.opening_stock,
                              ytdSales: acc.ytdSales + mdo.ytd_sales,
                              liquidation: acc.liquidation + mdo.liquidation,
                              balanceStock: acc.balanceStock + mdo.balance_stock
                            }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

                            return (
                              <div key={tsmId} className="border-b border-gray-200 last:border-b-0">
                                <button
                                  onClick={() => toggleTSM(zone, tsmId)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {isTsmExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div className="text-left">
                                      <h4 className="font-medium text-gray-900">{tsmData.tsmName}</h4>
                                      <p className="text-xs text-gray-500">TSM • {tsmData.mdos.length} MDOs</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-4 text-xs">
                                    <div className="text-right">
                                      <p className="text-gray-500">Opening</p>
                                      <p className="font-medium text-orange-600">₹{(tsmTotals.openingStock / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-gray-500">Sales</p>
                                      <p className="font-medium text-blue-600">₹{(tsmTotals.ytdSales / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-gray-500">Liquidation</p>
                                      <p className="font-medium text-purple-600">₹{(tsmTotals.liquidation / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-gray-500">Balance</p>
                                      <p className="font-medium text-green-600">₹{(tsmTotals.balanceStock / 100000).toFixed(2)}L</p>
                                    </div>
                                  </div>
                                </button>

                                {isTsmExpanded && (
                                  <div className="bg-white border-t border-gray-200">
                                    {tsmData.mdos.map((mdo) => {
                                      const isMDOExpanded = expandedMDOs.has(`mdo_${mdo.mdo_id}`);
                                      return (
                                        <div key={mdo.mdo_id} className="border-b border-gray-100 last:border-b-0">
                                          <button
                                            onClick={() => toggleMDO(mdo.mdo_id)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="flex items-center gap-2">
                                              {isMDOExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                              <div className="text-left">
                                                <p className="font-medium text-gray-900 text-sm">{mdo.mdo_name}</p>
                                                <p className="text-xs text-gray-500">{mdo.outlet_count} outlets • {mdo.territory}</p>
                                              </div>
                                            </div>
                                            <div className="flex gap-3 text-xs">
                                              <div className="text-right">
                                                <p className="text-gray-500">Opening</p>
                                                <p className="font-medium text-orange-600">₹{(mdo.opening_stock / 100000).toFixed(2)}L</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-gray-500">Sales</p>
                                                <p className="font-medium text-blue-600">₹{(mdo.ytd_sales / 100000).toFixed(2)}L</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-gray-500">Liquidation</p>
                                                <p className="font-medium text-purple-600">₹{(mdo.liquidation / 100000).toFixed(2)}L</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-gray-500">Balance</p>
                                                <p className="font-medium text-green-600">₹{(mdo.balance_stock / 100000).toFixed(2)}L</p>
                                              </div>
                                            </div>
                                          </button>

                                          {isMDOExpanded && mdo.outlets.length > 0 && (
                                            <div className="bg-gray-50 px-3 pb-3">
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                  <thead className="bg-gray-100">
                                                    <tr>
                                                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Outlet</th>
                                                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700">Owner</th>
                                                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-700">Opening</th>
                                                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-700">Sales</th>
                                                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-700">Liquidation</th>
                                                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-700">Balance</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="bg-white divide-y divide-gray-200">
                                                    {mdo.outlets.map((outlet) => (
                                                      <tr key={outlet.id} className="hover:bg-gray-50">
                                                        <td className="px-2 py-1.5 text-gray-900">{outlet.outlet_name}</td>
                                                        <td className="px-2 py-1.5 text-gray-700">{outlet.owner_name}</td>
                                                        <td className="px-2 py-1.5 text-right text-orange-600">₹{(outlet.opening_stock / 100000).toFixed(2)}L</td>
                                                        <td className="px-2 py-1.5 text-right text-blue-600">₹{(outlet.sales / 100000).toFixed(2)}L</td>
                                                        <td className="px-2 py-1.5 text-right text-purple-600">₹{(outlet.liquidation / 100000).toFixed(2)}L</td>
                                                        <td className="px-2 py-1.5 text-right text-green-600">₹{(outlet.balance_stock / 100000).toFixed(2)}L</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // TSM View: Zone -> MDO -> Outlets (flat, no TSM level)
                Array.from(groupedData.entries()).map(([zone, mdos]) => {
                  const isZoneExpanded = expandedMDOs.has(zone);
                  const zoneTotals = mdos.reduce((acc, mdo) => ({
                    openingStock: acc.openingStock + mdo.opening_stock,
                    ytdSales: acc.ytdSales + mdo.ytd_sales,
                    liquidation: acc.liquidation + mdo.liquidation,
                    balanceStock: acc.balanceStock + mdo.balance_stock
                  }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

                  return (
                    <div key={zone} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => toggleZone(zone)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isZoneExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{zone}</h3>
                            <p className="text-sm text-gray-600">{mdos.length} MDOs</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Opening Stock</p>
                            <p className="font-semibold text-orange-600">₹{(zoneTotals.openingStock / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">YTD Sales</p>
                            <p className="font-semibold text-blue-600">₹{(zoneTotals.ytdSales / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Liquidation</p>
                            <p className="font-semibold text-purple-600">₹{(zoneTotals.liquidation / 100000).toFixed(2)}L</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Balance</p>
                            <p className="font-semibold text-green-600">₹{(zoneTotals.balanceStock / 100000).toFixed(2)}L</p>
                          </div>
                        </div>
                      </button>

                      {isZoneExpanded && (
                        <div className="border-t border-gray-200">
                          {mdos.map((mdo) => {
                            const isMDOExpanded = expandedMDOs.has(`mdo_${mdo.mdo_id}`);
                            return (
                              <div key={mdo.mdo_id} className="border-b border-gray-100 last:border-b-0">
                                <button
                                  onClick={() => toggleMDO(mdo.mdo_id)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {isMDOExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    <div className="text-left">
                                      <p className="font-medium text-gray-900">{mdo.mdo_name}</p>
                                      <p className="text-xs text-gray-500">{mdo.outlet_count} outlets | {mdo.territory}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 text-sm">
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Opening</p>
                                      <p className="font-medium text-orange-600">₹{(mdo.opening_stock / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Sales</p>
                                      <p className="font-medium text-blue-600">₹{(mdo.ytd_sales / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Liquidation</p>
                                      <p className="font-medium text-purple-600">₹{(mdo.liquidation / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Balance</p>
                                      <p className="font-medium text-green-600">₹{(mdo.balance_stock / 100000).toFixed(2)}L</p>
                                    </div>
                                  </div>
                                </button>

                                {isMDOExpanded && mdo.outlets.length > 0 && (
                                  <div className="bg-gray-50 px-4 pb-4">
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Outlet</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Owner</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Opening</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Sales</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liquidation</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Balance</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {mdo.outlets.map((outlet) => (
                                            <tr key={outlet.id} className="hover:bg-gray-50">
                                              <td className="px-3 py-2 text-gray-900">{outlet.outlet_name}</td>
                                              <td className="px-3 py-2 text-gray-700">{outlet.owner_name}</td>
                                              <td className="px-3 py-2 text-right text-orange-600">₹{(outlet.opening_stock / 100000).toFixed(2)}L</td>
                                              <td className="px-3 py-2 text-right text-blue-600">₹{(outlet.sales / 100000).toFixed(2)}L</td>
                                              <td className="px-3 py-2 text-right text-purple-600">₹{(outlet.liquidation / 100000).toFixed(2)}L</td>
                                              <td className="px-3 py-2 text-right text-green-600">₹{(outlet.balance_stock / 100000).toFixed(2)}L</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.filter(col => col.visible).map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mdoData.flatMap(mdo =>
                  mdo.outlets.map((outlet) => (
                    <tr key={outlet.id} className="hover:bg-gray-50">
                      {columns.filter(col => col.visible).map(col => (
                        <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                          {col.key === 'name' && outlet.outlet_name}
                          {col.key === 'zone' && mdo.zone}
                          {col.key === 'region' && mdo.region}
                          {col.key === 'territory' && mdo.territory}
                          {col.key === 'openingStock' && formatValue(outlet.opening_stock, 'number')}
                          {col.key === 'ytdSales' && formatValue(outlet.sales, 'number')}
                          {col.key === 'liquidation' && formatValue(outlet.liquidation, 'number')}
                          {col.key === 'balanceStock' && formatValue(outlet.balance_stock, 'number')}
                          {col.key === 'lastUpdated' && formatValue(outlet.updated_at, 'lastUpdated')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mdoData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No report data available for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
