import React from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ApprovalWorkflow } from '../../types/hierarchy';

interface ApprovalCardProps {
  workflow: ApprovalWorkflow;
  onViewDetails: (workflowId: string) => void;
  onApprove?: (workflowId: string) => void;
  onReject?: (workflowId: string) => void;
  canApprove: boolean;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  workflow,
  onViewDetails,
  onApprove,
  onReject,
  canApprove
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly_plan':
        return 'Monthly Plan';
      case 'travel_claim':
        return 'Travel Claim';
      case 'activity_claim':
        return 'Activity Claim';
      case 'budget_approval':
        return 'Budget Approval';
      case 'stock_verification':
        return 'Stock Verification';
      case 'stock_rectification':
        return 'Stock Rectification';
      default:
        return type;
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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {getTypeLabel(workflow.type)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
              {workflow.status}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {workflow.data.title || `${getTypeLabel(workflow.type)} Request`}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span>From: <span className="font-medium">{workflow.submittedByRole}</span></span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>Submitted: {formatDate(workflow.submissionDate)}</span>
        </div>
        {workflow.status === 'pending' && workflow.currentApproverRole && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Current: <span className="font-medium">{workflow.currentApproverRole}</span></span>
          </div>
        )}
      </div>

      {workflow.data.amount && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
          <span className="text-gray-600">Amount: </span>
          <span className="font-semibold text-gray-900">₹{workflow.data.amount.toLocaleString('en-IN')}</span>
        </div>
      )}

      {workflow.data.activities && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
          <span className="text-gray-600">Activities: </span>
          <span className="font-semibold text-gray-900">{workflow.data.activities}</span>
        </div>
      )}

      {workflow.type === 'stock_verification' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-2 text-sm">
          {workflow.data.retailer && (
            <div>
              <span className="text-gray-600">Retailer: </span>
              <span className="font-semibold text-gray-900">{workflow.data.retailer}</span>
            </div>
          )}
          {workflow.data.location && (
            <div>
              <span className="text-gray-600">Location: </span>
              <span className="font-medium text-gray-800">{workflow.data.location}</span>
            </div>
          )}
          {workflow.data.products && (
            <div>
              <span className="text-gray-600">Products: </span>
              <span className="font-medium text-gray-800">{workflow.data.products}</span>
            </div>
          )}
          {workflow.data.reason && (
            <div>
              <span className="text-gray-600">Reason: </span>
              <span className="font-medium text-gray-800">{workflow.data.reason}</span>
            </div>
          )}
          {workflow.data.verifiedBy && (
            <div>
              <span className="text-gray-600">Verified By: </span>
              <span className="font-medium text-gray-800">{workflow.data.verifiedBy}</span>
            </div>
          )}
        </div>
      )}

      {workflow.type === 'stock_rectification' && (
        <div className={`mb-4 p-3 rounded-lg space-y-2 text-sm ${
          workflow.data.adjustmentType === 'increase' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
        }`}>
          {workflow.data.customer && (
            <div>
              <span className="text-gray-600">Customer: </span>
              <span className="font-semibold text-gray-900">{workflow.data.customer}</span>
            </div>
          )}
          {workflow.data.product && (
            <div>
              <span className="text-gray-600">Product: </span>
              <span className="font-medium text-gray-800">{workflow.data.product}</span>
            </div>
          )}
          <div className="border-t border-gray-200 my-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">Current Balance</div>
                <div className="font-semibold">₹{(workflow.data.currentBalance / 100000).toFixed(2)}L</div>
                <div className="text-xs text-gray-600">{workflow.data.currentBalanceUnits} units</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">New Balance</div>
                <div className={`font-bold ${workflow.data.adjustmentType === 'increase' ? 'text-green-600' : 'text-orange-600'}`}>
                  ₹{(workflow.data.newBalance / 100000).toFixed(2)}L
                </div>
                <div className="text-xs text-gray-600">{workflow.data.newBalanceUnits} units</div>
              </div>
            </div>
            <div className="mt-2 text-xs">
              <span className={workflow.data.adjustmentType === 'increase' ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
                {workflow.data.adjustmentType === 'increase' ? '+' : '-'}
                {workflow.data.adjustmentUnits} units (₹{(workflow.data.adjustmentValue / 100000).toFixed(2)}L)
              </span>
            </div>
          </div>
          {workflow.data.reason && (
            <div>
              <span className="text-gray-600">Reason: </span>
              <span className="font-medium text-gray-800">{workflow.data.reason}</span>
            </div>
          )}
          {workflow.data.destination && (
            <div>
              <span className="text-gray-600">{workflow.data.adjustmentType === 'increase' ? 'Source' : 'Destination'}: </span>
              <span className="font-medium text-gray-800">{workflow.data.destination}</span>
            </div>
          )}
          {workflow.data.notes && (
            <div>
              <span className="text-gray-600">Notes: </span>
              <span className="text-gray-700 italic">{workflow.data.notes}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onViewDetails(workflow.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {canApprove && workflow.status === 'pending' && onApprove && onReject && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onApprove(workflow.id)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onReject(workflow.id)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
