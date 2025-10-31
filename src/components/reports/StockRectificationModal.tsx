import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, AlertCircle, ChevronDown } from 'lucide-react';

interface StockRectificationData {
  customer_name: string;
  customer_code: string;
  product_name: string;
  sku_name: string;
  current_balance: number;
  current_balance_units: number;
  unit: string;
}

interface StockRectificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: StockRectificationData | null;
  onSubmit: (data: RectificationSubmission) => void;
}

export interface RectificationSubmission {
  adjustment_type: 'increase' | 'decrease';
  adjustment_value: number;
  adjustment_units: number;
  reason: string;
  source_destination: string;
  notes: string;
  new_balance_value: number;
  new_balance_units: number;
}

export const StockRectificationModal: React.FC<StockRectificationModalProps> = ({
  isOpen,
  onClose,
  stockData,
  onSubmit
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('decrease');
  const [adjustmentUnits, setAdjustmentUnits] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [sourceDestination, setSourceDestination] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowReasonDropdown(false);
      }
    };

    if (showReasonDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReasonDropdown]);

  const handleClose = () => {
    setAdjustmentType('decrease');
    setAdjustmentUnits('');
    setReason('');
    setSourceDestination('');
    setNotes('');
    setShowReasonDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  if (!stockData) {
    console.error('[StockRectificationModal] stockData is null');
    return null;
  }

  console.log('[StockRectificationModal] stockData:', stockData);

  // Calculate unit to value ratio, handle edge cases
  const unitToValueRatio = stockData.current_balance_units > 0
    ? stockData.current_balance / stockData.current_balance_units
    : 5000;

  const newBalanceUnits = adjustmentType === 'increase'
    ? stockData.current_balance_units + (parseFloat(adjustmentUnits) || 0)
    : stockData.current_balance_units - (parseFloat(adjustmentUnits) || 0);

  const adjustmentValue = (parseFloat(adjustmentUnits) || 0) * unitToValueRatio;
  const newBalanceValue = newBalanceUnits * unitToValueRatio;

  const reasonOptions = adjustmentType === 'increase'
    ? [
        'Received from warehouse',
        'Received from another distributor',
        'Opening stock correction',
        'Return from retailer',
        'Inventory count adjustment',
        'Other'
      ]
    : [
        'Sold to farmer',
        'Sold to retailer',
        'Transferred to another distributor',
        'Damaged/Expired stock',
        'Inventory count adjustment',
        'Other'
      ];

  const handleSubmit = () => {
    if (!adjustmentUnits || !reason || !sourceDestination) {
      alert('Please fill all required fields');
      return;
    }

    onSubmit({
      adjustment_type: adjustmentType,
      adjustment_value: adjustmentValue,
      adjustment_units: parseFloat(adjustmentUnits),
      reason,
      source_destination: sourceDestination,
      notes,
      new_balance_value: newBalanceValue,
      new_balance_units: newBalanceUnits
    });

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">Rectify Current Stock</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stock Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Customer:</span>
                <div className="text-gray-900 font-semibold">{stockData.customer_name}</div>
                <div className="text-xs text-gray-500">{stockData.customer_code}</div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Product:</span>
                <div className="text-gray-900">{stockData.product_name}</div>
                <div className="text-xs text-gray-500">{stockData.sku_name}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="text-gray-600 font-medium">Current Balance:</span>
              <div className="flex items-center gap-4 mt-1">
                <div className="text-lg font-bold text-blue-600">
                  ₹{(stockData.current_balance / 100000).toFixed(2)}L
                </div>
                <div className="text-lg font-bold text-gray-700">
                  {stockData.current_balance_units.toFixed(2)} {stockData.unit || 'units'}
                </div>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('increase');
                  setReason('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'increase'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Increase Stock</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('decrease');
                  setReason('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'decrease'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Minus className="w-5 h-5" />
                <span className="font-semibold">Decrease Stock</span>
              </button>
            </div>
          </div>

          {/* Adjustment Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Adjustment Quantity ({stockData.unit || 'units'}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={adjustmentUnits}
              onChange={(e) => setAdjustmentUnits(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReasonDropdown(!showReasonDropdown);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
              >
                <span className={reason ? 'text-gray-900' : 'text-gray-400'}>
                  {reason || 'Select reason'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showReasonDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {reasonOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setReason(option);
                        setShowReasonDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Source/Destination */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {adjustmentType === 'increase' ? 'Source (From where)' : 'Destination (Sold to / Transferred to)'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sourceDestination}
              onChange={(e) => setSourceDestination(e.target.value)}
              placeholder={adjustmentType === 'increase' ? 'e.g., Main Warehouse, Delhi' : 'e.g., Farmer Name or Retailer Name'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional details or comments..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* New Balance Preview */}
          {adjustmentUnits && (
            <div className={`border-2 rounded-lg p-4 ${
              adjustmentType === 'increase' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  adjustmentType === 'increase' ? 'text-green-600' : 'text-orange-600'
                }`} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">New Balance After Adjustment</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <div className="text-xs text-gray-600">Value</div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{(newBalanceValue / 100000).toFixed(2)}L
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Volume</div>
                      <div className="text-lg font-bold text-gray-900">
                        {newBalanceUnits.toFixed(2)} {stockData.unit || 'units'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={adjustmentType === 'increase' ? 'text-green-700' : 'text-orange-700'}>
                      {adjustmentType === 'increase' ? '+' : '-'}
                      {adjustmentUnits} {stockData.unit || 'units'} ({adjustmentType === 'increase' ? '+' : '-'}₹{(adjustmentValue / 100000).toFixed(2)}L)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <span className="font-semibold">Important:</span> This stock adjustment will be sent for approval.
                The system will not update the stock until it is approved by RMM/RBH/ZBH.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};
