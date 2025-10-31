import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, Activity, CheckCircle, XCircle, Building, TrendingUp, Package, Users, DollarSign, Target, AlertTriangle, Clock, FileText, ShoppingBag } from 'lucide-react';
import {
  mockDashboardMetrics,
  mockTeamPerformance,
  mockRecentActivities,
  mockPendingApprovals
} from '../data/mockDashboardReportsData';
import VerificationApprovals from '../components/activities/VerificationApprovals';
import { supabase } from '../lib/supabase';

type TabType = 'overview' | 'meetings' | 'activities' | 'approvals';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(mockDashboardMetrics);
  const [teamPerformance, setTeamPerformance] = useState(mockTeamPerformance);
  const [activities, setActivities] = useState(mockRecentActivities);
  const [pendingApprovals, setPendingApprovals] = useState(mockPendingApprovals);
  const [verificationCount, setVerificationCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
    loadVerificationCount();
  }, []);

  const loadVerificationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error && count !== null) {
        setVerificationCount(count);
        setPendingApprovals(prev => ({
          ...prev,
          count: prev.count - (prev.breakdown.stockVerifications || 0) + count,
          breakdown: {
            ...prev.breakdown,
            stockVerifications: count
          }
        }));
      }
    } catch (error) {
      console.error('Error loading verification count:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(false);
      setMetrics(mockDashboardMetrics);
      setTeamPerformance(mockTeamPerformance);
      setActivities(mockRecentActivities);
      setPendingApprovals(mockPendingApprovals);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
      return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(2)}K`;
    }
    return `${sign}₹${absValue.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const getRoleDisplayName = () => {
    const roleMap: { [key: string]: string } = {
      'ZBH': 'Zonal Business Head',
      'RBH': 'Regional Business Head',
      'TSM': 'Territory Sales Manager',
      'MDO': 'Market Development Officer',
      'MH': 'Marketing Head',
      'VP': 'Vice President'
    };
    return roleMap[user?.role || ''] || user?.role || 'Dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutGrid },
    { id: 'meetings' as TabType, label: 'Meetings', icon: Calendar },
    { id: 'activities' as TabType, label: 'Activities', icon: Activity },
    { id: 'approvals' as TabType, label: 'Approvals', icon: CheckCircle, badge: pendingApprovals.count }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mx-3 sm:mx-6 mt-3 sm:mt-6 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
            </div>
            <p className="text-white/90 text-sm sm:text-base">{getRoleDisplayName()}</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">{user?.zone || 'North Zone'}</p>
          </div>
          {pendingApprovals.count > 0 && (
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
              <div className="text-3xl sm:text-4xl font-bold">{pendingApprovals.count}</div>
              <div className="text-xs sm:text-sm text-white/90 mt-1">Pending Approvals</div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-3 sm:mx-6 mt-4 sm:mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatNumber(48)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">No of Distributors</div>
                    <div className="text-xs text-gray-600 mt-1">Active distributors</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(metrics.ytdSales.value)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">YTD Sales</div>
                    <div className="text-xs text-gray-500 mt-1">(in Rs.Lakhs)</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(metrics.totalLiquidation.value / 10)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">YTD Opening Stock</div>
                    <div className="text-xs text-gray-600 mt-1">Opening inventory</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(metrics.totalLiquidation.value / 5)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">YTD Liquidation</div>
                    <div className="text-xs text-gray-600 mt-1">Total liquidated</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(9480000)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">Total O/S</div>
                    <div className="text-xs text-gray-600 mt-1">Outstanding amount</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(1896000)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">Total Overdue</div>
                    <div className="text-xs text-gray-600 mt-1">Overdue payments</div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-l-4 border-pink-600 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">2</div>
                    <div className="text-xs sm:text-sm text-gray-700">Total Blocked Parties</div>
                    <div className="text-xs text-gray-600 mt-1">Blocked distributors</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meetings Scheduled</h3>
                <p className="text-gray-600">Your meetings will appear here</p>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 ml-5">
                      <span>{new Date(activity.timestamp).toLocaleString('en-IN')}</span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>by {activity.user.name} ({activity.user.role})</span>
                        </>
                      )}
                    </div>

                    {/* Show additional details for liquidation activities */}
                    {activity.type === 'liquidation_done' && activity.metadata && (
                      <div className="mt-3 ml-5 p-3 bg-gray-50 rounded-lg space-y-1.5">
                        {activity.metadata.retailer && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Retailer:</span>
                            <span className="text-gray-600 ml-2">{activity.metadata.retailer}</span>
                          </div>
                        )}
                        {activity.metadata.location && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="text-gray-600 ml-2">{activity.metadata.location}</span>
                          </div>
                        )}
                        {activity.metadata.products && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Products:</span>
                            <span className="text-gray-600 ml-2">{activity.metadata.products}</span>
                          </div>
                        )}
                        {activity.metadata.amount && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Amount:</span>
                            <span className="text-gray-600 ml-2">₹{activity.metadata.amount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {activity.status === 'pending' ? (
                      <div className="flex items-center gap-2 mt-3 ml-5">
                        <button
                          onClick={() => {
                            alert('Verify functionality - to be implemented');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            alert('Reject functionality - to be implemented');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 ml-5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'verified' || activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status === 'verified' || activity.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : null}
                          {activity.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">Coming Soon</h3>
                  <p className="text-gray-500">Approval workflows will be available soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
