import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface MobileHomeTabProps {
  liveMeetingsExpanded: boolean;
  setLiveMeetingsExpanded: (value: boolean) => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  liveMeetingsExpanded,
  setLiveMeetingsExpanded,
}) => {
  return (
    <div className="flex-1 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
          <h3 className="text-xs font-medium opacity-90">Team Members</h3>
          <div className="text-2xl font-bold mt-1">4</div>
          <p className="text-xs opacity-75">MDOs under TSM</p>
          <p className="text-xs opacity-75">All active today</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3 text-white">
          <h3 className="text-xs font-medium opacity-90">Activities Done</h3>
          <div className="text-2xl font-bold mt-1">1374</div>
          <p className="text-xs opacity-75">out of 1620 planned</p>
          <p className="text-xs opacity-75">85% Achievement Rate</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 border border-gray-200">
        <div
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-1 px-1 py-1 rounded-lg transition-colors"
          onClick={() => setLiveMeetingsExpanded(!liveMeetingsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">Live Meetings</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <span className="text-sm font-medium">2 Active</span>
            {liveMeetingsExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {liveMeetingsExpanded && (
          <div className="space-y-2 mt-2">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Rajesh Kumar</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">25 min</div>
                  <div className="text-xs text-gray-500">Started 10:45 AM</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Meeting ended');
                    }}
                    className="mt-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <p>Ram Kumar Farm</p>
                <p>Green Valley, Sector 12</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Amit Singh</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">15 min</div>
                  <div className="text-xs text-gray-500">Started 11:20 AM</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Meeting ended');
                    }}
                    className="mt-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <p>Suresh Traders</p>
                <p>Market Area, Sector 8</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
