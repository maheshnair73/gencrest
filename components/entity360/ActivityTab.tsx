import React from 'react';
import { Calendar, CheckCircle, Package, Wallet } from 'lucide-react';

export const ActivityTab: React.FC = () => {
  return (
    <div className="p-3 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">360° Activity Timeline</h3>
      <p className="text-sm text-gray-600 mb-6">Complete chronological history of all interactions</p>

      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Visit: Product Demo</h4>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Scheduled</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Product demonstration and stock review</p>
              <p className="text-xs text-gray-500 mt-2">Jul 4, 2024 • 10:30 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Payment Received</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Completed</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">₹50,000 received via NEFT</p>
              <p className="text-xs text-gray-500 mt-2">Jun 28, 2024 • 2:15 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Order Delivered</h4>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Completed</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Order #ORD-2024-001 • 500 units</p>
              <p className="text-xs text-gray-500 mt-2">Jun 15, 2024 • 11:00 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Liquidation Verified</h4>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded">Verified</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">LIQ-2024-001 • 250 units • E-Signature</p>
              <p className="text-xs text-gray-500 mt-2">Jun 10, 2024 • 2:30 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Wallet className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Advance Payment</h4>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">Applied</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">₹20,000 advance for upcoming order</p>
              <p className="text-xs text-gray-500 mt-2">Jun 1, 2024 • 11:30 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Visit: Routine Check</h4>
                <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded">Completed</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Monthly stock verification and order collection</p>
              <p className="text-xs text-gray-500 mt-2">May 20, 2024 • 3:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
