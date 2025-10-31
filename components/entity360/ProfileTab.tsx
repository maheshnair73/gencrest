import React from 'react';
import { CreditCard, ShoppingCart, Package, DollarSign, User, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';

interface ProfileTabProps {
  entity: any;
  sampleData: {
    creditLimit: number;
    totalPurchases: number;
    balanceCredit: number;
    totalPayments: number;
    contactPerson: string;
    primaryPhone: string;
    email: string;
    address: string;
    gstNumber: string;
    panNumber: string;
    assignedMDO: string;
    ageing: {
      days0_30: number;
      days31_60: number;
      days61_90: number;
      days91Plus: number;
    };
    liquidationProgress: number;
    creditUtilization: number;
  };
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ entity, sampleData }) => {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">Total Credit Limit</h4>
          <div className="text-lg sm:text-2xl font-bold text-blue-900">₹{sampleData.creditLimit}L</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h4 className="text-xs sm:text-sm font-medium text-green-800 mb-1">Total Purchases</h4>
          <div className="text-lg sm:text-2xl font-bold text-green-900">₹{sampleData.totalPurchases}L</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <h4 className="text-xs sm:text-sm font-medium text-purple-800 mb-1">Balance Credit Limit</h4>
          <div className="text-lg sm:text-2xl font-bold text-purple-900">₹{sampleData.balanceCredit}L</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          </div>
          <h4 className="text-xs sm:text-sm font-medium text-orange-800 mb-1">Total Payments</h4>
          <div className="text-lg sm:text-2xl font-bold text-orange-900">₹{sampleData.totalPayments}L</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Contact Person</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{sampleData.contactPerson}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Primary Phone</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{sampleData.primaryPhone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{sampleData.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{sampleData.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Territory:</span>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{entity.territory}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">GST Number:</span>
              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{sampleData.gstNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">PAN Number:</span>
              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{sampleData.panNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Assigned MDO:</span>
              <span className="font-semibold text-blue-900 text-xs sm:text-sm">{sampleData.assignedMDO}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ageing Analysis</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">₹{sampleData.ageing.days0_30 / 1000}K</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">0-30 Days</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">₹{sampleData.ageing.days31_60 / 1000}K</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">31-60 Days</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">₹{sampleData.ageing.days61_90 / 1000}K</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">61-90 Days</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">₹{sampleData.ageing.days91Plus / 1000}K</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">91+ Days</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base font-medium text-gray-700">Liquidation Progress</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">{sampleData.liquidationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className="h-3 sm:h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${sampleData.liquidationProgress}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base font-medium text-gray-700">Credit Utilization</span>
              <span className="text-lg sm:text-xl font-bold text-green-600">{sampleData.creditUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className="h-3 sm:h-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                style={{ width: `${sampleData.creditUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
