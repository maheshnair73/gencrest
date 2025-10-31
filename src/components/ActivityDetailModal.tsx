import React, { useState } from 'react';
import { X, MapPin, Clock, Calendar, User, FileText, Play, Square, Star, MessageSquare, Target, CheckCircle, TrendingUp, Camera, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  date: string;
  activity: string;
  location: string;
  time: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  description?: string;
  assignedTo?: string;
  // Pending activity details
  objectives?: string[];
  expectedOutcomes?: string[];
  preparations?: string[];
  // Completed activity details
  actualOutcomes?: string[];
  achievements?: string[];
  photosCount?: number;
  completedAt?: string;
  completedBy?: string;
  feedbackRating?: number;
  feedbackComments?: string;
}

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onStartMeeting?: (activityId: string) => void;
  onEndMeeting?: (activityId: string) => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
  onStartMeeting,
  onEndMeeting
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'plan' | 'results'>('details');
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: '',
    outcomes: '',
    followUpRequired: false
  });

  if (!isOpen || !activity) {
    return null;
  }

  const handleStartMeeting = () => {
    setMeetingStarted(true);
    if (onStartMeeting) {
      onStartMeeting(activity.id);
    }
  };

  const handleEndMeeting = () => {
    setMeetingStarted(false);
    setMeetingEnded(true);
    if (onEndMeeting) {
      onEndMeeting(activity.id);
    }
  };

  const handleSubmitFeedback = () => {
    // TODO: Submit feedback to backend
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Activity Details</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-white">
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl font-bold text-gray-900">{activity.activity}</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 border-b border-gray-200 -mb-px">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Details
                </button>
                {activity.status === 'Pending' && (
                  <button
                    onClick={() => setActiveTab('plan')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === 'plan'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Activity Plan
                  </button>
                )}
                {activity.status === 'Completed' && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === 'results'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Results
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Location</p>
                    <p className="text-sm text-gray-900 font-semibold">{activity.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Date</p>
                      <p className="text-sm text-gray-900 font-semibold">{activity.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Time</p>
                      <p className="text-sm text-gray-900 font-semibold">{activity.time}</p>
                    </div>
                  </div>
                </div>

                {activity.assignedTo && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Assigned To</p>
                      <p className="text-sm text-gray-900 font-semibold">{activity.assignedTo}</p>
                    </div>
                  </div>
                )}

                {activity.description && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Description</p>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {meetingStarted && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-blue-900">Meeting in Progress</span>
                    </div>
                    <span className="text-xs text-blue-700">Live</span>
                  </div>
                </div>
              )}
                </div>
              )}

            {/* Activity Plan Tab (for Pending activities) */}
            {activeTab === 'plan' && activity.status === 'Pending' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Activity Plan
                </h4>

                {activity.objectives && activity.objectives.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      Objectives
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {activity.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-sm text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.expectedOutcomes && activity.expectedOutcomes.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Expected Outcomes
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {activity.expectedOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-sm text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.preparations && activity.preparations.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                      Required Preparations
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {activity.preparations.map((prep, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          <span className="text-sm text-gray-700">{prep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!activity.objectives || activity.objectives.length === 0) &&
                 (!activity.expectedOutcomes || activity.expectedOutcomes.length === 0) &&
                 (!activity.preparations || activity.preparations.length === 0) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No additional details available for this activity. Please add objectives and preparations before starting.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Results Tab (for Completed activities) */}
            {activeTab === 'results' && activity.status === 'Completed' && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Activity Results
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {activity.completedAt && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-medium mb-1">Completed At</p>
                      <p className="text-sm text-green-900 font-semibold">{activity.completedAt}</p>
                    </div>
                  )}
                  {activity.completedBy && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-medium mb-1">Completed By</p>
                      <p className="text-sm text-green-900 font-semibold">{activity.completedBy}</p>
                    </div>
                  )}
                </div>

                {activity.actualOutcomes && activity.actualOutcomes.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                      Actual Outcomes
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {activity.actualOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.achievements && activity.achievements.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-600" />
                      Key Achievements
                    </h5>
                    <ul className="space-y-2 ml-4">
                      {activity.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-600 mr-2">★</span>
                          <span className="text-sm text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.photosCount && activity.photosCount > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Camera className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">
                          {activity.photosCount} Photo{activity.photosCount > 1 ? 's' : ''} Attached
                        </span>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View Photos
                      </button>
                    </div>
                  </div>
                )}

                {activity.feedbackRating && (
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-semibold text-gray-700">Feedback Rating</h5>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= activity.feedbackRating!
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {activity.feedbackRating} / 5
                        </span>
                      </div>
                    </div>
                    {activity.feedbackComments && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Comments</p>
                        <p className="text-sm text-gray-700">{activity.feedbackComments}</p>
                      </div>
                    )}
                  </div>
                )}

                {(!activity.actualOutcomes || activity.actualOutcomes.length === 0) &&
                 (!activity.achievements || activity.achievements.length === 0) &&
                 !activity.feedbackRating && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      This activity was completed on {activity.date} at {activity.time}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Meeting Feedback Section (shown when meeting ends) */}
            {meetingEnded && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Meeting Feedback
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate this meeting
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= feedback.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {feedback.rating > 0 && (
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {feedback.rating} / 5
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Outcomes
                    </label>
                    <textarea
                      value={feedback.outcomes}
                      onChange={(e) => setFeedback({ ...feedback, outcomes: e.target.value })}
                      placeholder="What was achieved in this meeting?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments
                    </label>
                    <textarea
                      value={feedback.comments}
                      onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                      placeholder="Any additional notes or observations..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="followUpRequired"
                      checked={feedback.followUpRequired}
                      onChange={(e) => setFeedback({ ...feedback, followUpRequired: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="followUpRequired" className="ml-2 text-sm text-gray-700">
                      Follow-up action required
                    </label>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {meetingEnded ? (
              <>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Submit Feedback
                </button>
              </>
            ) : (
              <>
                {activity.status !== 'Completed' && (
                  <>
                    {!meetingStarted ? (
                      <button
                        onClick={handleStartMeeting}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Meeting
                      </button>
                    ) : (
                      <button
                        onClick={handleEndMeeting}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        End Meeting
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;
