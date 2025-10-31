import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText, AlertCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TravelClaimApprovalCard } from '../components/approvals/TravelClaimApprovalCard';

interface ClaimWithApproval {
  claim: any;
  approval: any;
  submitterName: string;
}

const TravelClaimApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [claims, setClaims] = useState<ClaimWithApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('Pending');

  useEffect(() => {
    if (currentUser) {
      loadApprovals();
    }
  }, [currentUser, filterStatus]);

  const loadApprovals = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Get all claims where user is an approver
      const query = supabase
        .from('claim_approvals')
        .select(`
          id,
          approver_level,
          can_approve,
          status,
          claim_id,
          travel_claims (
            id,
            user_id,
            claim_date,
            from_location,
            to_location,
            distance_km,
            travel_mode,
            amount,
            purpose,
            purpose_category,
            customer_name,
            status,
            submitted_at
          )
        `)
        .eq('approver_id', currentUser.id);

      if (filterStatus !== 'All') {
        query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // For now, using mock submitter names since we don't have user profiles yet
      const formattedClaims = (data || []).map((item: any) => ({
        claim: item.travel_claims,
        approval: {
          id: item.id,
          approver_level: item.approver_level,
          can_approve: item.can_approve,
          status: item.status
        },
        submitterName: `User ${item.travel_claims.user_id.substring(0, 8)}`
      }));

      setClaims(formattedClaims);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = claims.filter(c => c.approval.status === 'Pending').length;
  const approvedCount = claims.filter(c => c.approval.status === 'Approved').length;
  const rejectedCount = claims.filter(c => c.approval.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Travel Claim Approvals</h1>
            <p className="text-gray-600 mt-1">Review and approve travel reimbursement claims</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 card-shadow">
          <p className="text-sm text-gray-600">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 card-shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 card-shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 card-shadow">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filter by Status:</span>
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading approvals...</p>
          </div>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-lg p-12 card-shadow text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'Pending'
              ? 'No pending claims requiring your approval at the moment.'
              : `No ${filterStatus.toLowerCase()} claims to display.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((item) => (
            <TravelClaimApprovalCard
              key={item.approval.id}
              claim={item.claim}
              approval={item.approval}
              submitterName={item.submitterName}
              onApprovalUpdate={loadApprovals}
            />
          ))}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          How Approval Works (Option C: Flexible Approval Rights)
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Claims automatically route to immediate reporting manager (Level 1)</li>
          <li>• You can approve claims from anyone in your reporting hierarchy</li>
          <li>• Level 1 approvers are notified immediately when claims are submitted</li>
          <li>• Higher-ups (Level 2, Level 3) can also approve if needed</li>
          <li>• Once approved by any authorized person, other pending approvals are skipped</li>
          <li>• Rejection requires a comment explaining the reason</li>
        </ul>
      </div>
    </div>
  );
};

export default TravelClaimApprovals;
