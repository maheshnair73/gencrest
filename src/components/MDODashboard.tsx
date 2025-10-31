import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LiveMeetings from './LiveMeetings';
import DashboardMetricsGrid from './DashboardMetricsGrid';
import { MOCK_LIVE_MEETINGS, MOCK_DASHBOARD_STATS, type LiveMeeting } from '../data/mockData';
import {
  MapPin,
  CheckCircle,
  ChevronRight,
  Activity,
  Package,
  Building,
  Navigation,
  Store,
  Droplets,
  LayoutGrid,
  Calendar,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

const MDODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'overview' | 'meetings' | 'activities' | 'approvals'>('overview');
  const [activitiesSubTab, setActivitiesSubTab] = useState<'my' | 'team'>('my');
  const [liveMeetings, setLiveMeetings] = useState<LiveMeeting[]>(MOCK_LIVE_MEETINGS);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = MOCK_DASHBOARD_STATS;

  const renderOverview = () => (
    <>
      <DashboardMetricsGrid
        distributorCount={12}
        ytdSales={4275000}
        ytdOpeningStock={2850000}
        ytdLiquidation={3562500}
        totalOS={3160000}
        totalOverdue={632000}
        totalBlockedParties={1}
      />

      {/* Liquidation Summary */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Liquidation Summary</h3>
          <button
            onClick={() => navigate('/liquidation')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                <p className="text-xl font-bold text-green-900">₹8.10L</p>
                <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Droplets className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Package className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/field-visits')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Field Visits</h4>
          <p className="text-sm text-gray-600">Manage your visits</p>
        </button>

        <button
          onClick={() => navigate('/liquidation')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Stock Liquidation</h4>
          <p className="text-sm text-gray-600">Track inventory</p>
        </button>

        <button
          onClick={() => navigate('/contacts')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Contacts</h4>
          <p className="text-sm text-gray-600">Manage dealers & farmers</p>
        </button>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold truncate">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90 text-sm sm:text-base">Market Development Officer</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Dashboard</p>
            <p className="text-white/80 text-xs sm:text-sm">{user?.territory || 'Territory'}</p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 text-left sm:text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold">{stats.pendingApprovals}</div>
            <div className="text-white/90 text-xs sm:text-sm whitespace-nowrap">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedView('overview')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
              selectedView === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('meetings')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
              selectedView === 'meetings'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Meetings
          </button>
          <button
            onClick={() => setSelectedView('activities')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
              selectedView === 'activities'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            Activities
          </button>
          <button
            onClick={() => setSelectedView('approvals')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
              selectedView === 'approvals'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approvals
            {stats.pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'meetings' && (
        <div className="bg-white rounded-xl card-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Meetings</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Live Meetings:</span>
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                  {liveMeetings.length}
                </span>
              </div>
            </div>
          </div>
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Meetings</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>
      )}
      {selectedView === 'activities' && (
        <div className="bg-white rounded-xl card-shadow">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActivitiesSubTab('my')}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activitiesSubTab === 'my'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                My Activities
              </button>
              <button
                onClick={() => setActivitiesSubTab('team')}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activitiesSubTab === 'team'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Team Activities
              </button>
            </div>
          </div>
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activitiesSubTab === 'my' ? 'My Activities' : 'Team Activities'}
            </h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>
      )}
      {selectedView === 'approvals' && (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Approvals</h3>
          <p className="text-gray-600">Coming Soon</p>
        </div>
      )}
    </div>
  );
};

export default MDODashboard;
