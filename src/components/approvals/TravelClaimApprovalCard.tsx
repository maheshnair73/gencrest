import React, { useState } from 'react';
import { Car, Calendar, MapPin, DollarSign, User, CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TravelClaimApprovalCardProps {
  claim: {
    id: string;
    user_id: string;
    claim_date: string;
    from_location: string;
    to_location: string;
    distance_km: number;
    travel_mode: string;
    amount: number;
    purpose: string;
    purpose_category: string;
    customer_name?: string;
    status: string;
    submitted_at: string;
  };
  approval: {
    id: string;
    approver_level: number;
    can_approve: boolean;
    status: string;
  };
  submitterName?: string;
  onApprovalUpdate?: () => void;
}

export const TravelClaimApprovalCard: React.FC<TravelClaimApprovalCardProps> = ({
  claim,
  approval,
  submitterName = 'Team Member',
  onApprovalUpdate
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showAdjustAmount, setShowAdjustAmount] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState(claim.amount);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleApprove = async () => {
    // Validate adjusted amount if it was changed
    if (showAdjustAmount && adjustedAmount !== claim.amount) {
      if (!adjustmentReason.trim()) {
        alert('Please provide a reason for adjusting the amount');
        return;
      }
      if (adjustedAmount <= 0) {
        alert('Adjusted amount must be greater than 0');
        return;
      }
    }

    const confirmMessage = adjustedAmount !== claim.amount
      ? `Approve claim with adjusted amount ₹${adjustedAmount} (Original: ₹${claim.amount})?`
      : 'Are you sure you want to approve this claim?';

    if (!confirm(confirmMessage)) return;

    setProcessing(true);
    try {
      const updateData: any = {
        status: 'Approved',
        approved_at: new Date().toISOString(),
        comments: comments || null
      };

      // Add adjustment fields if amount was changed
      if (adjustedAmount !== claim.amount) {
        updateData.adjusted_amount = adjustedAmount;
        updateData.adjustment_reason = adjustmentReason;
      }

      const { error } = await supabase
        .from('claim_approvals')
        .update(updateData)
        .eq('id', approval.id);

      if (error) throw error;

      alert('Claim approved successfully!');
      if (onApprovalUpdate) onApprovalUpdate();
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve claim. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      setShowComments(true);
      return;
    }

    if (!confirm('Are you sure you want to reject this claim?')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('claim_approvals')
        .update({
          status: 'Rejected',
          approved_at: new Date().toISOString(),
          comments: comments
        })
        .eq('id', approval.id);

      if (error) throw error;

      alert('Claim rejected successfully.');
      if (onApprovalUpdate) onApprovalUpdate();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Failed to reject claim. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Skipped: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[approval.status as keyof typeof statusColors] || statusColors.Pending}`}>
        {approval.status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 card-shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{submitterName}</h3>
            <p className="text-sm text-gray-500">Travel Claim</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(claim.claim_date).toLocaleDateString()}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {claim.from_location} → {claim.to_location} ({claim.distance_km} km)
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Car className="w-4 h-4 mr-2" />
          {claim.travel_mode}
        </div>

        <div className="flex items-center text-sm font-semibold text-gray-900">
          <DollarSign className="w-4 h-4 mr-2" />
          ₹{claim.amount.toLocaleString()}
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Category:</span> {claim.purpose_category}
          </p>
          {claim.customer_name && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Customer:</span> {claim.customer_name}
            </p>
          )}
          <p className="text-sm text-gray-600">
            <span className="font-medium">Purpose:</span> {claim.purpose}
          </p>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Submitted: {new Date(claim.submitted_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              Approver Level {approval.approver_level}
            </div>
          </div>
        </div>
      </div>

      {/* View Details Button - Always visible */}
      <button
        onClick={() => setShowDetailsModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>

      {approval.can_approve && approval.status === 'Pending' && (
        <div className="space-y-3">
          {showAdjustAmount && (
            <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">
                Adjust Claim Amount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">₹</span>
                <input
                  type="number"
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter adjusted amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-600">
                Original: ₹{claim.amount.toLocaleString()} |
                Difference: {adjustedAmount > claim.amount ? '+' : ''}₹{(adjustedAmount - claim.amount).toLocaleString()}
              </p>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Reason for adjustment (required)*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          )}

          {showComments && (
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments (optional for approval, required for rejection)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowAdjustAmount(!showAdjustAmount)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {showAdjustAmount ? 'Cancel Adjustment' : 'Adjust Amount'}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-gray-600 hover:text-gray-700 underline"
            >
              {showComments ? 'Hide Comments' : 'Add Comments'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : adjustedAmount !== claim.amount ? `Approve ₹${adjustedAmount}` : 'Approve'}
            </button>
            <button
              onClick={() => {
                if (showComments) {
                  handleReject();
                } else {
                  setShowComments(true);
                }
              }}
              disabled={processing}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {!approval.can_approve && (
        <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded">
          Pending approval from Level {approval.approver_level} approver
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Travel Claim Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Submitter Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Submitted by</p>
                  <p className="font-semibold text-gray-900">{submitterName}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  approval.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  approval.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {approval.status}
                </span>
              </div>

              {/* Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium text-gray-900">{new Date(claim.claim_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mode of Transport</p>
                  <p className="font-medium text-gray-900">{claim.travel_mode}</p>
                </div>
              </div>

              {/* Travel Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Travel Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-medium text-gray-900">{claim.from_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-medium text-gray-900">{claim.to_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Car className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-medium text-gray-900">{claim.distance_km} km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Claim Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">₹{claim.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">₹{(claim.amount / claim.distance_km).toFixed(2)}/km</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose</p>
                    <p className="font-medium text-gray-900">{claim.purpose}</p>
                  </div>
                  {claim.purpose_category && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-medium text-gray-900">{claim.purpose_category}</p>
                    </div>
                  )}
                  {claim.customer_name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-900">{claim.customer_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Approval Details</h3>
                <p className="text-sm text-gray-600">
                  Approver Level: <span className="font-medium text-gray-900">{approval.approver_level}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted: <span className="font-medium text-gray-900">{new Date(claim.submitted_at).toLocaleDateString()}</span>
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
