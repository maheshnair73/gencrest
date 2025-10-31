import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { RetailerSelector } from './RetailerSelector';
import { AddRetailerModal, type NewRetailerData } from './AddRetailerModal';
import { useModal } from '../../contexts/ModalContext';

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
  allocatedRetailers: Array<{
    id: string;
    code: string;
    name: string;
    phone: string;
    address: string;
    quantity: number;
  }>;
}

interface BatchStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: Product[];
  onSubmit: (updates: SKUUpdate[]) => void;
}

export const BatchStockUpdateModal: React.FC<BatchStockUpdateModalProps> = ({
  isOpen,
  onClose,
  productData,
  onSubmit
}) => {
  const { showError, showSuccess, showWarning } = useModal();
  const [step, setStep] = useState<'input' | 'allocate' | 'review'>('' input');
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, number>>(new Map());
  const [completedUpdates, setCompletedUpdates] = useState<SKUUpdate[]>([]);
  const [currentSKUIndex, setCurrentSKUIndex] = useState(0);
  const [showAddRetailerModal, setShowAddRetailerModal] = useState(false);
  const [newRetailers, setNewRetailers] = useState<NewRetailerData[]>([]);

  const allSKUs = productData.flatMap(product =>
    product.skus.map(sku => ({
      product,
      sku
    }))
  );

  const skusToUpdate = allSKUs.filter(item =>
    pendingUpdates.has(`${item.product.productCode}-${item.sku.skuCode}`)
  );

  const handleStockInput = (productCode: string, skuCode: string, newStock: number) => {
    const key = `${productCode}-${skuCode}`;
    const newMap = new Map(pendingUpdates);

    if (newStock === 0) {
      newMap.delete(key);
    } else {
      newMap.set(key, newStock);
    }

    setPendingUpdates(newMap);
  };

  const proceedToAllocation = () => {
    if (skusToUpdate.length === 0) {
      showWarning('Please enter at least one stock value to update');
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
        retailerQty: 0,
        allocatedRetailers: []
      };
    });

    setCompletedUpdates(updates);
    setCurrentSKUIndex(0);
    setStep('allocate');
  };

  const handleRetailerSelect = (retailer: { id: string; code: string; name: string; phone: string; address: string }) => {
    const updated = [...completedUpdates];
    updated[currentSKUIndex].allocatedRetailers.push({
      ...retailer,
      quantity: 0
    });
    setCompletedUpdates(updated);
  };

  const handleAddNewRetailer = (retailer: NewRetailerData) => {
    setNewRetailers([...newRetailers, retailer]);

    const newRetailer = {
      id: `new-${Date.now()}`,
      code: retailer.code,
      name: retailer.name,
      phone: retailer.phone,
      address: retailer.address,
      quantity: 0
    };

    const updated = [...completedUpdates];
    updated[currentSKUIndex].allocatedRetailers.push(newRetailer);
    setCompletedUpdates(updated);
  };

  const handleQuantityChange = (updateIndex: number, retailerIndex: number, quantity: number) => {
    const updated = [...completedUpdates];
    updated[updateIndex].allocatedRetailers[retailerIndex].quantity = quantity;

    const totalRetailerQty = updated[updateIndex].allocatedRetailers.reduce(
      (sum, r) => sum + r.quantity,
      0
    );
    updated[updateIndex].retailerQty = totalRetailerQty;

    setCompletedUpdates(updated);
  };

  const handleFarmerQuantityChange = (updateIndex: number, qty: number) => {
    const updated = [...completedUpdates];
    updated[updateIndex].farmerQty = qty;
    setCompletedUpdates(updated);
  };

  const validateCurrentSKU = () => {
    const update = completedUpdates[currentSKUIndex];
    const total = update.farmerQty + update.retailerQty;

    if (total !== update.difference) {
      showError(`Total must equal ${update.difference} ${update.sku.unit}. Currently: ${total}`);
      return false;
    }

    if (update.retailerQty > 0) {
      const allocated = update.allocatedRetailers.reduce((sum, r) => sum + r.quantity, 0);
      if (allocated !== update.retailerQty) {
        showError(`Please allocate all ${update.retailerQty} ${update.sku.unit} to retailers`);
        return false;
      }
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
    showSuccess(`Successfully updated ${completedUpdates.length} SKU(s)!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Batch Stock Update</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 'input' && 'Enter new stock values for multiple SKUs'}
                  {step === 'allocate' && `Allocating SKU ${currentSKUIndex + 1} of ${completedUpdates.length}`}
                  {step === 'review' && 'Review all changes before submitting'}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {step === 'allocate' && (
              <div className="mt-4 flex items-center gap-2">
                {completedUpdates.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full ${
                      index < currentSKUIndex
                        ? 'bg-green-600'
                        : index === currentSKUIndex
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {step === 'input' && (
              <div className="space-y-4">
                {productData.map(product => (
                  <div key={product.productId} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{product.productName}</h3>
                    <div className="space-y-3">
                      {product.skus.map(sku => {
                        const key = `${product.productCode}-${sku.skuCode}`;
                        const newStock = pendingUpdates.get(key) || 0;
                        const hasValue = newStock > 0;

                        return (
                          <div
                            key={sku.skuCode}
                            className={`flex items-center gap-4 p-3 rounded-lg ${
                              hasValue ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                            }`}
                          >
                            <Package className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{sku.skuName}</p>
                              <p className="text-sm text-gray-600">
                                Current: {sku.currentStock} {sku.unit}
                              </p>
                            </div>
                            <div className="w-40">
                              <input
                                type="number"
                                value={newStock || ''}
                                onChange={(e) =>
                                  handleStockInput(
                                    product.productCode,
                                    sku.skuCode,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="New stock"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {hasValue && (
                              <div className="flex items-center gap-1 text-sm font-medium">
                                {newStock > sku.currentStock ? (
                                  <span className="text-blue-600">+{newStock - sku.currentStock}</span>
                                ) : (
                                  <span className="text-red-600">-{sku.currentStock - newStock}</span>
                                )}
                              </div>
                            )}
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
                <div className="space-y-6">
                  <div className={`border rounded-lg p-4 ${
                    update.isIncrease ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {update.productName} - {update.sku.skuName}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Last Stock</p>
                        <p className="text-2xl font-bold">{update.sku.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Stock</p>
                        <p className="text-2xl font-bold text-orange-600">{update.newStock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Difference</p>
                        <p className={`text-2xl font-bold ${update.isIncrease ? 'text-blue-600' : 'text-red-600'}`}>
                          {update.isIncrease ? '+' : '-'}{update.difference}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {update.isIncrease ? 'Returned from Farmers' : 'Sold to Farmers'}
                      </label>
                      <input
                        type="number"
                        value={update.farmerQty || ''}
                        onChange={(e) => handleFarmerQuantityChange(currentSKUIndex, parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {update.isIncrease ? 'Returned from Retailers' : 'Sold to Retailers'}
                      </label>
                      <input
                        type="number"
                        value={update.retailerQty || ''}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                      />
                    </div>
                  </div>

                  {remaining !== 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        Need to allocate <span className="font-bold">{remaining} {update.sku.unit}</span> more
                      </p>
                    </div>
                  )}

                  {update.retailerQty > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Retailer Allocation</h4>

                      {update.allocatedRetailers.map((retailer, rIndex) => (
                        <div key={retailer.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{retailer.name}</p>
                            <p className="text-sm text-gray-600">{retailer.code}</p>
                          </div>
                          <input
                            type="number"
                            value={retailer.quantity || ''}
                            onChange={(e) =>
                              handleQuantityChange(currentSKUIndex, rIndex, parseInt(e.target.value) || 0)
                            }
                            className="w-32 px-3 py-2 border rounded-lg"
                            placeholder="Quantity"
                          />
                        </div>
                      ))}

                      <RetailerSelector
                        onSelect={handleRetailerSelect}
                        onAddNew={() => setShowAddRetailerModal(true)}
                        selectedRetailerIds={update.allocatedRetailers.map(r => r.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {step === 'review' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Ready to Submit</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    You are about to update {completedUpdates.length} SKU(s). Review the changes below.
                  </p>
                </div>

                {completedUpdates.map((update, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{update.productName}</h4>
                        <p className="text-sm text-gray-600">{update.sku.skuName}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        update.isIncrease
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {update.isIncrease ? '+' : '-'}{update.difference} {update.sku.unit}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Farmers: {update.farmerQty} {update.sku.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Retailers: {update.retailerQty} {update.sku.unit}</p>
                      </div>
                    </div>
                    {update.allocatedRetailers.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium text-gray-700 mb-1">Allocated to:</p>
                        {update.allocatedRetailers.map((r, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            • {r.name} ({r.code}): {r.quantity} {update.sku.unit}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {step === 'input' ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={() => {
                  if (step === 'input') proceedToAllocation();
                  else if (step === 'allocate') handleNext();
                  else handleSubmit();
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {step === 'review' ? 'Submit All' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddRetailerModal
        isOpen={showAddRetailerModal}
        onClose={() => setShowAddRetailerModal(false)}
        onSave={handleAddNewRetailer}
      />
    </>
  );
};
