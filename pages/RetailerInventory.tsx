import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { stockTransferService } from '../utils/stockTransferService';
import { ArrowLeft, Package, Building, TrendingUp, Calendar, MapPin, User } from 'lucide-react';

const RetailerInventory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retailerId = searchParams.get('retailerId');
  const retailerName = searchParams.get('retailerName');

  const [inventory, setInventory] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  useEffect(() => {
    if (retailerId) {
      loadData();
    }
  }, [retailerId]);

  const loadData = async () => {
    setLoading(true);

    const inventoryResult = await stockTransferService.getRetailerInventory(retailerId!);
    if (inventoryResult.success && inventoryResult.data) {
      setInventory(inventoryResult.data);
    }

    const transfersResult = await stockTransferService.getRetailerReceivedStock(retailerId!);
    if (transfersResult.success && transfersResult.data) {
      setTransfers(transfersResult.data);
    }

    setLoading(false);
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white mb-4 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                <Building className="w-12 h-12 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{retailerName || 'Retailer'}</h1>
                <p className="text-blue-100">ID: {retailerId}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'inventory'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Current Inventory</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Transfer History</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'inventory' ? (
              <div className="space-y-4">
                {inventory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No inventory data available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-gray-600">{item.sku_name}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku_code}</p>
                          </div>
                          <Package className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Stock:</span>
                            <span className="text-lg font-bold text-blue-600">
                              {item.current_stock} {item.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Total Received:</span>
                            <span className="text-sm font-semibold text-green-600">
                              {item.total_received} {item.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Total Sold:</span>
                            <span className="text-sm font-semibold text-orange-600">
                              {item.total_sold} {item.unit}
                            </span>
                          </div>
                        </div>

                        {item.last_received_date && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Last received: {new Date(item.last_received_date).toLocaleDateString()}
                                ({item.last_received_quantity} {item.unit})
                              </span>
                            </div>
                          </div>
                        )}

                        {item.distributor_name && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Building className="w-3 h-3" />
                              <span>From: {item.distributor_name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {transfers.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No transfer history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <span className="font-bold text-gray-900">
                                {transfer.product_name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{transfer.sku_name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              +{transfer.quantity}
                            </div>
                            <div className="text-xs text-gray-500">{transfer.unit}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">From</p>
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-blue-600" />
                              <p className="text-sm font-medium text-gray-900">
                                {transfer.from_entity_name}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(transfer.transfer_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {transfer.recorded_by && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Recorded By</p>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <p className="text-sm font-medium text-gray-900">
                                  {transfer.recorded_by}
                                </p>
                              </div>
                            </div>
                          )}

                          {transfer.latitude && transfer.longitude && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Location</p>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-red-600" />
                                <p className="text-sm font-medium text-gray-900">
                                  GPS Verified
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {transfer.total_value > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Transfer Value:</span>
                              <span className="text-lg font-bold text-gray-900">
                                ₹{transfer.total_value.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {transfer.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 italic">{transfer.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerInventory;
