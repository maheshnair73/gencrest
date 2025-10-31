import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCachedData } from '../contexts/DataCacheContext';
import { dashboardApiService, DashboardData, DashboardMetric, TeamMember, Activity } from '../services/dashboardApiService';
import { TrendingUp, TrendingDown, Users, Target, Activity as ActivityIcon, AlertCircle, Calendar, Award } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ICON_MAP: { [key: string]: React.ComponentType<{ className?: string }> } = {
  users: Users,
  target: Target,
  activity: ActivityIcon,
  calendar: Calendar,
  award: Award,
  trending_up: TrendingUp,
  trending_down: TrendingDown,
};

const COLOR_MAP: { [key: string]: string } = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
};

const MetricCard: React.FC<{ metric: DashboardMetric }> = ({ metric }) => {
  const IconComponent = ICON_MAP[metric.icon || 'target'];
  const bgColor = COLOR_MAP[metric.color || 'blue'];

  return (
    <div className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
        </div>
        {metric.change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {metric.trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
      <p className="text-sm text-gray-600">{metric.label}</p>
    </div>
  );
};

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <div className="bg-white rounded-xl p-4 card-shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
          <p className="text-sm text-gray-600">{member.role}</p>
        </div>
      </div>
      <div className="space-y-2">
        {member.metrics.map((metric, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600">{metric.label}:</span>
            <span className="font-semibold text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
          </div>
          {activity.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(activity.status)}`}>
              {activity.status}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>{new Date(activity.timestamp).toLocaleString()}</span>
          {activity.user && <span>by {activity.user}</span>}
        </div>
      </div>
    </div>
  );
};

const UnifiedDashboard: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'MDO';

  const { data: dashboardData, loading, error, refetch } = useCachedData<DashboardData>(
    `dashboard_${userRole}`,
    async () => {
      const result = await dashboardApiService.getDashboardData(userRole);
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch dashboard data');
      }
      return result.data;
    },
    5 * 60 * 1000
  );

  const renderMetrics = useMemo(() => {
    if (!dashboardData?.metrics) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {dashboardData.metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>
    );
  }, [dashboardData?.metrics]);

  const renderTeam = useMemo(() => {
    if (!dashboardData?.team || dashboardData.team.length === 0) return null;
    return (
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.team.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    );
  }, [dashboardData?.team]);

  const renderActivities = useMemo(() => {
    if (!dashboardData?.activities || dashboardData.activities.length === 0) return null;
    return (
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-2">
          {dashboardData.activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    );
  }, [dashboardData?.activities]);

  const renderAlerts = useMemo(() => {
    if (!dashboardData?.alerts || dashboardData.alerts.length === 0) return null;
    return (
      <div className="mb-6 space-y-3">
        {dashboardData.alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 p-4 rounded-lg ${
              alert.type === 'error' ? 'bg-red-50 border border-red-200' :
              alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              alert.type === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-blue-50 border border-blue-200'
            }`}
          >
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              alert.type === 'error' ? 'text-red-600' :
              alert.type === 'warning' ? 'text-yellow-600' :
              alert.type === 'success' ? 'text-green-600' :
              'text-blue-600'
            }`} />
            <p className={`text-sm ${
              alert.type === 'error' ? 'text-red-800' :
              alert.type === 'warning' ? 'text-yellow-800' :
              alert.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>{alert.message}</p>
          </div>
        ))}
      </div>
    );
  }, [dashboardData?.alerts]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {renderAlerts}
      {renderMetrics}
      {renderTeam}
      {renderActivities}
    </div>
  );
};

export default UnifiedDashboard;
