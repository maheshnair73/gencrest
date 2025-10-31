import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LiveMeetings from './LiveMeetings';
import {
  Users,
  Target,
  Calendar,
  MapPin,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  Search,
  ChevronRight,
  User,
  Building,
  Activity,
  Crown,
  Shield,
  FileText,
  Megaphone,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AllIndiaStats {
  totalRMMs: number;
  totalZBHs: number;
  totalRBHs: number;
  totalTSMs: number;
  totalMDOs: number;
  ytdSales: {
    target: number;
    achieved: number;
    percentage: number;
  };
  liquidation: {
    openingStock: number;
    ytdNetSales: number;
    liquidationRate: number;
  };
  marketingCampaigns: {
    active: number;
    planned: number;
    completed: number;
    budget: number;
    spent: number;
    roi: number;
  };
  pendingApprovals: number;
  averagePerformance: number;
}

interface PendingApproval {
  id: string;
  type: string;
  submittedBy: string;
  submittedByRole: string;
  region: string;
  zone: string;
  amount?: number;
  description: string;
  submittedDate: string;
  urgency: 'high' | 'medium' | 'low';
}

const MHDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'overview' | 'approvals' | 'marketing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Priya Sharma',
      participantRole: 'RMM',
      location: 'Marketing Strategy Meeting',
      address: 'Head Office, Mumbai',
      startTime: '10:30 AM',
      duration: 90,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 98765 43210',
      notes: 'National marketing campaign review'
    },
    {
      id: 'LM002',
      participantName: 'Rajesh Kumar',
      participantRole: 'ZBH',
      location: 'Budget Planning Session',
      address: 'Video Conference',
      startTime: '02:00 PM',
      duration: 45,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 87654 32109',
      notes: 'Q2 marketing budget allocation discussion'
    }
  ]);

  // All India statistics
  const allIndiaStats: AllIndiaStats = {
    totalRMMs: 4,
    totalZBHs: 5,
    totalRBHs: 15,
    totalTSMs: 45,
    totalMDOs: 180,
    ytdSales: {
      target: 50000,
      achieved: 42500,
      percentage: 85
    },
    liquidation: {
      openingStock: 8500,
      ytdNetSales: 12300,
      liquidationRate: 68
    },
    marketingCampaigns: {
      active: 8,
      planned: 5,
      completed: 12,
      budget: 15000,
      spent: 11200,
      roi: 3.2
    },
    pendingApprovals: 15,
    averagePerformance: 78
  };

  // Pending approvals data
  const pendingApprovals: PendingApproval[] = [
    {
      id: 'APR001',
      type: 'Marketing Campaign',
      submittedBy: 'Priya Sharma',
      submittedByRole: 'RMM',
      region: 'North India',
      zone: 'Zone 1',
      amount: 250000,
      description: 'Summer Festival Campaign - North Region',
      submittedDate: '2025-10-14',
      urgency: 'high'
    },
    {
      id: 'APR002',
      type: 'Budget Revision',
      submittedBy: 'Amit Patel',
      submittedByRole: 'RMM',
      region: 'West India',
      zone: 'Zone 2',
      amount: 180000,
      description: 'Q2 Marketing Budget Increase Request',
      submittedDate: '2025-10-13',
      urgency: 'high'
    },
    {
      id: 'APR003',
      type: 'Strategic Plan',
      submittedBy: 'Sunita Reddy',
      submittedByRole: 'RMM',
      region: 'South India',
      zone: 'Zone 3',
      description: 'Regional Expansion Plan - Karnataka',
      submittedDate: '2025-10-12',
      urgency: 'medium'
    },
    {
      id: 'APR004',
      type: 'Campaign ROI Report',
      submittedBy: 'Vikram Singh',
      submittedByRole: 'RMM',
      region: 'East India',
      zone: 'Zone 4',
      description: 'Monsoon Campaign Performance Analysis',
      submittedDate: '2025-10-11',
      urgency: 'medium'
    },
    {
      id: 'APR005',
      type: 'Marketing Campaign',
      submittedBy: 'Priya Sharma',
      submittedByRole: 'RMM',
      region: 'North India',
      zone: 'Zone 1',
      amount: 150000,
      description: 'Dealer Incentive Program',
      submittedDate: '2025-10-10',
      urgency: 'low'
    }
  ];

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
            <p className="text-white/90">All India Overview & Approvals</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{allIndiaStats.pendingApprovals}</div>
            <div className="text-white/90 text-sm">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedView('overview')}
            className={`flex-1 px-6 py-3 font-medium transition-all ${
              selectedView === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedView('approvals')}
            className={`flex-1 px-6 py-3 font-medium transition-all relative ${
              selectedView === 'approvals'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Approvals</span>
              {allIndiaStats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {allIndiaStats.pendingApprovals}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setSelectedView('marketing')}
            className={`flex-1 px-6 py-3 font-medium transition-all ${
              selectedView === 'marketing'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span>Marketing</span>
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Team</p>
              <p className="text-3xl font-bold text-gray-900">{allIndiaStats.totalMDOs}</p>
              <p className="text-xs text-gray-500 mt-2">MDOs across India</p>
            </div>

            <div className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">YTD Sales</p>
              <p className="text-3xl font-bold text-gray-900">{allIndiaStats.ytdSales.percentage}%</p>
              <p className="text-xs text-gray-500 mt-2">₹{allIndiaStats.ytdSales.achieved}L / ₹{allIndiaStats.ytdSales.target}L</p>
            </div>

            <div className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Liquidation</p>
              <p className="text-3xl font-bold text-gray-900">{allIndiaStats.liquidation.liquidationRate}%</p>
              <p className="text-xs text-gray-500 mt-2">All India Average</p>
            </div>

            <div className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{allIndiaStats.marketingCampaigns.active}</p>
              <p className="text-xs text-gray-500 mt-2">{allIndiaStats.marketingCampaigns.planned} planned</p>
            </div>
          </div>

          {/* Team Structure */}
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All India Team Structure</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">{allIndiaStats.totalRMMs}</span>
                </div>
                <p className="text-sm font-medium text-blue-900">RMMs</p>
                <p className="text-xs text-blue-700">Regional Marketing Managers</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-900">{allIndiaStats.totalRBHs}</span>
                </div>
                <p className="text-sm font-medium text-purple-900">RBHs</p>
                <p className="text-xs text-purple-700">Regional Business Heads</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">{allIndiaStats.totalTSMs}</span>
                </div>
                <p className="text-sm font-medium text-green-900">TSMs</p>
                <p className="text-xs text-green-700">Territory Sales Managers</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-900">{allIndiaStats.totalMDOs}</span>
                </div>
                <p className="text-sm font-medium text-orange-900">MDOs</p>
                <p className="text-xs text-orange-700">Market Development Officers</p>
              </div>
            </div>
          </div>

          {/* Live Meetings */}
          <LiveMeetings
            meetings={liveMeetings}
            onEndMeeting={handleEndMeeting}
            userRole={user?.role || 'MH'}
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
              <p className="text-sm text-gray-600">View all India liquidation metrics</p>
            </button>

            <button
              onClick={() => setSelectedView('marketing')}
              className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Marketing Campaigns</h4>
              <p className="text-sm text-gray-600">Manage national campaigns</p>
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
              <p className="text-sm text-gray-600">View comprehensive reports</p>
            </button>
          </div>
        </>
      )}

      {/* Approvals Tab */}
      {selectedView === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Pending Approvals</h3>
                <p className="text-sm text-gray-600 mt-1">{pendingApprovals.length} items requiring your approval</p>
              </div>
              <button
                onClick={() => navigate('/approvals')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View All</span>
              </button>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyBadge(approval.urgency)}`}>
                          {approval.urgency.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{approval.type}</span>
                      </div>
                      <p className="text-gray-900 font-medium mb-1">{approval.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{approval.submittedBy} ({approval.submittedByRole})</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{approval.region}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(approval.submittedDate).toLocaleDateString('en-IN')}</span>
                        </span>
                        {approval.amount && (
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>₹{(approval.amount / 1000).toFixed(0)}K</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marketing Tab */}
      {selectedView === 'marketing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Marketing Campaigns Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <Megaphone className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-900">{allIndiaStats.marketingCampaigns.active}</span>
                </div>
                <p className="text-sm font-medium text-green-900">Active Campaigns</p>
                <p className="text-xs text-green-700 mt-1">Currently running</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-900">₹{allIndiaStats.marketingCampaigns.spent / 1000}Cr</span>
                </div>
                <p className="text-sm font-medium text-blue-900">Marketing Spend</p>
                <p className="text-xs text-blue-700 mt-1">of ₹{allIndiaStats.marketingCampaigns.budget / 1000}Cr budget</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold text-purple-900">{allIndiaStats.marketingCampaigns.roi}x</span>
                </div>
                <p className="text-sm font-medium text-purple-900">Average ROI</p>
                <p className="text-xs text-purple-700 mt-1">Return on Investment</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Campaign Performance</h4>
              <p className="text-sm text-gray-600">Detailed campaign analytics and performance metrics coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MHDashboard;
