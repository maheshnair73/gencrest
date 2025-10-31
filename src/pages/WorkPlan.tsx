import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, Clock, TrendingUp, Award, MapPin, Plus, Eye, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Navigation, Play, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivityType {
  id: string;
  name: string;
  category: 'mdo_activity' | 'employee_activity';
  description: string;
}

interface PlannedActivity {
  id: string;
  activity_type_id: string;
  planned_count: number;
  completed_count: number;
  activity_type?: ActivityType;
}

interface ScheduledActivity {
  id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  location: string;
  village_name: string;
  distributor_name: string;
  retailer_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  activity_type?: ActivityType;
  expected_outcome: string;
  notes: string;
}

interface WorkPlan {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_planned: number;
  total_completed: number;
  created_at: string;
  approved_at?: string;
  planned_activities: PlannedActivity[];
  scheduled_activities?: ScheduledActivity[];
}

const WorkPlan: React.FC = () => {
  const { user } = useAuth();
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    loadWorkPlans();
    loadActivityTypes();
  }, []);

  const loadWorkPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_plans')
        .select(`
          *,
          planned_activities (
            *,
            activity_type:activity_types (*)
          ),
          scheduled_activities (
            *,
            activity_type:activity_types (*)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkPlans(data || []);
    } catch (error) {
      console.error('Error loading work plans:', error);
    } finally {
      setLoading(false);
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

  const createWorkPlan = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const { data, error } = await supabase
        .from('work_plans')
        .insert({
          user_id: user?.id,
          month: selectedMonth,
          year: parseInt(year),
          status: 'draft',
          created_by: user?.id,
          total_planned: 0,
          total_completed: 0
        })
        .select()
        .single();

      if (error) throw error;
      setShowCreateModal(false);
      loadWorkPlans();
    } catch (error) {
      console.error('Error creating work plan:', error);
      alert('Error creating work plan');
    }
  };

  const handleStartActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_activities')
        .update({ status: 'in_progress' })
        .eq('id', activityId);

      if (error) throw error;
      loadWorkPlans();
    } catch (error) {
      console.error('Error starting activity:', error);
      alert('Error starting activity');
    }
  };

  const handleEndActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_activities')
        .update({ status: 'completed' })
        .eq('id', activityId);

      if (error) throw error;
      loadWorkPlans();
    } catch (error) {
      console.error('Error ending activity:', error);
      alert('Error ending activity');
    }
  };

  const handleActivityClick = (activity: ScheduledActivity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const calculatePercentages = (plan: WorkPlan) => {
    if (plan.total_planned === 0) return { pending: 0, completed: 0 };
    const completed = (plan.total_completed / plan.total_planned) * 100;
    const pending = 100 - completed;
    return {
      pending: pending.toFixed(1),
      completed: completed.toFixed(1)
    };
  };

  const groupActivitiesByCategory = (activities: PlannedActivity[]) => {
    const grouped: { [key: string]: PlannedActivity[] } = {
      mdo_activity: [],
      employee_activity: []
    };

    activities.forEach(activity => {
      if (activity.activity_type) {
        grouped[activity.activity_type.category].push(activity);
      }
    });

    return grouped;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Work Plan</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your monthly activity plans</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Work Plans List */}
      <div className="space-y-4">
        {workPlans.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Work Plans Yet</h3>
            <p className="text-gray-600 mb-4">Create your first work plan to start tracking your activities</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Work Plan
            </button>
          </div>
        ) : (
          workPlans.map(plan => {
            const percentages = calculatePercentages(plan);
            const isExpanded = expandedPlan === plan.id;
            const groupedActivities = groupActivitiesByCategory(plan.planned_activities);
            const mdoTotal = groupedActivities.mdo_activity.reduce((sum, a) => sum + a.completed_count, 0);
            const mdoPlanned = groupedActivities.mdo_activity.reduce((sum, a) => sum + a.planned_count, 0);
            const empTotal = groupedActivities.employee_activity.reduce((sum, a) => sum + a.completed_count, 0);
            const empPlanned = groupedActivities.employee_activity.reduce((sum, a) => sum + a.planned_count, 0);

            return (
              <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Plan Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                          {new Date(plan.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Created on {new Date(plan.created_at).toLocaleDateString()}
                        {plan.approved_at && ` • Approved on ${new Date(plan.approved_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Planned</div>
                      <div className="text-2xl font-bold text-gray-900">{plan.total_planned}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Completed</div>
                      <div className="text-2xl font-bold text-green-600">{plan.total_completed}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">% Pending</div>
                      <div className="text-2xl font-bold text-yellow-600">{percentages.pending}%</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">% Completed</div>
                      <div className="text-2xl font-bold text-green-600">{percentages.completed}%</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Activity Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* MDO Activities */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-blue-900">MDO Activities</h3>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {mdoTotal}/{mdoPlanned}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {groupedActivities.mdo_activity.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                              <span className="text-sm text-gray-700">{activity.activity_type?.name}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {activity.completed_count}/{activity.planned_count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Employee Activities */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-green-900">Employee Activities</h3>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {empTotal}/{empPlanned}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {groupedActivities.employee_activity.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-100">
                              <span className="text-sm text-gray-700">{activity.activity_type?.name}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {activity.completed_count}/{activity.planned_count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Activities List */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Activities</h3>
                      {plan.scheduled_activities && plan.scheduled_activities.length > 0 ? (
                        <div className="space-y-3">
                          {plan.scheduled_activities
                            .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                            .map(activity => (
                            <div
                              key={activity.id}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleActivityClick(activity)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ')}
                                    </span>
                                    <h4 className="font-semibold text-gray-900">{activity.activity_type?.name}</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {new Date(activity.scheduled_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                    {activity.scheduled_time && (
                                      <div className="flex items-center text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {activity.scheduled_time}
                                      </div>
                                    )}
                                    {activity.location && (
                                      <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {activity.location}
                                      </div>
                                    )}
                                    {activity.village_name && (
                                      <div className="flex items-center text-gray-600">
                                        <Navigation className="w-4 h-4 mr-2" />
                                        {activity.village_name}
                                      </div>
                                    )}
                                  </div>
                                  {(activity.distributor_name || activity.retailer_name) && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      {activity.distributor_name && <span>Distributor: {activity.distributor_name}</span>}
                                      {activity.distributor_name && activity.retailer_name && <span className="mx-2">•</span>}
                                      {activity.retailer_name && <span>Retailer: {activity.retailer_name}</span>}
                                    </div>
                                  )}
                                  {activity.expected_outcome && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <span className="font-medium">Expected Outcome:</span> {activity.expected_outcome}
                                    </div>
                                  )}
                                  {activity.notes && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      <span className="font-medium">Notes:</span> {activity.notes}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col space-y-2 ml-4">
                                  {activity.status === 'pending' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartActivity(activity.id);
                                      }}
                                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                      title="Start this activity"
                                    >
                                      <Play className="w-4 h-4" />
                                      <span>Start</span>
                                    </button>
                                  )}
                                  {activity.status === 'in_progress' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEndActivity(activity.id);
                                      }}
                                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                      title="End this activity"
                                    >
                                      <Square className="w-4 h-4" />
                                      <span>End</span>
                                    </button>
                                  )}
                                  {activity.status === 'completed' && (
                                    <div className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Done</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-600 text-sm text-center py-4">
                            No scheduled activities found for this plan. Activities will appear here once they are scheduled with specific dates and times.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Work Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWorkPlan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedActivity.activity_type?.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  selectedActivity.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedActivity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  selectedActivity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedActivity.status.charAt(0).toUpperCase() + selectedActivity.status.slice(1).replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center text-blue-600 mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Date</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedActivity.scheduled_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedActivity.scheduled_time && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Time</span>
                    </div>
                    <p className="text-gray-900 font-medium">{selectedActivity.scheduled_time}</p>
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-lg">Location Details</h4>

                {selectedActivity.location && (
                  <div className="flex items-start space-x-3 bg-gray-50 rounded-lg p-4">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{selectedActivity.location}</p>
                    </div>
                  </div>
                )}

                {selectedActivity.village_name && (
                  <div className="flex items-start space-x-3 bg-gray-50 rounded-lg p-4">
                    <Navigation className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Village/Area</p>
                      <p className="font-medium text-gray-900">{selectedActivity.village_name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Participant Details */}
              {(selectedActivity.distributor_name || selectedActivity.retailer_name) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg">Participants</h4>

                  {selectedActivity.distributor_name && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Distributor</p>
                      <p className="font-medium text-gray-900">{selectedActivity.distributor_name}</p>
                    </div>
                  )}

                  {selectedActivity.retailer_name && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Retailer</p>
                      <p className="font-medium text-gray-900">{selectedActivity.retailer_name}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Expected Outcome */}
              {selectedActivity.expected_outcome && (
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">Expected Outcome</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedActivity.expected_outcome}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedActivity.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedActivity.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedActivity.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartActivity(selectedActivity.id);
                      setShowActivityModal(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Activity</span>
                  </button>
                )}
                {selectedActivity.status === 'in_progress' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndActivity(selectedActivity.id);
                      setShowActivityModal(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Square className="w-5 h-5" />
                    <span>End Activity</span>
                  </button>
                )}
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

export default WorkPlan;
