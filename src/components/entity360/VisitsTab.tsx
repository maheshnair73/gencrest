import React from 'react';
import { User } from 'lucide-react';

export const VisitsTab: React.FC = () => {
  return (
    <div className="p-3 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Visit History</h3>
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Product Demo</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Product demonstration and stock review</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>Jul 4, 2024</span>
                <span>10:30 AM</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Scheduled</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <User className="w-4 h-4" />
              <span>Assigned to: Rajesh Kumar</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Routine Check</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Monthly stock verification and order collection</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>Jun 10, 2024</span>
                <span>3:00 PM</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Completed</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <User className="w-4 h-4" />
              <span>Completed by: Rajesh Kumar</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">New Product Launch</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Introduction of new pesticide products</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>May 22, 2024</span>
                <span>11:15 AM</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Completed</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <User className="w-4 h-4" />
              <span>Completed by: Rajesh Kumar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
