import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LiveMeetings from './LiveMeetings';
import { MOCK_LIVE_MEETINGS, MOCK_DASHBOARD_STATS, type LiveMeeting } from '../data/mockData';
import {
  Users,
  Target,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  ArrowUp,
  ChevronRight,
  Activity,
  Package,
  Building,
  Navigation
} from 'lucide-react';

const MDODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveMeetings, setLiveMeetings] = useState<LiveMeeting[]>(MOCK_LIVE_MEETINGS);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = MOCK_DASHBOARD_STATS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90">Market Development Officer Dashboard</p>
            <p className="text-white/80 text-sm mt-1">{user?.territory || 'Territory'}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Visits</p>
          <p className="text-3xl font-bold text-gray-900">{stats.todayVisits.completed}/{stats.todayVisits.planned}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.todayVisits.pending} pending</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Monthly Target</p>
          <p className="text-3xl font-bold text-gray-900">{stats.monthlyTarget.percentage}%</p>
          <p className="text-xs text-gray-500 mt-2">{stats.monthlyTarget.achieved}/{stats.monthlyTarget.target} visits</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">YTD Performance</p>
          <p className="text-3xl font-bold text-gray-900">{stats.ytdPerformance}%</p>
          <p className="text-xs text-gray-500 mt-2">Year to date</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
          <p className="text-xs text-gray-500 mt-2">Require attention</p>
        </div>
      </div>

      {/* Live Meetings */}
      <LiveMeetings
        meetings={liveMeetings}
        onEndMeeting={handleEndMeeting}
        userRole={user?.role || 'MDO'}
        currentUserId={user?.id}
      />

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
    </div>
  );
};

export default MDODashboard;
