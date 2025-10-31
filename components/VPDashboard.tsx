import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LiveMeetings from './LiveMeetings';
import {
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  BarChart3,
  ArrowUp,
  ChevronRight,
  Crown,
  DollarSign,
  Building,
  Award,
  Briefcase
} from 'lucide-react';

const VPDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Suresh Iyer',
      participantRole: 'ZBH',
      location: 'Executive Strategy Review',
      address: 'Head Office, Mumbai',
      startTime: '10:00 AM',
      duration: 120,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 98765 43210',
      notes: 'Annual strategic planning session'
    }
  ]);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = {
    totalZones: 5,
    totalZBHs: 5,
    totalRBHs: 15,
    totalTSMs: 45,
    totalMDOs: 180,
    ytdRevenue: { target: 50000, achieved: 42500, percentage: 85 },
    liquidation: 68,
    pendingApprovals: 12
  };

  const teamPerformance = [
    {
      role: 'ZBH',
      count: 5,
      avgPerformance: 82,
      topPerformer: 'Suresh Iyer',
      topPerformance: 92
    },
    {
      role: 'RBH',
      count: 15,
      avgPerformance: 78,
      topPerformer: 'Amit Patel',
      topPerformance: 89
    },
    {
      role: 'TSM',
      count: 45,
      avgPerformance: 75,
      topPerformer: 'Rajesh Kumar',
      topPerformance: 88
    },
    {
      role: 'MDO',
      count: 180,
      avgPerformance: 72,
      topPerformer: 'Vikram Singh',
      topPerformance: 91
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90">VP - Sales & Marketing</p>
            <p className="text-white/80 text-sm mt-1">All India Operations</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.pendingApprovals}</div>
            <div className="text-white/90 text-sm">Pending Approvals</div>
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
          <p className="text-sm text-gray-600 mb-1">Total Team</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMDOs}</p>
          <p className="text-xs text-gray-500 mt-2">Across {stats.totalZones} zones</p>
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
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Liquidation</p>
          <p className="text-3xl font-bold text-gray-900">{stats.liquidation}%</p>
          <p className="text-xs text-gray-500 mt-2">All India average</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
          <p className="text-xs text-gray-500 mt-2">Require attention</p>
        </div>
      </div>

      {/* Team Structure & Performance */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Structure & Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {teamPerformance.map((team) => (
            <div key={team.role} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{team.role}</h4>
                  <p className="text-2xl font-bold text-blue-600">{team.count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Average Performance</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${team.avgPerformance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{team.avgPerformance}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600">Top Performer</p>
                  <p className="text-sm font-medium text-gray-900">{team.topPerformer}</p>
                  <p className="text-xs text-green-600 font-semibold">{team.topPerformance}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Meetings */}
      <LiveMeetings
        meetings={liveMeetings}
        onEndMeeting={handleEndMeeting}
        userRole={user?.role || 'VP_SM'}
        currentUserId={user?.id}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <h4 className="font-semibold text-gray-900 mb-1">Liquidation Report</h4>
          <p className="text-sm text-gray-600">All India metrics</p>
        </button>

        <button
          onClick={() => navigate('/approvals')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Approvals</h4>
          <p className="text-sm text-gray-600">Manage approvals</p>
        </button>

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
          <p className="text-sm text-gray-600">Strategic insights</p>
        </button>
      </div>
    </div>
  );
};

export default VPDashboard;
