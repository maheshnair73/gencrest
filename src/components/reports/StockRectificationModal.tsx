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
  console.log('[StockRectificationModal] Render called with:', { isOpen, hasStockData: !!stockData });

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

  if (!isOpen) {
    console.log('[StockRectificationModal] Not rendering - isOpen is false');
    return null;
  }

  if (!stockData) {
    console.error('[StockRectificationModal] Not rendering - stockData is null');
    return null;
  }

  console.log('[StockRectificationModal] Rendering modal with stockData:', stockData);

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
    if (!adjustmentUnits || parseFloat(adjustmentUnits) === 0) {
      alert('Please enter adjustment quantity');
      return;
    }

    if (!notes.trim()) {
      alert('Please enter reason for adjustment');
      return;
    }

    onSubmit({
      adjustment_type: adjustmentType,
      adjustment_value: adjustmentValue,
      adjustment_units: parseFloat(adjustmentUnits),
      reason: notes.trim(),
      source_destination: '-',
      notes: notes.trim(),
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
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Rectify Stock</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Info */}
          <div className="text-sm">
            <div className="font-semibold text-gray-900">{stockData.customer_name}</div>
            <div className="text-xs text-gray-600">{stockData.product_name} - {stockData.sku_name}</div>
          </div>

          {/* Last Updated Stock + Modify */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">Last Updated Stock</label>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-900">
                {stockData.current_balance_units.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">{stockData.unit || 'units'}</div>
              <div className="flex-1"></div>
              <div className="text-sm text-gray-600">Modify</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('decrease')}
                  className={`w-8 h-8 flex items-center justify-center rounded border-2 transition-all ${
                    adjustmentType === 'decrease'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step="1"
                  value={adjustmentUnits}
                  onChange={(e) => setAdjustmentUnits(e.target.value)}
                  placeholder="0"
                  className="w-20 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setAdjustmentType('increase')}
                  className={`w-8 h-8 flex items-center justify-center rounded border-2 transition-all ${
                    adjustmentType === 'increase'
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {adjustmentUnits && (
              <div className="mt-2 text-sm text-gray-600">
                New Stock: <span className="font-semibold text-gray-900">{newBalanceUnits.toFixed(0)} {stockData.unit || 'units'}</span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">Reason (Enter Remarks)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Enter reason for stock adjustment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Send for Approval
          </button>
        </div>
      </div>
    </div>
  );
};
