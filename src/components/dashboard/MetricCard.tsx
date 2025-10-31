import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  value,
  label,
  trend,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100'
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-xs sm:text-sm font-medium ${getTrendColor()}`}>
              {trend.percentage}%
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {value}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
};
