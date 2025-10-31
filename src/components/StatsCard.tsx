import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow card-hover transition-all duration-200 hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs sm:text-sm text-gray-600">{subtitle}</div>
      </div>
    </div>
  );
};

export default StatsCard;