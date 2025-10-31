import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveMeetings from './LiveMeetings';
import DashboardMetricsGrid from './DashboardMetricsGrid';
import { TaskManager } from './TaskManager';
import { Users, Target, Calendar, MapPin, AlertTriangle, TrendingUp, CheckCircle, Clock, Award, BarChart3, PieChart, ArrowUp, ArrowDown, Eye, Filter, Search, ChevronRight, User, Building, Activity, Crown, Shield, Phone, DollarSign, ShoppingCart, Droplets, Navigation, CreditCard, FileText, Video, Plus, CreditCard as Edit, Download, Star, Package, Truck, Receipt } from 'lucide-react';
import { Task, TaskVerification } from '../types';

interface TSMMeeting {
  id: string;
  title: string;
  type: 'Field Visit' | 'Sales Order' | 'Liquidation' | 'Internal';
  date: string;
  time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  customerName?: string;
  customerCode?: string;
  customerPhone?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  assignedMDO?: string;
  description: string;
  objectives: string[];
  expectedOutcome: string;
  orderValue?: number;
  creditUtilization?: number;
  liquidationCurrent?: number;
  liquidationTarget?: number;
  stockValue?: number;
  verificationStatus?: 'Verified' | 'Pending' | 'Failed';
  attendees?: string[];
  meetingLink?: string;
  documents?: string[];
  duration?: number;
  notes?: string;
}

interface ApprovalRequest {
  id: string;
  type: 'Monthly Plan' | 'Travel Claim' | 'Expense Report' | 'Location Deviation' | 'Stock Variance';
  submittedBy: string;
  submittedByRole: string;
  submissionDate: string;
  amount?: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  details: any;
}

const TSMDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'overview' | 'meetings' | 'activities' | 'approvals'>('overview');
  const [activitiesSubTab, setActivitiesSubTab] = useState<'my' | 'team'>('my');
  const [selectedMeetingFilter, setSelectedMeetingFilter] = useState('All Meetings');
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldVisitTab, setFieldVisitTab] = useState<'my-meetings' | 'my-team'>('my-meetings');
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [taskManagerMode, setTaskManagerMode] = useState<'create' | 'verify'>('create');
  const [selectedMDO, setSelectedMDO] = useState<string>('');
  const [assigneeType, setAssigneeType] = useState<'self' | 'mdo'>('self');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showMappingView, setShowMappingView] = useState<'hidden' | 'mdo' | 'distributor' | 'retailer'>('hidden');
  const [approvalTypeFilter, setApprovalTypeFilter] = useState('All');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('All');
  const [approvalSearchTerm, setApprovalSearchTerm] = useState('');

  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 'LM001',
      participantName: 'Rajesh Kumar',
      participantRole: 'MDO',
      location: 'SRI RAMA SEEDS',
      address: 'Green Valley, Sector 12',
      startTime: '10:45 AM',
      duration: 35,
      status: 'active' as const,
      type: 'Visit' as const,
      phone: '+91 98765 43210',
      notes: 'Joint customer visit - liquidation review in progress'
    },
    {
      id: 'LM002',
      participantName: 'Amit Singh',
      participantRole: 'MDO',
      location: 'Ram Kumar Distributors',
      address: 'Market Area, Sector 8',
      startTime: '2:20 PM',
      duration: 25,
      status: 'active' as const,
      type: 'Demo' as const,
      phone: '+91 87654 32109',
      notes: 'Stock verification and liquidation tracking'
    }
  ]);

  // Comprehensive TSM meetings data
  const [tsmMeetings] = useState<TSMMeeting[]>([
    // Field Visits
    {
      id: 'TSM001',
      title: 'Joint Customer Visit',
      type: 'Field Visit',
      date: '2024-01-22',
      time: '10:00 AM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      customerPhone: '+91 98765 43210',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Joint visit with MDO for relationship building and territory oversight',
      objectives: ['Review liquidation progress', 'Assess MDO performance', 'Strengthen customer relationship'],
      expectedOutcome: 'Improved liquidation rate and stronger customer partnership',
      duration: 120
    },
    {
      id: 'TSM002',
      title: 'Territory Expansion Meeting',
      type: 'Field Visit',
      date: '2024-01-22',
      time: '2:30 PM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      customerName: 'New Prospect - Delhi Agro Hub',
      customerCode: 'PROSPECT001',
      customerPhone: '+91 99887 76543',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Evaluate new distributor prospect for territory expansion',
      objectives: ['Assess business potential', 'Review financial capacity', 'Discuss partnership terms'],
      expectedOutcome: 'Onboard new distributor with ₹5L credit limit',
      duration: 90
    },
    {
      id: 'TSM003',
      title: 'Farmer Meet Supervision',
      type: 'Field Visit',
      date: '2024-01-23',
      time: '9:00 AM',
      location: 'Village Khera, Sector 8',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Community Center - Farmer Group',
      customerCode: 'FARM_GROUP_001',
      customerPhone: '+91 88776 65432',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Priya Verma (MDO003)',
      description: 'Supervise MDO farmer engagement and product demonstration',
      objectives: ['Monitor MDO performance', 'Ensure farmer satisfaction', 'Validate product knowledge'],
      expectedOutcome: '30+ farmers engaged, 5+ orders generated',
      duration: 180
    },
    {
      id: 'TSM004',
      title: 'Emergency Stock Issue',
      type: 'Field Visit',
      date: '2024-01-22',
      time: '4:00 PM',
      location: 'Highway Rest Stop (Emergency)',
      coordinates: { lat: 28.7000, lng: 77.1000 },
      customerName: 'Delhi Agro Hub',
      customerCode: 'DAH001',
      customerPhone: '+91 77665 54321',
      status: 'In Progress',
      priority: 'High',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Emergency response to contaminated stock issue requiring immediate TSM intervention',
      objectives: ['Assess contamination extent', 'Arrange replacement stock', 'Prevent customer complaints'],
      expectedOutcome: 'Issue resolved, customer satisfaction maintained',
      duration: 60,
      notes: 'Urgent: 200kg contaminated batch affecting multiple farmers'
    },
    {
      id: 'TSM005',
      title: 'Distributor Performance Review',
      type: 'Field Visit',
      date: '2024-01-24',
      time: '11:00 AM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      customerPhone: '+91 87654 32109',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Quarterly performance review and target setting',
      objectives: ['Review Q4 performance', 'Set Q1 targets', 'Discuss growth strategies'],
      expectedOutcome: 'Clear Q1 targets and improved performance plan',
      duration: 150
    },

    // Sales Orders
    {
      id: 'TSM006',
      title: 'Large Order Approval Meeting',
      type: 'Sales Order',
      date: '2024-01-22',
      time: '11:30 AM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      customerPhone: '+91 98765 43210',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Review and approve large order exceeding MDO authority',
      objectives: ['Review order details', 'Assess credit risk', 'Approve order value'],
      expectedOutcome: 'Order approved with proper credit terms',
      orderValue: 125000,
      creditUtilization: 92,
      duration: 45
    },
    {
      id: 'TSM007',
      title: 'Credit Limit Review',
      type: 'Sales Order',
      date: '2024-01-23',
      time: '3:00 PM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      customerPhone: '+91 76543 21098',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Priya Verma (MDO003)',
      description: 'Review credit limit increase request and approve pending order',
      objectives: ['Assess financial stability', 'Review payment history', 'Approve credit increase'],
      expectedOutcome: 'Credit limit increased to ₹6L, order approved',
      orderValue: 75000,
      creditUtilization: 78,
      duration: 60
    },
    {
      id: 'TSM008',
      title: 'Bulk Order Negotiation',
      type: 'Sales Order',
      date: '2024-01-24',
      time: '2:00 PM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      customerPhone: '+91 87654 32109',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Negotiate bulk order pricing and payment terms',
      objectives: ['Finalize bulk pricing', 'Negotiate payment terms', 'Secure large order'],
      expectedOutcome: '₹2L bulk order with favorable terms',
      orderValue: 200000,
      creditUtilization: 85,
      duration: 90
    },

    // Liquidation Management
    {
      id: 'TSM009',
      title: 'Low Performance Liquidation Review',
      type: 'Liquidation',
      date: '2024-01-22',
      time: '1:00 PM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      customerPhone: '+91 87654 32109',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Address low liquidation performance and create improvement plan',
      objectives: ['Analyze liquidation bottlenecks', 'Create action plan', 'Set improvement targets'],
      expectedOutcome: 'Liquidation rate improved from 29% to 40%',
      liquidationCurrent: 29,
      liquidationTarget: 50,
      stockValue: 18.75,
      verificationStatus: 'Pending',
      duration: 90
    },
    {
      id: 'TSM010',
      title: 'Stock Verification Meeting',
      type: 'Liquidation',
      date: '2024-01-23',
      time: '10:30 AM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      customerPhone: '+91 76543 21098',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Priya Verma (MDO003)',
      description: 'Physical stock verification and farmer sales validation',
      objectives: ['Verify physical stock', 'Validate farmer sales records', 'Update liquidation data'],
      expectedOutcome: 'Stock verified, liquidation data updated',
      liquidationCurrent: 26,
      liquidationTarget: 50,
      stockValue: 21.05,
      verificationStatus: 'Pending',
      duration: 120
    },
    {
      id: 'TSM011',
      title: 'Stock Variance Approval',
      type: 'Liquidation',
      date: '2024-01-22',
      time: '3:30 PM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      customerPhone: '+91 98765 43210',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Approve 8% stock variance and validate liquidation tracking',
      objectives: ['Review variance reasons', 'Validate farmer sales', 'Approve variance'],
      expectedOutcome: 'Variance approved, liquidation tracking updated',
      liquidationCurrent: 71,
      liquidationTarget: 50,
      stockValue: 5.67,
      verificationStatus: 'Failed',
      duration: 75
    },
    {
      id: 'TSM012',
      title: 'Retailer Liquidation Tracking',
      type: 'Liquidation',
      date: '2024-01-24',
      time: '9:30 AM',
      location: 'Sector 15, Delhi',
      coordinates: { lat: 28.5500, lng: 77.2500 },
      customerName: 'Multiple Retailers',
      customerCode: 'RETAIL_GROUP',
      customerPhone: '+91 99887 76543',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Track retailer-to-farmer liquidation and update distributor metrics',
      objectives: ['Visit 5 retailers', 'Track farmer sales', 'Update liquidation data'],
      expectedOutcome: 'Retailer liquidation tracked, distributor metrics updated',
      liquidationCurrent: 35,
      liquidationTarget: 50,
      stockValue: 12.50,
      verificationStatus: 'Pending',
      duration: 240
    },

    // Internal Meetings
    {
      id: 'TSM013',
      title: 'Monthly Team Performance Review',
      type: 'Internal',
      date: '2024-01-23',
      time: '2:00 PM',
      location: 'Regional Office Conference Room',
      status: 'Scheduled',
      priority: 'High',
      description: 'Monthly performance review with MDO team and RBH',
      objectives: ['Review team performance', 'Discuss challenges', 'Set next month targets'],
      expectedOutcome: 'Clear performance feedback and improved targets',
      attendees: ['Rajesh Kumar (MDO)', 'Amit Singh (MDO)', 'Priya Verma (MDO)', 'Amit Patel (RBH)'],
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      documents: ['Performance Report Q4.pdf', 'Target Setting Guidelines.pdf'],
      duration: 120
    },
    {
      id: 'TSM014',
      title: 'Quarterly Business Review',
      type: 'Internal',
      date: '2024-01-25',
      time: '10:00 AM',
      location: 'Regional Office Conference Room',
      status: 'Scheduled',
      priority: 'Medium',
      description: 'Quarterly business review and strategic planning session',
      objectives: ['Review Q4 achievements', 'Plan Q1 strategy', 'Budget allocation'],
      expectedOutcome: 'Q1 strategy finalized, budget approved',
      attendees: ['RBH Manager', 'Other TSMs', 'Regional Team'],
      meetingLink: 'https://meet.google.com/qbr-2024-q1',
      documents: ['Q4 Business Review.pdf', 'Q1 Strategy Plan.pdf'],
      duration: 180
    },
    {
      id: 'TSM015',
      title: 'Weekly Team Sync',
      type: 'Internal',
      date: '2024-01-22',
      time: '5:00 PM',
      location: 'Virtual Meeting',
      status: 'Scheduled',
      priority: 'Low',
      description: 'Weekly sync with MDO team for updates and coordination',
      objectives: ['Share weekly updates', 'Coordinate activities', 'Address blockers'],
      expectedOutcome: 'Team aligned on weekly priorities',
      attendees: ['All MDO Team Members'],
      meetingLink: 'https://meet.google.com/weekly-sync',
      duration: 60
    },

    // Additional Field Visits
    {
      id: 'TSM016',
      title: 'Customer Complaint Resolution',
      type: 'Field Visit',
      date: '2024-01-23',
      time: '4:00 PM',
      location: 'Sector 10, Delhi',
      coordinates: { lat: 28.6000, lng: 77.2200 },
      customerName: 'Complaint - Farmer Ramesh',
      customerCode: 'COMP001',
      customerPhone: '+91 88776 65432',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Resolve customer complaint about product quality',
      objectives: ['Understand complaint', 'Provide solution', 'Ensure satisfaction'],
      expectedOutcome: 'Complaint resolved, customer satisfied',
      duration: 90
    },
    {
      id: 'TSM017',
      title: 'New Product Launch',
      type: 'Field Visit',
      date: '2024-01-24',
      time: '10:30 AM',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      customerPhone: '+91 98765 43210',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Rajesh Kumar (MDO001)',
      description: 'Launch new fertilizer product line with key distributor',
      objectives: ['Present new products', 'Discuss pricing', 'Plan launch strategy'],
      expectedOutcome: 'Product launch successful, initial orders secured',
      duration: 120
    },

    // Additional Sales Orders
    {
      id: 'TSM018',
      title: 'Seasonal Order Planning',
      type: 'Sales Order',
      date: '2024-01-25',
      time: '11:00 AM',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      customerPhone: '+91 87654 32109',
      status: 'Scheduled',
      priority: 'High',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Plan seasonal orders for upcoming farming season',
      objectives: ['Forecast demand', 'Plan inventory', 'Secure advance orders'],
      expectedOutcome: '₹3L seasonal orders secured',
      orderValue: 300000,
      creditUtilization: 95,
      duration: 90
    },
    {
      id: 'TSM019',
      title: 'Payment Terms Negotiation',
      type: 'Sales Order',
      date: '2024-01-23',
      time: '1:30 PM',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      customerPhone: '+91 76543 21098',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Priya Verma (MDO003)',
      description: 'Negotiate extended payment terms for large order',
      objectives: ['Review payment history', 'Negotiate terms', 'Approve extended credit'],
      expectedOutcome: 'Extended payment terms approved',
      orderValue: 150000,
      creditUtilization: 68,
      duration: 75
    },

    // Additional Liquidation Activities
    {
      id: 'TSM020',
      title: 'Multi-Distributor Liquidation Review',
      type: 'Liquidation',
      date: '2024-01-25',
      time: '9:00 AM',
      location: 'Regional Office',
      status: 'Scheduled',
      priority: 'High',
      description: 'Comprehensive liquidation review across all territory distributors',
      objectives: ['Review all distributor performance', 'Identify improvement areas', 'Set liquidation targets'],
      expectedOutcome: 'Territory liquidation improved to 45%',
      liquidationCurrent: 42,
      liquidationTarget: 50,
      stockValue: 45.30,
      verificationStatus: 'Pending',
      duration: 180
    },
    {
      id: 'TSM021',
      title: 'Farmer Sales Validation',
      type: 'Liquidation',
      date: '2024-01-24',
      time: '3:30 PM',
      location: 'Village Khera, Sector 8',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      customerName: 'Farmer Group - Village Khera',
      customerCode: 'FARM_KHERA',
      customerPhone: '+91 99887 76543',
      status: 'Scheduled',
      priority: 'Medium',
      assignedMDO: 'Amit Singh (MDO002)',
      description: 'Validate farmer sales records and update liquidation tracking',
      objectives: ['Verify farmer purchases', 'Update liquidation records', 'Ensure accurate tracking'],
      expectedOutcome: 'Farmer sales validated, liquidation data accurate',
      liquidationCurrent: 38,
      liquidationTarget: 50,
      stockValue: 8.25,
      verificationStatus: 'Pending',
      duration: 150
    }
  ]);

  // Approval requests data
  const [approvalRequests] = useState<ApprovalRequest[]>([
    {
      id: 'APR001',
      type: 'Monthly Plan',
      submittedBy: 'Rajesh Kumar',
      submittedByRole: 'MDO',
      submissionDate: '2024-01-20',
      description: 'February 2024 monthly activity plan',
      status: 'Pending',
      priority: 'High',
      dueDate: '2024-01-25',
      details: {
        activities: 45,
        visits: 35,
        targetSales: 500000
      }
    },
    {
      id: 'APR002',
      type: 'Travel Claim',
      submittedBy: 'Amit Singh',
      submittedByRole: 'MDO',
      submissionDate: '2024-01-19',
      amount: 2500,
      description: 'Travel expenses for customer visits',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2024-01-24',
      details: {
        distance: 85,
        mode: 'Car',
        purpose: 'Customer visits'
      }
    },
    {
      id: 'APR003',
      type: 'Location Deviation',
      submittedBy: 'Priya Verma',
      submittedByRole: 'MDO',
      submissionDate: '2024-01-21',
      description: 'Location deviation approval for emergency meeting',
      status: 'Pending',
      priority: 'High',
      dueDate: '2024-01-22',
      details: {
        deviation: 6.2,
        reason: 'Emergency stock issue'
      }
    }
  ]);

  // MDO Team Activities Data
  const mdoTeamActivities = [
    {
      id: 'MDO_ACT001',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      territory: 'North Delhi',
      date: '2024-01-23',
      time: '10:00 AM',
      type: 'Field Visit',
      customerName: 'SRI RAMA SEEDS AND PESTICIDES',
      customerCode: '1325',
      location: 'Green Valley, Sector 12, Delhi',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      phone: '+91 98765 43210',
      status: 'In Progress',
      priority: 'High',
      description: 'Stock verification and liquidation tracking',
      objectives: ['Verify physical stock', 'Review liquidation progress', 'Update farmer sales data'],
      checkInTime: '9:55 AM',
      estimatedDuration: 90,
      visitType: 'Liquidation Review'
    },
    {
      id: 'MDO_ACT002',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      territory: 'South Delhi',
      date: '2024-01-23',
      time: '11:30 AM',
      type: 'Field Visit',
      customerName: 'Ram Kumar Distributors',
      customerCode: 'DLR001',
      location: 'Market Area, Sector 8, Delhi',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      phone: '+91 87654 32109',
      status: 'Scheduled',
      priority: 'Medium',
      description: 'Product demonstration and order collection',
      objectives: ['Demonstrate new fertilizer line', 'Collect pending orders', 'Discuss pricing'],
      estimatedDuration: 60,
      visitType: 'Sales Visit'
    },
    {
      id: 'MDO_ACT003',
      mdoName: 'Priya Verma',
      mdoCode: 'MDO003',
      territory: 'East Delhi',
      date: '2024-01-23',
      time: '2:00 PM',
      type: 'Farmer Meet',
      customerName: 'Village Farmers Group',
      customerCode: 'VFG001',
      location: 'Village Khera, East Delhi',
      coordinates: { lat: 28.5200, lng: 77.3800 },
      phone: '+91 76543 21098',
      status: 'Scheduled',
      priority: 'High',
      description: 'Farmer education and product demonstration',
      objectives: ['Educate 30+ farmers', 'Demonstrate application methods', 'Collect feedback'],
      estimatedDuration: 120,
      visitType: 'Farmer Engagement',
      targetParticipants: 30
    },
    {
      id: 'MDO_ACT004',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      territory: 'North Delhi',
      date: '2024-01-23',
      time: '3:30 PM',
      type: 'Sales Order',
      customerName: 'Green Agro Solutions',
      customerCode: 'GAS001',
      location: 'Industrial Area, Delhi',
      coordinates: { lat: 28.4089, lng: 77.3178 },
      phone: '+91 65432 10987',
      status: 'Pending Approval',
      priority: 'High',
      description: 'Large order requiring TSM approval - ₹85,000',
      orderValue: 85000,
      creditUtilization: 68,
      visitType: 'Order Processing'
    },
    {
      id: 'MDO_ACT005',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      territory: 'South Delhi',
      date: '2024-01-23',
      time: '4:00 PM',
      type: 'Liquidation',
      customerName: 'Suresh Traders',
      customerCode: 'ST001',
      location: 'Sector 15, Delhi',
      coordinates: { lat: 28.5500, lng: 77.2500 },
      phone: '+91 54321 09876',
      status: 'Completed',
      priority: 'Medium',
      description: 'Liquidation verification - 45% achieved vs 50% target',
      liquidationCurrent: 45,
      liquidationTarget: 50,
      stockValue: 12.5,
      visitType: 'Stock Verification'
    },
    {
      id: 'MDO_ACT006',
      mdoName: 'Priya Verma',
      mdoCode: 'MDO003',
      territory: 'East Delhi',
      date: '2024-01-24',
      time: '9:00 AM',
      type: 'Field Visit',
      customerName: 'Delhi Agro Hub',
      customerCode: 'DAH001',
      location: 'Highway Junction, Delhi',
      coordinates: { lat: 28.7000, lng: 77.1000 },
      phone: '+91 43210 98765',
      status: 'Scheduled',
      priority: 'High',
      description: 'Emergency stock quality issue resolution',
      objectives: ['Investigate quality complaints', 'Arrange replacement stock', 'Document issues'],
      estimatedDuration: 75,
      visitType: 'Emergency Response'
    },
    {
      id: 'MDO_ACT007',
      mdoName: 'Rajesh Kumar',
      mdoCode: 'MDO001',
      territory: 'North Delhi',
      date: '2024-01-24',
      time: '11:00 AM',
      type: 'Sales Order',
      customerName: 'Farmer Cooperative Society',
      customerCode: 'FCS001',
      location: 'Cooperative Office, Sector 20',
      coordinates: { lat: 28.6200, lng: 77.2100 },
      phone: '+91 32109 87654',
      status: 'Draft',
      priority: 'Medium',
      description: 'Bulk order preparation - ₹1.2L cooperative purchase',
      orderValue: 120000,
      creditUtilization: 85,
      visitType: 'Bulk Order'
    },
    {
      id: 'MDO_ACT008',
      mdoName: 'Amit Singh',
      mdoCode: 'MDO002',
      territory: 'South Delhi',
      date: '2024-01-24',
      time: '2:30 PM',
      type: 'Liquidation',
      customerName: 'South Delhi Distributors',
      customerCode: 'SDD001',
      location: 'South Extension, Delhi',
      coordinates: { lat: 28.5700, lng: 77.2200 },
      phone: '+91 21098 76543',
      status: 'Scheduled',
      priority: 'High',
      description: 'Critical liquidation review - 22% vs 50% target',
      liquidationCurrent: 22,
      liquidationTarget: 50,
      stockValue: 25.8,
      visitType: 'Performance Review'
    }
  ];

  const handleStartVisit = (meetingId: string) => {
    // Navigate to field visits page with the specific meeting
    navigate('/field-visits', { state: { startMeeting: meetingId } });
  };

  const handleCallCustomer = (phone: string) => {
    // In a real app, this would integrate with phone system
    window.open(`tel:${phone}`, '_self');
  };

  const handleCreateTask = (type: 'self' | 'mdo', mdoName?: string) => {
    setAssigneeType(type);
    setSelectedMDO(mdoName || '');
    setTaskManagerMode('create');
    setShowTaskManager(true);
  };

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    alert(`${updatedTasks.length - tasks.length} task(s) created successfully!`);
  };

  const handleEndMeeting = (meetingId: string) => {
    // Show task verification before ending meeting
    const meetingTasks = tasks.filter(task => 
      task.assignedTo === user?.name && task.status !== 'Completed'
    );
    
    if (meetingTasks.length > 0) {
      setTaskManagerMode('verify');
      setShowTaskManager(true);
      return;
    }
    
    // End meeting if no tasks to verify
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
  };

  const handleTasksVerified = (verifications: TaskVerification[]) => {
    // Update task statuses based on verifications
    setTasks(prev => prev.map(task => {
      const verification = verifications.find(v => v.taskId === task.id);
      if (verification) {
        return {
          ...task,
          status: verification.status === 'Completed' ? 'Completed' : 'In Progress',
          verificationNotes: verification.notes,
          completedAt: verification.status === 'Completed' ? verification.verifiedAt : undefined,
          completedBy: verification.status === 'Completed' ? verification.verifiedBy : undefined
        };
      }
      return task;
    }));
    
    // Now end the meeting
    setLiveMeetings(prev => prev.filter(meeting => meeting.id !== 'current'));
    alert('Meeting ended successfully with task verification completed!');
  };

  const handleReviewOrder = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting) {
      alert(`Reviewing order:\nCustomer: ${meeting.customerName}\nValue: ₹${meeting.orderValue?.toLocaleString()}\nCredit Utilization: ${meeting.creditUtilization}%`);
    }
  };

  const handleApproveCredit = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting) {
      alert(`Approving credit:\nCustomer: ${meeting.customerName}\nOrder Value: ₹${meeting.orderValue?.toLocaleString()}\nCredit Utilization: ${meeting.creditUtilization}%`);
    }
  };

  const handleReviewLiquidation = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting) {
      alert(`Reviewing liquidation:\nDistributor: ${meeting.customerName}\nCurrent: ${meeting.liquidationCurrent}%\nTarget: ${meeting.liquidationTarget}%\nStock Value: ₹${meeting.stockValue}L`);
    }
  };

  const handleVerifyStock = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting) {
      alert(`Verifying stock:\nDistributor: ${meeting.customerName}\nStock Value: ₹${meeting.stockValue}L\nVerification Status: ${meeting.verificationStatus}`);
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting && meeting.meetingLink) {
      alert(`Joining meeting:\n${meeting.title}\nLink: ${meeting.meetingLink}`);
    } else {
      alert(`Joining meeting: ${meeting?.title}`);
    }
  };

  const handleViewDetails = (meetingId: string) => {
    const meeting = tsmMeetings.find(m => m.id === meetingId);
    if (meeting) {
      alert(`Meeting Details:\n\nTitle: ${meeting.title}\nType: ${meeting.type}\nCustomer: ${meeting.customerName || 'N/A'}\nLocation: ${meeting.location}\nObjectives: ${meeting.objectives.join(', ')}\nExpected Outcome: ${meeting.expectedOutcome}`);
    }
  };

  const handleApproveRequest = (requestId: string) => {
    const request = approvalRequests.find(r => r.id === requestId);
    if (request) {
      const comments = prompt('Approval comments (optional):');
      alert(`Approved: ${request.type}\nSubmitted by: ${request.submittedBy}\nComments: ${comments || 'No comments'}`);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const request = approvalRequests.find(r => r.id === requestId);
    if (request) {
      const reason = prompt('Rejection reason (required):');
      if (reason && reason.trim()) {
        alert(`Rejected: ${request.type}\nSubmitted by: ${request.submittedBy}\nReason: ${reason}`);
      } else {
        alert('Rejection reason is required');
      }
    }
  };

  const handleViewApprovalDetails = (requestId: string) => {
    const request = approvalRequests.find(r => r.id === requestId);
    if (request) {
      alert(`Approval Details:\n\nType: ${request.type}\nSubmitted by: ${request.submittedBy} (${request.submittedByRole})\nDate: ${new Date(request.submissionDate).toLocaleDateString()}\nDescription: ${request.description}\nStatus: ${request.status}\nPriority: ${request.priority}\nDue: ${new Date(request.dueDate).toLocaleDateString()}`);
    }
  };

  // Filter meetings based on selected filter
  const getFilteredMeetings = () => {
    let filtered = tsmMeetings;
    
    if (selectedMeetingFilter !== 'All Meetings') {
      filtered = filtered.filter(meeting => meeting.type === selectedMeetingFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(meeting => 
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-700 bg-blue-100';
      case 'In Progress': return 'text-yellow-700 bg-yellow-100';
      case 'Completed': return 'text-green-700 bg-green-100';
      case 'Cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Field Visit': return <MapPin className="w-4 h-4" />;
      case 'Sales Order': return <ShoppingCart className="w-4 h-4" />;
      case 'Liquidation': return <Droplets className="w-4 h-4" />;
      case 'Internal': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Field Visit': return 'bg-blue-100 text-blue-600';
      case 'Sales Order': return 'bg-green-100 text-green-600';
      case 'Liquidation': return 'bg-purple-100 text-purple-600';
      case 'Internal': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Team performance data
  const teamStats = {
    totalMDOs: 3,
    activeMDOs: 3,
    avgPerformance: 89,
    totalActivities: 135,
    completedActivities: 121,
    pendingApprovals: approvalRequests.filter(r => r.status === 'Pending').length,
    highPriorityTasks: tsmMeetings.filter(m => m.priority === 'High').length
  };

  // Mapping data for TSM
  const mappingData = {
    mdos: [
      {
        id: 'MDO001',
        name: 'Rajesh Kumar',
        territory: 'North Delhi',
        distributors: ['SRI RAMA SEEDS AND PESTICIDES', 'Green Agro Solutions'],
        retailers: ['Green Farm Supplies', 'Kisan Agro Store', 'Farm Fresh Supplies']
      },
      {
        id: 'MDO002',
        name: 'Amit Singh',
        territory: 'South Delhi',
        distributors: ['Ram Kumar Distributors', 'KISAN DISTRIBUTORS'],
        retailers: ['Bharat Seeds and Fertilizers', 'Agro World', 'Krishi Bhandar']
      },
      {
        id: 'MDO003',
        name: 'Priya Verma',
        territory: 'East Delhi',
        distributors: ['RURAL AGRO CENTER', 'Delhi Agro Hub'],
        retailers: ['Village Agro Store', 'Farmer Choice', 'Seed and Feed Co.']
      }
    ],
    totalDistributors: 6,
    totalRetailers: 9
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Dashboard Metrics Grid */}
      <DashboardMetricsGrid
        distributorCount={48}
        ytdSales={12750000}
        ytdOpeningStock={8450000}
        ytdLiquidation={10625000}
        totalOS={9480000}
        totalOverdue={1896000}
        totalBlockedParties={2}
      />

      {/* Territory Mapping Details - Conditionally Shown */}
      {showMappingView !== 'hidden' && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showMappingView === 'mdo' && 'MDO Mapping Overview'}
                {showMappingView === 'distributor' && 'Distributor Mapping Overview'}
                {showMappingView === 'retailer' && 'Retailer Mapping Overview'}
              </h2>
              <p className="text-gray-600 mt-1">Complete hierarchy of your team structure</p>
            </div>
            <button
              onClick={() => setShowMappingView('hidden')}
              className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 flex items-center"
            >
              <ChevronRight className="w-4 h-4 mr-1 transform rotate-90" />
              Close
            </button>
          </div>

          <div className="space-y-4">
            {mappingData.mdos.map((mdo) => (
              <div key={mdo.id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{mdo.name}</h3>
                        <p className="text-sm text-gray-600">{mdo.id} • {mdo.territory}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {mdo.distributors.length} Distributors
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {mdo.retailers.length} Retailers
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Distributors - Show only if viewing MDO or Distributor */}
                      {(showMappingView === 'mdo' || showMappingView === 'distributor') && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center mb-3">
                            <Building className="w-4 h-4 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-blue-900">Distributors</h4>
                          </div>
                          <ul className="space-y-2">
                            {mdo.distributors.map((distributor, idx) => (
                              <li key={idx} className="flex items-center text-sm text-blue-800">
                                <ChevronRight className="w-3 h-3 mr-1 text-blue-500" />
                                {distributor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Retailers - Show only if viewing MDO or Retailer */}
                      {(showMappingView === 'mdo' || showMappingView === 'retailer') && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center mb-3">
                            <Users className="w-4 h-4 text-green-600 mr-2" />
                            <h4 className="font-semibold text-green-900">Retailers</h4>
                          </div>
                          <ul className="space-y-2">
                            {mdo.retailers.map((retailer, idx) => (
                              <li key={idx} className="flex items-center text-sm text-green-800">
                                <ChevronRight className="w-3 h-3 mr-1 text-green-500" />
                                {retailer}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liquidation Summary */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Liquidation Summary</h3>
          <button
            onClick={() => navigate('/liquidation')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Farmer Liquidation - Distributor</p>
                <p className="text-xl font-bold text-blue-900">₹32.40L</p>
                <p className="text-xs text-blue-600 mt-1">7,850 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Farmer Liquidation - Retailer</p>
                <p className="text-xl font-bold text-green-900">₹8.10L</p>
                <p className="text-xs text-green-600 mt-1">1,950 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Droplets className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Stock at Retailer</p>
                <p className="text-xl font-bold text-orange-900">₹6.80L</p>
                <p className="text-xs text-orange-600 mt-1">1,680 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Package className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Stock at Distributor</p>
                <p className="text-xl font-bold text-purple-900">₹4.70L</p>
                <p className="text-xs text-purple-600 mt-1">1,020 Kg/Ltr</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{teamStats.avgPerformance}%</div>
              <div className="text-sm text-green-600">Avg Performance</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{teamStats.activeMDOs}</div>
              <div className="text-sm text-blue-600">Active MDOs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activities Overview</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">{teamStats.completedActivities}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-800">{teamStats.totalActivities - teamStats.completedActivities}</div>
              <div className="text-sm text-orange-600">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{tsmMeetings.filter(m => m.type === 'Field Visit').length}</div>
          <div className="text-sm text-gray-600">Field Visits</div>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600">{tsmMeetings.filter(m => m.type === 'Sales Order').length}</div>
          <div className="text-sm text-gray-600">Sales Orders</div>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{tsmMeetings.filter(m => m.type === 'Liquidation').length}</div>
          <div className="text-sm text-gray-600">Liquidation</div>
        </div>
        <div className="bg-white rounded-xl p-4 card-shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{teamStats.pendingApprovals}</div>
          <div className="text-sm text-gray-600">Pending Approvals</div>
        </div>
      </div>

      {/* Task Manager Modal */}
      <TaskManager
        isOpen={showTaskManager}
        onClose={() => setShowTaskManager(false)}
        mode={taskManagerMode}
        assigneeType={assigneeType}
        assigneeName={selectedMDO}
        existingTasks={tasks}
        onTasksUpdate={handleTasksUpdate}
        onTasksVerified={handleTasksVerified}
        userRole={user?.role || 'TSM'}
        userName={user?.name || 'TSM User'}
      />

      {/* Quick Actions for TSM */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => handleCreateTask('self')}
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Target className="w-4 h-4 mr-2" />
            Create Task (Self)
          </button>
          <button 
            onClick={() => handleCreateTask('mdo', 'Rajesh Kumar')}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Create Task (MDO)
          </button>
          <button 
            onClick={() => navigate('/planning')}
            className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </button>
          <button 
            onClick={() => navigate('/performance')}
            className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderMyMeetings = () => (
    <div className="space-y-6">
      {/* Sub-tabs and Live Meetings Counter */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
              My Meetings
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600">
              Team Meetings
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Live Meetings:</span>
            <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-bold">
              {liveMeetings.length}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Meetings</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyMeetingsOld = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedMeetingFilter}
            onChange={(e) => setSelectedMeetingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="All Meetings">All Meetings</option>
            <option value="Field Visit">Field Visits</option>
            <option value="Sales Order">Sales Orders</option>
            <option value="Liquidation">Liquidation</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {getFilteredMeetings().map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(meeting.type)}`}>
                  {getTypeIcon(meeting.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">{meeting.customerName || meeting.attendees?.[0] || 'Internal'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(meeting.priority)}`}>
                  {meeting.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">{new Date(meeting.date).toLocaleDateString()}</p>
                  <p>{meeting.time}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">{meeting.location}</p>
                  {meeting.customerCode && <p>{meeting.customerCode}</p>}
                </div>
              </div>
              {meeting.assignedMDO && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">MDO: {meeting.assignedMDO}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Type-specific information */}
            {meeting.type === 'Sales Order' && meeting.orderValue && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">Order Value:</span>
                    <span className="ml-2 font-bold">₹{meeting.orderValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">Credit Utilization:</span>
                    <span className="ml-2 font-bold">{meeting.creditUtilization}%</span>
                  </div>
                </div>
              </div>
            )}

            {meeting.type === 'Liquidation' && meeting.liquidationCurrent !== undefined && (
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-purple-600 font-medium">Current:</span>
                    <span className="ml-2 font-bold">{meeting.liquidationCurrent}%</span>
                  </div>
                  <div>
                    <span className="text-purple-600 font-medium">Target:</span>
                    <span className="ml-2 font-bold">{meeting.liquidationTarget}%</span>
                  </div>
                  <div>
                    <span className="text-purple-600 font-medium">Stock Value:</span>
                    <span className="ml-2 font-bold">₹{meeting.stockValue}L</span>
                  </div>
                </div>
                {meeting.verificationStatus && (
                  <div className="mt-2">
                    <span className="text-purple-600 font-medium">Verification:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                      meeting.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {meeting.verificationStatus}
                    </span>
                    {fieldVisitTab === 'my-team' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {meeting.mdoName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {meeting.type === 'Internal' && meeting.attendees && (
              <div className="bg-orange-50 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <span className="text-orange-600 font-medium">Attendees:</span>
                  <span className="ml-2">{meeting.attendees.join(', ')}</span>
                </div>
                {meeting.meetingLink && (
                  <div className="mt-2 text-sm">
                    <span className="text-orange-600 font-medium">Link:</span>
                    <span className="ml-2 text-blue-600 underline">{meeting.meetingLink}</span>
                  </div>
                )}
              </div>
            )}

            {/* Expanded Details */}
            {expandedMeeting === meeting.id && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Objectives</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {meeting.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-3 h-3 mr-2 mt-0.5 text-purple-600" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Expected Outcome</h4>
                    <p className="text-sm text-gray-600">{meeting.expectedOutcome}</p>
                    
                    {meeting.duration && (
                      <div className="mt-3">
                        <h4 className="font-medium text-sm text-gray-900 mb-1">Duration</h4>
                        <p className="text-sm text-gray-600">{meeting.duration} minutes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                {expandedMeeting === meeting.id ? 'Hide Details' : 'View Details'}
              </button>

              {meeting.type === 'Field Visit' && (
                <>
                  <button
                    onClick={() => handleStartVisit(meeting.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Start Visit
                  </button>
                  {meeting.customerPhone && (
                    <button
                      onClick={() => handleCallCustomer(meeting.customerPhone!)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </button>
                  )}
                </>
              )}

              {meeting.type === 'Sales Order' && (
                <>
                  <button
                    onClick={() => handleReviewOrder(meeting.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Review Order
                  </button>
                  <button
                    onClick={() => handleApproveCredit(meeting.id)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Approve Credit
                  </button>
                </>
              )}

              {meeting.type === 'Liquidation' && (
                <>
                  <button
                    onClick={() => handleReviewLiquidation(meeting.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    Review Liquidation
                  </button>
                  <button
                    onClick={() => handleVerifyStock(meeting.id)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Stock
                  </button>
                  {meeting.customerPhone && (
                    <button
                      onClick={() => handleCallCustomer(meeting.customerPhone!)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </button>
                  )}
                </>
              )}

              {meeting.type === 'Internal' && (
                <button
                  onClick={() => handleJoinMeeting(meeting.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredMeetings().length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No meetings found</p>
        </div>
      )}
    </div>
  );

  const renderTeamActivities = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">MDO Team Activities</h3>
        
        <div className="space-y-4">
          {[
            {
              id: 'TA001',
              mdoName: 'Rajesh Kumar',
              mdoCode: 'MDO001',
              territory: 'North Delhi',
              date: '2024-01-23',
              time: '10:00 AM',
              type: 'Field Visit',
              customerName: 'SRI RAMA SEEDS AND PESTICIDES',
              customerCode: '1325',
              location: 'Green Valley, Sector 12, Delhi',
              coordinates: { lat: 28.6139, lng: 77.2090 },
              phone: '+91 98765 43210',
              status: 'In Progress',
              priority: 'High',
              description: 'Stock verification and liquidation tracking',
              objectives: ['Verify physical stock', 'Review liquidation progress', 'Update farmer sales data'],
              checkInTime: '9:55 AM',
              estimatedDuration: 90,
              visitType: 'Liquidation Review'
            }
          ].map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.mdoName}</h3>
                    <p className="text-sm text-gray-600">{activity.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                    {activity.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">{new Date(activity.date).toLocaleDateString()}</p>
                    <p>{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">{activity.location}</p>
                    <p>{activity.customerCode}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">{activity.territory}</p>
                    <p>{activity.mdoCode}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <span className="text-blue-600 font-medium">Visit Type:</span>
                  <span className="ml-2">{activity.visitType}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-blue-600 font-medium">Check-in:</span>
                  <span className="ml-2">{activity.checkInTime}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-blue-600 font-medium">Duration:</span>
                  <span className="ml-2">{activity.estimatedDuration} minutes</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCallCustomer(activity.phone)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call MDO
                </button>
                <button
                  onClick={() => handleViewDetails(activity.id)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => {
    const filteredApprovals = approvalRequests.filter(request => {
      const matchesType = approvalTypeFilter === 'All' || request.type === approvalTypeFilter;
      const matchesStatus = approvalStatusFilter === 'All' || request.status === approvalStatusFilter;
      const matchesSearch = request.type.toLowerCase().includes(approvalSearchTerm.toLowerCase()) ||
                           request.submittedBy.toLowerCase().includes(approvalSearchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(approvalSearchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });

    return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={approvalTypeFilter}
              onChange={(e) => setApprovalTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="All">All Types</option>
              <option value="Monthly Plan">Monthly Plan</option>
              <option value="Travel Claim">Travel Claim</option>
              <option value="Expense Report">Expense Report</option>
              <option value="Location Deviation">Location Deviation</option>
              <option value="Stock Variance">Stock Variance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={approvalStatusFilter}
              onChange={(e) => setApprovalStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search approvals..."
                value={approvalSearchTerm}
                onChange={(e) => setApprovalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {approvalStatusFilter === 'Pending' ? 'Pending' : approvalStatusFilter === 'All' ? 'All' : approvalStatusFilter} Approvals
          {filteredApprovals.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">({filteredApprovals.length})</span>
          )}
        </h3>

        <div className="space-y-4">
          {filteredApprovals.map((request) => (
            <div key={request.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.type}</h3>
                    <p className="text-sm text-gray-600">Submitted by {request.submittedBy} ({request.submittedByRole})</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Submitted</p>
                    <p>{new Date(request.submissionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p>{new Date(request.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {request.amount && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <div>
                      <p className="font-medium">Amount</p>
                      <p>₹{request.amount.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">{request.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApproveRequest(request.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleViewApprovalDetails(request.id)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredApprovals.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {approvalSearchTerm || approvalTypeFilter !== 'All' || approvalStatusFilter !== 'All'
                ? 'No approvals match your filters'
                : 'No approvals found'}
            </p>
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TSM Dashboard</h1>
              <p className="text-gray-600 mt-1">Territory Sales Manager - {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 card-shadow">
                <div className="text-sm text-gray-600">Territory</div>
                <div className="font-semibold text-gray-900">Delhi NCR</div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 card-shadow">
                <div className="text-sm text-gray-600">Team Size</div>
                <div className="font-semibold text-gray-900">{teamStats.activeMDOs} MDOs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl card-shadow overflow-hidden mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'meetings', label: 'Meetings', icon: Calendar },
              { id: 'activities', label: 'Activities', icon: Users },
              { id: 'approvals', label: 'Approvals', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
                  selectedView === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'approvals' && approvalRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {approvalRequests.filter(r => r.status === 'Pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'meetings' && renderMyMeetings()}
        {selectedView === 'activities' && (
          <div className="bg-white rounded-xl card-shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActivitiesSubTab('my')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activitiesSubTab === 'my'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  My Activities
                </button>
                <button
                  onClick={() => setActivitiesSubTab('team')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activitiesSubTab === 'team'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Team Activities
                </button>
              </div>
            </div>
            {activitiesSubTab === 'my' ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">My Activities</h3>
                <p className="text-gray-600">Coming Soon</p>
              </div>
            ) : (
              renderTeamActivities()
            )}
          </div>
        )}
        {selectedView === 'approvals' && renderApprovals()}
      </div>
    </div>
  );
};

export default TSMDashboard;