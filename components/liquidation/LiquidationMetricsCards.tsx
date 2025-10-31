import React from 'react';
import { Package, TrendingUp, Droplets, Target } from 'lucide-react';

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
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View Details
        </button>
      )}
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
}

interface LiquidationMetricsCardsProps {
  metrics: Metrics;
  onViewDetails: (metric: string) => void;
}

export const LiquidationMetricsCards: React.FC<LiquidationMetricsCardsProps> = ({
  metrics,
  onViewDetails
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    }
    return `₹${value.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)} Tons`;
    }
    return `${volume.toFixed(2)} Kg/Ltr`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Opening Stock"
          value={formatCurrency(metrics.openingStock.value)}
          subValue={formatVolume(metrics.openingStock.volume)}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          color="border-orange-500"
          dateLabel={`As on ${formatDate(metrics.lastUpdated)}`}
          onViewDetails={() => onViewDetails('openingStock')}
        />

        <MetricCard
          title="YTD Net Sales"
          value={formatCurrency(metrics.ytdNetSales.value)}
          subValue={formatVolume(metrics.ytdNetSales.volume)}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          color="border-blue-500"
          onViewDetails={() => onViewDetails('ytdNetSales')}
        />

        <MetricCard
          title="Liquidation"
          value={formatCurrency(metrics.liquidation.value)}
          subValue={formatVolume(metrics.liquidation.volume)}
          icon={<Droplets className="w-6 h-6 text-green-600" />}
          color="border-green-500"
          onViewDetails={() => onViewDetails('liquidation')}
        />

        <MetricCard
          title="Balance Stock"
          value={formatCurrency(metrics.balanceStock.value)}
          subValue={formatVolume(metrics.balanceStock.volume)}
          icon={<Target className="w-6 h-6 text-purple-600" />}
          color="border-purple-500"
          onViewDetails={() => onViewDetails('balanceStock')}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Liquidation Rate</h3>
          <span className="text-2xl font-bold text-green-600">{metrics.liquidationPercentage}%</span>
        </div>
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(metrics.liquidationPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0%</span>
          <span>Target: 50%</span>
          <span>100%</span>
        </div>
      </div>
    </>
  );
};
