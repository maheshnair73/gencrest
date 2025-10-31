import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, CheckCircle, TrendingUp, Users, Calendar, MapPin, Clock, Plus, Eye } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import WorkPlanCalendar from '../components/WorkPlanCalendar';
import CreateAWPModal, { AWPFormData } from '../components/CreateAWPModal';
import ActivityDetailModal from '../components/ActivityDetailModal';
import VerificationApprovals from '../components/activities/VerificationApprovals';

const ActivityTracker: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: workPlanId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [awpActivities, setAwpActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'verifications'>('overview');


  const isTSM = user?.role === 'TSM';
  const isRMM = user?.role === 'RMM';
  const isMyActivity = location.pathname.includes('/my-activity');
  const isTeamActivity = location.pathname.includes('/team-activity');
  const isWorkPlans = location.pathname === '/activity-tracker/work-plans';
  const isWorkPlanDetail = location.pathname.includes('/work-plan/') && workPlanId;

  const activityStats = {
    tasksPlanned: 15,
    tasksDone: 12,
    tasksCompletedPercentage: 80
  };

  // Mock team data for TSM/RMM
  const teamMDOs = [
    { id: 1, name: 'John Doe', territory: 'North Zone', tasksPlanned: 20, tasksDone: 18, percentage: 90 },
    { id: 2, name: 'Jane Smith', territory: 'South Zone', tasksPlanned: 18, tasksDone: 15, percentage: 83 },
    { id: 3, name: 'Mike Johnson', territory: 'East Zone', tasksPlanned: 22, tasksDone: 19, percentage: 86 },
    { id: 4, name: 'Sarah Williams', territory: 'West Zone', tasksPlanned: 25, tasksDone: 20, percentage: 80 },
  ];

  // Mock Work Plans data
  const allWorkPlans = [
    {
      id: '1',
      createdBy: 'Rajesh Kumar (TSM)',
      createdDate: '2025-10-20',
      preparedOn: '2025-10-18 09:30 AM',
      approvalStatus: 'Approved',
      approvedBy: 'Amit Verma (RMM)',
      approvedDate: '2025-10-19 02:15 PM',
      planMonth: 'October 2025',
      tasksCount: 5,
      completedTasks: 3,
      tasks: [
        {
          id: 1,
          date: '2025-10-25',
          activity: 'Retailer Visit',
          location: 'ABC Store, North Zone',
          time: '10:00 AM',
          status: 'Completed',
          description: 'Conduct quarterly review meeting with retailer to discuss sales performance and new product launches',
          completedAt: '2025-10-25 10:45 AM',
          completedBy: 'Priya Sharma (TSM)',
          actualOutcomes: [
            'Reviewed Q3 sales performance - achieved 95% of target',
            'Discussed placement of 3 new SKUs in premium section',
            'Identified shelf space optimization opportunities'
          ],
          achievements: [
            'Secured commitment for additional 50 units order',
            'Established weekly stock replenishment schedule',
            'Resolved billing discrepancy from last month'
          ],
          photosCount: 4,
          feedbackRating: 5,
          feedbackComments: 'Excellent engagement from retailer. Very positive about new product line.'
        },
        {
          id: 2,
          date: '2025-10-25',
          activity: 'Stock Verification',
          location: 'XYZ Distributor',
          time: '2:00 PM',
          status: 'Completed',
          description: 'Monthly physical stock count and inventory reconciliation',
          completedAt: '2025-10-25 3:30 PM',
          completedBy: 'Priya Sharma (TSM)',
          actualOutcomes: [
            'Physical stock matched system records - 98% accuracy',
            'Identified 12 units of expired stock for return',
            'Updated inventory management system'
          ],
          achievements: [
            'Completed verification 2 days ahead of schedule',
            'Zero discrepancy in high-value items',
            'Implemented new barcode scanning process'
          ],
          photosCount: 6,
          feedbackRating: 4
        },
        {
          id: 3,
          date: '2025-10-26',
          activity: 'Market Survey',
          location: 'Area 5',
          time: '11:00 AM',
          status: 'Completed',
          description: 'Competitive analysis and market intelligence gathering in target area',
          completedAt: '2025-10-26 1:15 PM',
          completedBy: 'Priya Sharma (TSM)',
          actualOutcomes: [
            'Surveyed 15 retail outlets in the area',
            'Documented competitor pricing and promotions',
            'Identified 8 potential new retail partners'
          ],
          achievements: [
            'Discovered untapped market segment',
            'Collected 25 customer feedback forms',
            'Mapped complete competitive landscape'
          ],
          photosCount: 12,
          feedbackRating: 5,
          feedbackComments: 'Comprehensive survey with actionable insights. Identified clear opportunities for expansion.'
        },
        {
          id: 4,
          date: '2025-10-26',
          activity: 'Retailer Meeting',
          location: 'DEF Store',
          time: '3:00 PM',
          status: 'Pending',
          description: 'New partnership discussion and contract negotiation with potential retailer',
          objectives: [
            'Present company profile and product portfolio',
            'Discuss partnership terms and conditions',
            'Negotiate pricing and payment terms',
            'Finalize initial order quantity'
          ],
          expectedOutcomes: [
            'Signed partnership agreement',
            'Initial order of minimum 100 units',
            'Establish delivery and payment schedule',
            'Set up regular review meeting cadence'
          ],
          preparations: [
            'Prepare company presentation deck',
            'Print product catalogs and price lists',
            'Review competitor analysis for the area',
            'Draft partnership agreement document',
            'Arrange product samples for demonstration'
          ]
        },
        {
          id: 5,
          date: '2025-10-27',
          activity: 'Territory Review',
          location: 'Regional Office',
          time: '9:00 AM',
          status: 'Pending',
          description: 'Monthly territory performance review with Regional Manager',
          objectives: [
            'Present monthly sales performance vs targets',
            'Review key account status and opportunities',
            'Discuss challenges and resource requirements',
            'Plan next month activities and priorities'
          ],
          expectedOutcomes: [
            'Approval for additional promotional budget',
            'Support for 2 new retailer onboarding',
            'Clarity on Q4 sales targets',
            'Resource allocation for territory expansion'
          ],
          preparations: [
            'Compile monthly sales report with analytics',
            'Prepare retailer visit summary documentation',
            'Create next month activity calendar',
            'List resource requirements and justifications',
            'Gather competitor activity intelligence'
          ]
        },
      ]
    },
    {
      id: '2',
      createdBy: 'Rajesh Kumar (TSM)',
      createdDate: '2025-09-22',
      preparedOn: '2025-09-18 10:15 AM',
      approvalStatus: 'Approved',
      approvedBy: 'Amit Verma (RMM)',
      approvedDate: '2025-09-20 03:30 PM',
      planMonth: 'September 2025',
      tasksCount: 6,
      completedTasks: 6,
      tasks: [
        { id: 1, date: '2025-09-25', activity: 'Distributor Meeting', location: 'Central Hub', time: '10:00 AM', status: 'Completed' },
        { id: 2, date: '2025-09-26', activity: 'Retailer Training', location: 'Training Center', time: '2:00 PM', status: 'Completed' },
        { id: 3, date: '2025-09-27', activity: 'Market Research', location: 'Zone 3', time: '11:00 AM', status: 'Completed' },
        { id: 4, date: '2025-09-28', activity: 'Stock Audit', location: 'Warehouse A', time: '3:00 PM', status: 'Completed' },
        { id: 5, date: '2025-09-29', activity: 'Team Review', location: 'Regional Office', time: '9:00 AM', status: 'Completed' },
        { id: 6, date: '2025-09-30', activity: 'Monthly Report', location: 'Head Office', time: '11:00 AM', status: 'Completed' },
      ]
    },
    {
      id: '3',
      createdBy: 'Amit Verma (RMM)',
      createdDate: '2025-08-18',
      preparedOn: '2025-08-15 09:00 AM',
      approvalStatus: 'Approved',
      approvedBy: 'Suresh Patel (MH)',
      approvedDate: '2025-08-17 01:45 PM',
      planMonth: 'August 2025',
      tasksCount: 7,
      completedTasks: 7,
      tasks: [
        { id: 1, date: '2025-08-20', activity: 'Product Launch', location: 'Main Market', time: '10:00 AM', status: 'Completed' },
        { id: 2, date: '2025-08-21', activity: 'Client Meeting', location: 'Office', time: '2:00 PM', status: 'Completed' },
      ]
    }
  ];

  // Find the current work plan
  const currentWorkPlan = workPlanId
    ? allWorkPlans.find(plan => plan.id === workPlanId)
    : allWorkPlans[0];

  const totalTeamPlanned = teamMDOs.reduce((sum, mdo) => sum + mdo.tasksPlanned, 0);
  const totalTeamDone = teamMDOs.reduce((sum, mdo) => sum + mdo.tasksDone, 0);
  const teamPercentage = Math.round((totalTeamDone / totalTeamPlanned) * 100);

  const pageTitle = isWorkPlans ? 'Work Plans' :
                    isWorkPlanDetail ? 'Work Plan Details' :
                    isTeamActivity ? 'Team Activity' :
                    isMyActivity ? 'My Activity' :
                    'Activity Tracker';
  const statsToShow = isTeamActivity ? {
    tasksPlanned: totalTeamPlanned,
    tasksDone: totalTeamDone,
    tasksCompletedPercentage: teamPercentage
  } : activityStats;

  const handleCreateActivity = (date: string) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const handleSubmitAWP = (data: AWPFormData) => {
    const newActivity = {
      id: awpActivities.length + 1,
      ...data,
      status: 'Pending'
    };
    setAwpActivities([...awpActivities, newActivity]);
  };

  const handleActivityClick = (activity: any) => {
    const formattedActivity = {
      ...activity,
      id: String(activity.id),
      status: activity.status as 'Completed' | 'Pending' | 'In Progress'
    };

    setSelectedActivity(formattedActivity);
    setModalKey(prev => prev + 1);
  };

  const handleStartMeeting = (activityId: string) => {
    // TODO: Implement meeting start logic
  };

  const handleEndMeeting = (activityId: string) => {
    // TODO: Implement meeting end logic
  };

  // Work Plans List View
  if (isWorkPlans) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {(isTSM || isRMM) ? 'Work Plans' : 'My Work Plans'}
              </h1>
              <p className="text-gray-600">{user?.name} - {user?.territory}</p>
            </div>
          </div>

          <div className="space-y-4">
            {allWorkPlans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.planMonth}</h3>
                    <p className="text-sm text-gray-600">Prepared on {plan.preparedOn}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    plan.approvalStatus === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : plan.approvalStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.approvalStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Created By</p>
                    <p className="text-sm font-medium text-gray-900">{plan.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approved By</p>
                    <p className="text-sm font-medium text-gray-900">{plan.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Approval Date</p>
                    <p className="text-sm font-medium text-gray-900">{plan.approvedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tasks Progress</p>
                    <p className="text-sm font-medium text-gray-900">
                      {plan.completedTasks}/{plan.tasksCount} Completed
                      <span className="ml-2 text-xs text-gray-600">
                        ({Math.round((plan.completedTasks / plan.tasksCount) * 100)}%)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/activity-tracker/work-plan/${plan.id}`)}
                    className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Detail Modal */}
        {modalKey > 0 && selectedActivity && (
          <ActivityDetailModal
            key={modalKey}
            isOpen={true}
            onClose={() => {
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
            onStartMeeting={handleStartMeeting}
            onEndMeeting={handleEndMeeting}
          />
        )}
      </div>
    );
  }

  // Work Plan Detail View
  if (isWorkPlanDetail && currentWorkPlan) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div
            className="flex items-center space-x-3 mb-6 cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-t-xl transition-colors"
            onClick={() => navigate(`/activity-tracker/work-plan/${currentWorkPlan.id}`)}
            role="button"
            tabIndex={0}
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Work Plan (AWP)</h1>
              <p className="text-gray-600">{user?.name} - {user?.territory}</p>
            </div>
          </div>

          <div
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => navigate(`/activity-tracker/work-plan/${currentWorkPlan.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Prepared On</p>
                <p className="text-sm font-semibold text-gray-900">{currentWorkPlan.preparedOn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Created By</p>
                <p className="text-sm font-semibold text-gray-900">{currentWorkPlan.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Plan Period</p>
                <p className="text-sm font-semibold text-gray-900">{currentWorkPlan.planMonth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Approval Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  currentWorkPlan.approvalStatus === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : currentWorkPlan.approvalStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentWorkPlan.approvalStatus}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Approved By & Date</p>
                <p className="text-sm font-semibold text-gray-900">{currentWorkPlan.approvedBy}</p>
                <p className="text-xs text-gray-600">{currentWorkPlan.approvedDate}</p>
              </div>
            </div>
          </div>

          <WorkPlanCalendar
            activities={currentWorkPlan.tasks}
            canCreate={false}
            onActivityClick={handleActivityClick}
          />
        </div>

        {/* Activity Detail Modal */}
        {modalKey > 0 && selectedActivity && (
          <ActivityDetailModal
            key={modalKey}
            isOpen={true}
            onClose={() => {
              setSelectedActivity(null);
            }}
            activity={selectedActivity}
            onStartMeeting={handleStartMeeting}
            onEndMeeting={handleEndMeeting}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {isTeamActivity ? (
              <Users className="w-8 h-8 text-blue-600" />
            ) : (
              <CheckSquare className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-gray-600">{user?.name} - {user?.territory}</p>
            </div>
          </div>
          {(isMyActivity || isTeamActivity) && (
            <button
              onClick={() => handleCreateActivity('')}
              className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Activity
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsToShow.tasksPlanned}
            </div>
            <div className="text-sm font-medium text-gray-700">Tasks Planned</div>
            <div className="text-xs text-gray-600 mt-1">Current month</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsToShow.tasksDone}
            </div>
            <div className="text-sm font-medium text-gray-700">Tasks Done</div>
            <div className="text-xs text-gray-600 mt-1">Completed successfully</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {statsToShow.tasksCompletedPercentage}%
            </div>
            <div className="text-sm font-medium text-gray-700">Task Completed %</div>
            <div className="text-xs text-gray-600 mt-1">Success rate</div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {statsToShow.tasksDone} / {statsToShow.tasksPlanned} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${statsToShow.tasksCompletedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {isTeamActivity && (
        <div className="bg-white rounded-xl card-shadow">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                MDO Activity Overview
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'create'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create AWP for Team
              </button>
              <button
                onClick={() => setActiveTab('verifications')}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'verifications'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stock Verifications
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">MDO Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Territory</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tasks Planned</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tasks Done</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMDOs.map((mdo) => (
                      <tr key={mdo.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{mdo.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{mdo.territory}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900">{mdo.tasksPlanned}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900">{mdo.tasksDone}</td>
                        <td className="py-3 px-4 text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mdo.percentage >= 85 ? 'bg-green-100 text-green-800' :
                            mdo.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {mdo.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'create' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Create and assign activities to your MDO team members</p>
                  <button
                    onClick={() => handleCreateActivity('')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Activity
                  </button>
                </div>

                <WorkPlanCalendar
                  activities={awpActivities}
                  onAddActivity={handleCreateActivity}
                  onActivityClick={handleActivityClick}
                  canCreate={true}
                />
              </div>
            )}

            {activeTab === 'verifications' && (
              <VerificationApprovals />
            )}
          </div>
        </div>
      )}

      {!isTeamActivity && (
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Retailer Visit - Shop ABC</p>
                  <p className="text-xs text-gray-600">Completed today at 10:30 AM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Stock Verification - Distributor XYZ</p>
                  <p className="text-xs text-gray-600">Completed today at 2:15 PM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Market Survey - Area 5</p>
                  <p className="text-xs text-gray-600">Scheduled for tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateAWPModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedDate={selectedDate}
        onSubmit={handleSubmitAWP}
      />

      {modalKey > 0 && selectedActivity && (
        <ActivityDetailModal
          key={modalKey}
          isOpen={true}
          onClose={() => {
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
          onStartMeeting={handleStartMeeting}
          onEndMeeting={handleEndMeeting}
        />
      )}
    </div>
  );
};

export default ActivityTracker;
