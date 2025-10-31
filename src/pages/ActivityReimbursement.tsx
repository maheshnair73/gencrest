import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Eye, Calendar, Users, Target, DollarSign, CheckCircle, Clock, XCircle, FileText, X, Upload } from 'lucide-react';

interface ActivityReimbursement {
  id: string;
  activityName: string;
  activityType: 'Farmer Meeting' | 'Dealer Meet' | 'Product Demo' | 'Training Session' | 'Field Day' | 'Exhibition' | 'Other';
  activityDate: string;
  attendees: string;
  attendeeCount: number;
  outcome: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  remarks?: string;
  proofAttachment?: string;
}

const ActivityReimbursement: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('create');
  const [selectedActivity, setSelectedActivity] = useState<ActivityReimbursement | null>(null);

  const [formData, setFormData] = useState({
    activityName: '',
    activityType: 'Farmer Meeting' as ActivityReimbursement['activityType'],
    activityDate: new Date().toISOString().split('T')[0],
    attendees: '',
    attendeeCount: 0,
    outcome: '',
    amount: 0,
    proofAttachment: '',
  });

  const [activities] = useState<ActivityReimbursement[]>([
    {
      id: '1',
      activityName: 'Rabi Season Product Launch',
      activityType: 'Dealer Meet',
      activityDate: '2025-10-15',
      attendees: 'Dealers from North Region',
      attendeeCount: 45,
      outcome: 'Successfully launched 3 new products. Received orders worth ₹15L',
      amount: 12500,
      status: 'Approved',
      submittedDate: '2025-10-16',
      approvedBy: 'Regional Manager',
      approvedDate: '2025-10-18',
    },
    {
      id: '2',
      activityName: 'Organic Farming Training',
      activityType: 'Training Session',
      activityDate: '2025-10-12',
      attendees: 'Farmers from 5 villages',
      attendeeCount: 78,
      outcome: 'Trained farmers on organic practices. 60% showed interest in adopting',
      amount: 8500,
      status: 'Approved',
      submittedDate: '2025-10-13',
      approvedBy: 'TSM',
      approvedDate: '2025-10-14',
    },
    {
      id: '3',
      activityName: 'Pest Control Workshop',
      activityType: 'Farmer Meeting',
      activityDate: '2025-10-20',
      attendees: 'Progressive farmers and dealers',
      attendeeCount: 32,
      outcome: 'Demonstrated new pest control products. Generated immediate orders',
      amount: 6500,
      status: 'Pending',
      submittedDate: '2025-10-21',
    },
  ]);

  const activityTypes = [
    'Farmer Meeting',
    'Dealer Meet',
    'Product Demo',
    'Training Session',
    'Field Day',
    'Exhibition',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting activity reimbursement:', formData);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      activityName: '',
      activityType: 'Farmer Meeting',
      activityDate: new Date().toISOString().split('T')[0],
      attendees: '',
      attendeeCount: 0,
      outcome: '',
      amount: 0,
      proofAttachment: '',
    });
  };

  const handleEdit = (activity: ActivityReimbursement) => {
    setSelectedActivity(activity);
    setFormData({
      activityName: activity.activityName,
      activityType: activity.activityType,
      activityDate: activity.activityDate,
      attendees: activity.attendees,
      attendeeCount: activity.attendeeCount,
      outcome: activity.outcome,
      amount: activity.amount,
    });
    setViewMode('edit');
    setShowModal(true);
  };

  const handleView = (activity: ActivityReimbursement) => {
    setSelectedActivity(activity);
    setViewMode('view');
    setShowModal(true);
  };

  const handleCreate = () => {
    resetForm();
    setSelectedActivity(null);
    setViewMode('create');
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = activities.reduce((sum, activity) => sum + activity.amount, 0);
  const approvedAmount = activities.filter(a => a.status === 'Approved').reduce((sum, activity) => sum + activity.amount, 0);
  const pendingAmount = activities.filter(a => a.status === 'Pending').reduce((sum, activity) => sum + activity.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Reimbursement</h1>
          <p className="text-gray-600 mt-1">Submit and track reimbursements for activities conducted</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Total Claimed</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-blue-700 mt-1">{activities.length} activities</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{approvedAmount.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">{activities.filter(a => a.status === 'Approved').length} activities</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">₹{pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-yellow-700 mt-1">{activities.filter(a => a.status === 'Pending').length} activities</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Activity Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Attendees</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{activity.activityName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(activity.submittedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.activityType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      {new Date(activity.activityDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                      {activity.attendeeCount}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">₹{activity.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(activity)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {activity.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {viewMode === 'view' ? 'Activity Details' : viewMode === 'edit' ? 'Edit Activity' : 'New Activity Reimbursement'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {viewMode === 'view' && selectedActivity ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                    <p className="text-gray-900">{selectedActivity.activityName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{selectedActivity.activityType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-gray-900">{new Date(selectedActivity.activityDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
                    <p className="text-gray-900">{selectedActivity.attendeeCount}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendees Details</label>
                    <p className="text-gray-900">{selectedActivity.attendees}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                    <p className="text-gray-900">{selectedActivity.outcome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <p className="text-gray-900 font-semibold">₹{selectedActivity.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedActivity.status)}`}>
                      {selectedActivity.status}
                    </span>
                  </div>
                  {selectedActivity.status === 'Approved' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                        <p className="text-gray-900">{selectedActivity.approvedBy}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                        <p className="text-gray-900">{selectedActivity.approvedDate && new Date(selectedActivity.approvedDate).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.activityName}
                      onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Farmer Training on Organic Practices"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
                    <select
                      required
                      value={formData.activityType}
                      onChange={(e) => setFormData({ ...formData, activityType: e.target.value as ActivityReimbursement['activityType'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {activityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.activityDate}
                      onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendees Details *</label>
                    <textarea
                      required
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="e.g., Farmers from 5 villages, Dealers from North Region"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.attendeeCount}
                      onChange={(e) => setFormData({ ...formData, attendeeCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reimbursement Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label>
                    <textarea
                      required
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe the outcome and impact of the activity"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Attach Proof <span className="text-gray-500 text-xs font-normal">(Optional - photos, documents, etc.)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, proofAttachment: file.name });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.proofAttachment && (
                      <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {formData.proofAttachment}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {viewMode === 'edit' ? 'Update' : 'Submit'} Activity
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityReimbursement;
