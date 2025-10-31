import React from 'react';
import { Calendar, User, CheckCircle, Clock, Eye } from 'lucide-react';

interface WorkPlan {
  id: string;
  createdBy: string;
  createdDate: string;
  preparedOn: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedDate?: string;
  planMonth: string;
  tasksCount: number;
  completedTasks: number;
}

interface WorkPlanCardProps {
  workPlan: WorkPlan;
  onViewDetails: (planId: string) => void;
}

export const WorkPlanCard: React.FC<WorkPlanCardProps> = ({
  workPlan,
  onViewDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completionPercentage = workPlan.tasksCount > 0
    ? Math.round((workPlan.completedTasks / workPlan.tasksCount) * 100)
    : 0;

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
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {workPlan.planMonth}
          </h3>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workPlan.approvalStatus)}`}>
            <CheckCircle className="w-3 h-3" />
            <span>{workPlan.approvalStatus}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-xs">Created by: <span className="font-medium">{workPlan.createdBy}</span></span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-xs">Created: {formatDate(workPlan.createdDate)}</span>
        </div>
        {workPlan.approvedBy && (
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-xs">Approved by: <span className="font-medium">{workPlan.approvedBy}</span></span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            {workPlan.completedTasks}/{workPlan.tasksCount} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{completionPercentage}% completed</p>
      </div>

      <button
        onClick={() => onViewDetails(workPlan.id)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
  );
};
