import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Store, Eye, MapPin, Calendar, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Entity360View from '../components/Entity360View';

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
  retailer_business_name: string;
  retailer_location: string;
  distributor_id: string;
  distributor_name: string;
  status: string;
  priority: string;
  updated: string;
  linkedDistributors: number;
  metrics: RetailerMetrics;
  latitude?: number;
  longitude?: number;
}

interface OverallMetrics {
  openingStock: { volume: number; value: number };
  totalAllocated: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
  lastUpdated: string;
  totalRetailers: number;
}

const RetailerStockLiquidation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selected360Retailer, setSelected360Retailer] = useState<Retailer | null>(null);
  const [show360View, setShow360View] = useState(false);

  useEffect(() => {
    fetchRetailersData();
  }, []);

  const fetchRetailersData = async () => {
    try {
      setLoading(true);

      const { data: inventoryData, error } = await supabase
        .from('retailer_inventory')
        .select('*');

      if (error) throw error;

      const retailerMap = new Map<string, Retailer>();

      inventoryData?.forEach((item) => {
        const key = item.retailer_id;

        if (!retailerMap.has(key)) {
          retailerMap.set(key, {
            id: item.id,
            retailer_id: item.retailer_id,
            retailer_name: item.retailer_name,
            retailer_business_name: item.retailer_business_name,
            retailer_location: item.retailer_location,
            distributor_id: item.distributor_id,
            distributor_name: item.distributor_name,
            status: 'Active',
            priority: item.current_stock < 100 ? 'High' : item.current_stock < 500 ? 'Medium' : 'Low',
            updated: item.updated_at || new Date().toISOString(),
            linkedDistributors: 1,
            latitude: item.latitude,
            longitude: item.longitude,
            metrics: {
              openingStock: { volume: 0, value: 0 },
              totalAllocated: { volume: 0, value: 0 },
              liquidation: { volume: 0, value: 0 },
              balanceStock: { volume: 0, value: 0 },
              liquidationPercentage: 0
            }
          });
        }

        const retailer = retailerMap.get(key)!;
        retailer.metrics.totalAllocated.volume += item.total_received || 0;
        retailer.metrics.liquidation.volume += item.total_sold || 0;
        retailer.metrics.balanceStock.volume += item.current_stock || 0;
      });

      const retailersArray = Array.from(retailerMap.values());

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
        lastUpdated: new Date().toISOString(),
        totalRetailers: retailersArray.length
      };

      const totalAvailable = overall.openingStock.volume + overall.totalAllocated.volume;
      overall.liquidationPercentage = totalAvailable > 0
        ? Math.round((overall.liquidation.volume / totalAvailable) * 100)
        : 0;

      setOverallMetrics(overall);
    } catch (error) {
      console.error('Error fetching retailers:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const matchesSearch =
        retailer.retailer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.retailer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        retailer.retailer_location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || retailer.status === statusFilter;
      const matchesPriority = !priorityFilter || retailer.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [retailers, searchQuery, statusFilter, priorityFilter]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retailer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white mb-4 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">Retailer Liquidation</h1>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm font-semibold">
                    Retailer
                  </span>
                </div>
                <p className="text-green-100 mt-2">Track retailer stock liquidation performance</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <Store className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search retailers by name, code, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
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

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Retailers ({filteredRetailers.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredRetailers.map((retailer) => (
              <div key={retailer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Linked to {retailer.linkedDistributors} Distributor{retailer.linkedDistributors !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium`}>
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
                    <p className="text-xs text-orange-600">{formatVolume(retailer.metrics.openingStock.volume)}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700 mb-1">Allocated Stock</p>
                    <p className="text-xs text-blue-600 mb-1">Value</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(retailer.metrics.totalAllocated.value)}</p>
                    <p className="text-xs text-blue-600">{formatVolume(retailer.metrics.totalAllocated.volume)}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-700 mb-1">Liquidation</p>
                    <p className="text-xs text-green-600 mb-1">Value</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(retailer.metrics.liquidation.value)}</p>
                    <p className="text-xs text-green-600">{formatVolume(retailer.metrics.liquidation.volume)}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-700 mb-1">Balance Stock</p>
                    <p className="text-xs text-purple-600 mb-1">Value</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(retailer.metrics.balanceStock.value)}</p>
                    <p className="text-xs text-purple-600">{formatVolume(retailer.metrics.balanceStock.volume)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
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

                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                    Verify Stock
                  </button>
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
    </div>
  );
};

export default RetailerStockLiquidation;
