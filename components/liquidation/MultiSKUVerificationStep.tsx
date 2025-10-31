import React from 'react';
import { Building2, X, ChevronDown, ChevronUp, AlertTriangle, Phone, MapPin } from 'lucide-react';
import { RetailerSelector } from './RetailerSelector';

interface SKU {
  skuCode: string;
  skuName: string;
  name: string;
  unit: string;
  openingStock: number;
  currentStock: number;
  liquidated: number;
  unitPrice: number;
}

interface Product {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  skus: SKU[];
}

interface MultiSKUVerificationStepProps {
  allSKUsToProcess: Array<{product: Product; sku: SKU; newStock: number}>;
  skuFarmerQuantities: Map<string, string>;
  setSkuFarmerQuantities: (map: Map<string, string>) => void;
  skuRetailers: Map<string, Array<{id: string; code: string; name: string; phone: string; address: string; quantity: string}>>;
  setSkuRetailers: (map: Map<string, Array<any>>) => void;
  expandedSKUsInVerification: Set<string>;
  toggleSKUInVerification: (key: string) => void;
  handleSelectRetailer: (skuKey: string, retailer: any) => void;
  handleAddNewRetailer: (skuKey: string) => void;
  handleRemoveRetailer: (skuKey: string, index: number) => void;
  handleRetailerQuantityChange: (skuKey: string, index: number, quantity: string) => void;
}

export const MultiSKUVerificationStep: React.FC<MultiSKUVerificationStepProps> = ({
  allSKUsToProcess,
  skuFarmerQuantities,
  setSkuFarmerQuantities,
  skuRetailers,
  setSkuRetailers,
  expandedSKUsInVerification,
  toggleSKUInVerification,
  handleSelectRetailer,
  handleAddNewRetailer,
  handleRemoveRetailer,
  handleRetailerQuantityChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Step 2: Allocate Stock for All SKUs</h4>
        <p className="text-sm text-blue-700 mb-2">
          For each SKU below, specify where the stock went:
        </p>
        <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
          <li><strong>Farmers:</strong> Stock sold to farmers will be recorded as liquidation</li>
          <li><strong>Retailers:</strong> Select retailer(s) from dropdown and enter quantity for each</li>
          <li>Total must match the stock difference to proceed</li>
        </ul>
      </div>

      {allSKUsToProcess.map((item, index) => {
        const key = `${item.product.productCode}-${item.sku.skuCode}`;
        const difference = Math.abs(item.sku.currentStock - item.newStock);
        const isIncrease = item.newStock > item.sku.currentStock;
        const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
        const retailers = skuRetailers.get(key) || [];
        const retailerTotal = retailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
        const total = farmerQty + retailerTotal;
        const remaining = difference - total;
        const isExpanded = expandedSKUsInVerification.has(key);

        return (
          <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleSKUInVerification(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{item.product.productName}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{item.sku.skuCode}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      isIncrease ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isIncrease ? 'Return' : 'Outward'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Old: <strong>{item.sku.currentStock}</strong></span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">New: <strong>{item.newStock}</strong></span>
                    <span className="text-gray-400">|</span>
                    <span className={`font-semibold ${
                      total === difference ? 'text-green-600' :
                      total > difference ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      Allocated: {total}/{difference} {item.sku.unit}
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Sold to Farmers
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={skuFarmerQuantities.get(key) || ''}
                      onChange={(e) => {
                        const newMap = new Map(skuFarmerQuantities);
                        newMap.set(key, e.target.value);
                        setSkuFarmerQuantities(newMap);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {farmerQty > 0 && (
                      <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-blue-700">
                          {farmerQty} {item.sku.unit} will be directly recorded as liquidation
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Sold to Retailers (Total: {retailerTotal} {item.sku.unit})
                    </label>
                  </div>
                </div>

                <div>
                  {retailers.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {retailers.map((retailer, rIdx) => (
                        <div key={rIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <h5 className="font-semibold text-gray-900 text-sm truncate">{retailer.name}</h5>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-shrink-0">
                                  {retailer.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={retailer.quantity}
                                  onChange={(e) => handleRetailerQuantityChange(key, rIdx, e.target.value)}
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-600">{item.sku.unit}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveRetailer(key, rIdx)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border border-dashed border-gray-300 rounded-lg p-3">
                    <RetailerSelector
                      onSelect={(r) => handleSelectRetailer(key, r)}
                      onAddNew={() => handleAddNewRetailer(key)}
                      selectedRetailerIds={retailers.map(r => r.id)}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Stock Difference:</span>
                    <span className="font-semibold text-gray-900">{difference} {item.sku.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-700">Allocated (Farmers + Retailers):</span>
                    <span className={`font-semibold ${
                      total === difference ? 'text-green-600' :
                      total > difference ? 'text-red-600' :
                      'text-orange-600'
                    }`}>{total} {item.sku.unit}</span>
                  </div>
                  {remaining !== 0 && (
                    <div className={`mt-2 pt-2 border-t ${
                      remaining > 0 ? 'border-orange-200' : 'border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                          remaining > 0 ? 'text-orange-600' : 'text-red-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          remaining > 0 ? 'text-orange-800' : 'text-red-800'
                        }`}>
                          {remaining > 0 ? `Need to allocate ${remaining} ${item.sku.unit} more` : `Over-allocated by ${Math.abs(remaining)} ${item.sku.unit}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
