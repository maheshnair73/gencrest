import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText } from 'lucide-react';
import { ApprovalWorkflow } from '../types/hierarchy';
import { ApprovalWorkflowComponent } from '../components/ApprovalWorkflow';
import { ApprovalCard } from '../components/approvals/ApprovalCard';
import { ApprovalFilters } from '../components/approvals/ApprovalFilters';
import { Pagination } from '../components/Pagination';
import { getRoleBasedApprovals, canUserApprove } from '../utils/approvalFilters';

const ITEMS_PER_PAGE = 12;

const Approvals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [workflows] = useState<ApprovalWorkflow[]>([
    {
      id: 'WF001',
      type: 'monthly_plan',
      submittedBy: 'U002',
      submittedByRole: 'TSM',
      currentApprover: 'U003',
      currentApproverRole: 'RBH',
      status: 'pending',
      submissionDate: '2024-01-20T10:00:00Z',
      data: {
        title: 'January 2024 Monthly Plan - MDO Team',
        activities: 45,
        targets: { visits: 35, sales: 500000 },
        territory: 'North Delhi',
        planFor: 'MDO Team and Self'
      },
      approvalChain: [
        {
          approverRole: 'RBH',
          status: 'pending'
        }
      ]
    },
    {
      id: 'WF002',
      type: 'travel_claim',
      submittedBy: 'U001',
      submittedByRole: 'MDO',
      currentApprover: 'U002',
      currentApproverRole: 'TSM',
      status: 'approved',
      submissionDate: '2024-01-18T14:30:00Z',
      approvalDate: '2024-01-19T09:15:00Z',
      comments: 'Approved for client visit expenses',
      data: {
        amount: 2500,
        purpose: 'Client visit - Delhi to Gurgaon',
        distance: 45,
        mode: 'Car'
      },
      approvalChain: [
        {
          approverRole: 'TSM',
          approverUserId: 'U002',
          status: 'approved',
          date: '2024-01-19T09:15:00Z',
          comments: 'Approved for client visit expenses'
        }
      ]
    },
    {
      id: 'WF003',
      type: 'activity_claim',
      submittedBy: 'U001',
      submittedByRole: 'MDO',
      currentApprover: 'U002',
      currentApproverRole: 'TSM',
      status: 'pending',
      submissionDate: '2024-01-21T11:00:00Z',
      data: {
        title: 'Field Activity - Farmer Meeting',
        amount: 1500,
        purpose: 'Farmer engagement program',
        activities: 10
      },
      approvalChain: [
        {
          approverRole: 'TSM',
          status: 'pending'
        }
      ]
    },
    {
      id: 'WF004',
      type: 'budget_approval',
      submittedBy: 'U003',
      submittedByRole: 'RBH',
      currentApprover: 'U005',
      currentApproverRole: 'MH',
      status: 'pending',
      submissionDate: '2024-01-22T09:00:00Z',
      data: {
        title: 'Q1 2024 Marketing Budget',
        amount: 500000,
        purpose: 'Marketing campaigns and promotions'
      },
      approvalChain: [
        {
          approverRole: 'MH',
          status: 'pending'
        }
      ]
    },
    {
      id: 'WF005',
      type: 'travel_claim',
      submittedBy: 'U002',
      submittedByRole: 'TSM',
      currentApprover: 'U003',
      currentApproverRole: 'RBH',
      status: 'rejected',
      submissionDate: '2024-01-19T15:00:00Z',
      approvalDate: '2024-01-20T10:30:00Z',
      comments: 'Insufficient documentation provided',
      data: {
        amount: 3500,
        purpose: 'Regional meeting travel',
        distance: 120,
        mode: 'Car'
      },
      approvalChain: [
        {
          approverRole: 'RBH',
          approverUserId: 'U003',
          status: 'rejected',
          date: '2024-01-20T10:30:00Z',
          comments: 'Insufficient documentation provided'
        }
      ]
    },
    {
      id: 'WF006',
      type: 'stock_verification',
      submittedBy: 'U001',
      submittedByRole: 'TSM',
      currentApprover: 'U010',
      currentApproverRole: 'RMM',
      status: 'pending',
      submissionDate: '2025-10-29T13:12:00Z',
      data: {
        title: 'Stock Rectification - Agro Enterprises',
        retailer: 'Agro Enterprises',
        location: 'Connaught Place, New Delhi',
        liquidationId: 'LIQ-2024-001',
        products: 'NPK 12-32-16 (1000 Kg), Urea (750 Kg)',
        amount: 150000,
        reason: 'Liquidation completed - Awaiting verification',
        verifiedBy: 'Rajesh Kumar (TSM)'
      },
      approvalChain: [
        {
          approverRole: 'RMM',
          status: 'pending'
        },
        {
          approverRole: 'RBH',
          status: 'pending'
        },
        {
          approverRole: 'ZBH',
          status: 'pending'
        }
      ]
    },
    {
      id: 'WF007',
      type: 'stock_verification',
      submittedBy: 'U004',
      submittedByRole: 'TSM',
      currentApprover: 'U010',
      currentApproverRole: 'RMM',
      status: 'pending',
      submissionDate: '2025-10-28T10:30:00Z',
      data: {
        title: 'Stock Rectification - Green Valley Traders',
        retailer: 'Green Valley Traders',
        location: 'Rohini, New Delhi',
        liquidationId: 'LIQ-2024-002',
        products: 'DAP (1500 Kg), MOP (1250 Kg)',
        amount: 220000,
        reason: 'Stock verification and adjustment required',
        verifiedBy: 'Kavita Verma (TSM)'
      },
      approvalChain: [
        {
          approverRole: 'RMM',
          status: 'pending'
        },
        {
          approverRole: 'RBH',
          status: 'pending'
        }
      ]
    },
    {
      id: 'WF008',
      type: 'stock_rectification',
      submittedBy: 'U002',
      submittedByRole: 'TSM',
      currentApprover: 'U010',
      currentApproverRole: 'RMM',
      status: 'pending',
      submissionDate: '2025-10-30T14:25:00Z',
      data: {
        title: 'Stock Rectification - Decrease Balance Stock',
        customer: 'Shree Krishna Agro',
        product: 'NPK 12-32-16 - 50 Kg',
        adjustmentType: 'decrease',
        adjustmentUnits: 25,
        adjustmentValue: 125000,
        currentBalance: 500000,
        currentBalanceUnits: 100,
        newBalance: 375000,
        newBalanceUnits: 75,
        reason: 'Sold to farmer',
        destination: 'Ramesh Kumar - Farmer, Village Khatoli',
        notes: 'Sale completed on 29th Oct, payment received in full'
      },
      approvalChain: [
        {
          approverRole: 'RMM',
          status: 'pending'
        },
        {
          approverRole: 'RBH',
          status: 'pending'
        }
      ]
    }
  ]);

  const roleBasedWorkflows = useMemo(() => {
    if (!user) return [];
    return getRoleBasedApprovals(workflows, user.role, user.id);
  }, [workflows, user]);

  const filteredWorkflows = useMemo(() => {
    let filtered = roleBasedWorkflows;

    if (selectedType !== 'All') {
      filtered = filtered.filter(w => w.type === selectedType);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(w => w.status === selectedStatus);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.data.title?.toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query) ||
        w.submittedByRole.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }, [roleBasedWorkflows, selectedType, selectedStatus, searchTerm]);

  const paginatedWorkflows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredWorkflows.slice(startIndex, endIndex);
  }, [filteredWorkflows, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredWorkflows.length / ITEMS_PER_PAGE);
  }, [filteredWorkflows.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus, searchTerm]);

  const hasActiveFilters = selectedType !== 'All' || selectedStatus !== 'All' || searchTerm !== '';

  const clearAllFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewDetails = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
  };

  const handleApprove = (workflowId: string) => {
    console.log('Approve workflow:', workflowId);
  };

  const handleReject = (workflowId: string) => {
    console.log('Reject workflow:', workflowId);
  };

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

  if (selectedWorkflowData) {
    return (
      <ApprovalWorkflowComponent
        workflow={selectedWorkflowData}
        onClose={() => setSelectedWorkflow(null)}
      />
    );
  }

  const pendingCount = roleBasedWorkflows.filter(w => w.status === 'pending').length;
  const approvedCount = roleBasedWorkflows.filter(w => w.status === 'approved').length;
  const rejectedCount = roleBasedWorkflows.filter(w => w.status === 'rejected').length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div className="flex items-start sm:items-center justify-between">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-0.5 sm:mt-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Approvals</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              {user?.role} - Manage and track approval workflows
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      <ApprovalFilters
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {filteredWorkflows.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No approvals found</h3>
          <p className="text-gray-600">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results'
              : 'There are no approval workflows available for your role'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedWorkflows.map((workflow) => (
              <ApprovalCard
                key={workflow.id}
                workflow={workflow}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                canApprove={canUserApprove(workflow, user?.role || '', user?.id || '')}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Approvals;
