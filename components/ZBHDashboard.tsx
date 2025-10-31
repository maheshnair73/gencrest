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
  Shield,
  Building,
  MapPin,
  DollarSign,
  Award,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

const ZBHDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Rajesh Kumar',
      participantRole: 'RBH',
      location: 'Zonal Strategy Meeting',
      address: 'Zone Office, Chandigarh',
      startTime: '11:00 AM',
      duration: 60,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 98765 43210',
      notes: 'Quarterly zonal review - North Zone'
    }
  ]);

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const stats = {
    totalRBHs: 3,
    totalTSMs: 12,
    totalMDOs: 48,
    ytdSales: { target: 15000, achieved: 12750, percentage: 85 },
    liquidation: 72,
    pendingApprovals: 8
  };

  const regionPerformance = [
    {
      region: 'Punjab',
      rbh: 'Amit Patel',
      tsms: 4,
      mdos: 16,
      sales: { target: 5000, achieved: 4500, percentage: 90 },
      liquidation: 78,
      performance: 88
    },
    {
      region: 'Haryana',
      rbh: 'Priya Sharma',
      tsms: 4,
      mdos: 16,
      sales: { target: 5000, achieved: 4200, percentage: 84 },
      liquidation: 71,
      performance: 82
    },
    {
      region: 'Uttar Pradesh',
      rbh: 'Rajesh Kumar',
      tsms: 4,
      mdos: 16,
      sales: { target: 5000, achieved: 4050, percentage: 81 },
      liquidation: 67,
      performance: 75
    }
  ];

  const pendingApprovals = [
    {
      id: 'APR001',
      type: 'Travel Expense',
      submittedBy: 'Amit Patel',
      role: 'RBH',
      amount: 45000,
      description: 'Regional tour expenses - Punjab',
      submittedDate: '2025-10-14',
      urgency: 'high'
    },
    {
      id: 'APR002',
      type: 'Marketing Budget',
      submittedBy: 'Priya Sharma',
      role: 'RBH',
      amount: 120000,
      description: 'BTL campaign for Haryana',
      submittedDate: '2025-10-13',
      urgency: 'medium'
    },
    {
      id: 'APR003',
      type: 'Leave Request',
      submittedBy: 'Rajesh Kumar',
      role: 'RBH',
      description: 'Medical leave - 3 days',
      submittedDate: '2025-10-15',
      urgency: 'low'
    },
    {
      id: 'APR004',
      type: 'Stock Transfer',
      submittedBy: 'Suresh Iyer',
      role: 'TSM',
      description: 'Stock transfer request - 500 bags DAP',
      submittedDate: '2025-10-14',
      urgency: 'high'
    },
    {
      id: 'APR005',
      type: 'Training Budget',
      submittedBy: 'Vikram Singh',
      role: 'TSM',
      amount: 35000,
      description: 'Team training program',
      submittedDate: '2025-10-12',
      urgency: 'low'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90">Zonal Business Head Dashboard</p>
            <p className="text-white/80 text-sm mt-1">{user?.zone || 'North Zone (Punjab, Haryana, UP, J&K, HP)'}</p>
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
          <p className="text-sm text-gray-600 mb-1">Total MDOs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMDOs}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalTSMs} TSMs | {stats.totalRBHs} RBHs</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">YTD Sales</p>
          <p className="text-3xl font-bold text-gray-900">{stats.ytdSales.percentage}%</p>
          <p className="text-xs text-gray-500 mt-2">₹{stats.ytdSales.achieved}L / ₹{stats.ytdSales.target}L</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Liquidation</p>
          <p className="text-3xl font-bold text-gray-900">{stats.liquidation}%</p>
          <p className="text-xs text-gray-500 mt-2">Zone average</p>
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

      {/* Regional Performance */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance Overview</h3>
        <div className="space-y-4">
          {regionPerformance.map((region, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{region.region}</h4>
                  </div>
                  <p className="text-sm text-gray-600">RBH: {region.rbh}</p>
                  <p className="text-xs text-gray-500">{region.tsms} TSMs | {region.mdos} MDOs</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">{region.performance}%</span>
                  </div>
                  <p className="text-xs text-gray-500">Performance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-600 mb-1">YTD Sales Achievement</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${region.sales.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{region.sales.percentage}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">₹{region.sales.achieved}L / ₹{region.sales.target}L</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Liquidation Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${region.liquidation}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{region.liquidation}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inventory turnover</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
            {pendingApprovals.length} pending
          </span>
        </div>
        <div className="space-y-3">
          {pendingApprovals.slice(0, 5).map((approval) => (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">{approval.type}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getUrgencyColor(approval.urgency)}`}>
                      {approval.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{approval.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{approval.submittedBy} ({approval.role})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{approval.submittedDate}</span>
                    </span>
                    {approval.amount && (
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>₹{approval.amount.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/approvals')}
          className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          View All Approvals
        </button>
      </div>

      {/* Live Meetings */}
      <LiveMeetings
        meetings={liveMeetings}
        onEndMeeting={handleEndMeeting}
        userRole={user?.role || 'ZBH'}
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
          <p className="text-sm text-gray-600">View zonal metrics</p>
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
          <p className="text-sm text-gray-600">Manage pending approvals</p>
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
          <h4 className="font-semibold text-gray-900 mb-1">Zonal Reports</h4>
          <p className="text-sm text-gray-600">View performance reports</p>
        </button>
      </div>
    </div>
  );
};

export default ZBHDashboard;
