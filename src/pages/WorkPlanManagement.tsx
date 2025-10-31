import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, Users, CheckCircle, X, Save, Edit, Trash2, Eye, Send, Check, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface ActivityType {
  id: string;
  name: string;
  category: 'mdo_activity' | 'employee_activity';
}

interface ActivityPlan {
  activity_type_id: string;
  planned_count: number;
}

const WorkPlanManagement: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [activities, setActivities] = useState<ActivityPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeamMembers();
    loadActivityTypes();
    loadExistingPlans();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('role', 'MDO')
        .order('name', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadActivityTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setActivityTypes(data || []);
    } catch (error) {
      console.error('Error loading activity types:', error);
    }
  };

  const loadExistingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('work_plans')
        .select(`
          *,
          user:user_id (email, name),
          planned_activities (
            *,
            activity_type:activity_types (name)
          )
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingPlans(data || []);
    } catch (error) {
      console.error('Error loading existing plans:', error);
    }
  };

  const handleActivityChange = (activityTypeId: string, plannedCount: number) => {
    setActivities(prev => {
      const existing = prev.find(a => a.activity_type_id === activityTypeId);
      if (existing) {
        if (plannedCount === 0) {
          return prev.filter(a => a.activity_type_id !== activityTypeId);
        }
        return prev.map(a =>
          a.activity_type_id === activityTypeId
            ? { ...a, planned_count: plannedCount }
            : a
        );
      } else {
        return plannedCount > 0
          ? [...prev, { activity_type_id: activityTypeId, planned_count: plannedCount }]
          : prev;
      }
    });
  };

  const createWorkPlan = async () => {
    if (!selectedUser || activities.length === 0) {
      alert('Please select a user and add at least one activity');
      return;
    }

    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const totalPlanned = activities.reduce((sum, a) => sum + a.planned_count, 0);

      const { data: workPlan, error: workPlanError } = await supabase
        .from('work_plans')
        .insert({
          user_id: selectedUser,
          month: selectedMonth,
          year: parseInt(year),
          status: 'submitted',
          created_by: user?.id,
          total_planned: totalPlanned,
          total_completed: 0
        })
        .select()
        .single();

      if (workPlanError) throw workPlanError;

      const plannedActivitiesData = activities.map(a => ({
        work_plan_id: workPlan.id,
        activity_type_id: a.activity_type_id,
        planned_count: a.planned_count,
        completed_count: 0
      }));

      const { error: activitiesError } = await supabase
        .from('planned_activities')
        .insert(plannedActivitiesData);

      if (activitiesError) throw activitiesError;

      alert('Work plan created successfully');
      setShowModal(false);
      setSelectedUser('');
      setActivities([]);
      loadExistingPlans();
    } catch (error: any) {
      console.error('Error creating work plan:', error);
      alert(error.message || 'Error creating work plan');
    } finally {
      setLoading(false);
    }
  };

  const approveWorkPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('work_plans')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      alert('Work plan approved');
      loadExistingPlans();
    } catch (error: any) {
      console.error('Error approving work plan:', error);
      alert(error.message || 'Error approving work plan');
    }
  };

  const rejectWorkPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('work_plans')
        .update({ status: 'rejected' })
        .eq('id', planId);

      if (error) throw error;
      alert('Work plan rejected');
      loadExistingPlans();
    } catch (error: any) {
      console.error('Error rejecting work plan:', error);
      alert(error.message || 'Error rejecting work plan');
    }
  };

  const groupActivitiesByCategory = (category: string) => {
    return activityTypes.filter(at => at.category === category);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Plan Management</h1>
            <p className="text-gray-600 mt-1">Create and manage work plans for your team</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Work Plan</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {existingPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.user?.name || plan.user?.email}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">
                  {new Date(plan.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              {plan.status === 'submitted' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveWorkPlan(plan.id)}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectWorkPlan(plan.id)}
                    className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Total Planned</div>
                <div className="text-2xl font-bold text-gray-900">{plan.total_planned}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-green-600">{plan.total_completed}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {plan.total_planned > 0 ? Math.round((plan.total_completed / plan.total_planned) * 100) : 0}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Activities</div>
                <div className="text-2xl font-bold text-gray-900">{plan.planned_activities.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                <div className="space-y-1">
                  {plan.planned_activities.map((pa: any) => (
                    <div key={pa.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{pa.activity_type?.name}</span>
                      <span className="font-medium">{pa.completed_count}/{pa.planned_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Work Plan</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Member</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a team member...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">MDO Activities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupActivitiesByCategory('mdo_activity').map(activityType => {
                    const activity = activities.find(a => a.activity_type_id === activityType.id);
                    return (
                      <div key={activityType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{activityType.name}</span>
                        <input
                          type="number"
                          min="0"
                          value={activity?.planned_count || 0}
                          onChange={(e) => handleActivityChange(activityType.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Employee Activities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupActivitiesByCategory('employee_activity').map(activityType => {
                    const activity = activities.find(a => a.activity_type_id === activityType.id);
                    return (
                      <div key={activityType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{activityType.name}</span>
                        <input
                          type="number"
                          min="0"
                          value={activity?.planned_count || 0}
                          onChange={(e) => handleActivityChange(activityType.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkPlan}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Work Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkPlanManagement;
