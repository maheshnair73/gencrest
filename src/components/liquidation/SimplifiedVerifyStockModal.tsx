import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Search, Plus, Building2 } from 'lucide-react';
import { SignatureCapture } from '../SignatureCapture';
import { MediaUpload } from '../MediaUpload';
import { MOCK_RETAILERS } from '../../data/mockData';

interface SKU {
  id: string;
  sku_code: string;
  sku_name: string;
  product_name: string;
  current_stock: number;
  unit: string;
}

interface Retailer {
  retailer_id: string;
  retailer_name: string;
  retailer_location: string;
  inventory: SKU[];
}

interface SimplifiedVerifyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailer: Retailer;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4;

export const SimplifiedVerifyStockModal: React.FC<SimplifiedVerifyStockModalProps> = ({
  isOpen,
  onClose,
  retailer,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [verificationData, setVerificationData] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    retailer.inventory.forEach(sku => {
      initial[sku.id] = sku.current_stock;
    });
    return initial;
  });
  const [allocations, setAllocations] = useState<Record<string, { farmer: number; retailers: { name: string; amount: number }[] }>>(() => {
    const initial: Record<string, { farmer: number; retailers: { name: string; amount: number }[] }> = {};
    retailer.inventory.forEach(sku => {
      initial[sku.id] = { farmer: 0, retailers: [] };
    });
    return initial;
  });
  const [signature, setSignature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [retailerSearch, setRetailerSearch] = useState<Record<string, string>>({});
  const [showRetailerDropdown, setShowRetailerDropdown] = useState<Record<string, boolean>>({});
  const [retailerAmount, setRetailerAmount] = useState<Record<string, string>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(showRetailerDropdown).forEach(skuId => {
        if (showRetailerDropdown[skuId] && dropdownRefs.current[skuId] &&
            !dropdownRefs.current[skuId]?.contains(event.target as Node)) {
          setShowRetailerDropdown(prev => ({ ...prev, [skuId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRetailerDropdown]);

  if (!isOpen) return null;

  const updateStock = (skuId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setVerificationData({
      ...verificationData,
      [skuId]: isNaN(numValue) ? 0 : numValue
    });
  };

  const totalCurrentStock = retailer.inventory.reduce((sum, sku) => sum + sku.current_stock, 0);
  const totalNewStock = Object.values(verificationData).reduce((sum, val) => sum + val, 0);
  const totalDecreased = totalCurrentStock - totalNewStock;

  const steps = [
    { number: 1, label: 'Verify', completed: currentStep > 1 },
    { number: 2, label: 'Allocate', completed: currentStep > 2 },
    { number: 3, label: 'E-Sign', completed: currentStep > 3 },
    { number: 4, label: 'Proof', completed: currentStep > 4 }
  ];

  const handleNext = () => {
    if (currentStep === 3 && !signature) {
      alert('Please provide your signature');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const updateFarmerAllocation = (skuId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setAllocations({
      ...allocations,
      [skuId]: {
        ...allocations[skuId],
        farmer: isNaN(numValue) ? 0 : numValue
      }
    });
  };

  const addRetailerAllocation = (skuId: string, retailerName: string, amount: number) => {
    setAllocations({
      ...allocations,
      [skuId]: {
        ...allocations[skuId],
        retailers: [...allocations[skuId].retailers, { name: retailerName, amount }]
      }
    });
  };

  const removeRetailerAllocation = (skuId: string, index: number) => {
    setAllocations({
      ...allocations,
      [skuId]: {
        ...allocations[skuId],
        retailers: allocations[skuId].retailers.filter((_, i) => i !== index)
      }
    });
  };

  const getTotalAllocated = (skuId: string) => {
    const allocation = allocations[skuId];
    if (!allocation) return 0;
    const retailerTotal = allocation.retailers.reduce((sum, r) => sum + r.amount, 0);
    return allocation.farmer + retailerTotal;
  };

  const getRemaining = (skuId: string, sku: SKU) => {
    const difference = Math.abs(sku.current_stock - verificationData[skuId]);
    const allocated = getTotalAllocated(skuId);
    const remaining = difference - allocated;
    return remaining >= 0 ? remaining : 0;
  };

  const isFullyAllocated = (skuId: string, sku: SKU) => {
    const difference = Math.abs(sku.current_stock - verificationData[skuId]);
    const allocated = getTotalAllocated(skuId);
    return difference > 0 && allocated >= difference;
  };

  const addRetailerToAllocation = (skuId: string, retailerName: string) => {
    const amount = parseFloat(retailerAmount[skuId] || '0');
    if (amount > 0) {
      addRetailerAllocation(skuId, retailerName, amount);
      setRetailerSearch({ ...retailerSearch, [skuId]: '' });
      setRetailerAmount({ ...retailerAmount, [skuId]: '' });
      setShowRetailerDropdown({ ...showRetailerDropdown, [skuId]: false });
    }
  };

  const getFilteredRetailers = (skuId: string) => {
    const search = retailerSearch[skuId] || '';
    const selectedIds = allocations[skuId]?.retailers.map(r => r.name) || [];
    return MOCK_RETAILERS.filter(retailer =>
      !selectedIds.includes(retailer.name) &&
      (retailer.name.toLowerCase().includes(search.toLowerCase()) ||
       retailer.code.toLowerCase().includes(search.toLowerCase()) ||
       retailer.phone.includes(search))
    );
  };

  const handleSubmit = async () => {
    console.log('Submitting verification...', { verificationData, allocations, signature, photos });
    alert('Verification submitted successfully!');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Verify Stock Changes</h2>
            <p className="text-sm text-gray-600">Verifying {retailer.inventory.length} SKUs</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className={`mt-2 text-xs font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5">
          {/* Step 1: Verify Stock */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Step 1: Verify Stock Changes</h3>
                <p className="text-xs text-blue-700">Review the stock changes below. Click Next to proceed with allocation.</p>
              </div>

              <div className="space-y-3">
                {retailer.inventory.map((sku) => {
                  const difference = verificationData[sku.id] - sku.current_stock;
                  return (
                    <div key={sku.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{sku.product_name}</div>
                          <div className="text-xs text-gray-600">{sku.sku_name} • {sku.sku_code}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Last Balance Stock</div>
                          <div className="text-lg font-bold text-gray-900">{sku.current_stock}</div>
                          <div className="text-xs text-gray-500">{sku.unit}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Current Stock</div>
                          <input
                            type="number"
                            value={verificationData[sku.id]}
                            onChange={(e) => updateStock(sku.id, e.target.value)}
                            className="w-full px-2 py-1 text-lg font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="text-xs text-gray-500">{sku.unit}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Sold/Liquidated</div>
                          <div className={`text-lg font-bold ${difference < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {Math.abs(difference)}
                          </div>
                          <div className="text-xs text-gray-500">{sku.unit}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Allocate Stock */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">Step 2: Allocate Stock</h3>
                <p className="text-xs text-yellow-700">Specify where the stock difference came from or went to.</p>
              </div>

              <div className="space-y-3">
                {retailer.inventory.map((sku) => {
                  const difference = verificationData[sku.id] - sku.current_stock;
                  if (difference === 0) return null;

                  const totalDifference = Math.abs(difference);
                  const remaining = getRemaining(sku.id, sku);
                  const fullyAllocated = isFullyAllocated(sku.id, sku);
                  const allocated = getTotalAllocated(sku.id);

                  return (
                    <div key={sku.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-2">{sku.product_name} ({sku.sku_name})</div>
                      <div className="text-sm text-red-600 mb-3">
                        Total: {totalDifference} {sku.unit} (Decrease)
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Farmer Allocation</label>
                          <input
                            type="number"
                            placeholder="Enter Farmer Quantity"
                            value={allocations[sku.id]?.farmer || ''}
                            onChange={(e) => updateFarmerAllocation(sku.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          {fullyAllocated ? (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Fully Allocated ({totalDifference} {sku.unit})
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600 mt-1">
                              Remaining: {remaining} {sku.unit}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Retailer Allocations</label>
                          <div className="space-y-2">
                            {allocations[sku.id]?.retailers.map((retailer, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="flex-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <span className="font-medium">{retailer.name}:</span> {retailer.amount} {sku.unit}
                                </div>
                                <button
                                  onClick={() => removeRetailerAllocation(sku.id, idx)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}

                            <div className="relative" ref={(el) => { dropdownRefs.current[sku.id] = el; }}>
                              <div className="flex gap-2 mb-2">
                                <div className="flex-1 relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="Search retailer..."
                                    value={retailerSearch[sku.id] || ''}
                                    onChange={(e) => {
                                      setRetailerSearch({ ...retailerSearch, [sku.id]: e.target.value });
                                      setShowRetailerDropdown({ ...showRetailerDropdown, [sku.id]: true });
                                    }}
                                    onFocus={() => setShowRetailerDropdown({ ...showRetailerDropdown, [sku.id]: true })}
                                    className="w-full pl-7 pr-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={retailerAmount[sku.id] || ''}
                                  onChange={(e) => setRetailerAmount({ ...retailerAmount, [sku.id]: e.target.value })}
                                  className="w-20 px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  alert('Add new retailer functionality');
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-medium text-green-600">+ Add New Retailer</span>
                              </button>

                              {showRetailerDropdown[sku.id] && (
                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ top: '40px' }}>
                                  {getFilteredRetailers(sku.id).length === 0 ? (
                                    <div className="px-3 py-4 text-center text-gray-500">
                                      <Building2 className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                                      <p className="text-xs">No retailers found</p>
                                    </div>
                                  ) : (
                                    <div>
                                      {getFilteredRetailers(sku.id).slice(0, 5).map(retailer => (
                                        <button
                                          key={retailer.id}
                                          onClick={() => addRetailerToAllocation(sku.id, retailer.name)}
                                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                        >
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                            <span className="font-medium text-gray-900 text-xs">{retailer.name}</span>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                                              {retailer.code}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-600 ml-4">
                                            {retailer.phone}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {fullyAllocated ? (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Fully Allocated ({totalDifference} {sku.unit})
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600 mt-1">
                              Remaining: {remaining} {sku.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: E-Sign */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Step 3: E-Sign</h3>
                <p className="text-xs text-purple-700">Provide your electronic signature to authenticate this stock verification.</p>
              </div>

              {!signature ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="text-red-600 font-semibold mb-2">E-Sign (Required)</div>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Open Signature Pad
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-green-600 mb-2">✓ Signature Captured</div>
                  <img src={signature} alt="Signature" className="border border-gray-300 rounded max-h-40" />
                  <button
                    onClick={() => setSignature(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Clear & Redo
                  </button>
                </div>
              )}

              {showSignatureModal && (
                <SignatureCapture
                  onSave={(sig) => {
                    setSignature(sig);
                    setShowSignatureModal(false);
                  }}
                  onClose={() => setShowSignatureModal(false)}
                  title="Capture Retailer Signature"
                  entityName={retailer.retailer_name}
                  entityCode={retailer.retailer_id}
                  entityType="Retailer"
                />
              )}
            </div>
          )}

          {/* Step 4: Proof */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Step 4: Proof</h3>
                <p className="text-xs text-green-700">Upload photo proofs to complete the verification.</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 mb-4">Open Camera</div>
                <button className="px-6 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium">
                  Open Camera
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-red-600">⚠</div>
                  <div className="text-xs text-red-800">
                    <div className="font-semibold mb-1">The Following Photo Proofs Are Mandatory:</div>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Photo Of The Person Who Signed</li>
                      <li>Photo Of The Outlet Frontage</li>
                    </ol>
                  </div>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-2">
                      <img src={URL.createObjectURL(photo)} alt={`Proof ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                      <div className="text-xs text-gray-600 mt-1">{photo.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-3 rounded-b-xl">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Confirm & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
