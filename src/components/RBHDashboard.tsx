import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LiveMeetings from './LiveMeetings';
import DashboardMetricsGrid from './DashboardMetricsGrid';
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
  LayoutGrid,
  CalendarCheck
} from 'lucide-react';

interface TSMStats {
  id: string;
  name: string;
  employeeCode: string;
  territory: string;
  mdoCount: number;
  ytdActivities: {
    planned: number;
    done: number;
    percentage: number;
  };
  monthlyActivities: {
    planned: number;
    done: number;
    pending: number;
    pendingPercentage: number;
    completedPercentage: number;
  };
  teamPerformance: {
    averageScore: number;
    topPerformers: number;
    needsAttention: number;
  };
  exceptions: number;
  mdos: MDOUnderTSM[];
}

interface MDOUnderTSM {
  id: string;
  name: string;
  employeeCode: string;
  territory: string;
  performance: number;
  activitiesCompleted: number;
  activitiesPlanned: number;
  exceptions: number;
  status: 'Active' | 'Inactive';
}

const RBHDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'overview' | 'meetings' | 'activities' | 'approvals'>('overview');
  const [activitiesSubTab, setActivitiesSubTab] = useState<'my' | 'team'>('my');
  const [selectedTSM, setSelectedTSM] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Priya Sharma',
      participantRole: 'TSM',
      location: 'Regional Office',
      address: 'Delhi NCR Office',
      startTime: '2:30 PM',
      duration: 45,
      status: 'active' as const,
      type: 'Meeting' as const,
      phone: '+91 87654 32109',
      notes: 'Monthly review meeting with TSM team'
    },
    {
      id: 'LM002',
      participantName: 'Vikram Patel',
      participantRole: 'TSM',
      location: 'Gurgaon Office',
      address: 'Gurgaon Territory Office',
      startTime: '3:15 PM',
      duration: 30,
      status: 'active' as const,
      type: 'Training' as const,
      phone: '+91 76543 21098',
      notes: 'Product training session'
    }
  ]);

  // Sample TSM data under RBH
  const tsmStats: TSMStats[] = [
    {
      id: 'TSM001',
      name: 'Priya Sharma',
      employeeCode: 'TSM001',
      territory: 'Delhi Territory',
      mdoCount: 3,
      ytdActivities: {
        planned: 240,
        done: 216,
        percentage: 90
      },
      monthlyActivities: {
        planned: 20,
        done: 18,
        pending: 2,
        pendingPercentage: 10,
        completedPercentage: 90
      },
      teamPerformance: {
        averageScore: 87,
        topPerformers: 2,
        needsAttention: 1
      },
      exceptions: 3,
      mdos: [
        {
          id: 'MDO001',
          name: 'Rajesh Kumar',
          employeeCode: 'MDO001',
          territory: 'North Delhi',
          performance: 88,
          activitiesCompleted: 38,
          activitiesPlanned: 45,
          exceptions: 2,
          status: 'Active'
        },
        {
          id: 'MDO002',
          name: 'Amit Singh',
          employeeCode: 'MDO002',
          territory: 'South Delhi',
          performance: 85,
          activitiesCompleted: 36,
          activitiesPlanned: 45,
          exceptions: 1,
          status: 'Active'
        },
        {
          id: 'MDO003',
          name: 'Priya Verma',
          employeeCode: 'MDO003',
          territory: 'East Delhi',
          performance: 94,
          activitiesCompleted: 41,
          activitiesPlanned: 45,
          exceptions: 0,
          status: 'Active'
        }
      ]
    },
    {
      id: 'TSM002',
      name: 'Vikram Patel',
      employeeCode: 'TSM002',
      territory: 'Gurgaon Territory',
      mdoCount: 2,
      ytdActivities: {
        planned: 240,
        done: 192,
        percentage: 80
      },
      monthlyActivities: {
        planned: 20,
        done: 16,
        pending: 4,
        pendingPercentage: 20,
        completedPercentage: 80
      },
      teamPerformance: {
        averageScore: 82,
        topPerformers: 1,
        needsAttention: 1
      },
      exceptions: 2,
      mdos: [
        {
          id: 'MDO004',
          name: 'Suresh Kumar',
          employeeCode: 'MDO004',
          territory: 'Gurgaon North',
          performance: 86,
          activitiesCompleted: 34,
          activitiesPlanned: 40,
          exceptions: 1,
          status: 'Active'
        },
        {
          id: 'MDO005',
          name: 'Neha Gupta',
          employeeCode: 'MDO005',
          territory: 'Gurgaon South',
          performance: 78,
          activitiesCompleted: 28,
          activitiesPlanned: 40,
          exceptions: 1,
          status: 'Active'
        }
      ]
    }
  ];

  const handleEndMeeting = (meetingId: string) => {
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  // Aggregate regional stats
  const regionalAggregates = {
    totalTSMs: tsmStats.length,
    totalMDOs: tsmStats.reduce((sum, tsm) => sum + tsm.mdoCount, 0),
    ytdActivities: {
      planned: tsmStats.reduce((sum, tsm) => sum + tsm.ytdActivities.planned, 0),
      done: tsmStats.reduce((sum, tsm) => sum + tsm.ytdActivities.done, 0),
      percentage: Math.round((tsmStats.reduce((sum, tsm) => sum + tsm.ytdActivities.done, 0) / tsmStats.reduce((sum, tsm) => sum + tsm.ytdActivities.planned, 0)) * 100)
    },
    monthlyActivities: {
      planned: tsmStats.reduce((sum, tsm) => sum + tsm.monthlyActivities.planned, 0),
      done: tsmStats.reduce((sum, tsm) => sum + tsm.monthlyActivities.done, 0),
      pending: tsmStats.reduce((sum, tsm) => sum + tsm.monthlyActivities.pending, 0)
    },
    totalExceptions: tsmStats.reduce((sum, tsm) => sum + tsm.exceptions, 0),
    averagePerformance: Math.round(tsmStats.reduce((sum, tsm) => sum + tsm.teamPerformance.averageScore, 0) / tsmStats.length),
    sales: {
      ytdTarget: 12500000,
      ytdAchieved: 10625000,
      monthlyTarget: 1050000,
      monthlyAchieved: 892500
    },
    liquidation: {
      totalOpening: 8450000,
      totalYTDSales: 10625000,
      totalClosing: 6320000,
      liquidationPercentage: 74.8
    }
  };

  const renderOverview = () => (
    <DashboardMetricsGrid
      distributorCount={tsmStats.reduce((sum, tsm) => sum + tsm.mdoCount, 0)}
      ytdSales={regionalAggregates.sales.ytdAchieved}
      ytdOpeningStock={regionalAggregates.liquidation.totalOpening}
      ytdLiquidation={regionalAggregates.liquidation.totalYTDSales}
      totalOS={regionalAggregates.liquidation.totalClosing * 1.5}
      totalOverdue={regionalAggregates.liquidation.totalClosing * 0.3}
      totalBlockedParties={Math.floor(tsmStats.reduce((sum, tsm) => sum + tsm.mdoCount, 0) * 0.05)}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-bg rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">RBH Dashboard - {user?.name}</h1>
            <p className="text-white/90">Regional Business Head</p>
            <p className="text-white/80 text-sm mt-1">{user?.region || 'Delhi NCR Region'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{regionalAggregates.monthlyActivities.done}</div>
            <div className="text-white/90 text-sm">Regional Activities</div>
            <div className="text-white/80 text-xs mt-1">
              {regionalAggregates.monthlyActivities.pending} Pending
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedView('overview')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap relative ${
              selectedView === 'approvals'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approvals
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
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

export default RBHDashboard;