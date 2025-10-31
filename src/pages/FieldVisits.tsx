import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessValidation } from '../utils/businessValidation';
import { MapPin, Calendar, Clock, Plus, CheckCircle, AlertCircle, Navigation, Camera, FileText, User, Phone, DollarSign, Target, Star, Filter, Search, Download, CreditCard, Trash2, ArrowLeft, Eye, Users, Building, Crown, Shield } from 'lucide-react';
import { SignatureCapture } from '../components/SignatureCapture';
import { MediaUpload } from '../components/MediaUpload';
import VisitManager from '../components/VisitManager';

interface Visit {
  id: string;
  customerName: string;
  customerCode: string;
  date: string;
  time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
  objectives: string[];
  outcomes: string[];
  orderValue?: number;
  paymentCollected?: number;
  nextFollowUp?: string;
  customerFeedback?: {
    satisfaction: number;
    comments: string;
  };
  competitorInfo?: {
    name: string;
    products: string[];
    pricing: number;
  }[];
  media?: string[];
  signature?: string;
  actionItems?: {
    description: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

interface MDOActivity {
  id: string;
  mdoName: string;
  mdoCode: string;
  mdoTerritory: string;
  customerName: string;
  customerCode: string;
  date: string;
  time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Pending Approval';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
  objectives: string[];
  outcomes: string[];
  orderValue?: number;
  paymentCollected?: number;
  requiresApproval?: boolean;
  approvalReason?: string;
  priority: 'High' | 'Medium' | 'Low';
}

const FieldVisits: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validateAndAlert } = useBusinessValidation();
  const [activeTab, setActiveTab] = useState<'my-meetings' | 'my-team'>('my-meetings');
  const [visits, setVisits] = useState<Visit[]>([
    {
      id: '1',
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      date: '2024-01-20',
      time: '10:00 AM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      type: 'Product Demo',
      status: 'Scheduled',
      objectives: ['Demonstrate new DAP fertilizer line', 'Review liquidation progress', 'Discuss bulk pricing', 'Collect customer feedback'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0,
      actionItems: [
        { description: 'Follow up on bulk order pricing', dueDate: '2024-01-25', priority: 'High' },
        { description: 'Send product brochures', dueDate: '2024-01-22', priority: 'Medium' }
      ]
    },
    {
      id: '2',
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      date: '2024-01-20',
      time: '2:30 PM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      type: 'Stock Review',
      status: 'Scheduled',
      objectives: ['Review inventory levels', 'Discuss liquidation strategy', 'Check retailer performance'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0
    },
    {
      id: '3',
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      date: '2024-01-20',
      time: '4:00 PM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      type: 'Payment Collection',
      status: 'Scheduled',
      objectives: ['Collect outstanding payment', 'Discuss new product launch', 'Review credit terms'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0
    },
    {
      id: '4',
      customerName: 'Suresh Traders',
      customerCode: 'ST001',
      date: '2024-01-20',
      time: '11:30 AM',
      location: 'Sector 15, Delhi',
      coordinates: { lat: 28.5500, lng: 77.2500 },
      type: 'Farmer Meet',
      status: 'In Progress',
      checkInTime: '11:25 AM',
      notes: 'Good farmer participation, discussing new fertilizer benefits',
      objectives: ['Conduct farmer education session', 'Demonstrate product benefits', 'Collect farmer feedback'],
      outcomes: ['25 farmers attended', 'Positive response to new DAP formula', '3 bulk orders confirmed'],
      orderValue: 75000,
      paymentCollected: 0,
      media: ['/demo-photo1.jpg', '/demo-video1.mp4'],
      customerFeedback: {
        satisfaction: 4,
        comments: 'Farmers are interested in the new formula'
      }
    },
    {
      id: '5',
      customerName: 'Amit Agro Solutions',
      customerCode: 'AAS001',
      date: '2024-01-19',
      time: '11:00 AM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      type: 'Stock Liquidation Review',
      status: 'Completed',
      checkInTime: '10:55 AM',
      checkOutTime: '11:45 AM',
      duration: 50,
      notes: 'Stock verification completed, liquidation progress reviewed',
      objectives: ['Verify physical stock', 'Review liquidation progress', 'Plan farmer outreach'],
      outcomes: ['Physical stock matches records', 'Liquidation at 26%', 'Planned 5 farmer meets'],
      orderValue: 0,
      paymentCollected: 0,
      media: ['/stock-photo1.jpg', '/verification-video.mp4', '/signature.png'],
      signature: 'captured',
      customerFeedback: {
        satisfaction: 5,
        comments: 'Excellent support for liquidation tracking'
      },
      nextFollowUp: '2024-01-25',
      competitorInfo: [
        {
          name: 'Competitor A',
          products: ['DAP', 'Urea'],
          pricing: 1300
        }
      ],
      actionItems: [
        { description: 'Schedule farmer meets', dueDate: '2024-01-23', priority: 'High' },
        { description: 'Send liquidation report', dueDate: '2024-01-22', priority: 'Medium' }
      ]
    },
    {
      id: '6',
      customerName: 'Farmer - Ramesh Kumar',
      customerCode: 'FAR001',
      date: '2024-01-21',
      time: '9:00 AM',
      location: 'Village Khera, Sector 8, Delhi',
      coordinates: { lat: 28.5200, lng: 77.3800 },
      type: 'Farm Demo',
      status: 'Scheduled',
      objectives: ['Demonstrate fertilizer application', 'Educate on best practices', 'Collect soil samples'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0
    },
    {
      id: '7',
      customerName: 'Retailer - Green Store',
      customerCode: 'RET001',
      date: '2024-01-21',
      time: '2:00 PM',
      location: 'Main Market, Sector 10, Delhi',
      coordinates: { lat: 28.6000, lng: 77.2200 },
      type: 'Retailer Training',
      status: 'Scheduled',
      objectives: ['Product knowledge training', 'Sales technique workshop', 'Liquidation tracking setup'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0
    },
    {
      id: '8',
      customerName: 'Delhi Agro Hub',
      customerCode: 'DAH001',
      date: '2024-01-18',
      time: '3:30 PM',
      location: 'Highway Rest Stop (Emergency)',
      coordinates: { lat: 28.7000, lng: 77.1000 },
      type: 'Emergency Stock Issue',
      status: 'Completed',
      checkInTime: '3:25 PM',
      checkOutTime: '4:10 PM',
      duration: 45,
      notes: 'Emergency meeting due to contaminated batch issue. Met at highway rest stop as it was midway between locations.',
      objectives: ['Address contaminated stock issue', 'Arrange replacement stock', 'Prevent farmer complaints'],
      outcomes: ['Identified 200kg contaminated batch', 'Arranged immediate replacement', 'Prevented customer complaints'],
      orderValue: 0,
      paymentCollected: 0,
      media: ['/emergency-photo1.jpg', '/contaminated-stock.jpg'],
      signature: 'captured',
      customerFeedback: {
        satisfaction: 4,
        comments: 'Quick response to emergency situation appreciated'
      },
      actionItems: [
        { description: 'Follow up on replacement delivery', dueDate: '2024-01-20', priority: 'High' },
        { description: 'Quality control review', dueDate: '2024-01-25', priority: 'High' }
      ]
    }
  ]);

  // MDO team activities for TSM supervision
  const [mdoActivities, setMdoActivities] = useState<MDOActivity[]>([
    {
      id: 'MDO_ACT001',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      mdoTerritory: 'North Delhi',
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      date: '2024-01-22',
      time: '10:00 AM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      type: 'Stock Verification',
      status: 'In Progress',
      checkInTime: '9:55 AM',
      notes: 'Physical stock verification in progress, liquidation review pending',
      objectives: ['Verify physical stock', 'Review liquidation progress', 'Collect customer feedback'],
      outcomes: ['Stock verification 95% complete', 'Liquidation at 71%'],
      orderValue: 0,
      paymentCollected: 0,
      priority: 'High'
    },
    {
      id: 'MDO_ACT002',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      mdoTerritory: 'South Delhi',
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      date: '2024-01-22',
      time: '2:30 PM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      type: 'Large Order Review',
      status: 'Pending Approval',
      notes: 'Order value ₹85,000 requires TSM approval due to credit utilization',
      objectives: ['Review large order request', 'Assess credit worthiness', 'Approve or reject order'],
      outcomes: [],
      orderValue: 85000,
      paymentCollected: 0,
      requiresApproval: true,
      approvalReason: 'Order value exceeds MDO approval limit',
      priority: 'High'
    },
    {
      id: 'MDO_ACT003',
      mdoName: 'Priya Verma',
      mdoCode: 'MDO003',
      mdoTerritory: 'East Delhi',
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      date: '2024-01-22',
      time: '11:30 AM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      type: 'Farmer Meet - Large',
      status: 'Scheduled',
      notes: '50+ farmers expected, product demonstration planned',
      objectives: ['Conduct farmer education session', 'Demonstrate new fertilizer line', 'Generate bulk orders'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0,
      priority: 'Medium'
    },
    {
      id: 'MDO_ACT004',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      mdoTerritory: 'North Delhi',
      customerName: 'Suresh Traders',
      customerCode: 'ST001',
      date: '2024-01-22',
      time: '4:00 PM',
      location: 'Sector 15, Delhi',
      coordinates: { lat: 28.5500, lng: 77.2500 },
      type: 'Payment Collection',
      status: 'Completed',
      checkInTime: '3:55 PM',
      checkOutTime: '4:35 PM',
      duration: 40,
      notes: 'Successfully collected ₹45,000 outstanding payment',
      objectives: ['Collect outstanding payment', 'Discuss credit terms', 'Plan next order'],
      outcomes: ['₹45,000 payment collected', 'Credit terms extended', 'Next order planned for Feb'],
      orderValue: 0,
      paymentCollected: 45000,
      priority: 'High'
    },
    {
      id: 'MDO_ACT005',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      mdoTerritory: 'South Delhi',
      customerName: 'Delhi Agro Hub',
      customerCode: 'DAH001',
      date: '2024-01-22',
      time: '9:00 AM',
      location: 'Highway Rest Stop (Emergency)',
      coordinates: { lat: 28.7000, lng: 77.1000 },
      type: 'Emergency Stock Issue',
      status: 'Pending Approval',
      notes: 'Location deviation 8.5km due to emergency stock contamination issue',
      objectives: ['Address contaminated stock', 'Arrange replacement', 'Prevent farmer complaints'],
      outcomes: ['200kg contaminated batch identified', 'Replacement arranged'],
      orderValue: 0,
      paymentCollected: 0,
      requiresApproval: true,
      approvalReason: 'Location deviation >5km requires TSM approval',
      priority: 'High'
    },
    {
      id: 'MDO_ACT006',
      mdoName: 'Priya Verma',
      mdoCode: 'MDO003',
      mdoTerritory: 'East Delhi',
      customerName: 'Farmer - Ramesh Kumar',
      customerCode: 'FAR001',
      date: '2024-01-23',
      time: '9:00 AM',
      location: 'Village Khera, Sector 8, Delhi',
      coordinates: { lat: 28.5200, lng: 77.3800 },
      type: 'Farm Demo',
      status: 'Scheduled',
      objectives: ['Demonstrate fertilizer application', 'Educate on best practices', 'Collect soil samples'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0,
      priority: 'Medium'
    },
    {
      id: 'MDO_ACT007',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      mdoTerritory: 'North Delhi',
      customerName: 'Retailer - Green Store',
      customerCode: 'RET001',
      date: '2024-01-23',
      time: '2:00 PM',
      location: 'Main Market, Sector 10, Delhi',
      coordinates: { lat: 28.6000, lng: 77.2200 },
      type: 'Retailer Training',
      status: 'Scheduled',
      objectives: ['Product knowledge training', 'Sales technique workshop', 'Liquidation tracking setup'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0,
      priority: 'Medium'
    },
    {
      id: 'MDO_ACT008',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      mdoTerritory: 'South Delhi',
      customerName: 'Distributor Day Training',
      customerCode: 'TRAIN001',
      date: '2024-01-23',
      time: '10:00 AM',
      location: 'Community Hall, South Delhi',
      coordinates: { lat: 28.5000, lng: 77.2000 },
      type: 'Distributor Day Training Program (25 dealers max)',
      status: 'Scheduled',
      notes: '25 dealers confirmed, training materials prepared',
      objectives: ['Train 25 dealers', 'Product knowledge session', 'Sales technique workshop'],
      outcomes: [],
      orderValue: 0,
      paymentCollected: 0,
      priority: 'High'
    }
  ]);

  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeVisitManager, setActiveVisitManager] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'text-blue-700 bg-blue-100';
      case 'In Progress':
        return 'text-yellow-700 bg-yellow-100';
      case 'Completed':
        return 'text-green-700 bg-green-100';
      case 'Cancelled':
        return 'text-red-700 bg-red-100';
      case 'No Show':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Navigation className="w-4 h-4" />;
      case 'Cancelled':
      case 'No Show':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || visit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const todayVisits = visits.filter(visit => visit.date === '2024-01-20');
  const completedToday = todayVisits.filter(visit => visit.status === 'Completed').length;
  const inProgressToday = todayVisits.filter(visit => visit.status === 'In Progress').length;
  const scheduledToday = todayVisits.filter(visit => visit.status === 'Scheduled').length;

  // Filter MDO activities based on search and status
  const filteredMDOActivities = mdoActivities.filter(activity => {
    const matchesSearch = activity.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.mdoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get counts for MDO activities
  const mdoScheduled = mdoActivities.filter(activity => activity.status === 'Scheduled').length;
  const mdoInProgress = mdoActivities.filter(activity => activity.status === 'In Progress').length;
  const mdoCompleted = mdoActivities.filter(activity => activity.status === 'Completed').length;
  const mdoPendingApproval = mdoActivities.filter(activity => activity.status === 'Pending Approval').length;

  const handleSignature = (signature: string) => {
    if (selectedVisit) {
      setVisits(prev => prev.map(visit => 
        visit.id === selectedVisit 
          ? { ...visit, signature }
          : visit
      ));
    }
    setShowSignatureModal(false);
  };

  const handleMediaUpload = (visitId: string, files: File[]) => {
    console.log('Media uploaded for visit:', visitId, files);
  };

  const startVisit = (visitId: string) => {
    setActiveVisitManager(visitId);
  };
  
  const handleVisitComplete = (visitData: any) => {
    const visitId = activeVisitManager;
    if (visitId) {
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { 
              ...visit, 
              status: 'Completed' as const, 
              checkInTime: visitData.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              checkOutTime: visitData.endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              duration: visitData.completionData.totalDuration,
              notes: visitData.notes,
              media: visitData.media.map((m: any) => m.url),
              signature: visitData.signature
            }
          : visit
      ));
    }
    setActiveVisitManager(null);
  };

  const handleVisitCancel = () => {
    setActiveVisitManager(null);
  };

  const handleStartVisit = (visitId: string) => {
    console.log('Starting visit:', visitId);
    
    // Update visit status to "In Progress" and set check-in time
    setVisits(prev => prev.map(visit => 
      visit.id === visitId 
        ? { 
            ...visit, 
            status: 'In Progress' as const,
            checkInTime: new Date().toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }
        : visit
    ));
    
    // Open visit manager
    setActiveVisitManager(visitId);
  };

  const handleEditVisit = (visitId: string) => {
    console.log('Editing visit:', visitId);
    alert(`Edit functionality for visit ${visitId} - Opening edit form...`);
    // In real app, this would open an edit modal or navigate to edit page
  };

  const handleMDOApproval = (activityId: string, action: 'approve' | 'reject') => {
    setMdoActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { 
            ...activity, 
            status: action === 'approve' ? 'Scheduled' as const : 'Cancelled' as const,
            notes: activity.notes + ` | TSM ${action}d on ${new Date().toLocaleString()}`
          }
        : activity
    ));
    
    alert(`Activity ${action}d successfully!`);
  };

  const endVisit = (visitId: string) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit || !visit.checkInTime) return;
    
    const currentTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Validate working hours
    const isValid = validateAndAlert('working_hours', {
      checkInTime: visit.checkInTime,
      checkOutTime: currentTime
    });
    
    if (!isValid) {
      const proceed = confirm('Visit duration validation failed. Do you want to proceed anyway?');
      if (!proceed) return;
    }
    
    setVisits(prev => prev.map(visit => {
      if (visit.id === visitId && visit.checkInTime) {
        const checkIn = new Date(`2024-01-20 ${visit.checkInTime}`);
        const checkOut = new Date(`2024-01-20 ${currentTime}`);
        const duration = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
        
        return { 
          ...visit, 
          status: 'Completed' as const, 
          checkOutTime: currentTime,
          duration
        };
      }
      return visit;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Visits</h1>
            <p className="text-gray-600 mt-1">Manage your daily visits and customer interactions</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Visit
        </button>
      </div>

      {/* TSM Tab Structure */}
      {user?.role === 'TSM' && (
        <div className="bg-white rounded-xl p-2 card-shadow">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('my-meetings')}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center ${
                activeTab === 'my-meetings'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              My Meetings ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('my-team')}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center ${
                activeTab === 'my-team'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              My Team ({mdoActivities.length})
            </button>
          </div>
        </div>
      )}

      {/* Today's Summary - Dynamic based on active tab */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {user?.role === 'TSM' && activeTab === 'my-team' ? 'Team Summary' : 'Today\'s Summary'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'TSM' && activeTab === 'my-team' ? (
            <>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mdoScheduled}</div>
                <div className="text-sm text-blue-700">Scheduled</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{mdoInProgress}</div>
                <div className="text-sm text-yellow-700">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mdoCompleted}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{mdoPendingApproval}</div>
                <div className="text-sm text-red-700">Pending Approval</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{scheduledToday}</div>
                <div className="text-sm text-blue-700">Scheduled</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{inProgressToday}</div>
                <div className="text-sm text-yellow-700">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedToday}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{todayVisits.length}</div>
                <div className="text-sm text-purple-700">Total</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="space-y-4">
        {user?.role === 'TSM' && activeTab === 'my-team' ? (
          // MDO Team Activities
          filteredMDOActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.customerName}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.customerCode} • {activity.type}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      MDO: {activity.mdoName} ({activity.mdoCode}) - {activity.mdoTerritory}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.requiresApproval && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Approval Required
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                    <span className="ml-1">{activity.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(activity.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {activity.time}
                  {activity.checkInTime && (
                    <span className="ml-2 text-green-600">
                      (Checked in: {activity.checkInTime})
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {activity.location}
                </div>
              </div>

              {/* Activity Details */}
              {selectedVisit === activity.id && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activity.objectives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Objectives</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {activity.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <Target className="w-3 h-3 mr-2 mt-0.5 text-purple-600" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activity.outcomes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Outcomes</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {activity.outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {(activity.orderValue > 0 || activity.paymentCollected > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm text-gray-600">Order Value: </span>
                        <span className="font-medium text-green-600 ml-1">₹{activity.orderValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm text-gray-600">Payment: </span>
                        <span className="font-medium text-blue-600 ml-1">₹{activity.paymentCollected?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {activity.approvalReason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-medium text-sm text-yellow-800 mb-1">Approval Required</h4>
                        <p className="text-sm text-yellow-700">{activity.approvalReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {activity.notes && (selectedVisit === activity.id || activity.status === 'Completed' || activity.status === 'In Progress') && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{activity.notes}</p>
                </div>
              )}

              {/* Action Buttons for MDO Activities */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedVisit(selectedVisit === activity.id ? null : activity.id)}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {selectedVisit === activity.id ? 'Hide Details' : 'View Details'}
                </button>
                
                {activity.requiresApproval && activity.status === 'Pending Approval' && (
                  <>
                    <button
                      onClick={() => handleMDOApproval(activity.id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleMDOApproval(activity.id, 'reject')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Call MDO
                </button>
                
                {activity.status === 'In Progress' && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Monitor Live
                  </button>
                )}
              </div>

              {/* Activity Duration */}
              {activity.duration && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Activity Duration: {activity.duration} minutes</span>
                    <span>MDO: {activity.mdoName}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // TSM's Own Visits or Other Roles
          filteredVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{visit.customerName}</h3>
                  <p className="text-sm text-gray-600">{visit.customerCode} • {visit.type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(visit.status)}`}>
                {getStatusIcon(visit.status)}
                <span className="ml-1">{visit.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(visit.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {visit.time}
                {visit.checkInTime && (
                  <span className="ml-2 text-green-600">
                    (Checked in: {visit.checkInTime})
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {visit.location}
              </div>
            </div>

            {/* Visit Details - Only show when explicitly selected */}
            {selectedVisit === visit.id && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visit.objectives.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Objectives</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {visit.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-3 h-3 mr-2 mt-0.5 text-purple-600" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {visit.outcomes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {visit.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(visit.orderValue > 0 || visit.paymentCollected > 0) && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-600">Order Value: </span>
                      <span className="font-medium text-green-600 ml-1">₹{visit.orderValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm text-gray-600">Payment: </span>
                      <span className="font-medium text-blue-600 ml-1">₹{visit.paymentCollected?.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {visit.customerFeedback && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Customer Feedback</h4>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= visit.customerFeedback!.satisfaction
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {visit.customerFeedback.satisfaction}/5
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{visit.customerFeedback.comments}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes - Only show when visit is selected or for completed visits */}
            {visit.notes && (selectedVisit === visit.id || visit.status === 'Completed') && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{visit.notes}</p>
              </div>
            )}

            {/* Media Upload Section - Only show when selected */}
            {visit.status === 'In Progress' && selectedVisit === visit.id && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-3">Visit Documentation</h4>
                <MediaUpload
                  onUpload={(files) => handleMediaUpload(visit.id, files)}
                  maxFiles={5}
                  acceptedTypes={['image/*', 'video/*']}
                  existingMedia={visit.media || []}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {visit.status !== 'Scheduled' && (
                <button
                  onClick={() => setSelectedVisit(selectedVisit === visit.id ? null : visit.id)}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {selectedVisit === visit.id ? 'Hide Details' : 'View Details'}
                </button>
              )}
              
              {visit.status === 'Scheduled' && (
                <button
                  onClick={() => handleStartVisit(visit.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Visit
                </button>
              )}
              
              {visit.status === 'In Progress' && (
                <>
                  <button
                    onClick={() => endVisit(visit.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    End Visit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setShowSignatureModal(true);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Signature
                  </button>
                </>
              )}
              
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              {visit.status === 'Completed' && (
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Report
                </button>
              )}
            </div>

            {/* Visit Duration */}
            {visit.duration && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Visit Duration: {visit.duration} minutes</span>
                  {visit.nextFollowUp && (
                    <span>Next Follow-up: {new Date(visit.nextFollowUp).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* No Results Message */}
      {((user?.role === 'TSM' && activeTab === 'my-team' && filteredMDOActivities.length === 0) ||
        ((user?.role !== 'TSM' || activeTab === 'my-meetings') && filteredVisits.length === 0)) && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {user?.role === 'TSM' && activeTab === 'my-team' ? 'No team activities found' : 'No visits found'}
          </p>
        </div>
      )}

      {/* Visit Manager Modal */}
      {activeVisitManager && (
        <VisitManager
          target={{
            id: activeVisitManager,
            name: visits.find(v => v.id === activeVisitManager)?.customerName || '',
            code: visits.find(v => v.id === activeVisitManager)?.customerCode || '',
            type: 'Distributor',
            phone: '+91 98765 43210',
            address: visits.find(v => v.id === activeVisitManager)?.location || '',
            location: {
              latitude: visits.find(v => v.id === activeVisitManager)?.coordinates?.lat || 28.6139,
              longitude: visits.find(v => v.id === activeVisitManager)?.coordinates?.lng || 77.2090,
              address: visits.find(v => v.id === activeVisitManager)?.location || ''
            },
            assignedMDO: user?.name || '',
            territory: 'North Delhi'
          }}
          onVisitComplete={handleVisitComplete}
          onVisitCancel={handleVisitCancel}
        />
      )}
      {/* Signature Capture Modal */}
      <SignatureCapture
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignature}
        title="Customer Signature"
      />
    </div>
  );
};

export default FieldVisits;