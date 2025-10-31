import React from 'react';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Activity {
  id: number;
  date: string;
  activity: string;
  location: string;
  time: string;
  status: string;
}

interface ActivityCardProps {
  activity: Activity;
  onViewDetails?: (activityId: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onViewDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            {activity.activity}
          </h3>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
            {getStatusIcon(activity.status)}
            <span>{activity.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(activity.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>{activity.time}</span>
        </div>
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
          <span>{activity.location}</span>
        </div>
      </div>

      {onViewDetails && (
        <button
          onClick={() => onViewDetails(activity.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      )}
    </div>
  );
};
