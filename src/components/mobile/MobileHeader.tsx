import React from 'react';
import { ChevronDown, ChevronUp, Play, Square } from 'lucide-react';

interface MobileHeaderProps {
  userName: string;
  userRole: string;
  region: string;
  monthlyPlanExpanded: boolean;
  setMonthlyPlanExpanded: (value: boolean) => void;
  dayStarted: boolean;
  onStartDay: () => void;
  onEndDay: () => void;
  startTime: Date | null;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  userName,
  userRole,
  region,
  monthlyPlanExpanded,
  setMonthlyPlanExpanded,
  dayStarted,
  onStartDay,
  onEndDay,
  startTime,
}) => {
  const getElapsedTime = () => {
    if (!startTime) return '0h 0m';
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'SK'}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-sm">{userName.split(' ')[0]}</h2>
            <p className="text-xs opacity-90">{userName.split(' ').slice(1).join(' ')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium opacity-90">{userRole}</p>
          <p className="text-[10px] opacity-75">{region}</p>
        </div>
      </div>

      <div className="bg-white bg-opacity-20 rounded-lg p-2 mb-2 border border-white border-opacity-30">
        <button
          onClick={() => setMonthlyPlanExpanded(!monthlyPlanExpanded)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-xs font-medium">Monthly Plan Overview</span>
          {monthlyPlanExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {monthlyPlanExpanded && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="bg-white bg-opacity-10 rounded p-1.5">
              <div className="text-[10px] opacity-75">Target</div>
              <div className="text-sm font-bold">1620</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded p-1.5">
              <div className="text-[10px] opacity-75">Done</div>
              <div className="text-sm font-bold">1374</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded p-1.5">
              <div className="text-[10px] opacity-75">Rate</div>
              <div className="text-sm font-bold">85%</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white bg-opacity-20 rounded-lg p-2 border border-white border-opacity-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {dayStarted ? (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            )}
            <span className="text-xs font-medium">
              {dayStarted ? `Day Active - ${getElapsedTime()}` : 'Day Not Started'}
            </span>
          </div>
          {!dayStarted ? (
            <button
              onClick={onStartDay}
              className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>Start Day</span>
            </button>
          ) : (
            <button
              onClick={onEndDay}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Square className="w-3 h-3" />
              <span>End Day</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
