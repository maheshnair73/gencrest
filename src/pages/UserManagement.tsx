import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';

interface SystemUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  territory: string | null;
  zone: string | null;
  state: string | null;
  region: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  employee_code: string | null;
  phone_number: string | null;
  joining_date: string;
  last_login_at: string | null;
  login_count: number;
  disabled_at: string | null;
  disabled_by: string | null;
  disable_reason: string | null;
}

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_logins_today: number;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stats, setStats] = useState<UserStats>({ total_users: 0, active_users: 0, inactive_users: 0, total_logins_today: 0 });

  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [reassignToUserId, setReassignToUserId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [disableReason, setDisableReason] = useState('');

  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [userLogins, setUserLogins] = useState<any[]>([]);

  const roles = ['All', 'MD', 'VP', 'MH', 'RMM', 'ZBH', 'RBH', 'MDO', 'SO', 'TSM', 'sfaadmin'];

  const isAdmin = currentUser?.role === 'sfaadmin' || currentUser?.user_metadata?.is_super_admin;

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allUsers } = await supabase.from('system_users').select('is_active');
      const { data: todayLogins } = await supabase
        .from('user_login_history')
        .select('id')
        .gte('login_time', new Date().toISOString().split('T')[0]);

      const total = allUsers?.length || 0;
      const active = allUsers?.filter(u => u.is_active).length || 0;

      setStats({
        total_users: total,
        active_users: active,
        inactive_users: total - active,
        total_logins_today: todayLogins?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'All') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => statusFilter === 'active' ? u.is_active : !u.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (user: SystemUser) => {
    if (!isAdmin) return;

    const newStatus = !user.is_active;
    const confirmMessage = newStatus
      ? `Enable user ${user.full_name}?`
      : `Disable user ${user.full_name}? ${!newStatus ? 'Please provide a reason.' : ''}`;

    if (!window.confirm(confirmMessage)) return;

    let reason = '';
    if (!newStatus) {
      reason = prompt('Reason for disabling this user:') || '';
      if (!reason.trim()) {
        alert('Reason is required to disable a user');
        return;
      }
    }

    try {
      const updateData: any = {
        is_active: newStatus,
        updated_at: new Date().toISOString()
      };

      if (!newStatus) {
        updateData.disabled_at = new Date().toISOString();
        updateData.disabled_by = currentUser?.id || 'unknown';
        updateData.disable_reason = reason;
      } else {
        updateData.disabled_at = null;
        updateData.disabled_by = null;
        updateData.disable_reason = null;
      }

      const { error } = await supabase
        .from('system_users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      alert(`User ${newStatus ? 'enabled' : 'disabled'} successfully`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleViewUserActivity = async (user: SystemUser) => {
    setSelectedUser(user);
    setShowActivityModal(true);

    try {
      const { data: activityData } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.user_id)
        .order('timestamp', { ascending: false })
        .limit(50);

      const { data: loginData } = await supabase
        .from('user_login_history')
        .select('*')
        .eq('user_id', user.user_id)
        .order('login_time', { ascending: false })
        .limit(20);

      setUserActivity(activityData || []);
      setUserLogins(loginData || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const handleReassignUser = async () => {
    if (!selectedUser || !reassignToUserId || !reassignReason.trim()) {
      alert('Please select a new assignee and provide a reason');
      return;
    }

    const newUser = users.find(u => u.user_id === reassignToUserId);
    if (!newUser) {
      alert('New assignee not found');
      return;
    }

    if (!window.confirm(`Transfer all data from ${selectedUser.full_name} to ${newUser.full_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('user_data_reassignments').insert({
        old_user_id: selectedUser.user_id,
        old_user_email: selectedUser.email,
        old_user_name: selectedUser.full_name,
        old_user_role: selectedUser.role,
        new_user_id: newUser.user_id,
        new_user_email: newUser.email,
        new_user_name: newUser.full_name,
        new_user_role: newUser.role,
        reassignment_type: 'full_transfer',
        data_types_transferred: ['work_plans', 'liquidations', 'verifications', 'travel_claims', 'activities'],
        reason: reassignReason,
        performed_by_id: currentUser?.id || 'unknown',
        performed_by_name: currentUser?.name || 'Unknown',
        records_transferred: {}
      });

      if (error) throw error;

      alert('User data reassignment recorded successfully');
      setShowReassignModal(false);
      setReassignToUserId('');
      setReassignReason('');
    } catch (error) {
      console.error('Error reassigning user:', error);
      alert('Failed to reassign user data');
    }
  };

  const exportUsersReport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Territory', 'Status', 'Login Count', 'Last Login', 'Joining Date'].join(','),
      ...filteredUsers.map(u => [
        u.full_name,
        u.email,
        u.role,
        u.territory || '-',
        u.is_active ? 'Active' : 'Inactive',
        u.login_count,
        u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never',
        new Date(u.joining_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users, permissions, and activity</p>
        </div>
        <button
          onClick={exportUsersReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats.total_users}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold mt-1">{stats.active_users}</p>
            </div>
            <UserCheck className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Inactive Users</p>
              <p className="text-3xl font-bold mt-1">{stats.inactive_users}</p>
            </div>
            <UserX className="w-12 h-12 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Logins Today</p>
              <p className="text-3xl font-bold mt-1">{stats.total_logins_today}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Territory</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Logins</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Last Login</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.employee_code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.is_super_admin ? 'bg-purple-100 text-purple-700' :
                      user.is_admin ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.territory || '-'}
                    {user.zone && <div className="text-xs text-gray-500">{user.zone}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">
                    {user.login_count}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewUserActivity(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Activity"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowReassignModal(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Reassign Data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`p-2 ${user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} rounded-lg transition-colors`}
                        title={user.is_active ? 'Disable User' : 'Enable User'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reassign User Data</h3>
            <p className="text-gray-600 mb-6">
              Transfer all data from <strong>{selectedUser.full_name}</strong> to a new assignee
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Assignee</label>
                <select
                  value={reassignToUserId}
                  onChange={(e) => setReassignToUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => u.is_active && u.user_id !== selectedUser.user_id).map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Reassignment</label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g., Employee resigned, territory change, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignToUserId('');
                  setReassignReason('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignUser}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Reassign Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">User Activity Report</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedUser.full_name} - {selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-white hover:text-gray-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Login History */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Login History (Last 20)
                </h4>
                <div className="space-y-2">
                  {userLogins.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No login history found</p>
                  ) : (
                    userLogins.map((login) => (
                      <div key={login.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{new Date(login.login_time).toLocaleString()}</p>
                            <p className="text-sm text-gray-600">
                              {login.device_type} • {login.browser} • {login.ip_address}
                            </p>
                          </div>
                        </div>
                        {login.session_duration && (
                          <span className="text-sm text-gray-600">
                            Duration: {Math.floor(login.session_duration / 60)}m
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Activity (Last 50)
                </h4>
                <div className="space-y-2">
                  {userActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No activity logs found</p>
                  ) : (
                    userActivity.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.action_type === 'create' ? 'bg-green-100' :
                          activity.action_type === 'update' ? 'bg-blue-100' :
                          activity.action_type === 'delete' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <Activity className={`w-5 h-5 ${
                            activity.action_type === 'create' ? 'text-green-600' :
                            activity.action_type === 'update' ? 'text-blue-600' :
                            activity.action_type === 'delete' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 capitalize">{activity.action_type} - {activity.module}</p>
                            <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.page_path}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
