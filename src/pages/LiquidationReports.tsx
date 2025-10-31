import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Calendar, Filter, TrendingUp, Package, Users, BarChart3, RefreshCw, Columns, Mail, Share2, MessageCircle, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ZONE_LIST, STATE_LIST, getStatesForZone } from '../constants/geography';
import Select from 'react-select';
import { supabase } from '../lib/supabase';

interface ReportData {
  dealerCode: string;
  dealerName: string;
  territory: string;
  openingStock: number;
  ytdSales: number;
  currentStock: number;
  liquidationPercentage: number;
}

interface ProductReportData {
  productCode: string;
  productName: string;
  category: string;
  openingStock: number;
  openingStockUnits: number;
  openingStockUnit: string;
  ytdSales: number;
  ytdSalesUnits: number;
  ytdSalesUnit: string;
  currentStock: number;
  currentStockUnits: number;
  currentStockUnit: string;
  liquidationPercentage: number;
}

interface MonthWiseData {
  month: string;
  sales: number;
  salesUnits: number;
  salesUnit: string;
  liquidation: number;
  liquidationUnits: number;
  liquidationUnit: string;
  liquidationPercentage: number;
}

type ReportType = 'dealer' | 'product' | 'month';
type ProductFilterType = 'sku' | 'territory' | 'region' | 'zone' | 'state';

const LiquidationReports: React.FC = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('product');
  const [productFilter, setProductFilter] = useState<ProductFilterType>('sku');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; product_code: string; product_name: string; category_id: string; category_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories and products from Supabase
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('product_categories')
          .select('id, name')
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch products with their categories
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            product_code,
            product_name,
            category_id,
            product_categories!inner(name)
          `)
          .eq('is_active', true)
          .order('product_name');

        if (productsError) throw productsError;

        // Transform the data
        const transformedProducts = (productsData || []).map(p => ({
          id: p.id,
          product_code: p.product_code,
          product_name: p.product_name,
          category_id: p.category_id,
          category_name: (p.product_categories as any)?.name || 'Unknown'
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  // Get filtered states based on selected zone
  const getFilteredStates = () => {
    if (!selectedZone) {
      return STATE_LIST;
    }
    const statesForZone = getStatesForZone(selectedZone);
    console.log('Selected Zone:', selectedZone);
    console.log('States for this zone:', statesForZone);
    const filtered = STATE_LIST.filter(state => statesForZone.includes(state.value));
    console.log('Filtered states:', filtered);
    return filtered;
  };

  // Reset dependent filters when zone changes
  useEffect(() => {
    if (selectedZone) {
      const statesForZone = getStatesForZone(selectedZone);
      if (selectedState && !statesForZone.includes(selectedState)) {
        setSelectedState('');
      }
    }
  }, [selectedZone]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const mockDealerData: ReportData[] = [
    {
      dealerCode: 'DEMO001',
      dealerName: 'Demo Distributors Pvt Ltd',
      territory: 'North Zone',
      openingStock: 14500,
      ytdSales: 9800,
      currentStock: 7300,
      liquidationPercentage: 57.3
    },
    {
      dealerCode: 'DIST002',
      dealerName: 'Green Valley Distributors',
      territory: 'South Zone',
      openingStock: 12000,
      ytdSales: 8500,
      currentStock: 5200,
      liquidationPercentage: 62.0
    },
    {
      dealerCode: 'DIST003',
      dealerName: 'Sunrise Agro Solutions',
      territory: 'East Zone',
      openingStock: 18000,
      ytdSales: 12000,
      currentStock: 8500,
      liquidationPercentage: 58.5
    },
    {
      dealerCode: 'DIST004',
      dealerName: 'Prime Fertilizers Ltd',
      territory: 'West Zone',
      openingStock: 16500,
      ytdSales: 10200,
      currentStock: 7800,
      liquidationPercentage: 56.7
    }
  ];

  // Generate product report data from database products
  const mockProductData: ProductReportData[] = products.map((product, index) => {
    const openingStockValue = 15000 + (index * 2500);
    const openingStockUnits = 5000 + (index * 1500);
    const ytdSalesValue = 8000 + (index * 2000);
    const ytdSalesUnits = 3000 + (index * 800);
    const currentStockValue = openingStockValue - ytdSalesValue + (Math.random() * 2000 - 1000);
    const currentStockUnits = openingStockUnits - ytdSalesUnits + (Math.random() * 500 - 250);
    const liquidationPercentage = (ytdSalesValue / openingStockValue) * 100;

    return {
      productCode: product.product_code,
      productName: product.product_name,
      category: product.category_name,
      openingStock: Math.round(openingStockValue),
      openingStockUnits: Math.round(openingStockUnits),
      openingStockUnit: 'Kg/Ltr',
      ytdSales: Math.round(ytdSalesValue),
      ytdSalesUnits: Math.round(ytdSalesUnits),
      ytdSalesUnit: 'Kg/Ltr',
      currentStock: Math.round(currentStockValue),
      currentStockUnits: Math.round(currentStockUnits),
      currentStockUnit: 'Kg/Ltr',
      liquidationPercentage: Math.round(liquidationPercentage * 10) / 10
    };
  });

  const mockMonthWiseData: MonthWiseData[] = [
    { month: 'Jan 2025', sales: 3500, salesUnits: 2450, salesUnit: 'kg', liquidation: 3200, liquidationUnits: 2240, liquidationUnit: 'kg', liquidationPercentage: 91.4 },
    { month: 'Feb 2025', sales: 4200, salesUnits: 2940, salesUnit: 'kg', liquidation: 3800, liquidationUnits: 2660, liquidationUnit: 'kg', liquidationPercentage: 90.5 },
    { month: 'Mar 2025', sales: 5100, salesUnits: 3570, salesUnit: 'kg', liquidation: 4600, liquidationUnits: 3220, liquidationUnit: 'kg', liquidationPercentage: 90.2 },
    { month: 'Apr 2025', sales: 4800, salesUnits: 3360, salesUnit: 'kg', liquidation: 4300, liquidationUnits: 3010, liquidationUnit: 'kg', liquidationPercentage: 89.6 },
    { month: 'May 2025', sales: 5500, salesUnits: 3850, salesUnit: 'kg', liquidation: 4900, liquidationUnits: 3430, liquidationUnit: 'kg', liquidationPercentage: 89.1 },
    { month: 'Jun 2025', sales: 6200, salesUnits: 4340, salesUnit: 'kg', liquidation: 5500, liquidationUnits: 3850, liquidationUnit: 'kg', liquidationPercentage: 88.7 },
    { month: 'Jul 2025', sales: 5800, salesUnits: 4060, salesUnit: 'kg', liquidation: 5100, liquidationUnits: 3570, liquidationUnit: 'kg', liquidationPercentage: 87.9 },
    { month: 'Aug 2025', sales: 6500, salesUnits: 4550, salesUnit: 'kg', liquidation: 5700, liquidationUnits: 3990, liquidationUnit: 'kg', liquidationPercentage: 87.7 },
    { month: 'Sep 2025', sales: 7000, salesUnits: 4900, salesUnit: 'kg', liquidation: 6100, liquidationUnits: 4270, liquidationUnit: 'kg', liquidationPercentage: 87.1 },
    { month: 'Oct 2025', sales: 6800, salesUnits: 4760, salesUnit: 'kg', liquidation: 5900, liquidationUnits: 4130, liquidationUnit: 'kg', liquidationPercentage: 86.8 }
  ];

  const mockRegionalData = [
    {
      region: 'Delhi NCR',
      territories: [
        { name: 'North Delhi', openingStock: 18500, ytdSales: 12300, currentStock: 8200, liquidationPercentage: 62.5 },
        { name: 'South Delhi', openingStock: 16200, ytdSales: 10800, currentStock: 7100, liquidationPercentage: 61.2 },
        { name: 'East Delhi', openingStock: 14800, ytdSales: 9600, currentStock: 6500, liquidationPercentage: 59.8 }
      ]
    },
    {
      region: 'Rayalaseema',
      territories: [
        { name: 'Anantapur', openingStock: 22000, ytdSales: 15200, currentStock: 9500, liquidationPercentage: 64.8 },
        { name: 'Kurnool', openingStock: 19500, ytdSales: 13100, currentStock: 8200, liquidationPercentage: 62.3 },
        { name: 'Kadapa', openingStock: 17800, ytdSales: 11900, currentStock: 7600, liquidationPercentage: 61.5 }
      ]
    }
  ];

  const mockZonalData = [
    {
      zone: 'North Zone',
      states: [
        {
          state: 'Delhi',
          regions: ['Delhi NCR'],
          openingStock: 49500,
          ytdSales: 32700,
          currentStock: 21800,
          liquidationPercentage: 61.2
        },
        {
          state: 'Punjab',
          regions: ['Ludhiana Region', 'Amritsar Region'],
          openingStock: 38200,
          ytdSales: 25400,
          currentStock: 16800,
          liquidationPercentage: 60.1
        }
      ]
    },
    {
      zone: 'ANDHRA PRADESH',
      states: [
        {
          state: 'Andhra Pradesh',
          regions: ['Rayalaseema', 'Coastal Andhra'],
          openingStock: 59300,
          ytdSales: 40200,
          currentStock: 23300,
          liquidationPercentage: 63.5
        }
      ]
    }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2023, 2024, 2025];

  const generateExcelFile = (): Blob => {
    let data: any[] = [];
    let worksheetName = 'Report';

    if (reportType === 'product') {
      worksheetName = 'Product Report';
      data = mockProductData.map(p => ({
        'Product Code': p.productCode,
        'Product Name': p.productName,
        'Category': p.category,
        'Opening Stock (Value)': `₹${p.openingStock.toLocaleString()}`,
        'Opening Stock (Units)': `${p.openingStockUnits.toLocaleString()} ${p.openingStockUnit}`,
        'YTD Sales (Value)': `₹${p.ytdSales.toLocaleString()}`,
        'YTD Sales (Units)': `${p.ytdSalesUnits.toLocaleString()} ${p.ytdSalesUnit}`,
        'Current Stock (Value)': `₹${p.currentStock.toLocaleString()}`,
        'Current Stock (Units)': `${p.currentStockUnits.toLocaleString()} ${p.currentStockUnit}`,
        'Liquidation %': `${p.liquidationPercentage.toFixed(1)}%`
      }));
    } else if (reportType === 'month') {
      worksheetName = 'Period Report';
      data = mockMonthWiseData.map(m => ({
        'Month': m.month,
        'Sales (Value)': `₹${m.sales.toLocaleString()}`,
        'Sales (Units)': `${m.salesUnits.toLocaleString()} ${m.salesUnit}`,
        'Liquidation (Value)': `₹${m.liquidation.toLocaleString()}`,
        'Liquidation (Units)': `${m.liquidationUnits.toLocaleString()} ${m.liquidationUnit}`,
        'Liquidation %': `${m.liquidationPercentage.toFixed(1)}%`
      }));
    } else {
      worksheetName = 'Dealer Report';
      data = mockDealerData.map(d => ({
        'Dealer Code': d.dealerCode,
        'Dealer Name': d.dealerName,
        'Territory': d.territory,
        'Opening Stock': `${d.openingStock.toLocaleString()} L`,
        'YTD Sales': `${d.ytdSales.toLocaleString()} L`,
        'Current Stock': `${d.currentStock.toLocaleString()} L`,
        'Liquidation %': `${d.liquidationPercentage.toFixed(1)}%`
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const handleExportToExcel = () => {
    const blob = generateExcelFile();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liquidation_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEmailShare = async () => {
    const blob = generateExcelFile();
    const file = new File([blob], `Liquidation_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Liquidation Report',
          text: 'Please find the attached liquidation report.',
          files: [file]
        });
        setShowShareMenu(false);
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackEmailShare(blob);
      }
    } else {
      fallbackEmailShare(blob);
    }
  };

  const fallbackEmailShare = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liquidation_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    const mailtoLink = `mailto:?subject=Liquidation Report&body=Please find the liquidation report attached. Download the file to view the complete report.`;
    window.location.href = mailtoLink;
    setShowShareMenu(false);
  };

  const handleWhatsAppShare = async () => {
    const blob = generateExcelFile();
    const file = new File([blob], `Liquidation_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Liquidation Report',
          text: 'Please find the attached liquidation report.',
          files: [file]
        });
        setShowShareMenu(false);
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Please download the file first, then share it manually via WhatsApp.');
        handleExportToExcel();
      }
    } else {
      alert('Please download the file first, then share it manually via WhatsApp.');
      handleExportToExcel();
      setShowShareMenu(false);
    }
  };

  const getAvailableProductFilters = () => {
    const role = user?.role;
    if (role === 'ZBH') {
      return [
        { value: 'sku' as ProductFilterType, label: 'SKU-wise' },
        { value: 'territory' as ProductFilterType, label: 'Territory-wise' },
        { value: 'region' as ProductFilterType, label: 'Region-wise' },
        { value: 'state' as ProductFilterType, label: 'State-wise' }
      ];
    } else if (role === 'RMM' || role === 'RBH') {
      return [
        { value: 'sku' as ProductFilterType, label: 'SKU-wise' },
        { value: 'territory' as ProductFilterType, label: 'Territory-wise' },
        { value: 'region' as ProductFilterType, label: 'Region-wise' }
      ];
    } else if (role === 'TSM') {
      return [
        { value: 'sku' as ProductFilterType, label: 'SKU-wise' },
        { value: 'territory' as ProductFilterType, label: 'Territory-wise' }
      ];
    } else {
      return [
        { value: 'sku' as ProductFilterType, label: 'SKU-wise' },
        { value: 'territory' as ProductFilterType, label: 'Territory-wise' },
        { value: 'region' as ProductFilterType, label: 'Region-wise' },
        { value: 'zone' as ProductFilterType, label: 'Zone-wise' },
        { value: 'state' as ProductFilterType, label: 'State-wise' }
      ];
    }
  };

  const renderReportTabs = () => {
    return (
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('product')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              reportType === 'product'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Product-wise
          </button>
          <button
            onClick={() => setReportType('dealer')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              reportType === 'dealer'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Customer-wise <span className="ml-1 text-xs opacity-60">(v91)</span>
          </button>
          <button
            onClick={() => setReportType('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              reportType === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Date Range
          </button>
        </div>

      </div>
    );
  };

  const renderFiltersSection = () => {
    if (!reportType) return null;

    const isActive = reportType !== null;

    if (reportType === 'product') {
      const filteredStates = getFilteredStates();
      const isRBH = user?.role === 'RBH';
      const isZBHOrAbove = ['ZBH', 'VP', 'CFO', 'CHRO', 'MH', 'MD'].includes(user?.role || '');

      return (
        <div className={`p-4 rounded-lg transition-all ${isActive ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">

            {/* RBH gets Region, State, Territory, Search Customer - NO Product filter */}
            {isRBH ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select region...</option>
                    <option value="region-1">Region 1</option>
                    <option value="region-2">Region 2</option>
                    <option value="region-3">Region 3</option>
                    <option value="region-4">Region 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select states...</option>
                    {filteredStates.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <select
                    value={selectedTerritory}
                    onChange={(e) => setSelectedTerritory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select territory...</option>
                    <option value="north-delhi">North Delhi</option>
                    <option value="south-delhi">South Delhi</option>
                    <option value="east-delhi">East Delhi</option>
                    <option value="west-delhi">West Delhi</option>
                    <option value="bangalore-urban">Bangalore Urban</option>
                    <option value="bangalore-rural">Bangalore Rural</option>
                    <option value="mysore">Mysore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zones</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select zones...</option>
                    {ZONE_LIST.map(zone => (
                      <option key={zone.value} value={zone.value}>{zone.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">States</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedZone}
                  >
                    <option value="">Select states...</option>
                    {filteredStates.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select region...</option>
                    <option value="region-1">Region 1</option>
                    <option value="region-2">Region 2</option>
                    <option value="region-3">Region 3</option>
                    <option value="region-4">Region 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <select
                    value={selectedTerritory}
                    onChange={(e) => setSelectedTerritory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select territory...</option>
                    <option value="north-delhi">North Delhi</option>
                    <option value="south-delhi">South Delhi</option>
                    <option value="east-delhi">East Delhi</option>
                    <option value="west-delhi">West Delhi</option>
                    <option value="bangalore-urban">Bangalore Urban</option>
                    <option value="bangalore-rural">Bangalore Rural</option>
                    <option value="mysore">Mysore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedProduct(''); // Reset product when category changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All categories...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">All products...</option>
                    {products
                      .filter(p => !selectedCategory || p.category_id === selectedCategory)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (reportType === 'dealer') {
      const isTSM = user?.role === 'TSM';
      const isRMM = user?.role === 'RMM';
      const isRBH = user?.role === 'RBH';
      const isZBHOrAbove = ['ZBH', 'VP', 'CFO', 'CHRO', 'MH', 'MD'].includes(user?.role || '');

      const regionOptions = [
        { value: 'Delhi NCR', label: 'Delhi NCR' },
        { value: 'Rayalaseema', label: 'Rayalaseema' },
        { value: 'Karnataka Region', label: 'Karnataka Region' },
        { value: 'Punjab Region', label: 'Punjab Region' },
        { value: 'Haryana Region', label: 'Haryana Region' }
      ];

      const territoryOptions = [
        { value: 'North Delhi', label: 'North Delhi' },
        { value: 'South Delhi', label: 'South Delhi' },
        { value: 'Anantapur', label: 'Anantapur' },
        { value: 'Kurnool', label: 'Kurnool' },
        { value: 'Bangalore Urban', label: 'Bangalore Urban' },
        { value: 'Mysore', label: 'Mysore' }
      ];

      const stateOptions = STATE_LIST.map(state => ({
        value: state.value,
        label: state.label
      }));

      const zoneOptions = ZONE_LIST.map(zone => ({
        value: zone.value,
        label: zone.label
      }));

      const customerOptions = [
        { value: 'demo001', label: 'DEMO001 - Demo Distributors Pvt Ltd' },
        { value: 'dist002', label: 'DIST002 - Green Valley Distributors' },
        { value: 'dist003', label: 'DIST003 - Prime Fertilizers Ltd' },
        { value: 'dist004', label: 'DIST004 - Agro Solutions Inc' },
        { value: 'dist005', label: 'DIST005 - Farmers Choice Wholesale' }
      ];

      return (
        <div className={`p-4 rounded-lg transition-all ${isActive ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* RBH gets Region, State, Territory, Search Customer */}
            {isRBH ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                    onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                    placeholder="Select states..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distributor</label>
                  <Select
                    options={customerOptions}
                    value={customerOptions.find(opt => opt.value === selectedCustomer) || null}
                    onChange={(selected) => setSelectedCustomer(selected?.value || '')}
                    placeholder="Select distributor..."
                    isClearable
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isTSM ? 'Territory (Your Territory)' : 'Territories'}
                  </label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>

                {!isTSM && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                    <Select
                      isMulti
                      options={regionOptions}
                      value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                      onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                      placeholder="Select regions..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}

                {isZBHOrAbove && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">States</label>
                    <Select
                      isMulti
                      options={stateOptions}
                      value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                      onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                      placeholder="Select states..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}

                {isZBHOrAbove && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zones</label>
                    <Select
                      isMulti
                      options={zoneOptions}
                      value={zoneOptions.filter(opt => selectedZones.includes(opt.value))}
                      onChange={(selected) => setSelectedZones(selected?.map(s => s.value) || [])}
                      placeholder="Select zones..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distributor</label>
                  <Select
                    options={customerOptions}
                    value={customerOptions.find(opt => opt.value === selectedCustomer) || null}
                    onChange={(selected) => setSelectedCustomer(selected?.value || '')}
                    placeholder="Select distributor..."
                    isClearable
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <button className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFilters = () => {
    return (
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Period</option>
          </select>

          {selectedPeriod === 'monthly' && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </>
          )}

          {selectedPeriod === 'custom' && (
            <>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderDealerReport = () => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Package className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                <p className="text-xl font-bold text-green-900">₹8.10L</p>
                <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Package className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Package className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dealer Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Territory
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Opening Stock (L)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  YTD Sales (L)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock (L)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liquidation %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockDealerData.map((dealer) => (
                <tr key={dealer.dealerCode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {dealer.dealerCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {dealer.dealerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dealer.territory}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {dealer.openingStock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {dealer.ytdSales.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {dealer.currentStock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dealer.liquidationPercentage >= 60
                        ? 'bg-green-100 text-green-800'
                        : dealer.liquidationPercentage >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dealer.liquidationPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductReport = () => {
    if (productFilter === 'region' && user?.role === 'RBH') {
      const userRegion = mockRegionalData.find(r => r.region === user.region) || mockRegionalData[0];
      const totalOpeningStock = userRegion.territories.reduce((sum, t) => sum + t.openingStock, 0);
      const totalYtdSales = userRegion.territories.reduce((sum, t) => sum + t.ytdSales, 0);
      const totalCurrentStock = userRegion.territories.reduce((sum, t) => sum + t.currentStock, 0);
      const avgLiquidation = userRegion.territories.reduce((sum, t) => sum + t.liquidationPercentage, 0) / userRegion.territories.length;

      return (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                  <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                  <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                  <p className="text-xl font-bold text-green-900">₹8.10L</p>
                  <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <Package className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                  <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                  <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Package className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                  <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                  <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Package className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Territory</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Opening Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">YTD Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Liquidation %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userRegion.territories.map((territory) => (
                  <tr key={territory.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{userRegion.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{territory.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{territory.openingStock.toLocaleString()}L</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{territory.ytdSales.toLocaleString()}L</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{territory.currentStock.toLocaleString()}L</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        territory.liquidationPercentage >= 60 ? 'bg-green-100 text-green-800' : territory.liquidationPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {territory.liquidationPercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (productFilter === 'zone' && (user?.role === 'ZBH' || ['MD', 'VP', 'CFO', 'CHRO', 'MH', 'RMM'].includes(user?.role || ''))) {
      const zonesData = user?.role === 'ZBH' ? mockZonalData.filter(z => z.zone === user.zone) : mockZonalData;

      return (
        <div className="p-6">
          <div className="space-y-6">
            {zonesData.map((zoneData) => {
              const totalOpeningStock = zoneData.states.reduce((sum, s) => sum + s.openingStock, 0);
              const totalYtdSales = zoneData.states.reduce((sum, s) => sum + s.ytdSales, 0);
              const totalCurrentStock = zoneData.states.reduce((sum, s) => sum + s.currentStock, 0);
              const avgLiquidation = zoneData.states.reduce((sum, s) => sum + s.liquidationPercentage, 0) / zoneData.states.length;

              return (
                <div key={zoneData.zone}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{zoneData.zone}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-medium">Opening Stock</p>
                      <p className="text-xl font-bold text-green-900">₹{totalOpeningStock.toLocaleString()}L</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">YTD Sales</p>
                      <p className="text-xl font-bold text-blue-900">₹{totalYtdSales.toLocaleString()}L</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 font-medium">Current Stock</p>
                      <p className="text-xl font-bold text-orange-900">₹{totalCurrentStock.toLocaleString()}L</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium">Avg Liquidation</p>
                      <p className="text-xl font-bold text-purple-900">{avgLiquidation.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Regions</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Opening Stock</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">YTD Sales</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Stock</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Liquidation %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {zoneData.states.map((state) => (
                          <tr key={state.state} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{state.state}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{state.regions.join(', ')}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₹{state.openingStock.toLocaleString()}L</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₹{state.ytdSales.toLocaleString()}L</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₹{state.currentStock.toLocaleString()}L</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                state.liquidationPercentage >= 60 ? 'bg-green-100 text-green-800' : state.liquidationPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {state.liquidationPercentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Package className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                <p className="text-xl font-bold text-green-900">₹8.10L</p>
                <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Package className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Package className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Opening Stock (Value)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Opening Stock (Units)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  YTD Sales (Value)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  YTD Sales (Units)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock (Value)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock (Units)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liquidation %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockProductData.map((product) => (
                <tr key={product.productCode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.productCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{product.openingStock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    <span className="text-xs">{product.openingStockUnits.toLocaleString()} {product.openingStockUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{product.ytdSales.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    <span className="text-xs">{product.ytdSalesUnits.toLocaleString()} {product.ytdSalesUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{product.currentStock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    <span className="text-xs">{product.currentStockUnits.toLocaleString()} {product.currentStockUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.liquidationPercentage >= 60
                        ? 'bg-green-100 text-green-800'
                        : product.liquidationPercentage >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.liquidationPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMonthReport = () => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  ₹{mockMonthWiseData.reduce((sum, m) => sum + m.sales, 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {mockMonthWiseData.reduce((sum, m) => sum + m.salesUnits, 0).toLocaleString()} kg/Ltr
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Liquidation</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  ₹{mockMonthWiseData.reduce((sum, m) => sum + m.liquidation, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {mockMonthWiseData.reduce((sum, m) => sum + m.liquidationUnits, 0).toLocaleString()} kg/Ltr
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Liquidation %</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {(mockMonthWiseData.reduce((sum, m) => sum + m.liquidationPercentage, 0) / mockMonthWiseData.length).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sales (Value)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sales (Units)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liquidation (Value)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liquidation (Units)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Liquidation %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockMonthWiseData.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {month.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{month.sales.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    <span className="text-xs">{month.salesUnits.toLocaleString()} {month.salesUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    ₹{month.liquidation.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    <span className="text-xs">{month.liquidationUnits.toLocaleString()} {month.liquidationUnit}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      month.liquidationPercentage >= 90
                        ? 'bg-green-100 text-green-800'
                        : month.liquidationPercentage >= 85
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {month.liquidationPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMDOView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Liquidation Reports</h2>
                <p className="text-sm text-gray-500 mt-1">Territory: Delhi Territory | Zone: North</p>
              </div>
              <div className="text-sm text-gray-500">
                Last Updated<br />
                23/10/25, 8:04 pm
              </div>
            </div>

            <div className="mb-4">
              {renderReportTabs()}
            </div>

            <div className="mb-6">
              {renderFiltersSection()}
            </div>

            <div className="flex items-center justify-end space-x-2 mb-6">
              <button
                onClick={handleExportToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-b border-gray-100 rounded-t-lg"
                    >
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Email with Attachment</span>
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 rounded-b-lg"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span>WhatsApp with File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                    <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                    <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Package className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                    <p className="text-xl font-bold text-green-900">₹8.10L</p>
                    <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Package className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                    <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                    <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Package className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                    <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                    <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Package className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            {reportType === 'product' && renderProductReport()}
            {reportType === 'dealer' && renderDealerReport()}
            {reportType === 'month' && renderMonthReport()}
          </div>
        </div>
      </div>
    );
  };

  const renderTSMView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Liquidation Reports</h2>
                <p className="text-sm text-gray-500 mt-1">Territory: Delhi Territory | Zone: North</p>
              </div>
              <div className="text-sm text-gray-500">
                Last Updated<br />
                23/10/25, 8:04 pm
              </div>
            </div>

            <div className="mb-4">
              {renderReportTabs()}
            </div>

            <div className="mb-6">
              {renderFiltersSection()}
            </div>

            <div className="flex items-center justify-end space-x-2 mb-6">
              <button
                onClick={handleExportToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-b border-gray-100 rounded-t-lg"
                    >
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Email with Attachment</span>
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 rounded-b-lg"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span>WhatsApp with File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                    <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                    <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Package className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                    <p className="text-xl font-bold text-green-900">₹8.10L</p>
                    <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Package className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                    <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                    <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Package className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                    <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                    <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Package className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            {reportType === 'product' && renderProductReport()}
            {reportType === 'dealer' && renderDealerReport()}
            {reportType === 'month' && renderMonthReport()}
          </div>
        </div>
      </div>
    );
  };

  const renderHigherRoleView = () => {
    const role = user?.role;
    const isRBH = role === 'RBH';
    const isZBH = role === 'ZBH';
    const isHigherManagement = ['MD', 'VP', 'CFO', 'CHRO', 'MH', 'RMM'].includes(role || '');

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Liquidation Reports</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isRBH && `Region: ${user?.region || 'All Regions'}`}
                  {isZBH && `Zone: ${user?.zone || 'All Zones'}`}
                  {isHigherManagement && 'All Zones & Regions'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Last Updated<br />
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="mb-4">
              {renderReportTabs()}
            </div>

            <div className="mb-6">
              {renderFiltersSection()}
            </div>

            <div className="flex items-center justify-end space-x-2 mb-6">
              <button
                onClick={handleExportToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-b border-gray-100 rounded-t-lg"
                    >
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Email with Attachment</span>
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 rounded-b-lg"
                    >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span>WhatsApp with File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                    <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                    <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Package className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                    <p className="text-xl font-bold text-green-900">₹8.10L</p>
                    <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Package className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                    <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                    <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Package className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                    <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                    <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Package className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            {reportType === 'product' && renderProductReport()}
            {reportType === 'dealer' && renderDealerReport()}
            {reportType === 'month' && renderMonthReport()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {(user?.role === 'MDO') && renderMDOView()}
      {(user?.role === 'TSM') && renderTSMView()}

      {user?.role && ['RBH', 'ZBH', 'MD', 'VP', 'CFO', 'CHRO', 'MH', 'RMM'].includes(user.role) && renderHigherRoleView()}
    </div>
  );
};

export default LiquidationReports;
