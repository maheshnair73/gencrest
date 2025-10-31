import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, Hash, MapPin, ChevronDown, ChevronUp, Camera, Upload, FileText, CheckCircle, Clock, User, AlertTriangle, Phone } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { RetailerSelector } from './RetailerSelector';
import { AddRetailerModal, NewRetailerData } from './AddRetailerModal';
import { MultiSKUVerificationStep } from './MultiSKUVerificationStep';
import * as mockData from '../../data/mockData';

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

interface VerifyStockModalProps {
  distributorId: string;
  distributorName: string;
  distributorCode: string;
  salesStaffName?: string;
  onClose: () => void;
  productData: Product[];
}

export const VerifyStockModal: React.FC<VerifyStockModalProps> = ({
  distributorId,
  distributorName,
  distributorCode,
  salesStaffName = 'Sales Representative',
  onClose,
  productData
}) => {
  const { showError, showSuccess, showWarning } = useModal();
  const [modalTab, setModalTab] = useState<'details' | 'verify'>('details');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedSKUs, setExpandedSKUs] = useState<Set<string>>(new Set());
  const [verificationProductData, setVerificationProductData] = useState<Product[]>(productData);
  const [stockInputs, setStockInputs] = useState<Map<string, string>>(new Map());
  const [allSKUsToProcess, setAllSKUsToProcess] = useState<Array<{product: Product; sku: SKU; newStock: number}>>([]);
  const [showTransactionSplitModal, setShowTransactionSplitModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  // Per-SKU data storage: key = `${productCode}-${skuCode}`
  const [skuFarmerQuantities, setSkuFarmerQuantities] = useState<Map<string, string>>(new Map());
  const [skuRetailers, setSkuRetailers] = useState<Map<string, Array<{id: string; code: string; name: string; phone: string; address: string; quantity: string}>>>(new Map());
  const [expandedSKUsInVerification, setExpandedSKUsInVerification] = useState<Set<string>>(new Set());

  const [uploadedProofs, setUploadedProofs] = useState<any[]>([]);
  const [showAddRetailerModal, setShowAddRetailerModal] = useState(false);
  const [currentSKUKeyForRetailerSelection, setCurrentSKUKeyForRetailerSelection] = useState<string>('');
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedMetadata, setCapturedMetadata] = useState<{user: string; timestamp: string; location: string} | null>(null);

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleSKU = (skuCode: string) => {
    const newExpanded = new Set(expandedSKUs);
    if (newExpanded.has(skuCode)) {
      newExpanded.delete(skuCode);
    } else {
      newExpanded.add(skuCode);
    }
    setExpandedSKUs(newExpanded);
  };

  const handleStockInput = (productCode: string, skuCode: string, value: string) => {
    const key = `${productCode}-${skuCode}`;
    const newMap = new Map(stockInputs);
    if (value) {
      newMap.set(key, value);
    } else {
      newMap.delete(key);
    }
    setStockInputs(newMap);
  };

  const handleProceedToVerification = () => {
    if (stockInputs.size === 0) {
      showError('Please enter at least one stock value');
      return;
    }

    const skusToProcess: Array<{product: Product; sku: SKU; newStock: number}> = [];

    verificationProductData.forEach(product => {
      product.skus.forEach(sku => {
        const key = `${product.productCode}-${sku.skuCode}`;
        const inputValue = stockInputs.get(key);
        if (inputValue) {
          const newStock = parseInt(inputValue);
          if (!isNaN(newStock) && newStock !== sku.currentStock) {
            skusToProcess.push({ product, sku, newStock });
          }
        }
      });
    });

    if (skusToProcess.length === 0) {
      showWarning('No changes detected in stock values');
      return;
    }

    setAllSKUsToProcess(skusToProcess);

    // Initialize empty maps for each SKU
    const newFarmerQtyMap = new Map<string, string>();
    const newRetailersMap = new Map<string, Array<any>>();
    const newExpandedSet = new Set<string>();

    skusToProcess.forEach(item => {
      const key = `${item.product.productCode}-${item.sku.skuCode}`;
      newFarmerQtyMap.set(key, '0');
      newRetailersMap.set(key, []);
      newExpandedSet.add(key);
    });

    setSkuFarmerQuantities(newFarmerQtyMap);
    setSkuRetailers(newRetailersMap);
    setExpandedSKUsInVerification(newExpandedSet);
    setVerificationStep(1);
    setShowTransactionSplitModal(true);
  };

  const handleConfirmSplit = () => {
    // Validate all SKUs have proper allocation
    let hasErrors = false;
    const errors: string[] = [];

    allSKUsToProcess.forEach(item => {
      const key = `${item.product.productCode}-${item.sku.skuCode}`;
      const difference = Math.abs(item.sku.currentStock - item.newStock);
      const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
      const retailers = skuRetailers.get(key) || [];
      // Exclude manual-entry from retailer total calculation
      const actualRetailers = retailers.filter(r => r.id !== 'manual-entry');
      const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
      const total = farmerQty + retailerTotal;

      if (total !== difference) {
        hasErrors = true;
        errors.push(`${item.product.productName} - ${item.sku.skuCode}: Total ${total} doesn't match difference ${difference}`);
      }
    });

    if (hasErrors) {
      showError(`Please fix allocation errors:\n\n${errors.join('\n')}`);
      return;
    }

    if (!signature) {
      showError('E-signature is required to submit');
      return;
    }

    // Update all SKUs
    let updatedData = [...verificationProductData];

    allSKUsToProcess.forEach(item => {
      const key = `${item.product.productCode}-${item.sku.skuCode}`;
      const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;

      updatedData = updatedData.map(product => {
        if (product.productCode === item.product.productCode) {
          return {
            ...product,
            skus: product.skus.map(sku => {
              if (sku.skuCode === item.sku.skuCode) {
                return {
                  ...sku,
                  currentStock: item.newStock,
                  liquidated: sku.liquidated + farmerQty
                };
              }
              return sku;
            })
          };
        }
        return product;
      });
    });

    setVerificationProductData(updatedData);

    // Build success message
    let successMessage = `✅ All Stock Updates Successful!\n\n`;
    successMessage += `📦 Updated ${allSKUsToProcess.length} SKU(s)\n\n`;
    successMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    allSKUsToProcess.forEach((item, idx) => {
      const key = `${item.product.productCode}-${item.sku.skuCode}`;
      const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
      const retailers = skuRetailers.get(key) || [];
      // Exclude manual-entry from retailer total
      const actualRetailers = retailers.filter(r => r.id !== 'manual-entry');
      const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);

      successMessage += `${idx + 1}. ${item.product.productName} (${item.sku.skuCode})\n\n`;
      successMessage += `   📊 Stock Change:\n`;
      successMessage += `      Previous: ${item.sku.currentStock} ${item.sku.unit}\n`;
      successMessage += `      New: ${item.newStock} ${item.sku.unit}\n\n`;

      successMessage += `   📥 Quantities Returned:\n`;
      successMessage += `      • Farmers: ${farmerQty} ${item.sku.unit}\n`;
      successMessage += `      • Retailers: ${retailerTotal} ${item.sku.unit}\n`;

      if (actualRetailers.length > 0) {
        successMessage += `\n   🏪 Retailer Breakdown:\n`;
        actualRetailers.forEach(r => {
          successMessage += `      → ${r.name}: ${r.quantity} ${item.sku.unit}\n`;
        });
      }
      successMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    successMessage += `📎 Proofs: ${uploadedProofs.length} file(s) attached\n`;
    successMessage += `✍️ Signature: Captured and verified`;

    showSuccess(successMessage, 'All SKUs Verified');

    // Reset all state
    setShowTransactionSplitModal(false);
    setAllSKUsToProcess([]);
    setSkuFarmerQuantities(new Map());
    setSkuRetailers(new Map());
    setExpandedSKUsInVerification(new Set());
    setUploadedProofs([]);
    setSignature('');
    setCapturedMetadata(null);
    setVerificationStep(1);
  };

  const handleSelectRetailer = (skuKey: string, retailer: {id: string; code: string; name: string; phone: string; address: string}) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, [...currentRetailers, { ...retailer, quantity: '' }]);
    setSkuRetailers(newRetailersMap);
  };

  const handleAddNewRetailer = (skuKey: string) => {
    setCurrentSKUKeyForRetailerSelection(skuKey);
    setShowAddRetailerModal(true);
  };

  const handleSaveNewRetailer = (retailerData: NewRetailerData) => {
    const newRetailer = {
      id: `RET-${Date.now()}`,
      code: retailerData.code,
      name: retailerData.name,
      phone: retailerData.phone,
      address: retailerData.address,
      quantity: ''
    };

    if (currentSKUKeyForRetailerSelection) {
      const currentRetailers = skuRetailers.get(currentSKUKeyForRetailerSelection) || [];
      const newRetailersMap = new Map(skuRetailers);
      newRetailersMap.set(currentSKUKeyForRetailerSelection, [...currentRetailers, newRetailer]);
      setSkuRetailers(newRetailersMap);
    }

    setShowAddRetailerModal(false);
    setCurrentSKUKeyForRetailerSelection('');
  };

  const handleRemoveRetailer = (skuKey: string, index: number) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, currentRetailers.filter((_, i) => i !== index));
    setSkuRetailers(newRetailersMap);
  };

  const handleRetailerQuantityChange = (skuKey: string, index: number, quantity: string) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, currentRetailers.map((r, i) => i === index ? { ...r, quantity } : r));
    setSkuRetailers(newRetailersMap);
  };

  const toggleSKUInVerification = (skuKey: string) => {
    const newExpanded = new Set(expandedSKUsInVerification);
    if (newExpanded.has(skuKey)) {
      newExpanded.delete(skuKey);
    } else {
      newExpanded.add(skuKey);
    }
    setExpandedSKUsInVerification(newExpanded);
  };

  const handleClickPicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newProof = {
            id: `photo_${Date.now()}`,
            type: 'photo',
            name: file.name,
            url: event.target?.result as string,
            timestamp: new Date().toISOString(),
            metadata: {
              capturedAt: new Date().toLocaleString('en-IN'),
              userName: 'Current User',
              designation: 'Field Officer'
            }
          };
          setUploadedProofs(prev => [...prev, newProof]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmitProof = () => {
    if (uploadedProofs.length === 0) {
      showError('Please upload at least one proof');
      return;
    }
    showSuccess(`Verification submitted with ${uploadedProofs.length} proof(s)!`);
    onClose();
  };

  const totalValue = verificationProductData.reduce((sum, product) => {
    return sum + product.skus.reduce((skuSum, sku) => skuSum + (sku.currentStock * sku.unitPrice), 0);
  }, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white w-full h-full sm:h-auto sm:rounded-xl sm:shadow-2xl sm:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex-shrink-0 sticky top-0 z-10 bg-white shadow-sm">
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Verify Stock</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Outlet details and transaction history</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="bg-orange-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-orange-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs sm:text-sm text-orange-900 flex-1 min-w-0">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">{distributorName}</span>
                  <span className="sm:hidden flex-shrink-0">{distributorName.substring(0, 20)}</span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="flex-shrink-0">Code: {distributorCode}</span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Green Valley, Delhi NCR</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-900">
                    ₹{(totalValue / 100000).toFixed(2)}L
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Total Balance Stock</div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-200 px-3 sm:px-6 overflow-x-auto scrollbar-hide">
              <button
                className={`flex-shrink-0 px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  modalTab === 'details'
                    ? 'text-gray-900 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setModalTab('details')}
              >
                SKU WISE VERIFY
              </button>
              <button
                className={`flex-shrink-0 px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  modalTab === 'verify'
                    ? 'text-gray-900 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setModalTab('verify')}
              >
                Submit Proof
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {modalTab === 'details' ? (
              <>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Product & SKU Breakdown</h3>
                <div className="space-y-3">
                  {verificationProductData.map((product) => {
                    const productTotal = product.skus.reduce((sum, sku) => sum + sku.currentStock, 0);
                    const productValue = product.skus.reduce((sum, sku) => sum + (sku.currentStock * sku.unitPrice), 0);

                    return (
                      <div key={product.productId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between bg-gradient-to-r from-orange-400 to-orange-500 p-3 sm:p-4 text-white cursor-pointer hover:from-orange-500 hover:to-orange-600 transition-all"
                          onClick={() => toggleProduct(product.productId)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">{product.productName}</h4>
                            <p className="text-xs opacity-90 mt-0.5">Code: {product.productCode}</p>
                          </div>
                          <div className="text-right mr-3">
                            <div className="text-base sm:text-lg font-bold">₹{productValue.toLocaleString()}</div>
                            <div className="text-xs opacity-90">{productTotal.toLocaleString()} units</div>
                          </div>
                          {expandedProducts.has(product.productId) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>

                        {expandedProducts.has(product.productId) && (
                          <div className="bg-white">
                            {product.skus.map((sku) => (
                              <div key={sku.skuCode} className="border-t border-gray-200">
                                <div
                                  className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => toggleSKU(sku.skuCode)}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{sku.skuName}</div>
                                    <div className="text-xs text-gray-600 mt-1">SKU: {sku.skuCode}</div>
                                  </div>
                                  <div className="text-right mr-3">
                                    <div className="text-sm font-bold text-gray-900">₹{(sku.currentStock * sku.unitPrice).toLocaleString()}</div>
                                    <div className="text-xs text-gray-600">{sku.currentStock} {sku.unit}</div>
                                  </div>
                                  {expandedSKUs.has(sku.skuCode) ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>

                                {expandedSKUs.has(sku.skuCode) && (
                                  <div className="px-3 sm:px-6 pb-4 bg-gray-50">
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="font-semibold text-purple-900">Update Current Stock</h4>
                                          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <MapPin className="w-3 h-3" />
                                            <span>0m from outlet</span>
                                          </div>
                                        </div>
                                        <div className="text-sm text-purple-700 mb-3">
                                          <span className="font-medium">Last Entered Stock:</span> {sku.currentStock} {sku.unit}
                                          <span className="text-xs text-purple-600 ml-2">(10.06.2024)</span>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-xs text-purple-700 mb-1">Enter Current Stock:</label>
                                            <input
                                              type="number"
                                              placeholder={`Current: ${sku.currentStock}`}
                                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => handleStockInput(product.productCode, sku.skuCode, e.target.value)}
                                              value={stockInputs.get(`${product.productCode}-${sku.skuCode}`) || ''}
                                            />
                                            <p className="text-xs text-purple-600 mt-1">
                                              If increased = Retailer Return | If decreased = Sale/Liquidation
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 flex items-center justify-between p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Location Verified</div>
                        <div className="text-sm text-green-700">0m from outlet</div>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 text-center">Submit Proof</h3>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
                      <button
                        onClick={handleClickPicture}
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700">Click Pic</span>
                      </button>

                      <div className="text-xl sm:text-2xl text-gray-400 font-semibold">Or</div>

                      <button
                        onClick={handleClickPicture}
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700 text-center px-2">Upload</span>
                      </button>

                      <div className="text-xl sm:text-2xl text-gray-400 font-semibold">Or</div>

                      <button
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700">E-sign</span>
                      </button>
                    </div>

                    {uploadedProofs.length > 0 && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">Uploaded Proofs ({uploadedProofs.length})</h4>
                        <div className="space-y-3">
                          {uploadedProofs.map((proof) => (
                            <div key={proof.id} className="bg-white border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{proof.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Photo</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setUploadedProofs(prev => prev.filter(p => p.id !== proof.id))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {proof.url && (
                                <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-2">
                                  <img src={proof.url} alt="Uploaded" className="max-h-40 mx-auto rounded" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        onClick={() => setModalTab('details')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitProof}
                        disabled={uploadedProofs.length === 0}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          uploadedProofs.length > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Submit Verification ({uploadedProofs.length} proof{uploadedProofs.length !== 1 ? 's' : ''})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {modalTab === 'details' && (
            <div className="flex-shrink-0 bg-white border-t-2 border-orange-500 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {stockInputs.size > 0 ? (
                    <span className="font-medium text-orange-600">
                      {stockInputs.size} SKU(s) ready for verification
                    </span>
                  ) : (
                    <span>Enter stock values above to proceed</span>
                  )}
                </div>
                <button
                  onClick={handleProceedToVerification}
                  disabled={stockInputs.size === 0}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                    stockInputs.size > 0
                      ? 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  Proceed to Verification ({stockInputs.size})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTransactionSplitModal && allSKUsToProcess.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Verify Stock Changes</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {allSKUsToProcess.length > 1 ? (
                      <span>Verifying {allSKUsToProcess.length} SKUs</span>
                    ) : (
                      <span>Verifying 1 SKU</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTransactionSplitModal(false);
                    setAllSKUsToProcess([]);
                    setSkuFarmerQuantities(new Map());
                    setSkuRetailers(new Map());
                    setExpandedSKUsInVerification(new Set());
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    verificationStep === 1 ? 'bg-blue-600 text-white' : verificationStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>1</div>
                  <span className={`text-xs ${verificationStep === 1 ? 'font-semibold text-gray-900' : verificationStep > 1 ? 'text-green-600' : 'text-gray-400'}`}>Verification</span>
                </div>
                <div className="h-px w-6 bg-gray-300"></div>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    verificationStep === 2 ? 'bg-blue-600 text-white' : verificationStep > 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>2</div>
                  <span className={`text-xs ${verificationStep === 2 ? 'font-semibold text-gray-900' : verificationStep > 2 ? 'text-green-600' : 'text-gray-400'}`}>Proof & E-Sign</span>
                </div>
                <div className="h-px w-6 bg-gray-300"></div>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    verificationStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>3</div>
                  <span className={`text-xs ${verificationStep === 3 ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>Review & Submit</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {(() => {
                const item = allSKUsToProcess[0];
                if (!item) return null;

                const key = `${item.product.productCode}-${item.sku.skuCode}`;
                const farmerQuantity = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
                const retailers = skuRetailers.get(key) || [];
                const retailerTotal = retailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                const selectedSKUForUpdate = {
                  productName: item.product.productName,
                  productCode: item.product.productCode,
                  sku: item.sku
                };
                const newStockValue = item.newStock;
                const stockDifference = item.sku.currentStock - item.newStock;

                return (
                  <>
                    {verificationStep === 1 && (
                <div className="space-y-4">
                  {allSKUsToProcess.map((itemMap) => {
                    const keyMap = `${itemMap.product.productCode}-${itemMap.sku.skuCode}`;
                    const difference = Math.abs(itemMap.sku.currentStock - itemMap.newStock);
                    const isDecrease = itemMap.newStock < itemMap.sku.currentStock;
                    const farmerQty = parseInt(skuFarmerQuantities.get(keyMap) || '0') || 0;
                    const retailersMap = skuRetailers.get(keyMap) || [];
                    const hasActualRetailersCheck = retailersMap.some(r => r.id && r.id !== 'manual-entry' && r.id !== '');
                    const retailerTotalMap = hasActualRetailersCheck
                      ? retailersMap.filter(r => r.id && r.id !== 'manual-entry' && r.id !== '').reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0)
                      : retailersMap.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                    const total = farmerQty + retailerTotalMap;

                    return (
                      <div key={keyMap} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-sm text-gray-900">{itemMap.product.productName} ({itemMap.sku.skuCode})</h5>
                            <p className="text-xs text-gray-600">{itemMap.sku.skuName}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDecrease ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isDecrease ? 'Outward' : 'Return'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center mb-3">
                          <div>
                            <p className="text-xs text-gray-600">Last Balance Stock</p>
                            <p className="text-base font-bold text-gray-900">{itemMap.sku.currentStock}</p>
                            <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">New Balance Stock</p>
                            <p className="text-base font-bold text-green-600">{itemMap.newStock}</p>
                            <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Stock Difference</p>
                            <p className="text-base font-bold text-red-600">{difference}</p>
                            <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded p-2 mb-2 text-center border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            Where is the balance {difference}?
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Quantity returned from Farmers
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={skuFarmerQuantities.get(keyMap) || ''}
                                onChange={(e) => {
                                  const newMap = new Map(skuFarmerQuantities);
                                  newMap.set(keyMap, e.target.value);
                                  setSkuFarmerQuantities(newMap);
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              {farmerQty > 0 && (
                                <div className="mt-1.5 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded p-1.5">
                                  <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-blue-700">
                                    {farmerQty} {itemMap.sku.unit} will be directly recorded as liquidation
                                  </span>
                                </div>
                              )}

                              {total === difference && total > 0 && (
                                <div className="mt-1.5 flex items-start gap-1.5 bg-green-50 border border-green-200 rounded p-1.5">
                                  <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-green-700 font-medium">
                                    Fully allocated! ({total} {itemMap.sku.unit})
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Quantity returned from Retailers
                              </label>
                              {(() => {
                                const hasActualRetailers = retailersMap.some(r => r.id && r.id !== 'manual-entry' && r.id !== '');
                                const actualRetailersTotal = retailersMap
                                  .filter(r => r.id && r.id !== 'manual-entry' && r.id !== '')
                                  .reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);

                                // Get the manual entry value if it exists
                                const manualEntry = retailersMap.find(r => r.id === 'manual-entry');
                                const manualEntryValue = manualEntry ? (parseInt(manualEntry.quantity) || 0) : 0;

                                // Display value: show manual entry if it exists, otherwise show allocated retailers total
                                const displayValue = manualEntryValue > 0 ? manualEntryValue : actualRetailersTotal;

                                return (
                                  <>
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      value={displayValue}
                                      readOnly={hasActualRetailers}
                                      onChange={(e) => {
                                        if (hasActualRetailers) return;

                                        const newValue = e.target.value;
                                        const currentRetailers = skuRetailers.get(keyMap) || [];
                                        const withoutManual = currentRetailers.filter(r => r.id !== 'manual-entry');

                                        if (newValue) {
                                          // Always keep manual-entry alongside any empty retailers
                                          const newRetailersMap = new Map(skuRetailers);
                                          newRetailersMap.set(keyMap, [
                                            {
                                              id: 'manual-entry',
                                              code: 'MANUAL',
                                              name: 'Manual Entry',
                                              phone: '',
                                              address: '',
                                              quantity: newValue
                                            },
                                            ...withoutManual
                                          ]);
                                          setSkuRetailers(newRetailersMap);
                                        } else {
                                          // If cleared, keep other retailers but remove manual-entry
                                          const newRetailersMap = new Map(skuRetailers);
                                          newRetailersMap.set(keyMap, withoutManual);
                                          setSkuRetailers(newRetailersMap);
                                        }
                                      }}
                                      className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasActualRetailers ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                    {hasActualRetailers && manualEntryValue > 0 && actualRetailersTotal !== manualEntryValue && (
                                      <div className={`mt-1 text-xs flex items-center gap-1 ${actualRetailersTotal < manualEntryValue ? 'text-orange-600' : 'text-red-600'}`}>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Allocated: {actualRetailersTotal} / {manualEntryValue} {itemMap.sku.unit}
                                      </div>
                                    )}
                                    {hasActualRetailers && manualEntryValue > 0 && actualRetailersTotal === manualEntryValue && (
                                      <div className="mt-1 text-xs flex items-center gap-1 text-green-600">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Fully allocated!
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {(retailerTotalMap > 0 || retailersMap.length > 0) && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h6 className="text-sm font-semibold text-gray-900">Select Retailers</h6>
                              <button
                                onClick={() => {
                                  const currentRetailers = retailersMap;
                                  const newRetailersMap = new Map(skuRetailers);
                                  newRetailersMap.set(keyMap, [...currentRetailers, {
                                    id: '',
                                    code: '',
                                    name: '',
                                    phone: '',
                                    address: '',
                                    quantity: ''
                                  }]);
                                  setSkuRetailers(newRetailersMap);
                                }}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                              >
                                + Add Retailer
                              </button>
                            </div>

                            {retailersMap.length === 0 || (retailersMap.length === 1 && retailersMap[0].id === 'manual-entry') ? (
                              <div className="text-center py-4 text-sm text-gray-500">
                                No retailers added yet. Click "+ Add Retailer" to start.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {retailersMap.filter(r => r.id !== 'manual-entry').map((retailer, idx) => {
                                  const actualIndex = retailersMap.findIndex(r => r === retailer);
                                  return (
                                    <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border border-gray-200">
                                      <div className="flex-1">
                                        <select
                                          value={retailer.id}
                                          onChange={(e) => {
                                            const selectedRetailer = mockData.MOCK_RETAILERS.find(r => r.id === e.target.value);
                                            if (selectedRetailer) {
                                              const currentRetailers = skuRetailers.get(keyMap) || [];
                                              const newRetailersMap = new Map(skuRetailers);

                                              // Find manual-entry to keep it for reference
                                              const manualEntry = currentRetailers.find(r => r.id === 'manual-entry');

                                              // Get all non-manual retailers
                                              const withoutManual = currentRetailers.filter(r => r.id !== 'manual-entry');

                                              // Find the index of this retailer in the withoutManual array
                                              const indexInWithoutManual = withoutManual.findIndex(r => r === retailer);

                                              // Update the selected retailer
                                              const updatedRetailers = withoutManual.map((r, i) =>
                                                i === indexInWithoutManual ? { ...selectedRetailer, quantity: r.quantity } : r
                                              );

                                              // Keep manual-entry at the beginning if it exists
                                              if (manualEntry) {
                                                newRetailersMap.set(keyMap, [manualEntry, ...updatedRetailers]);
                                              } else {
                                                newRetailersMap.set(keyMap, updatedRetailers);
                                              }

                                              setSkuRetailers(newRetailersMap);
                                            }
                                          }}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        >
                                          <option value="">Select Retailer</option>
                                          {mockData.MOCK_RETAILERS.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Quantity"
                                        value={retailer.quantity}
                                        onChange={(e) => handleRetailerQuantityChange(keyMap, actualIndex, e.target.value)}
                                        className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                      <button
                                        onClick={() => handleRemoveRetailer(keyMap, actualIndex)}
                                        className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {total !== difference && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-orange-800 font-medium">
                              Balance remaining: {difference - total} {itemMap.sku.unit} (Total allocated: {total}, Required: {difference})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}



              {verificationStep === 2 && (() => {
                const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
                  const canvas = signatureCanvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  setIsDrawing(true);
                  ctx.beginPath();
                  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                };

                const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
                  if (!isDrawing) return;
                  const canvas = signatureCanvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                  ctx.stroke();
                };

                const stopDrawing = () => {
                  if (isDrawing) {
                    const canvas = signatureCanvasRef.current;
                    if (canvas) {
                      setSignature(canvas.toDataURL());

                      if (!capturedMetadata) {
                        const now = new Date();
                        setCapturedMetadata({
                          user: 'Rajendra Krishna Lokhande (MDO)',
                          timestamp: now.toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }),
                          location: '19.092350, 73.075933'
                        });
                      }
                    }
                  }
                  setIsDrawing(false);
                };

                const clearSignature = () => {
                  const canvas = signatureCanvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      setSignature('');
                    }
                  }
                };

                const hasRetailers = retailerTotal > 0;

                const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newProofs = Array.from(files).map(file => ({
                      name: file.name,
                      type: 'file',
                      size: file.size,
                      timestamp: new Date().toISOString()
                    }));
                    setUploadedProofs([...uploadedProofs, ...newProofs]);
                  }
                };

                const handleCapturePhoto = () => {
                  const photoName = `Photo_${new Date().getTime()}.jpg`;
                  setUploadedProofs([...uploadedProofs, {
                    name: photoName,
                    type: 'photo',
                    timestamp: new Date().toISOString()
                  }]);
                };

                const generateDraftLetter = () => {
                  const now = new Date();
                  const dateStr = now.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeStr = now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  const letterContent = `From: ${distributorName}
Distributor Code: ${distributorCode}
Date: ${dateStr}
Time: ${timeStr}

To,
GENCREST

Subject: Stock Verification and Update Confirmation

Dear Sir/Madam,

This is to confirm that stock verification was conducted at our premises on ${dateStr} at ${timeStr} in the presence of your Sales Representative, ${salesStaffName}.

The following stock updates were verified and confirmed:

Product Details:
Product Name: ${selectedSKUForUpdate?.productName || 'Product Name'}
SKU: ${selectedSKUForUpdate?.sku.skuName || 'SKU'}
Unit: ${selectedSKUForUpdate?.sku.unit || 'Kg'}

Stock Movement:
Previous Stock: ${selectedSKUForUpdate?.sku.currentStock || 0} ${selectedSKUForUpdate?.sku.unit || 'Kg'}
Updated Stock: ${newStockValue} ${selectedSKUForUpdate?.sku.unit || 'Kg'}
Net Change: ${stockDifference > 0 ? '-' : '+'}${Math.abs(stockDifference)} ${selectedSKUForUpdate?.sku.unit || 'Kg'}

Distribution Breakdown:
- Sold to Farmers: ${farmerQuantity || 0} ${selectedSKUForUpdate?.sku.unit || 'Kg'}
- Transferred to Retailers: ${retailerTotal || 0} ${selectedSKUForUpdate?.sku.unit || 'Kg'}
${retailers.length > 0 ? `
Retailer-wise Allocation:
${retailers.map((r, idx) => `${idx + 1}. ${r.name} (Code: ${r.code || 'N/A'}) - ${r.quantity} ${selectedSKUForUpdate?.sku.unit || 'Kg'}`).join('\n')}` : ''}

Verification Details:
Verified By (Sales Staff): ${salesStaffName}
Location: ${capturedMetadata?.location || 'N/A'}
Timestamp: ${capturedMetadata?.timestamp || `${dateStr}, ${timeStr}`}

We hereby confirm that the above information is accurate and complete to the best of our knowledge. All stock movements have been properly documented and accounted for.

Yours sincerely,


____________________
Signature
${distributorName}
Distributor Code: ${distributorCode}
                  `;

                  const blob = new Blob([letterContent.trim()], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Draft_Letter_${distributorCode}_${new Date().getTime()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  setUploadedProofs([...uploadedProofs, {
                    name: `Draft_Letter_${distributorCode}.txt`,
                    type: 'draft',
                    timestamp: new Date().toISOString()
                  }]);
                };

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Upload Proofs {hasRetailers && <span className="text-red-600">(Required for retailer movements)</span>}
                        </h4>

                        <button
                          onClick={generateDraftLetter}
                          className="w-full mb-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FileText className="w-5 h-5" />
                          <span>Draft Letter</span>
                        </button>

                        <div className="space-y-2">
                          <label className="w-full px-4 py-3 bg-green-50 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                            <Upload className="w-5 h-5" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx"
                            />
                          </label>

                          <button
                            onClick={handleCapturePhoto}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Camera className="w-5 h-5" />
                            <span>Capture Photo</span>
                          </button>
                        </div>

                        {uploadedProofs.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {uploadedProofs.map((proof, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-700">{proof.name}</span>
                                <button
                                  onClick={() => setUploadedProofs(uploadedProofs.filter((_, i) => i !== index))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          E-Sign <span className="text-red-600">(required)</span>
                        </h4>

                        <div className="border-2 border-gray-300 rounded-lg bg-white">
                          <canvas
                            ref={signatureCanvasRef}
                            width={400}
                            height={200}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="w-full cursor-crosshair"
                            style={{ touchAction: 'none' }}
                          />
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-2">
                          Draw signature above, it will be auto-saved & uploaded.
                        </p>

                        <button
                          onClick={clearSignature}
                          className="w-full mt-3 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Clear
                        </button>

                        {capturedMetadata && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs">
                            <p className="font-semibold text-gray-700 mb-2">Captured metadata:</p>
                            <p className="text-gray-600"><span className="font-medium">User:</span> {capturedMetadata.user}</p>
                            <p className="text-gray-600"><span className="font-medium">At:</span> {capturedMetadata.timestamp}</p>
                            <p className="text-gray-600"><span className="font-medium">Location:</span> {capturedMetadata.location}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {hasRetailers && (
                      <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">
                          For retailer movements, at least one proof and e-signature are required.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {verificationStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Review All Changes
                    </h4>
                    <p className="text-sm text-blue-800">
                      Please review all the information below before submitting. Once submitted, this stock update will be recorded in the system.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Product Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Name:</span>
                          <span className="font-medium text-gray-900">{selectedSKUForUpdate?.productName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Code:</span>
                          <span className="font-medium text-gray-900">{selectedSKUForUpdate?.productCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SKU Code:</span>
                          <span className="font-medium text-gray-900">{selectedSKUForUpdate?.sku.skuCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SKU Name:</span>
                          <span className="font-medium text-gray-900">{selectedSKUForUpdate?.sku.skuName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Stock Changes</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Previous Stock:</span>
                          <span className="font-medium text-gray-900">{selectedSKUForUpdate?.sku.currentStock || 0} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">New Stock:</span>
                          <span className="font-medium text-green-600">{newStockValue} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600 font-semibold">Stock Difference:</span>
                          <span className={`font-bold ${stockDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stockDifference > 0 ? '-' : '+'}{Math.abs(stockDifference)} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Stock Movement Breakdown</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Sold to Farmers:</span>
                          <span className="font-bold text-green-700 text-lg">{farmerQuantity || 0} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Sold to Retailers:</span>
                          <span className="font-bold text-blue-700 text-lg">{retailerTotal || 0} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {retailers.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Retailer-wise Allocation</h5>
                      <div className="space-y-2">
                        {retailers.map((retailer, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-900">{retailer.name}</span>
                            </div>
                            <span className="font-bold text-blue-600">{retailer.quantity} {selectedSKUForUpdate?.sku.unit || 'Kg/L'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Proofs & Signature</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Uploaded Proofs: <span className="font-semibold text-gray-900">{uploadedProofs.length}</span></p>
                        {uploadedProofs.length > 0 && (
                          <div className="space-y-1">
                            {uploadedProofs.map((proof, index) => (
                              <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1 text-gray-700 flex items-center">
                                <CheckCircle className="w-3 h-3 text-green-600 mr-1 flex-shrink-0" />
                                {proof.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">E-Signature:</p>
                        {signature ? (
                          <div className="space-y-2">
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="font-medium">Signature Captured</span>
                            </div>
                            {capturedMetadata && (
                              <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                                <p><span className="font-medium">By:</span> {capturedMetadata.user}</p>
                                <p><span className="font-medium">At:</span> {capturedMetadata.timestamp}</p>
                                <p><span className="font-medium">Location:</span> {capturedMetadata.location}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-red-600 text-sm flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            No signature captured
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Once submitted, this stock update will be permanently recorded</li>
                          <li>All changes will be reflected immediately in the system</li>
                          <li>This action cannot be undone without approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                  </>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                {verificationStep > 1 && (
                  <button
                    onClick={() => setVerificationStep(verificationStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                )}
                {verificationStep === 1 && (
                  <button
                    onClick={() => {
                      setShowTransactionSplitModal(false);
                      setAllSKUsToProcess([]);
                      setSkuFarmerQuantities(new Map());
                      setSkuRetailers(new Map());
                      setExpandedSKUsInVerification(new Set());
                      setVerificationStep(1);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
                {verificationStep < 3 ? (
                  <button
                    onClick={() => {
                      if (verificationStep === 1) {
                        // Validate all SKUs have proper allocation
                        let hasErrors = false;
                        const errors: string[] = [];
                        let unallocatedCount = 0;

                        allSKUsToProcess.forEach(item => {
                          const key = `${item.product.productCode}-${item.sku.skuCode}`;
                          const difference = Math.abs(item.sku.currentStock - item.newStock);
                          const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
                          const retailers = skuRetailers.get(key) || [];
                          // Exclude manual-entry from retailer total calculation
                          const actualRetailers = retailers.filter(r => r.id !== 'manual-entry');
                          const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                          const total = farmerQty + retailerTotal;

                          if (total !== difference) {
                            hasErrors = true;
                            unallocatedCount++;
                            const remaining = difference - total;
                            if (remaining > 0) {
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Need ${remaining} ${item.sku.unit} more`);
                            } else {
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Over-allocated by ${Math.abs(remaining)} ${item.sku.unit}`);
                            }
                          }

                          // Validate retailer selections have quantities (exclude manual-entry)
                          actualRetailers.forEach((retailer, idx) => {
                            if (!retailer.id || retailer.id === '') {
                              hasErrors = true;
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Please select a retailer`);
                            } else if (!retailer.quantity || parseInt(retailer.quantity) <= 0) {
                              hasErrors = true;
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Retailer "${retailer.name}" needs a quantity`);
                            }
                          });
                        });

                        if (hasErrors) {
                          const title = `Cannot Proceed - ${unallocatedCount} SKU${unallocatedCount > 1 ? 's' : ''} Not Fully Allocated`;
                          showError(`${title}\n\n${errors.join('\n')}\n\nPlease allocate all stock before proceeding.`);
                          return;
                        }
                      } else if (verificationStep === 2) {
                        // Validate signature is captured
                        if (!signature) {
                          showError('Please provide your signature before proceeding.');
                          return;
                        }
                      }

                      setVerificationStep(verificationStep + 1);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmSplit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Confirm & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddRetailerModal
        isOpen={showAddRetailerModal}
        onClose={() => setShowAddRetailerModal(false)}
        onSave={handleSaveNewRetailer}
      />
    </>
  );
};
