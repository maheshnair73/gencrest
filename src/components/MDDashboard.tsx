import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LiveMeetings from './LiveMeetings';
import { TeamPerformance } from './TeamPerformance';
import {
  Users,
  Target,
  TrendingUp,
  BarChart3,
  ArrowUp,
  ChevronRight,
  Crown,
  DollarSign,
  Award,
  Building,
  Globe
} from 'lucide-react';

const MDDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Rajesh Mehta',
      participantRole: 'VP',
      location: 'Board Meeting',
      address: 'Head Office, Mumbai',
      startTime: '02:00 PM',
      duration: 180,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 98765 43210',
      notes: 'Quarterly board review'
    }
  ]);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = {
    totalEmployees: 250,
    totalZBHs: 5,
    totalRBHs: 15,
    totalTSMs: 45,
    totalMDOs: 180,
    ytdRevenue: { target: 50000, achieved: 42500, percentage: 85 },
    profitMargin: 18.5,
    customerSatisfaction: 4.5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90">Managing Director</p>
            <p className="text-white/80 text-sm mt-1">Executive Overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
          <p className="text-xs text-gray-500 mt-2">Across all India</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">YTD Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{stats.ytdRevenue.percentage}%</p>
          <p className="text-xs text-gray-500 mt-2">₹{stats.ytdRevenue.achieved}L / ₹{stats.ytdRevenue.target}L</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
          <p className="text-3xl font-bold text-gray-900">{stats.profitMargin}%</p>
          <p className="text-xs text-gray-500 mt-2">EBITDA margin</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
          <p className="text-3xl font-bold text-gray-900">{stats.customerSatisfaction}/5</p>
          <p className="text-xs text-gray-500 mt-2">Average rating</p>
        </div>
      </div>

      {/* Team Structure & Performance */}
      <TeamPerformance />

      {/* Live Meetings */}
      <LiveMeetings
        meetings={liveMeetings}
        onEndMeeting={handleEndMeeting}
        userRole={user?.role || 'MD'}
        currentUserId={user?.id}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/reports')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Executive Reports</h4>
          <p className="text-sm text-gray-600">Comprehensive insights</p>
        </button>

        <button
          onClick={() => navigate('/liquidation')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Operations</h4>
          <p className="text-sm text-gray-600">View all operations</p>
        </button>

        <button
          onClick={() => navigate('/user-management')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">User Management</h4>
          <p className="text-sm text-gray-600">Manage team</p>
        </button>
      </div>
    </div>
  );
};

export default MDDashboard;
