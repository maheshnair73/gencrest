import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessValidation } from '../utils/businessValidation';
import { Car, Plus, Calendar, MapPin, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowLeft, X, Download, Eye, FileText, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TravelClaim {
  id: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  mode: 'Car' | 'Bike' | 'Public Transport' | 'Flight' | 'Train';
  amount: number;
  originalAmount?: number;
  adjustedAmount?: number;
  adjustmentReason?: string;
  purpose: string;
  purposeCategory?: 'Customer Visit' | 'Distributor Visit' | 'Retailer Visit' | 'Dealer Meeting' | 'Market Visit' | 'Office Work' | 'Training' | 'Other';
  customerName?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  receipts: string[];
  approvedBy?: string;
  remarks?: string;
}

const TravelReimbursement: React.FC = () => {
  const navigate = useNavigate();
  const { validateAndAlert } = useBusinessValidation();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    distance: 0,
    mode: 'Car' as TravelClaim['mode'],
    amount: 0,
    purpose: '',
    purposeCategory: 'Customer Visit' as TravelClaim['purposeCategory'],
    customerName: '',
  });

  const [claims, setClaims] = useState<TravelClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<TravelClaim | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<TravelClaim | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadClaims();
    }
  }, [currentUser]);

  const loadClaims = async () => {
    if (!currentUser) {
      console.log('No current user, skipping load');
      setLoading(false);
      return;
    }

    console.log('Loading claims for user:', currentUser);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('travel_claims')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      console.log('Query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setClaims([]);
        setLoading(false);
        return;
      }

      const formattedClaims: TravelClaim[] = (data || []).map(claim => ({
        id: claim.id,
        date: claim.claim_date,
        fromLocation: claim.from_location,
        toLocation: claim.to_location,
        distance: claim.distance_km,
        mode: claim.travel_mode as TravelClaim['mode'],
        amount: claim.adjusted_amount || claim.amount,
        originalAmount: claim.original_amount,
        adjustedAmount: claim.adjusted_amount,
        adjustmentReason: claim.adjustment_reason,
        purpose: claim.purpose,
        purposeCategory: claim.purpose_category as TravelClaim['purposeCategory'],
        customerName: claim.customer_name,
        status: claim.status as TravelClaim['status'],
        receipts: [],
        approvedBy: claim.approved_by,
        remarks: claim.rejection_reason
      }));

      console.log('Formatted claims:', formattedClaims.length);
      setClaims(formattedClaims);
    } catch (error: any) {
      console.error('Error loading claims:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'text-gray-700 bg-gray-100';
      case 'Submitted':
        return 'text-blue-700 bg-blue-100';
      case 'Approved':
        return 'text-green-700 bg-green-100';
      case 'Rejected':
        return 'text-red-700 bg-red-100';
      case 'Paid':
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Submitted':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Car':
      case 'Bike':
        return <Car className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0);
  const approvedAmount = claims.filter(c => c.status === 'Approved').reduce((sum, claim) => sum + claim.amount, 0);
  const pendingAmount = claims.filter(c => c.status === 'Submitted').reduce((sum, claim) => sum + claim.amount, 0);

  const handleCreateClaim = () => {
    setEditingClaim(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      fromLocation: '',
      toLocation: '',
      distance: 0,
      mode: 'Car',
      amount: 0,
      purpose: '',
      purposeCategory: 'Customer Visit',
      customerName: '',
    });
    setShowModal(true);
  };

  const handleEditClaim = (claim: TravelClaim) => {
    setEditingClaim(claim);
    setFormData({
      date: claim.date,
      fromLocation: claim.fromLocation,
      toLocation: claim.toLocation,
      distance: claim.distance,
      mode: claim.mode,
      amount: claim.amount,
      purpose: claim.purpose,
      purposeCategory: claim.purposeCategory || 'Customer Visit',
      customerName: claim.customerName || '',
    });
    setShowModal(true);
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('travel_claims')
        .delete()
        .eq('id', claimId);

      if (error) throw error;

      alert('Claim deleted successfully');
      loadClaims();
    } catch (error) {
      console.error('Error deleting claim:', error);
      alert('Failed to delete claim. Please try again.');
    }
  };

  const handleViewDetails = (claim: TravelClaim) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = (claim: TravelClaim) => {
    const pdfContent = `
TRAVEL REIMBURSEMENT CLAIM
========================

Claim ID: ${claim.id}
Date: ${new Date(claim.date).toLocaleDateString()}
Status: ${claim.status}

TRAVEL DETAILS
-------------
From: ${claim.fromLocation}
To: ${claim.toLocation}
Distance: ${claim.distance} km
Mode of Transport: ${claim.mode}

CLAIM INFORMATION
----------------
Amount: ₹${claim.amount.toLocaleString()}
Rate: ₹${(claim.amount / claim.distance).toFixed(2)}/km
Purpose: ${claim.purpose}
Category: ${claim.purposeCategory || 'N/A'}
${claim.customerName ? `Customer: ${claim.customerName}` : ''}

${claim.approvedBy ? `Approved By: ${claim.approvedBy}` : ''}
${claim.remarks ? `Remarks: ${claim.remarks}` : ''}

Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
    `.trim();

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-claim-${claim.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please log in to submit a claim');
      return;
    }

    setSubmitting(true);

    try {
      const claimData = {
        user_id: currentUser.id,
        claim_date: formData.date,
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        distance_km: formData.distance,
        travel_mode: formData.mode,
        amount: formData.amount,
        original_amount: formData.amount,
        purpose: formData.purpose,
        purpose_category: formData.purposeCategory,
        customer_name: formData.customerName || null,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      };

      if (editingClaim) {
        // Update existing claim
        const { error } = await supabase
          .from('travel_claims')
          .update(claimData)
          .eq('id', editingClaim.id);

        if (error) throw error;

        alert('Travel claim updated successfully!');
      } else {
        // Insert new claim
        const { error } = await supabase
          .from('travel_claims')
          .insert(claimData);

        if (error) throw error;

        alert('Travel claim submitted successfully! Your manager will be notified.');
      }

      setShowModal(false);
      setEditingClaim(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        fromLocation: '',
        toLocation: '',
        distance: 0,
        mode: 'Car',
        amount: 0,
        purpose: '',
        purposeCategory: 'Customer Visit',
        customerName: '',
      });

      // Reload claims
      loadClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Travel Reimbursement</h1>
            <p className="text-gray-600 mt-1">Track and manage your travel expenses</p>
          </div>
        </div>
        <button 
          onClick={handleCreateClaim}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Claim
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">₹{approvedAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your claims...</p>
          </div>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-lg p-12 card-shadow text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Yet</h3>
          <p className="text-gray-600 mb-6">Click "Add Claim" to submit your first travel reimbursement claim.</p>
          <button
            onClick={handleCreateClaim}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Claim
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
          <div key={claim.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  {getModeIcon(claim.mode)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{claim.purpose}</h3>
                  <p className="text-sm text-gray-600">{new Date(claim.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(claim.status)}`}>
                {getStatusIcon(claim.status)}
                <span className="ml-1">{claim.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">From: {claim.fromLocation}</p>
                  <p>To: {claim.toLocation}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Car className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">{claim.mode}</p>
                  <p>{claim.distance} km</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">₹{claim.amount.toLocaleString()}</p>
                  {claim.adjustedAmount && claim.adjustedAmount !== claim.originalAmount && (
                    <p className="text-xs text-orange-600">
                      Adjusted from ₹{claim.originalAmount?.toLocaleString()}
                    </p>
                  )}
                  <p>₹{(claim.amount / claim.distance).toFixed(2)}/km</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">Receipts</p>
                  <p>{claim.receipts.length} attached</p>
                </div>
              </div>
            </div>

            {(claim.remarks || claim.adjustmentReason) && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                {claim.adjustmentReason && (
                  <div className="bg-orange-50 p-2 rounded border border-orange-200">
                    <p className="text-xs font-medium text-orange-900 mb-1">Amount Adjusted</p>
                    <p className="text-sm text-orange-800">{claim.adjustmentReason}</p>
                  </div>
                )}
                {claim.remarks && (
                  <p className="text-sm text-gray-700">{claim.remarks}</p>
                )}
                {claim.approvedBy && (
                  <p className="text-xs text-gray-500 mt-1">Approved by: {claim.approvedBy}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleViewDetails(claim)}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              {(claim.status === 'Draft' || claim.status === 'Rejected') && (
                <button
                  onClick={() => handleEditClaim(claim)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              {(claim.status === 'Draft' || claim.status === 'Rejected') && (
                <button
                  onClick={() => handleDeleteClaim(claim.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
              <button
                onClick={() => handleDownloadPDF(claim)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingClaim ? 'Edit Travel Claim' : 'Add Travel Claim'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode *</label>
                  <select
                    required
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as TravelClaim['mode'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Public Transport">Public Transport</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Delhi Office"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Client Location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose Category *</label>
                  <select
                    required
                    value={formData.purposeCategory}
                    onChange={(e) => setFormData({ ...formData, purposeCategory: e.target.value as TravelClaim['purposeCategory'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Customer Visit">Customer Visit</option>
                    <option value="Distributor Visit">Distributor Visit</option>
                    <option value="Retailer Visit">Retailer Visit</option>
                    <option value="Dealer Meeting">Dealer Meeting</option>
                    <option value="Market Visit">Market Visit</option>
                    <option value="Office Work">Office Work</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer/Dealer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Ram Kumar"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Notes *</label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of travel purpose"
                  />
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
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Claim ID</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedClaim.status)}`}>
                  {getStatusIcon(selectedClaim.status)}
                  <span className="ml-1">{selectedClaim.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium text-gray-900">{new Date(selectedClaim.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mode of Transport</p>
                  <p className="font-medium text-gray-900">{selectedClaim.mode}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Travel Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-medium text-gray-900">{selectedClaim.fromLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-medium text-gray-900">{selectedClaim.toLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Car className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-medium text-gray-900">{selectedClaim.distance} km</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Claim Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div className="w-full">
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">₹{selectedClaim.amount.toLocaleString()}</p>
                      {selectedClaim.adjustedAmount && selectedClaim.adjustedAmount !== selectedClaim.originalAmount && (
                        <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                          <p className="text-xs font-medium text-orange-900">Amount was adjusted</p>
                          <p className="text-xs text-orange-700">Original: ₹{selectedClaim.originalAmount?.toLocaleString()}</p>
                          <p className="text-xs text-orange-700">Approved: ₹{selectedClaim.adjustedAmount.toLocaleString()}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">₹{(selectedClaim.amount / selectedClaim.distance).toFixed(2)}/km</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose</p>
                    <p className="font-medium text-gray-900">{selectedClaim.purpose}</p>
                  </div>
                  {selectedClaim.purposeCategory && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-medium text-gray-900">{selectedClaim.purposeCategory}</p>
                    </div>
                  )}
                  {selectedClaim.customerName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-900">{selectedClaim.customerName}</p>
                    </div>
                  )}
                </div>
              </div>

              {(selectedClaim.adjustmentReason || selectedClaim.remarks) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedClaim.adjustmentReason ? 'Adjustment & Remarks' : 'Remarks'}
                  </h3>
                  {selectedClaim.adjustmentReason && (
                    <div className="mb-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-900 mb-1">Reason for Amount Adjustment:</p>
                      <p className="text-sm text-orange-800">{selectedClaim.adjustmentReason}</p>
                    </div>
                  )}
                  {selectedClaim.remarks && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClaim.remarks}</p>
                  )}
                </div>
              )}

              {selectedClaim.approvedBy && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Approval Details</h3>
                  <p className="text-sm text-gray-600">Approved by: <span className="font-medium text-gray-900">{selectedClaim.approvedBy}</span></p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownloadPDF(selectedClaim)}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Claim
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
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

export default TravelReimbursement;