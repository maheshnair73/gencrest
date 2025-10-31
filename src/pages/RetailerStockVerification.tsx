import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Package, Eye, MapPin, Calendar, Search, Filter, TrendingUp, TrendingDown, CheckCircle, Clock, User, X, Camera, FileText, CreditCard as Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Entity360View from '../components/Entity360View';
import { SignatureCapture } from '../components/SignatureCapture';
import { MediaUpload } from '../components/MediaUpload';
import { StockRectificationModal } from '../components/reports/StockRectificationModal';
import { SimplifiedVerifyStockModal } from '../components/liquidation/SimplifiedVerifyStockModal';
import { MOCK_RETAILER_INVENTORY, MOCK_VERIFICATION_HISTORY, getVerificationHistoryForRetailer } from '../data/retailerMockData';

interface RetailerInventory {
  id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_business_name: string;
  retailer_location: string;
  distributor_id: string;
  distributor_name: string;
  product_code: string;
  product_name: string;
  sku_code: string;
  sku_name: string;
  current_stock: number;
  unit: string;
  last_received_date: string;
  last_received_quantity: number;
  total_received: number;
  total_sold: number;
  updated_at: string;
}

interface RetailerMetrics {
  openingStock: { volume: number; value: number };
  totalAllocated: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
}

interface Retailer {
  id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_location: string;
  distributor_name: string;
  linkedDistributors: number;
  status: string;
  priority: string;
  updated: string;
  metrics: RetailerMetrics;
  inventory: RetailerInventory[];
  latitude?: number;
  longitude?: number;
}

interface VerificationHistory {
  id: string;
  verification_date: string;
  skus_checked: any[];
  total_skus_count: number;
  verified_by_name: string;
  verified_by_role: string;
  proof_type: string;
}

interface OverallMetrics {
  openingStock: { volume: number; value: number };
  totalAllocated: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
  totalRetailers: number;
}

const RetailerStockVerification: React.FC = () => {
  const navigate = useNavigate();
  const { retailerId } = useParams<{ retailerId?: string }>();
  const { user } = useAuth();
  console.log('[Retailer Stock] Render - retailerId from URL:', retailerId);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistory[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [show360View, setShow360View] = useState(false);
  const [selected360Retailer, setSelected360Retailer] = useState<Retailer | null>(null);
  const [showDistributorModal, setShowDistributorModal] = useState(false);
  const [selectedRetailerForDistributor, setSelectedRetailerForDistributor] = useState<Retailer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalData, setDetailsModalData] = useState<{ type: string; data: any } | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRetailerForVerify, setSelectedRetailerForVerify] = useState<Retailer | null>(null);
  const [expandedSKU, setExpandedSKU] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Retailer[]>([]);
  const [showRectifyModal, setShowRectifyModal] = useState(false);
  const [selectedRectifyStock, setSelectedRectifyStock] = useState<any>(null);

  useEffect(() => {
    console.log('[Retailer Stock] Component mounted, fetching data...');
    fetchRetailersData();
  }, []);

  useEffect(() => {
    if (selectedRetailer) {
      loadVerificationHistory(selectedRetailer.retailer_id);
    }
  }, [selectedRetailer]);

  useEffect(() => {
    if (retailerId && retailers.length > 0 && !loading) {
      console.log('[Rectify] Attempting to open modal for retailerId:', retailerId);
      const retailer = retailers.find(r => r.retailer_id === retailerId);

      if (retailer) {
        console.log('[Rectify] Found retailer:', retailer.retailer_name);
        console.log('[Rectify] Inventory items:', retailer.inventory.length);

        if (retailer.inventory.length > 0) {
          const firstSKU = retailer.inventory[0];
          const unitValue = 5000;

          const stockData = {
            customer_name: retailer.retailer_name,
            customer_code: retailer.retailer_id,
            product_name: firstSKU.product_name,
            sku_name: firstSKU.sku_name,
            current_balance: firstSKU.current_stock * unitValue,
            current_balance_units: firstSKU.current_stock,
            unit: firstSKU.unit || 'Kg/Ltr'
          };

          console.log('[Rectify] Stock data to display:', stockData);
          setSelectedRectifyStock(stockData);
          setShowRectifyModal(true);
        } else {
          console.error('[Rectify] No inventory found for retailer');
        }
      } else {
        console.error('[Rectify] Retailer not found with ID:', retailerId);
      }
    }
  }, [retailerId, retailers, loading]);

  const fetchRetailersData = async () => {
    try {
      console.log('[Retailer Stock] Starting data fetch...');
      setLoading(true);

      // Skip database call and use mock data directly
      const mockRetailerData: RetailerInventory[] = MOCK_RETAILER_INVENTORY;
      console.log('[Retailer Stock] Using mock data:', mockRetailerData.length, 'items');

      const retailerMap = new Map<string, Retailer>();

      mockRetailerData.forEach((item) => {
        const key = item.retailer_id;

        if (!retailerMap.has(key)) {
          retailerMap.set(key, {
            id: item.id,
            retailer_id: item.retailer_id,
            retailer_name: item.retailer_name,
            retailer_location: item.retailer_location,
            distributor_name: item.distributor_name,
            linkedDistributors: 1,
            status: 'Active',
            priority: item.current_stock < 1000 ? 'High' : item.current_stock < 5000 ? 'Medium' : 'Low',
            updated: item.updated_at || new Date().toISOString(),
            latitude: item.latitude,
            longitude: item.longitude,
            metrics: {
              openingStock: { volume: 0, value: 0 },
              totalAllocated: { volume: 0, value: 0 },
              liquidation: { volume: 0, value: 0 },
              balanceStock: { volume: 0, value: 0 },
              liquidationPercentage: 0
            },
            inventory: []
          });
        }

        const retailer = retailerMap.get(key)!;
        retailer.inventory.push(item);
        retailer.metrics.totalAllocated.volume += item.total_received || 0;
        retailer.metrics.liquidation.volume += item.total_sold || 0;
        retailer.metrics.balanceStock.volume += item.current_stock || 0;
      });

      const retailersArray = Array.from(retailerMap.values());
      console.log('[Retailer Stock] Retailers array created:', retailersArray.length, 'retailers');

      retailersArray.forEach(retailer => {
        retailer.metrics.openingStock.volume =
          retailer.metrics.totalAllocated.volume -
          retailer.metrics.liquidation.volume;

        const totalAvailable =
          retailer.metrics.openingStock.volume +
          retailer.metrics.totalAllocated.volume;

        retailer.metrics.liquidationPercentage =
          totalAvailable > 0
            ? Math.round((retailer.metrics.liquidation.volume / totalAvailable) * 100)
            : 0;

        retailer.metrics.openingStock.value = retailer.metrics.openingStock.volume * 50;
        retailer.metrics.totalAllocated.value = retailer.metrics.totalAllocated.volume * 50;
        retailer.metrics.liquidation.value = retailer.metrics.liquidation.volume * 50;
        retailer.metrics.balanceStock.value = retailer.metrics.balanceStock.volume * 50;
      });

      console.log('[Retailer Stock] Setting retailers state with:', retailersArray.length, 'retailers');
      setRetailers(retailersArray);

      const overall: OverallMetrics = {
        openingStock: {
          volume: retailersArray.reduce((sum, r) => sum + r.metrics.openingStock.volume, 0),
          value: retailersArray.reduce((sum, r) => sum + r.metrics.openingStock.value, 0)
        },
        totalAllocated: {
          volume: retailersArray.reduce((sum, r) => sum + r.metrics.totalAllocated.volume, 0),
          value: retailersArray.reduce((sum, r) => sum + r.metrics.totalAllocated.value, 0)
        },
        liquidation: {
          volume: retailersArray.reduce((sum, r) => sum + r.metrics.liquidation.volume, 0),
          value: retailersArray.reduce((sum, r) => sum + r.metrics.liquidation.value, 0)
        },
        balanceStock: {
          volume: retailersArray.reduce((sum, r) => sum + r.metrics.balanceStock.volume, 0),
          value: retailersArray.reduce((sum, r) => sum + r.metrics.balanceStock.value, 0)
        },
        liquidationPercentage: 0,
        totalRetailers: retailersArray.length
      };

      const totalAvailable = overall.openingStock.volume + overall.totalAllocated.volume;
      overall.liquidationPercentage = totalAvailable > 0
        ? Math.round((overall.liquidation.volume / totalAvailable) * 100)
        : 0;

      setOverallMetrics(overall);
      console.log('[Retailer Stock] Data processing complete:', { 
        retailersCount: retailersArray.length,
        overallMetrics: overall 
      });
    } catch (error) {
      console.error('[Retailer Stock] Error in fetchRetailersData:', error);
    } finally {
      console.log('[Retailer Stock] Setting loading to false');
      setLoading(false);
    }
  };

  const loadVerificationHistory = async (retailerId: string) => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('stock_verification_history')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('verification_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Always use mock data for now
      setVerificationHistory(getVerificationHistoryForRetailer(retailerId));
    } catch (error) {
      console.error('Error loading verification history:', error);
      // Always use mock data
      setVerificationHistory(MOCK_VERIFICATION_HISTORY);
    } finally {
      setLoadingHistory(false);
    }
  };

  const groupedHistory = useMemo(() => {
    return verificationHistory.reduce((acc, record) => {
      const date = new Date(record.verification_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, VerificationHistory[]>);
  }, [verificationHistory]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
      return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(2)}K`;
    }
    return `${sign}₹${absValue.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(2)} Kg/Ltr`;
  };

  const filteredRetailers = useMemo(() => {
    return retailers.filter(retailer => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        retailer.retailer_name.toLowerCase().includes(searchLower) ||
        retailer.retailer_id.toLowerCase().includes(searchLower) ||
        retailer.retailer_location.toLowerCase().includes(searchLower) ||
        (retailer as any).retailer_phone?.toLowerCase().includes(searchLower) ||
        (retailer as any).retailer_contact_person?.toLowerCase().includes(searchLower)
      );

      const matchesStatus = !statusFilter || retailer.status === statusFilter;
      const matchesPriority = !priorityFilter || retailer.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [retailers, searchTerm, statusFilter, priorityFilter]);

  // Update search suggestions whenever search term changes
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const suggestions = retailers
        .filter(retailer => {
          const searchLower = searchTerm.toLowerCase();
          return (
            retailer.retailer_name.toLowerCase().includes(searchLower) ||
            retailer.retailer_id.toLowerCase().includes(searchLower) ||
            retailer.retailer_location.toLowerCase().includes(searchLower) ||
            (retailer as any).retailer_phone?.toLowerCase().includes(searchLower)
          );
        })
        .slice(0, 5); // Limit to 5 suggestions
      setSearchSuggestions(suggestions);
      setShowSearchDropdown(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSearchDropdown(false);
    }
  }, [searchTerm, retailers]);

  const handle360View = (retailer: Retailer) => {
    setSelected360Retailer(retailer);
    setShow360View(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLiquidationColor = (percentage: number) => {
    if (percentage >= 50) return 'text-green-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLiquidationBarColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  console.log('[Retailer Stock] Render state:', {
    loading,
    retailersCount: retailers.length,
    filteredCount: filteredRetailers.length,
    retailerId,
    showRectifyModal
  });

  if (loading) {
    console.log('[Retailer Stock] Showing loading state...');
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retailer data...</p>
        </div>
      </div>
    );
  }

  console.log('[Retailer Stock] Rendering main content...');

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Retailer Stock Verification</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Verify and track retailer inventory</p>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600">
            Last Balance Stock updated on: 31st Aug 2025
          </div>
          <div className="mt-2 text-sm">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 font-medium shadow-sm border border-blue-200">
              <Store className="w-4 h-4" />
              <span className="font-semibold">{overallMetrics?.totalRetailers || 0} Retailers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search retailers by name, code, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length > 0 && searchSuggestions.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSearchDropdown(false), 200);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Search Suggestions Dropdown */}
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchSuggestions.map((retailer) => (
                  <div
                    key={retailer.id}
                    onClick={() => {
                      setSearchTerm(retailer.retailer_name);
                      setShowSearchDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{retailer.retailer_name}</p>
                        <p className="text-sm text-gray-600">{retailer.retailer_id}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">📍 {retailer.retailer_location}</span>
                          {(retailer as any).retailer_phone && (
                            <span className="text-xs text-gray-500">📞 {(retailer as any).retailer_phone}</span>
                          )}
                        </div>
                      </div>
                      <Store className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

        {overallMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-orange-700 font-medium mb-1">Opening Stock</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(overallMetrics.openingStock.value)}</p>
                  <p className="text-xs text-orange-600 mt-1">{formatVolume(overallMetrics.openingStock.volume)}</p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Package className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Allocated Stock</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(overallMetrics.totalAllocated.value)}</p>
                  <p className="text-xs text-blue-600 mt-1">{formatVolume(overallMetrics.totalAllocated.volume)}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Total Liquidation</p>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(overallMetrics.liquidation.value)}</p>
                  <p className="text-xs text-green-600 mt-1">{formatVolume(overallMetrics.liquidation.volume)}</p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <Package className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Total Balance Stock</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(overallMetrics.balanceStock.value)}</p>
                  <p className="text-xs text-purple-600 mt-1">{formatVolume(overallMetrics.balanceStock.volume)}</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Package className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>
          </div>
        )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Retailers ({filteredRetailers.length})
        </h2>

        <div className="space-y-4">
              {filteredRetailers.map((retailer) => (
                <div key={retailer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                          <Store className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors"
                            onClick={() => handle360View(retailer)}
                          >
                            {retailer.retailer_name}
                            <Eye className="w-4 h-4" />
                          </h3>
                          <p className="text-sm text-gray-600">ID: {retailer.retailer_id}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {retailer.retailer_location}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedRetailerForDistributor(retailer);
                                setShowDistributorModal(true);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors"
                            >
                              Linked to {retailer.linkedDistributors} Distributor{retailer.linkedDistributors !== 1 ? 's' : ''}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {retailer.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(retailer.priority)}`}>
                          {retailer.priority}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>Last Updated Balance Stock - {new Date(retailer.updated).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-700 mb-1">Opening Stock</p>
                        <p className="text-xs text-orange-600 mb-1">Value</p>
                        <p className="text-lg font-bold text-orange-900">{formatCurrency(retailer.metrics.openingStock.value)}</p>
                        <p className="text-xs text-orange-600 mb-1">{formatVolume(retailer.metrics.openingStock.volume)}</p>
                        <button
                          onClick={() => {
                            setDetailsModalData({
                              type: 'Opening Stock',
                              data: retailer
                            });
                            setShowDetailsModal(true);
                          }}
                          className="mt-2 text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-700 mb-1">Allocated Stock</p>
                        <p className="text-xs text-blue-600 mb-1">Value</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(retailer.metrics.totalAllocated.value)}</p>
                        <p className="text-xs text-blue-600 mb-1">{formatVolume(retailer.metrics.totalAllocated.volume)}</p>
                        <button
                          onClick={() => {
                            setDetailsModalData({
                              type: 'Allocated Stock',
                              data: retailer
                            });
                            setShowDetailsModal(true);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Liquidation</p>
                        <p className="text-xs text-green-600 mb-1">Value</p>
                        <p className="text-lg font-bold text-green-900">{formatCurrency(retailer.metrics.liquidation.value)}</p>
                        <p className="text-xs text-green-600 mb-1">{formatVolume(retailer.metrics.liquidation.volume)}</p>
                        <button
                          onClick={() => {
                            setDetailsModalData({
                              type: 'Liquidation',
                              data: retailer
                            });
                            setShowDetailsModal(true);
                          }}
                          className="mt-2 text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-700 mb-1">Balance Stock</p>
                        <p className="text-xs text-purple-600 mb-1">Value</p>
                        <p className="text-lg font-bold text-purple-900">{formatCurrency(retailer.metrics.balanceStock.value)}</p>
                        <p className="text-xs text-purple-600 mb-2">{formatVolume(retailer.metrics.balanceStock.volume)}</p>
                        <button
                          onClick={() => {
                            setSelectedRetailerForVerify(retailer);
                            setShowVerifyModal(true);
                          }}
                          className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold"
                        >
                          Verify Current Stock
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/retailer-stock-verification/rectify/${retailer.retailer_id}`);
                          }}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700 hover:underline font-medium w-full text-center"
                        >
                          Rectify Existing Stock
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Liquidation Rate</span>
                        <span className={`text-lg font-bold ${getLiquidationColor(retailer.metrics.liquidationPercentage)}`}>
                          {retailer.metrics.liquidationPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getLiquidationBarColor(retailer.metrics.liquidationPercentage)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(retailer.metrics.liquidationPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>Target: 50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {selectedRetailer?.retailer_id === retailer.retailer_id && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Current Inventory</h4>

                        {retailer.inventory.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No inventory records found</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {retailer.inventory.map((item) => (
                              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900">{item.product_name}</h5>
                                    <p className="text-sm text-gray-600">{item.sku_name}</p>
                                    <p className="text-xs text-gray-500 mt-1">SKU: {item.sku_code}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div className="bg-blue-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-blue-600 text-xs mb-1">
                                      <TrendingUp className="w-3 h-3" />
                                      <span>Received</span>
                                    </div>
                                    <p className="text-md font-bold text-blue-900">{item.total_received}</p>
                                    <p className="text-xs text-blue-600">{item.unit}</p>
                                  </div>

                                  <div className="bg-green-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-green-600 text-xs mb-1">
                                      <TrendingDown className="w-3 h-3" />
                                      <span>Sold</span>
                                    </div>
                                    <p className="text-md font-bold text-green-900">{item.total_sold}</p>
                                    <p className="text-xs text-green-600">{item.unit}</p>
                                  </div>

                                  <div className="bg-orange-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-orange-600 text-xs mb-1">
                                      <Package className="w-3 h-3" />
                                      <span>Current</span>
                                    </div>
                                    <p className="text-md font-bold text-orange-900">{item.current_stock}</p>
                                    <p className="text-xs text-orange-600">{item.unit}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Last received: {new Date(item.last_received_date).toLocaleDateString()}</span>
                                  </div>
                                  <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verify
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold text-gray-900">Liquidation History</h4>
                          </div>

                          {loadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-500">Loading history...</p>
                            </div>
                          ) : Object.keys(groupedHistory).length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No verification history yet</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">DATE</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">SKU'S CHECKED</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">DONE BY</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">PROOF</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(groupedHistory).map(([date, records], dateIdx) => (
                                    <React.Fragment key={dateIdx}>
                                      {records.map((record, recordIdx) => (
                                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                                          {recordIdx === 0 ? (
                                            <td rowSpan={records.length} className="px-4 py-3 align-top border-r border-gray-200 bg-blue-50">
                                              <div className="text-sm font-semibold text-blue-900">{date}</div>
                                            </td>
                                          ) : null}
                                          <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-900">
                                              {record.skus_checked && record.skus_checked.length > 0
                                                ? record.skus_checked[0].sku_name || record.skus_checked[0].name || 'Unknown SKU'
                                                : 'Unknown SKU'}
                                            </div>
                                            <div className="text-xs text-gray-500">{record.total_skus_count} SKU</div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-600" />
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                  {record.verified_by_name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">{record.verified_by_role || 'Staff'}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <button className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                              <Eye className="w-4 h-4 mr-1" />
                                              View
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}

          {filteredRetailers.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No retailers found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {show360View && selected360Retailer && (
        <Entity360View
          entityType="retailer"
          entityId={selected360Retailer.retailer_id}
          entityName={selected360Retailer.retailer_name}
          onClose={() => {
            setShow360View(false);
            setSelected360Retailer(null);
          }}
        />
      )}

      {showDistributorModal && selectedRetailerForDistributor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Linked Distributors</h3>
              <p className="text-blue-100 text-sm mt-1">{selectedRetailerForDistributor.retailer_name}</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                     onClick={() => {
                       navigate(`/liquidation?distributor=${selectedRetailerForDistributor.inventory[0]?.distributor_id}`);
                     }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedRetailerForDistributor.distributor_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">ID: {selectedRetailerForDistributor.inventory[0]?.distributor_id}</p>
                    </div>
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => {
                  setShowDistributorModal(false);
                  setSelectedRetailerForDistributor(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && detailsModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{detailsModalData.type} Details</h3>
                <p className="text-gray-200 text-sm mt-1">Retailer Wise Stock Performance</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsModalData(null);
                }}
                className="text-white hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-700" />
                  <span className="font-semibold text-gray-900">{detailsModalData.data.retailer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Code: {detailsModalData.data.retailer_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">{detailsModalData.data.retailer_location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{detailsModalData.data.metrics.balanceStock.value.toFixed(0)}
                </div>
                <div className="text-sm text-orange-600">Total Balance</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">PRODUCT & SKU WISE BREAKDOWN</h4>
              </div>

              <div className="space-y-3">
                {detailsModalData.data.inventory.map((item: RetailerInventory, idx: number) => (
                  <div key={item.id} className="bg-orange-500 rounded-lg overflow-hidden">
                    <div
                      onClick={() => {
                        const currentExpanded = expandedSKU === item.id;
                        setExpandedSKU(currentExpanded ? null : item.id);
                      }}
                      className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-orange-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-white">{item.product_name}</div>
                        <div className="text-orange-100 text-sm">Code: {item.product_code} • Category: Biostimulant</div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-white">₹{(item.current_stock * 720).toFixed(0)}</div>
                        <div className="text-orange-100 text-sm">{item.current_stock.toLocaleString()} Kg/Ltr</div>
                      </div>
                      <button className="text-white">
                        {expandedSKU === item.id ? '▲' : '▼'}
                      </button>
                    </div>

                    {expandedSKU === item.id && (
                      <div className="bg-white">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <div className="font-semibold text-gray-900 mb-2">{item.sku_name}</div>
                          <div className="text-sm text-gray-600">{item.sku_code} • Unit Price: ₹720/Kg/Ltr</div>
                        </div>

                        <div className="px-4 py-3">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Stock Received From</h5>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 text-gray-700 font-semibold">Distributor</th>
                                  <th className="text-left py-2 text-gray-700 font-semibold">Transfer Date</th>
                                  <th className="text-right py-2 text-gray-700 font-semibold">Quantity</th>
                                  <th className="text-right py-2 text-gray-700 font-semibold">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 text-gray-900">{item.distributor_name}</td>
                                  <td className="py-3 text-gray-600">{new Date(item.last_received_date).toLocaleDateString('en-GB')}</td>
                                  <td className="text-right py-3 text-gray-900 font-medium">{item.last_received_quantity.toLocaleString()}</td>
                                  <td className="text-right py-3 text-gray-900 font-medium">₹{(item.last_received_quantity * 720).toFixed(0)}</td>
                                </tr>
                                {item.total_received > item.last_received_quantity && (
                                  <tr className="border-b border-gray-100">
                                    <td className="py-3 text-gray-900">{item.distributor_name}</td>
                                    <td className="py-3 text-gray-600">Previous Transfers</td>
                                    <td className="text-right py-3 text-gray-900 font-medium">{(item.total_received - item.last_received_quantity).toLocaleString()}</td>
                                    <td className="text-right py-3 text-gray-900 font-medium">₹{((item.total_received - item.last_received_quantity) * 720).toFixed(0)}</td>
                                  </tr>
                                )}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-300 font-semibold">
                                  <td className="py-3 text-gray-900" colSpan={2}>Total Received</td>
                                  <td className="text-right py-3 text-gray-900">{item.total_received.toLocaleString()}</td>
                                  <td className="text-right py-3 text-gray-900">₹{(item.total_received * 720).toFixed(0)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsModalData(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Old inventory details modal code removed */}
      {false && showDetailsModal && detailsModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 rounded-t-xl sticky top-0">
              <h3 className="text-xl font-bold text-white">{detailsModalData.type} - Details</h3>
              <p className="text-gray-200 text-sm mt-1">{detailsModalData.data.retailer_name}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {detailsModalData.data.inventory.map((item: RetailerInventory) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{item.product_name}</h5>
                        <p className="text-sm text-gray-600">{item.sku_name}</p>
                        <p className="text-xs text-gray-500 mt-1">SKU: {item.sku_code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-700 mb-1">Total Received</p>
                        <p className="text-lg font-bold text-blue-900">{item.total_received}</p>
                        <p className="text-xs text-blue-600">{item.unit}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Total Sold</p>
                        <p className="text-lg font-bold text-green-900">{item.total_sold}</p>
                        <p className="text-xs text-green-600">{item.unit}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-700 mb-1">Current Stock</p>
                        <p className="text-lg font-bold text-orange-900">{item.current_stock}</p>
                        <p className="text-xs text-orange-600">{item.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end sticky bottom-0">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsModalData(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerifyModal && selectedRetailerForVerify && (
        <SimplifiedVerifyStockModal
          isOpen={showVerifyModal}
          retailer={selectedRetailerForVerify}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedRetailerForVerify(null);
          }}
          onSuccess={() => {
            fetchRetailersData();
            setShowVerifyModal(false);
            setSelectedRetailerForVerify(null);
          }}
        />
      )}

      {/* Stock Rectification Modal */}
      <StockRectificationModal
        isOpen={showRectifyModal}
        onClose={() => {
          setShowRectifyModal(false);
          setSelectedRectifyStock(null);
        }}
        stockData={selectedRectifyStock}
        onSubmit={async (rectificationData) => {
          console.log('Rectification submitted:', rectificationData);
          setShowRectifyModal(false);
          setSelectedRectifyStock(null);
          await fetchRetailersData();
        }}
      />
    </div>
  );
};

export default RetailerStockVerification;
