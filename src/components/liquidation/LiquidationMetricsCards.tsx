import React from 'react';
import { Package, TrendingUp, Droplets, Target, Users, Store } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  color: string;
  dateLabel?: string;
  onViewDetails?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  color,
  dateLabel,
  onViewDetails
}) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      {dateLabel && <p className="text-xs text-orange-600 mb-2">{dateLabel}</p>}
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subValue}</p>
      {/* {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View Details
        </button>
      )} */}
    </div>
  </div>
);

interface Metrics {
  openingStock: { volume: number; value: number };
  ytdNetSales: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
  lastUpdated: string;
  totalDistributors?: number;
  totalRetailers?: number;
  totalMDOs?: number;
}

interface LiquidationMetricsCardsProps {
  metrics: Metrics;
  onViewDetails: (metric: string) => void;
}

export const LiquidationMetricsCards: React.FC<LiquidationMetricsCardsProps> = ({
  metrics,
  onViewDetails
}) => {
  // Defensive check - if metrics is undefined or null, don't render
  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
      return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(2)}K`;
    }
    return `${sign}₹${absValue.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    // if (volume >= 1000) {
    //   return `${(volume / 1000).toFixed(2)} Tons`;
    // }
    return `${volume.toFixed(2)} Kg/Ltr`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-orange-700 font-medium mb-1">Total Opening Stock</p>
              <p className="text-xl font-bold text-orange-900">{formatCurrency(metrics.openingStock.value)}</p>
              <p className="text-xs text-orange-600 mt-1">{formatVolume(metrics.openingStock.volume)}</p>
            </div>
            <div className="p-2 bg-orange-200 rounded-lg">
              <Package className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Total YTD Sales</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(metrics.ytdNetSales.value)}</p>
              <p className="text-xs text-blue-600 mt-1">{formatVolume(metrics.ytdNetSales.volume)}</p>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Total Liquidation</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(metrics.liquidation.value)}</p>
              <p className="text-xs text-green-600 mt-1">{formatVolume(metrics.liquidation.volume)}</p>
            </div>
            <div className="p-2 bg-green-200 rounded-lg">
              <Package className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-purple-700 font-medium mb-1">Total Balance Stock</p>
              <p className="text-xl font-bold text-purple-900">{formatCurrency(metrics.balanceStock.value)}</p>
              <p className="text-xs text-purple-600 mt-1">{formatVolume(metrics.balanceStock.volume)}</p>
            </div>
            <div className="p-2 bg-purple-200 rounded-lg">
              <Package className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
