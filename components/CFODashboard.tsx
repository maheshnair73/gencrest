import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LiveMeetings from './LiveMeetings';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Wallet,
  CreditCard,
  PieChart,
  FileText
} from 'lucide-react';

const CFODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Suresh Kumar',
      participantRole: 'Finance Manager',
      location: 'Financial Review Meeting',
      address: 'Head Office, Mumbai',
      startTime: '10:30 AM',
      duration: 90,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 98765 43210',
      notes: 'Q2 financial performance review'
    }
  ]);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = {
    revenue: { current: 42500, previous: 38200, change: 11.3 },
    expenses: { current: 28600, previous: 26800, change: 6.7 },
    profit: { current: 13900, previous: 11400, change: 21.9 },
    cashFlow: { current: 18500, previous: 16200, change: 14.2 },
    totalZBHs: 5,
    totalRBHs: 15,
    totalTSMs: 45,
    totalMDOs: 180
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
              <Wallet className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90">Chief Financial Officer</p>
            <p className="text-white/80 text-sm mt-1">Financial Operations & Management</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {stats.revenue.change >= 0 ? (
              <ArrowUp className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Revenue (YTD)</p>
          <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.current}L</p>
          <p className={`text-xs mt-2 ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.revenue.change >= 0 ? '+' : ''}{stats.revenue.change}% from last period
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            {stats.expenses.change >= 0 ? (
              <ArrowUp className="w-5 h-5 text-red-600" />
            ) : (
              <ArrowDown className="w-5 h-5 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Expenses (YTD)</p>
          <p className="text-3xl font-bold text-gray-900">₹{stats.expenses.current}L</p>
          <p className={`text-xs mt-2 ${stats.expenses.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.expenses.change >= 0 ? '+' : ''}{stats.expenses.change}% from last period
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            {stats.profit.change >= 0 ? (
              <ArrowUp className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Net Profit (YTD)</p>
          <p className="text-3xl font-bold text-gray-900">₹{stats.profit.current}L</p>
          <p className={`text-xs mt-2 ${stats.profit.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.profit.change >= 0 ? '+' : ''}{stats.profit.change}% from last period
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            {stats.cashFlow.change >= 0 ? (
              <ArrowUp className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Cash Flow</p>
          <p className="text-3xl font-bold text-gray-900">₹{stats.cashFlow.current}L</p>
          <p className={`text-xs mt-2 ${stats.cashFlow.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.cashFlow.change >= 0 ? '+' : ''}{stats.cashFlow.change}% from last period
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Revenue Growth</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.revenue.change}%</p>
            <p className="text-xs text-green-700 mt-1">Quarter over Quarter</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Profit Margin</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{((stats.profit.current / stats.revenue.current) * 100).toFixed(1)}%</p>
            <p className="text-xs text-blue-700 mt-1">EBITDA Margin</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Expense Ratio</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{((stats.expenses.current / stats.revenue.current) * 100).toFixed(1)}%</p>
            <p className="text-xs text-purple-700 mt-1">Operating Expenses</p>
          </div>
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
        userRole={user?.role || 'CFO'}
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
          <h4 className="font-semibold text-gray-900 mb-1">Financial Reports</h4>
          <p className="text-sm text-gray-600">View detailed reports</p>
        </button>

        <button
          onClick={() => navigate('/approvals')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Budget Approvals</h4>
          <p className="text-sm text-gray-600">Manage budget requests</p>
        </button>

        <button
          onClick={() => navigate('/liquidation')}
          className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Financial Operations</h4>
          <p className="text-sm text-gray-600">View operations metrics</p>
        </button>
      </div>
    </div>
  );
};

export default CFODashboard;
