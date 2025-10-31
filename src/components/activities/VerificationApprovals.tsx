import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Eye, Store, Building2, MapPin, Package, Calendar, User, Clock, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface VerificationRequest {
  id: string;
  request_type: string;
  entity_id: string;
  entity_name: string;
  entity_location: string;
  submitted_by_id: string;
  submitted_by_name: string;
  submitted_by_role: string;
  submitted_at: string;
  status: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_comments: string | null;
  verification_data: any;
  skus_verified: any[];
  total_skus_count: number;
  stock_changes: any;
}

const VerificationApprovals: React.FC = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const userRole = user?.user_metadata?.role || 'MDO';

  // Roles that can approve verifications
  const approverRoles = ['RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD', 'MDO'];
  const canApprove = approverRoles.includes(userRole);

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      // If user is a submitter role, also show their own submissions
      const submitterRoles = ['MDO', 'SO', 'TSM'];
      if (submitterRoles.includes(userRole)) {
        // Show verifications they submitted
        query = query.or(`submitted_by_role.eq.${userRole},status.eq.pending`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;

    try {
      setSubmittingReview(true);

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by_id: user?.id,
          reviewed_by_name: user?.email || 'Unknown',
          reviewed_by_role: userRole,
          reviewed_at: new Date().toISOString(),
          review_comments: reviewComments || 'Approved'
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      // Refresh list and close modal
      await fetchVerifications();
      setShowDetailModal(false);
      setSelectedVerification(null);
      setReviewComments('');
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !reviewComments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setSubmittingReview(true);

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by_id: user?.id,
          reviewed_by_name: user?.email || 'Unknown',
          reviewed_by_role: userRole,
          reviewed_at: new Date().toISOString(),
          review_comments: reviewComments
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      // Refresh list and close modal
      await fetchVerifications();
      setShowDetailModal(false);
      setSelectedVerification(null);
      setReviewComments('');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'no_change') return <Minus className="w-4 h-4 text-gray-500" />;
    if (changeType === 'return_from_farmer') return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Stock Verification Approvals</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Cards */}
      {verifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No verification requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      verification.request_type === 'distributor_verification' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {verification.request_type === 'distributor_verification' ? (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Store className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{verification.entity_name}</h3>
                      <p className="text-sm text-gray-600">Code: {verification.entity_id}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{verification.entity_location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(verification.status)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{verification.submitted_by_name}</p>
                        <p className="text-xs text-gray-600">{verification.submitted_by_role}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submission Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(verification.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total SKUs</p>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">{verification.total_skus_count} SKUs</p>
                    </div>
                  </div>
                </div>

                {verification.status !== 'pending' && verification.reviewed_by_name && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <p className="text-xs text-gray-600">
                        {verification.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                        <span className="font-semibold">{verification.reviewed_by_name}</span> on{' '}
                        {new Date(verification.reviewed_at!).toLocaleString()}
                      </p>
                    </div>
                    {verification.review_comments && (
                      <p className="text-sm text-gray-700 italic">"{verification.review_comments}"</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedVerification(verification);
                    setShowDetailModal(true);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details & {canApprove && verification.status === 'pending' ? 'Approve/Reject' : 'Review'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Verification Details</h3>
                <p className="text-green-100 text-sm mt-1">{selectedVerification.entity_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedVerification(null);
                  setReviewComments('');
                }}
                className="text-white hover:text-gray-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Entity Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Entity Type</p>
                    <p className="text-sm font-semibold">
                      {selectedVerification.request_type === 'distributor_verification' ? 'Distributor' : 'Retailer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Entity Code</p>
                    <p className="text-sm font-semibold">{selectedVerification.entity_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-semibold">{selectedVerification.entity_location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submission Date</p>
                    <p className="text-sm font-semibold">
                      {new Date(selectedVerification.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* SKU Details */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">SKU Verification Details</h4>
                <div className="space-y-3">
                  {selectedVerification.skus_verified.map((sku: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{sku.sku_name || sku.name}</p>
                          <p className="text-sm text-gray-600">Code: {sku.sku_code || sku.skuCode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(sku.change_type)}
                          <span className={`text-sm font-semibold ${
                            sku.change_type === 'no_change' ? 'text-gray-600' :
                            sku.change_type === 'return_from_farmer' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {sku.change_type?.replace(/_/g, ' ').toUpperCase() || 'LIQUIDATION'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Previous Stock</p>
                          <p className="font-semibold">{sku.previous_stock || sku.openingStock} {sku.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Updated Stock</p>
                          <p className="font-semibold">{sku.updated_stock || sku.currentStock} {sku.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Change</p>
                          <p className={`font-semibold ${
                            (sku.stock_change || 0) === 0 ? 'text-gray-600' :
                            (sku.stock_change || 0) > 0 ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {(sku.stock_change || sku.liquidated || 0) > 0 ? '+' : ''}
                            {sku.stock_change || sku.liquidated || 0} {sku.unit}
                          </p>
                        </div>
                      </div>
                      {sku.farmer_names && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Farmer Details</p>
                          <p className="text-sm font-medium text-gray-700">
                            {sku.farmer_count} farmer(s): {sku.farmer_names}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Section */}
              {canApprove && selectedVerification.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Review & Decision</h4>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add comments (required for rejection)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {canApprove && selectedVerification.status === 'pending' && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedVerification(null);
                    setReviewComments('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={submittingReview}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submittingReview}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationApprovals;
