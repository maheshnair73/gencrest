import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Plus, Minus, Building2 } from 'lucide-react';

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

interface SKUUpdate {
  productName: string;
  productCode: string;
  sku: SKU;
  newStock: number;
  difference: number;
  isIncrease: boolean;
  farmerQty: number;
  retailerQty: number;
}

interface MobileBatchStockUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  productData: Product[];
  onSubmit: (updates: SKUUpdate[]) => void;
}

export const MobileBatchStockUpdate: React.FC<MobileBatchStockUpdateProps> = ({
  isOpen,
  onClose,
  productData,
  onSubmit
}) => {
  const [step, setStep] = useState<'input' | 'allocate' | 'review'>('input');
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, number>>(new Map());
  const [completedUpdates, setCompletedUpdates] = useState<SKUUpdate[]>([]);
  const [currentSKUIndex, setCurrentSKUIndex] = useState(0);

  const allSKUs = productData.flatMap(product =>
    product.skus.map(sku => ({ product, sku }))
  );

  const skusToUpdate = allSKUs.filter(item =>
    pendingUpdates.has(`${item.product.productCode}-${item.sku.skuCode}`)
  );

  const handleStockInput = (productCode: string, skuCode: string, value: string) => {
    const key = `${productCode}-${skuCode}`;
    const newMap = new Map(pendingUpdates);
    const newStock = parseInt(value) || 0;

    if (newStock === 0) {
      newMap.delete(key);
    } else {
      newMap.set(key, newStock);
    }

    setPendingUpdates(newMap);
  };

  const proceedToAllocation = () => {
    if (skusToUpdate.length === 0) {
      alert('Please enter at least one stock value to update');
      return;
    }

    const updates: SKUUpdate[] = skusToUpdate.map(({ product, sku }) => {
      const key = `${product.productCode}-${sku.skuCode}`;
      const newStock = pendingUpdates.get(key) || 0;
      const difference = sku.currentStock - newStock;

      return {
        productName: product.productName,
        productCode: product.productCode,
        sku,
        newStock,
        difference: Math.abs(difference),
        isIncrease: difference < 0,
        farmerQty: 0,
        retailerQty: 0
      };
    });

    setCompletedUpdates(updates);
    setCurrentSKUIndex(0);
    setStep('allocate');
  };

  const handleFarmerQuantityChange = (index: number, qty: number) => {
    const updated = [...completedUpdates];
    updated[index].farmerQty = qty;
    updated[index].retailerQty = updated[index].difference - qty;
    setCompletedUpdates(updated);
  };

  const validateCurrentSKU = () => {
    const update = completedUpdates[currentSKUIndex];
    const total = update.farmerQty + update.retailerQty;

    if (total !== update.difference) {
      alert(`Total must equal ${update.difference} ${update.sku.unit}. Currently: ${total}`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSKU()) return;

    if (currentSKUIndex < completedUpdates.length - 1) {
      setCurrentSKUIndex(currentSKUIndex + 1);
    } else {
      setStep('review');
    }
  };

  const handleSubmit = () => {
    onSubmit(completedUpdates);
    alert(`Successfully updated ${completedUpdates.length} SKU(s)!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Batch Stock Update</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-blue-100">
          {step === 'input' && 'Enter new stock values'}
          {step === 'allocate' && `SKU ${currentSKUIndex + 1} of ${completedUpdates.length}`}
          {step === 'review' && 'Review all changes'}
        </p>
        {step === 'allocate' && (
          <div className="mt-3 flex gap-1">
            {completedUpdates.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index < currentSKUIndex
                    ? 'bg-green-400'
                    : index === currentSKUIndex
                    ? 'bg-white'
                    : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 'input' && (
          <div className="space-y-4">
            {productData.map(product => (
              <div key={product.productId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{product.productName}</h3>
                <div className="space-y-3">
                  {product.skus.map(sku => {
                    const key = `${product.productCode}-${sku.skuCode}`;
                    const newStock = pendingUpdates.get(key) || 0;
                    const hasValue = newStock > 0;

                    return (
                      <div
                        key={sku.skuCode}
                        className={`p-3 rounded-lg border ${
                          hasValue ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{sku.skuName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-gray-600">
                            Current: <strong>{sku.currentStock}</strong> {sku.unit}
                          </span>
                          <input
                            type="number"
                            value={newStock || ''}
                            onChange={(e) => handleStockInput(product.productCode, sku.skuCode, e.target.value)}
                            placeholder="New"
                            className="w-24 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          {hasValue && (
                            <span className={`text-sm font-bold ${
                              newStock > sku.currentStock ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {newStock > sku.currentStock ? '+' : ''}{newStock - sku.currentStock}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'allocate' && completedUpdates[currentSKUIndex] && (() => {
          const update = completedUpdates[currentSKUIndex];
          const total = update.farmerQty + update.retailerQty;
          const remaining = update.difference - total;

          return (
            <div className="space-y-4">
              <div className={`border-2 rounded-lg p-4 ${
                update.isIncrease ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'
              }`}>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {update.productName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{update.sku.skuName}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Stock</p>
                    <p className="text-xl font-bold">{update.sku.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">New Stock</p>
                    <p className="text-xl font-bold text-orange-600">{update.newStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Difference</p>
                    <p className={`text-xl font-bold ${update.isIncrease ? 'text-blue-600' : 'text-red-600'}`}>
                      {update.isIncrease ? '+' : '-'}{update.difference}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {update.isIncrease ? 'Returned from Farmers' : 'Sold to Farmers'}
                </label>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => handleFarmerQuantityChange(currentSKUIndex, Math.max(0, update.farmerQty - 1))}
                    className="p-2 bg-gray-100 rounded-lg"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={update.farmerQty}
                    onChange={(e) => handleFarmerQuantityChange(currentSKUIndex, parseInt(e.target.value) || 0)}
                    className="flex-1 text-center text-2xl font-bold py-3 border-2 border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleFarmerQuantityChange(currentSKUIndex, update.farmerQty + 1)}
                    className="p-2 bg-gray-100 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {update.isIncrease ? 'Returned from Retailers' : 'Sold to Retailers'}
                </label>
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{update.retailerQty}</p>
                  <p className="text-sm text-gray-600 mt-1">{update.sku.unit}</p>
                </div>
              </div>

              {remaining !== 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">
                      Need to allocate <strong>{remaining} {update.sku.unit}</strong> more
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Ready to Submit</h3>
              </div>
              <p className="text-sm text-green-800">
                You are about to update {completedUpdates.length} SKU(s)
              </p>
            </div>

            {completedUpdates.map((update, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{update.productName}</h4>
                    <p className="text-sm text-gray-600">{update.sku.skuName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    update.isIncrease ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {update.isIncrease ? '+' : '-'}{update.difference} {update.sku.unit}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600 text-xs mb-1">Farmers</p>
                    <p className="font-semibold">{update.farmerQty} {update.sku.unit}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600 text-xs mb-1">Retailers</p>
                    <p className="font-semibold">{update.retailerQty} {update.sku.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
        <div className="flex justify-between gap-3">
          <button
            onClick={() => {
              if (step === 'allocate' && currentSKUIndex > 0) {
                setCurrentSKUIndex(currentSKUIndex - 1);
              } else if (step === 'review') {
                setStep('allocate');
                setCurrentSKUIndex(completedUpdates.length - 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            {step === 'input' ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => {
              if (step === 'input') proceedToAllocation();
              else if (step === 'allocate') handleNext();
              else handleSubmit();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            {step === 'review' ? 'Submit All' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
