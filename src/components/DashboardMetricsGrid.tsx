import React from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  BarChart3,
  Building,
  Activity
} from 'lucide-react';

interface DashboardMetricsGridProps {
  distributorCount: number;
  ytdSales: number;
  ytdOpeningStock: number;
  ytdLiquidation: number;
  totalOS: number;
  totalOverdue: number;
  totalBlockedParties: number;
}

const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({
  distributorCount,
  ytdSales,
  ytdOpeningStock,
  ytdLiquidation,
  totalOS,
  totalOverdue,
  totalBlockedParties
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">No of Distributors</h4>
        <div className="text-2xl font-bold text-gray-900">{distributorCount}</div>
        <div className="text-xs text-gray-500 mt-1">Active distributors</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">YTD Sales</h4>
        <div className="text-2xl font-bold text-gray-900">₹{(ytdSales / 100000).toFixed(2)}L</div>
        <div className="text-xs text-gray-500 mt-1">Year to date sales</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-orange-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">YTD Opening Stock</h4>
        <div className="text-2xl font-bold text-gray-900">₹{(ytdOpeningStock / 100000).toFixed(2)}L</div>
        <div className="text-xs text-gray-500 mt-1">Opening inventory</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">YTD Liquidation</h4>
        <div className="text-2xl font-bold text-gray-900">₹{(ytdLiquidation / 100000).toFixed(2)}L</div>
        <div className="text-xs text-gray-500 mt-1">Total liquidated</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-red-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Total O/S</h4>
        <div className="text-2xl font-bold text-gray-900">₹{(totalOS / 100000).toFixed(2)}L</div>
        <div className="text-xs text-gray-500 mt-1">Outstanding amount</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Total Overdue</h4>
        <div className="text-2xl font-bold text-gray-900">₹{(totalOverdue / 100000).toFixed(2)}L</div>
        <div className="text-xs text-gray-500 mt-1">Overdue payments</div>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow border-l-4 border-gray-500">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Total Blocked Parties</h4>
        <div className="text-2xl font-bold text-gray-900">{totalBlockedParties}</div>
        <div className="text-xs text-gray-500 mt-1">Blocked distributors</div>
      </div>
    </div>
  );
};

export default DashboardMetricsGrid;
