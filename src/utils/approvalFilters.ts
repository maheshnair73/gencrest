import { ApprovalWorkflow } from '../types/hierarchy';

export const getRoleBasedApprovals = (
  workflows: ApprovalWorkflow[],
  userRole: string,
  userId: string
): ApprovalWorkflow[] => {
  return workflows.filter(workflow => {
    if (workflow.status === 'pending' && workflow.currentApproverRole === userRole) {
      return true;
    }

    if (workflow.submittedByRole === userRole || workflow.submittedBy === userId) {
      return true;
    }

    const hasApprovedOrRejected = workflow.approvalChain.some(
      approval => approval.approverUserId === userId
    );
    if (hasApprovedOrRejected) {
      return true;
    }

    const roleHierarchy: { [key: string]: number } = {
      'MDO': 1,
      'TSM': 2,
      'RBH': 3,
      'ZBH': 4,
      'RMM': 4,
      'MH': 5,
      'VP': 6,
      'MD': 7,
      'CFO': 7,
      'CHRO': 7,
      'ADMIN': 8
    };

    const userRoleLevel = roleHierarchy[userRole] || 0;
    const submitterRoleLevel = roleHierarchy[workflow.submittedByRole] || 0;

    if (userRoleLevel > submitterRoleLevel) {
      return true;
    }

    return false;
  });
};

export const canUserApprove = (
  workflow: ApprovalWorkflow,
  userRole: string,
  userId: string
): boolean => {
  if (workflow.status !== 'pending') {
    return false;
  }

  if (workflow.submittedBy === userId) {
    return false;
  }

  if (workflow.currentApproverRole === userRole) {
    return true;
  }

  return false;
};
