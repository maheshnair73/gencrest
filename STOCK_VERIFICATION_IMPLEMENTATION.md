# Stock Verification Workflow - Complete Implementation Guide

## Current Status

✅ **Completed:**
- 5-step visual indicator added to modal
- State variables added (`soldToFarmers`, `soldToRetailers`, `retailerAllocations`)
- Modal tab type updated to support new steps

⏳ **Remaining:**
- Step 2 (Verification) content
- Step 3 (Allocation) content
- Step 4 (Proof & E-Sign) validation messages
- Step 5 (Review & Submit) content
- Navigation logic between steps

## Implementation Code

### Step 2: Verification Content

Add after `{modalTab === 'details' ? (` section, before the closing:

```typescript
              ) : modalTab === 'verification' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Verify Stock Changes</h3>

                  {/* Product Summary */}
                  {verificationProductData.map((product) => product.skus.map((sku) => {
                    const lastStock = sku.openingStock || 0;
                    const newStock = skuQuantities[sku.skuCode] || sku.currentStock;
                    const stockDifference = lastStock - newStock;

                    if (stockDifference <= 0) return null;

                    return (
                      <div key={sku.skuCode} className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h4 className="font-semibold text-green-900 mb-4">{product.productName} [{sku.name}]</h4>

                        {/* Stock Comparison */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Last Balance Stock</div>
                            <div className="text-2xl font-bold text-gray-900">{lastStock}</div>
                            <div className="text-xs text-gray-500">{sku.unit}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">New Balance Stock</div>
                            <div className="text-2xl font-bold text-blue-600">{newStock}</div>
                            <div className="text-xs text-gray-500">{sku.unit}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Stock Difference</div>
                            <div className="text-2xl font-bold text-red-600">{stockDifference}</div>
                            <div className="text-xs text-gray-500">{sku.unit}</div>
                          </div>
                        </div>

                        {/* Question */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-900 mb-4">
                            Where is the balance {stockDifference} {sku.unit}?
                          </h5>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Sold to Farmers */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity sold to Farmers
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={soldToFarmers}
                                onChange={(e) => setSoldToFarmers(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>

                            {/* Sold to Retailers */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity sold to Retailers
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={soldToRetailers}
                                onChange={(e) => setSoldToRetailers(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Validation Message */}
                          {(() => {
                            const remaining = stockDifference - (soldToFarmers + soldToRetailers);
                            return (
                              <div className={`mt-4 p-3 rounded-lg ${
                                remaining === 0 ? 'bg-green-100 text-green-800' :
                                remaining > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {remaining === 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Perfect! All stock movements are accounted for.</span>
                                  </div>
                                ) : remaining > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-medium">
                                      Remaining balance to allocate: {remaining} {sku.unit}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <X className="w-5 h-5" />
                                    <span className="font-medium">
                                      Error: Total allocated ({soldToFarmers + soldToRetailers}) exceeds stock difference ({stockDifference})
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  }))}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <button
                      onClick={() => setModalTab('details')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        const totalDifference = verificationProductData.reduce((sum, product) => {
                          return sum + product.skus.reduce((skuSum, sku) => {
                            const lastStock = sku.openingStock || 0;
                            const newStock = skuQuantities[sku.skuCode] || sku.currentStock;
                            return skuSum + Math.max(0, lastStock - newStock);
                          }, 0);
                        }, 0);

                        const remaining = totalDifference - (soldToFarmers + soldToRetailers);

                        if (remaining !== 0) {
                          alert('Please ensure all stock movements are properly allocated before proceeding.');
                          return;
                        }

                        if (soldToRetailers > 0) {
                          setModalTab('allocation');
                        } else {
                          setModalTab('proof');
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
```

### Step 3: Allocation Content

```typescript
              ) : modalTab === 'allocation' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Allocate to Retailers</h3>

                  {verificationProductData.map((product) => product.skus.map((sku) => {
                    if (soldToRetailers === 0) return null;

                    return (
                      <div key={sku.skuCode} className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-900">{product.productName}</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Required for retailers: <span className="font-bold">{soldToRetailers}</span> {sku.unit}
                          </p>
                        </div>

                        {/* Allocation Rows */}
                        <div className="space-y-3 mb-4">
                          {retailerAllocations.map((allocation, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <select
                                value={allocation.retailerId}
                                onChange={(e) => {
                                  const newAllocations = [...retailerAllocations];
                                  const retailer = e.target.value;
                                  newAllocations[index] = {
                                    ...newAllocations[index],
                                    retailerId: retailer,
                                    retailerName: e.target.options[e.target.selectedIndex].text
                                  };
                                  setRetailerAllocations(newAllocations);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Retailer</option>
                                {linkedRetailers[selectedDistributorId || '']?.map((retailerName) => (
                                  <option key={retailerName} value={retailerName}>
                                    {retailerName}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                min="0"
                                value={allocation.quantity || 0}
                                onChange={(e) => {
                                  const newAllocations = [...retailerAllocations];
                                  newAllocations[index] = {
                                    ...newAllocations[index],
                                    quantity: Number(e.target.value)
                                  };
                                  setRetailerAllocations(newAllocations);
                                }}
                                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />

                              <button
                                onClick={() => {
                                  setRetailerAllocations(retailerAllocations.filter((_, i) => i !== index));
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Row Button */}
                        <button
                          onClick={() => {
                            setRetailerAllocations([
                              ...retailerAllocations,
                              { retailerId: '', retailerName: '', quantity: 0 }
                            ]);
                          }}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Row</span>
                        </button>

                        {/* Allocation Progress */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              Allocated: <span className={`text-lg font-bold ${
                                retailerAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0) === soldToRetailers
                                  ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {retailerAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0)}
                              </span> / {soldToRetailers}
                            </span>
                            {retailerAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0) === soldToRetailers && (
                              <span className="text-green-600 flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Complete</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }))}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <button
                      onClick={() => setModalTab('verification')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        const totalAllocated = retailerAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);

                        if (totalAllocated !== soldToRetailers) {
                          alert(`Please allocate exactly ${soldToRetailers} units to retailers. Currently allocated: ${totalAllocated}`);
                          return;
                        }

                        const hasEmptyRetailer = retailerAllocations.some(a => !a.retailerId || a.quantity === 0);
                        if (hasEmptyRetailer) {
                          alert('Please select a retailer and enter quantity for all rows, or remove empty rows.');
                          return;
                        }

                        setModalTab('proof');
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
```

### Step 4: Proof & E-Sign (Update existing with validation)

Update the submit button validation:

```typescript
              ) : modalTab === 'proof' ? (
                <>
                  {/* Existing proof upload UI */}

                  {/* Add validation message at the bottom */}
                  {soldToRetailers > 0 && uploadedProofs.length === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Proof Required</p>
                        <p className="text-sm text-red-700 mt-1">
                          For retailer movements, at least one proof and e-signature are required.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <button
                      onClick={() => setModalTab(soldToRetailers > 0 ? 'allocation' : 'verification')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (soldToRetailers > 0 && uploadedProofs.length === 0) {
                          alert('Please upload at least one proof document and provide an e-signature for retailer stock movements.');
                          return;
                        }
                        setModalTab('review');
                      }}
                      disabled={soldToRetailers > 0 && uploadedProofs.length === 0}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        soldToRetailers > 0 && uploadedProofs.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </>
```

### Step 5: Review & Submit

```typescript
              ) : modalTab === 'review' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Review & Submit</h3>

                  {/* Summary */}
                  <div className="space-y-4 mb-6">
                    {/* Stock Changes Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Stock Changes</h4>
                      {verificationProductData.map((product) => product.skus.map((sku) => {
                        const lastStock = sku.openingStock || 0;
                        const newStock = skuQuantities[sku.skuCode] || sku.currentStock;
                        const difference = lastStock - newStock;

                        if (difference === 0) return null;

                        return (
                          <div key={sku.skuCode} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                            <span className="text-gray-700">{product.productName} - {sku.name}</span>
                            <span className="font-semibold text-gray-900">
                              {lastStock} → {newStock} ({difference > 0 ? '-' : '+'}{Math.abs(difference)})
                            </span>
                          </div>
                        );
                      }))}
                    </div>

                    {/* Distribution Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Sold to Farmers:</span>
                          <span className="font-semibold text-blue-900">{soldToFarmers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Sold to Retailers:</span>
                          <span className="font-semibold text-blue-900">{soldToRetailers}</span>
                        </div>
                      </div>
                    </div>

                    {/* Retailer Allocations */}
                    {retailerAllocations.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">Retailer Allocations</h4>
                        <div className="space-y-2">
                          {retailerAllocations.map((allocation, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-green-200 last:border-0">
                              <span className="text-green-700">{allocation.retailerName}</span>
                              <span className="font-semibold text-green-900">{allocation.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proofs Summary */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-3">Verification Documents</h4>
                      <div className="text-purple-700">
                        <p>{uploadedProofs.length} proof document{uploadedProofs.length !== 1 ? 's' : ''} uploaded</p>
                        <p className="mt-1">E-signature captured</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <button
                      onClick={() => setModalTab('proof')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitProof}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Verification</span>
                    </button>
                  </div>
                </>
              )}
```

## Validation Messages (Grammar-Checked)

### Verification Step
- ✅ "Perfect! All stock movements are accounted for."
- ⚠️ "Remaining balance to allocate: X units"
- ❌ "Error: Total allocated (X) exceeds stock difference (Y)"
- 🚫 "Please ensure all stock movements are properly allocated before proceeding."

### Allocation Step
- 🚫 "Please allocate exactly X units to retailers. Currently allocated: Y"
- 🚫 "Please select a retailer and enter quantity for all rows, or remove empty rows."
- ✅ "Complete"

### Proof Step
- ❌ "Proof Required: For retailer movements, at least one proof and e-signature are required."
- 🚫 "Please upload at least one proof document and provide an e-signature for retailer stock movements."

## Reset Function

Add function to reset workflow:

```typescript
const resetVerificationWorkflow = () => {
  setSoldToFarmers(0);
  setSoldToRetailers(0);
  setRetailerAllocations([]);
  setUploadedProofs([]);
  setVerificationLetter(null);
  setModalTab('details');
};
```

Call this when modal closes or after successful submission.
