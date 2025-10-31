import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface ActivityItemProps {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'verified' | 'completed' | 'pending' | 'failed';
  userName?: string;
  userRole?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  description,
  timestamp,
  status,
  userName,
  userRole
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-green-600" />;
      case 'pending':
        return <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-600" />;
      default:
        return <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex items-start space-x-3 p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h4>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor()} whitespace-nowrap flex items-center space-x-1`}>
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600">{description}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{formatTimestamp(timestamp)}</span>
          {userName && (
            <>
              <span>•</span>
              <span>by {userName} {userRole && `(${userRole})`}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
