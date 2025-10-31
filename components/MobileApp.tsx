import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Users, ShoppingCart, Droplets, FileText, CheckSquare, Activity, MapPin, Calendar, Clock, Target, TrendingUp, Package, DollarSign, AlertTriangle, CheckCircle, User, Building, Phone, Mail, Camera, Upload, X, Plus, Minus, Save, ChevronDown, ChevronUp, Bell, Star, Award, Navigation, CreditCard, Receipt, Banknote, PenTool, Eye, BookOpen, Code, Database, Zap } from 'lucide-react';
import { useLiquidationCalculation } from '../hooks/useLiquidationCalculation';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePagination } from '../hooks/usePagination';
import Entity360View from './Entity360View';
import { SignatureCapture } from './SignatureCapture';
import { Pagination } from './Pagination';
import { MobileBatchStockUpdate } from './mobile/MobileBatchStockUpdate';
import {
  MOCK_DISTRIBUTORS,
  MOCK_RETAILERS,
  MOCK_TASKS,
  MOCK_VISITS,
  MOCK_REPORTS,
  MOCK_TEAM_MEMBERS,
  MOCK_ORDERS,
  MOCK_MEETINGS,
  MOCK_WORK_PLAN,
  MOCK_PRODUCTS,
  MOCK_GEOFENCE_CONFIG
} from '../data/mockData';

const MobileApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [liveMeetingsExpanded, setLiveMeetingsExpanded] = useState(true);
  const [monthlyPlanExpanded, setMonthlyPlanExpanded] = useState(false);
  const [show360View, setShow360View] = useState(false);
  const [selected360Distributor, setSelected360Distributor] = useState<any>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState('Timeline');
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWorkPlan, setShowWorkPlan] = useState(false);
  const [newMdoResponse, setNewMdoResponse] = useState<{[key: string]: string}>({});
  const { overallMetrics } = useLiquidationCalculation();
  const { latitude, longitude } = useGeolocation();

  const [showStockVerifyModal, setShowStockVerifyModal] = useState(false);
  const [selectedDistributorForVerify, setSelectedDistributorForVerify] = useState<any>(null);
  const [verifyTab, setVerifyTab] = useState<'stock-details' | 'verification'>('stock-details');
  const [skuQuantities, setSkuQuantities] = useState<Record<string, number>>({});
  // Using centralized product/SKU data - easily replaceable with API calls
  const [verifyProductData, setVerifyProductData] = useState(MOCK_PRODUCTS.map(p => ({
    productName: p.productName,
    skus: p.skus
  })));
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadedProofs, setUploadedProofs] = useState<any[]>([]);
  const [selectedVerificationMethod, setSelectedVerificationMethod] = useState<'letterhead' | 'esign' | ''>('');
  const [active360Tab, setActive360Tab] = useState<'contact' | 'financial' | 'performance' | 'history'>('contact');
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'opening' | 'ytd' | 'liquidation' | 'balance' | null>(null);
  const [selectedDistributorForMetric, setSelectedDistributorForMetric] = useState<any>(null);
  const [metricModalTab, setMetricModalTab] = useState<'details' | 'update' | 'verification'>('details');
  const [skuAccordionOpen, setSkuAccordionOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [expandedSku, setExpandedSku] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'distributor' | 'retailer'>('distributor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [showBatchStockUpdate, setShowBatchStockUpdate] = useState(false);

  const currentUserRole = user?.role || 'MDO';

  // Outlet location and geofence configuration from centralized mock data
  const OUTLET_LOCATION = MOCK_GEOFENCE_CONFIG.defaultLocation;
  const GEOFENCE_RADIUS = MOCK_GEOFENCE_CONFIG.radius;

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Check if user is within geofence
  const isWithinGeofence = (): { valid: boolean; distance: number; message: string } => {
    if (!latitude || !longitude) {
      return {
        valid: false,
        distance: -1,
        message: 'Unable to determine your location. Please enable location services.'
      };
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      OUTLET_LOCATION.latitude,
      OUTLET_LOCATION.longitude
    );

    const formatDistance = (dist: number): string => {
      if (dist >= 1000) {
        return `${(dist / 1000).toFixed(2)} km`;
      }
      return `${Math.round(dist)}m`;
    };

    if (distance > GEOFENCE_RADIUS) {
      return {
        valid: false,
        distance: Math.round(distance),
        message: `You are ${formatDistance(distance)} away from ${OUTLET_LOCATION.name}. You must be within ${GEOFENCE_RADIUS}m to submit proof or update stock.`
      };
    }

    return {
      valid: true,
      distance: Math.round(distance),
      message: `Location verified. You are ${formatDistance(distance)} from the outlet.`
    };
  };

  // Using centralized mock data - easily replaceable with API calls
  // See src/data/mockData.ts for the complete data structure and API replacement guide
  const retailers = MOCK_RETAILERS.length > 0 ? MOCK_RETAILERS : [
    {
      id: 'RET001',
      name: 'Green Farm Supplies',
      code: 'GFS789',
      type: 'retailer',
      product: 'DAP (Di-Ammonium Phosphate)',
      territory: 'Sector 15',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'High',
      linkedDistributors: ['DIST001', 'DIST002'],
      liquidationPercentage: 65,
      openingStock: { volume: 50, value: 0.68 },
      ytdNetSales: { volume: 20, value: 0.27 },
      liquidation: { volume: 33, value: 0.44 },
      balanceStock: { volume: 17, value: 0.23 },
      lastUpdated: '10/3/2025',
      remarks: 'Good retail partner',
      contactPerson: 'Suresh Patel',
      phone: '+91 99887 76655',
      email: 'suresh@greenfarmsupplies.com'
    },
    {
      id: 'RET002',
      name: 'Kisan Agro Store',
      code: 'KAS456',
      type: 'retailer',
      product: 'Urea',
      territory: 'Market Road',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'Medium',
      linkedDistributors: ['DIST001'],
      liquidationPercentage: 45,
      openingStock: { volume: 30, value: 0.41 },
      ytdNetSales: { volume: 15, value: 0.20 },
      liquidation: { volume: 14, value: 0.18 },
      balanceStock: { volume: 16, value: 0.22 },
      lastUpdated: '10/2/2025',
      remarks: 'Regular orders',
      contactPerson: 'Ramesh Kumar',
      phone: '+91 98765 43211',
      email: 'ramesh@kisanagro.com'
    },
    {
      id: 'RET003',
      name: 'Bharat Seeds & Fertilizers',
      code: 'BSF123',
      type: 'retailer',
      product: 'MOP (Muriate of Potash)',
      territory: 'Village Road',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'High',
      linkedDistributors: ['DIST002', 'DIST003'],
      liquidationPercentage: 80,
      openingStock: { volume: 40, value: 0.54 },
      ytdNetSales: { volume: 25, value: 0.34 },
      liquidation: { volume: 32, value: 0.43 },
      balanceStock: { volume: 8, value: 0.11 },
      lastUpdated: '10/4/2025',
      remarks: 'Excellent performer',
      contactPerson: 'Vijay Singh',
      phone: '+91 97654 32198',
      email: 'vijay@bharatseeds.com'
    }
  ];

  // Using centralized mock data - easily replaceable with API calls
  // See src/data/mockData.ts for the complete data structure and API replacement guide
  const distributors = MOCK_DISTRIBUTORS.length > 0 ? MOCK_DISTRIBUTORS : [
    {
      id: 'DIST001',
      name: 'SRI RAMA SEEDS AND PESTICIDES',
      code: '1325',
      product: 'DAP (Di-Ammonium Phosphate)',
      territory: 'North Delhi',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'High',
      liquidationPercentage: 71,
      openingStock: { volume: 210, value: 2.84 },
      ytdNetSales: { volume: 84, value: 1.13 },
      liquidation: { volume: 210, value: 2.84 },
      balanceStock: { volume: 420, value: 5.67 },
      lastUpdated: '9/18/2025',
      remarks: 'Good progress on liquidation',
      // Additional 360° data
      contactPerson: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh@sriramaseeds.com',
      address: 'Green Valley, Sector 12, Delhi NCR',
      establishedYear: 2018,
      businessType: 'Distributor',
      gstNumber: '07AABCU9603R1ZX',
      panNumber: 'AABCU9603R',
      creditLimit: 750000,
      totalPurchases: 300000,
      balanceCreditLimit: 680000,
      totalPayments: 230000,
      assignedMDO: 'Rajesh Kumar (MDO)',
      assignedTSM: 'Priya Sharma (TSM)',
      lastVisitDate: '2024-01-20',
      creditUtilization: 6.7
    },
    {
      id: 'DIST002',
      name: 'Ram Kumar Distributors',
      code: 'DLR001',
      product: 'DAP (Di-Ammonium Phosphate)',
      territory: 'Green Valley',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'Medium',
      liquidationPercentage: 29,
      openingStock: { volume: 15000, value: 18.75 },
      ytdNetSales: { volume: 6500, value: 8.13 },
      liquidation: { volume: 6200, value: 7.75 },
      balanceStock: { volume: 15300, value: 19.13 },
      lastUpdated: '9/18/2025',
      remarks: 'Needs improvement',
      // Additional 360° data
      contactPerson: 'Ram Kumar',
      phone: '+91 87654 32109',
      email: 'ram@ramkumardist.com',
      address: 'Market Area, Green Valley',
      establishedYear: 2015,
      businessType: 'Distributor',
      gstNumber: '07BBCDE1234F2GH',
      panNumber: 'BBCDE1234F',
      creditLimit: 500000,
      totalPurchases: 450000,
      balanceCreditLimit: 450000,
      totalPayments: 400000,
      assignedMDO: 'Amit Singh (MDO)',
      assignedTSM: 'Priya Sharma (TSM)',
      lastVisitDate: '2024-01-19',
      creditUtilization: 90.0
    },
    {
      id: 'DIST003',
      name: 'Green Agro Solutions',
      code: 'GAS001',
      product: 'DAP (Di-Ammonium Phosphate)',
      territory: 'Sector 8',
      region: 'Delhi NCR',
      zone: 'North Zone',
      status: 'Active',
      priority: 'Medium',
      liquidationPercentage: 26,
      openingStock: { volume: 17620, value: 21.70 },
      ytdNetSales: { volume: 6493, value: 6.57 },
      liquidation: { volume: 6380, value: 7.22 },
      balanceStock: { volume: 17733, value: 21.05 },
      lastUpdated: '9/18/2025',
      remarks: 'Regular follow-up needed',
      // Additional 360° data
      contactPerson: 'Suresh Patel',
      phone: '+91 76543 21098',
      email: 'suresh@greenagro.com',
      address: 'Industrial Area, Sector 8',
      establishedYear: 2020,
      businessType: 'Distributor',
      gstNumber: '07CDEFG5678H3IJ',
      panNumber: 'CDEFG5678H',
      creditLimit: 600000,
      totalPurchases: 380000,
      balanceCreditLimit: 570000,
      totalPayments: 350000,
      assignedMDO: 'Priya Verma (MDO)',
      assignedTSM: 'Vikram Patel (TSM)',
      lastVisitDate: '2024-01-18',
      creditUtilization: 63.3
    }
  ];

  // Activity history data
  const getActivityHistory = (distributorId: string) => {
    const baseActivities = [
      {
        id: 'ACT001',
        date: '2024-07-01',
        type: 'Visit',
        title: 'Visit: Product Demo',
        description: 'Product demonstration and stock review',
        status: 'Scheduled',
        performedBy: 'Rajesh Kumar',
        performedByRole: 'MDO',
        location: 'Green Valley, Sector 12',
        duration: 45
      },
      {
        id: 'ACT002',
        date: '2024-06-30',
        type: 'Payment',
        title: 'Payment Received',
        description: '₹80,000 - Invoice Payment',
        amount: 80000,
        status: 'Completed',
        performedBy: 'Rajesh Kumar',
        performedByRole: 'MDO',
        paymentMode: 'Bank Transfer',
        invoiceNumber: 'INV-2024-156'
      },
      {
        id: 'ACT003',
        date: '2024-06-28',
        type: 'Visit',
        title: 'Visit: Sales Call',
        description: 'Quarterly business review and target discussion',
        status: 'Completed',
        performedBy: 'Rajesh Kumar',
        performedByRole: 'MDO',
        location: 'Distributor Office',
        duration: 90
      },
      {
        id: 'ACT004',
        date: '2024-06-25',
        type: 'Order',
        title: 'Order #SO-001 created',
        description: 'Amount: ₹85,000. Status: delivered',
        amount: 85000,
        status: 'Delivered',
        performedBy: 'System',
        performedByRole: 'Auto',
        orderNumber: 'SO-001',
        invoiceNumber: 'INV-2024-001',
        items: [
          { name: 'Urea Fertilizer 50kg', qty: 100, rate: 650, total: 65000 },
          { name: 'DAP Fertilizer 25kg', qty: 40, rate: 500, total: 20000 }
        ]
      },
      {
        id: 'ACT005',
        date: '2024-06-20',
        type: 'Liquidation',
        title: 'Stock Liquidation Update',
        description: 'Updated liquidation progress to 7.5%',
        status: 'Completed',
        performedBy: 'Rajesh Kumar',
        performedByRole: 'MDO'
      },
      {
        id: 'ACT006',
        date: '2024-06-15',
        type: 'Advance',
        title: 'Advance Payment',
        description: '₹50,000 advance received for upcoming orders',
        amount: 50000,
        status: 'Completed',
        performedBy: 'Priya Sharma',
        performedByRole: 'TSM',
        paymentMode: 'Cash'
      },
      {
        id: 'ACT007',
        date: '2024-05-15',
        type: 'Order',
        title: 'Order #SO-002 created',
        description: 'Amount: ₹125,000. Status: delivered',
        amount: 125000,
        status: 'Delivered',
        performedBy: 'System',
        performedByRole: 'Auto',
        orderNumber: 'SO-002',
        invoiceNumber: 'INV-2024-002',
        items: [
          { name: 'NPK Complex 50kg', qty: 80, rate: 1200, total: 96000 },
          { name: 'Micronutrients 5kg', qty: 12, rate: 2400, total: 28800 }
        ]
      }
    ];
    return baseActivities;
  };

  // Handle distributor click - FIXED
  const handleDistributorClick = (distributor: any) => {
    console.log('Distributor clicked:', distributor.name);
    const entityData = {
      distributorName: distributor.name,
      distributorCode: distributor.code,
      territory: distributor.territory,
      status: distributor.status,
      metrics: {
        openingStock: distributor.openingStock,
        ytdNetSales: distributor.ytdNetSales,
        liquidation: distributor.liquidation,
        balanceStock: distributor.balanceStock,
        liquidationPercentage: distributor.liquidationPercentage
      }
    };
    setSelected360Distributor(entityData);
    setShow360View(true);
  };

  // Handle MDO response
  const handleMdoResponse = (deviationId: string) => {
    // Implementation for handling MDO response
    console.log('MDO response for deviation:', deviationId);
  };

  // Generate verification letter
  const generateVerificationLetter = () => {
    if (!selectedDistributorForVerify) return '';

    const date = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const currentDateTime = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const userName = user?.name || 'User';
    const userDesignation = user?.role || 'N/A';

    return `Date: ${date}

To,
Gencrest Bio-Sciences Ltd.

Subject: Stock Verification Certificate

Dear Sir/Madam,

This is to certify that we have physically verified the stock at our premises done by ${userName}, ${userDesignation} on ${currentDateTime}.

Distributor Details:
Name: ${selectedDistributorForVerify.name}
Code: ${selectedDistributorForVerify.code}
Location: ${selectedDistributorForVerify.address}

Current Stock Details:
- Opening Stock: ${selectedDistributorForVerify.openingStock?.volume || 0} MT
- Balance Stock: ${selectedDistributorForVerify.balanceStock?.volume || 0} MT
- Total Value: ₹${selectedDistributorForVerify.balanceStock?.value || 0}L

We confirm that the above stock details are accurate and have been verified physically.

_______________________________
Dealer/Distributor Signature

Name: ${selectedDistributorForVerify.contactPerson}
Stamp:


Visited and Liquidation done by:
Name: ${userName}
Designation: ${userDesignation}
Date/Time: ${currentDateTime}
`;
  };

  // Download verification letter
  const downloadVerificationLetter = () => {
    const letter = generateVerificationLetter();
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification_letter_${selectedDistributorForVerify?.code}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Ageing buckets data
  const getAgeingBuckets = (distributorId: string) => [
    { range: '0-30 Days', amount: 0, color: 'text-green-600' },
    { range: '31-60 Days', amount: 0, color: 'text-yellow-600' },
    { range: '61-90 Days', amount: 0, color: 'text-orange-600' },
    { range: '91+ Days', amount: 305000, color: 'text-red-600' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Visit': return <MapPin className="w-4 h-4" />;
      case 'Order': return <ShoppingCart className="w-4 h-4" />;
      case 'Payment': return <DollarSign className="w-4 h-4" />;
      case 'Advance': return <CreditCard className="w-4 h-4" />;
      case 'Liquidation': return <Droplets className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Visit': return 'bg-blue-100 text-blue-600';
      case 'Order': return 'bg-purple-100 text-purple-600';
      case 'Payment': return 'bg-green-100 text-green-600';
      case 'Advance': return 'bg-orange-100 text-orange-600';
      case 'Liquidation': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-700 bg-green-100';
      case 'Delivered': return 'text-blue-700 bg-blue-100';
      case 'Scheduled': return 'text-yellow-700 bg-yellow-100';
      case 'Pending': return 'text-orange-700 bg-orange-100';
      case 'Cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const renderHomeContent = () => (
    <div className="flex-1 p-4 space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Team Members</h3>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs opacity-75">MDOs under TSM</p>
          <p className="text-xs opacity-75">All active today</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Activities Done</h3>
          <div className="text-2xl font-bold">1374</div>
          <p className="text-xs opacity-75">out of 1620 planned</p>
          <p className="text-xs opacity-75">85% Achievement Rate</p>
        </div>
      </div>

      {/* Live Meetings Section */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
          onClick={() => setLiveMeetingsExpanded(!liveMeetingsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">Live Meetings</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <span className="text-sm font-medium">2 Active</span>
            {liveMeetingsExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        
        {liveMeetingsExpanded && (
          <div className="space-y-3 mt-3">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Rajesh Kumar</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">25 min</div>
                  <div className="text-xs text-gray-500">Started 10:45 AM</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Meeting ended');
                    }}
                    className="mt-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Ram Kumar Farm</p>
                <p>Green Valley, Sector 12</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Amit Singh</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">15 min</div>
                  <div className="text-xs text-gray-500">Started 11:20 AM</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Meeting ended');
                    }}
                    className="mt-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Suresh Traders</p>
                <p>Market Area, Sector 8</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLiquidationContent = () => {
    const filteredData = useMemo(() => {
      const sourceData = searchType === 'distributor' ? distributors : retailers;
      return sourceData.filter(d =>
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d as any).product?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchType, searchQuery, distributors, retailers]);

    const {
      currentPage,
      totalPages,
      paginatedData,
      goToPage
    } = usePagination({
      data: filteredData,
      itemsPerPage: 5,
      initialPage: 1
    });

    return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-500">
          <div className="text-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">₹190.00L</div>
            <div className="text-xs text-orange-700 mt-1">Opening Stock</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">₹43.70L</div>
            <div className="text-xs text-blue-700 mt-1">YTD Net Sales</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">₹55.52L</div>
            <div className="text-xs text-green-700 mt-1">Liquidation</div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">₹178.23L</div>
            <div className="text-xs text-purple-700 mt-1">Balance Stock</div>
          </div>
        </div>
      </div>

      {/* Distributor/Retailer Entries */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchType === 'distributor' ? 'Distributor' : 'Retailer'} Entries
          </h3>
          <button
            onClick={() => setShowBatchStockUpdate(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            <Package className="w-3 h-3" />
            Batch Update
          </button>
        </div>

        {/* Search Controls */}
        <div className="mb-4 space-y-2">
          <div className="flex space-x-2">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value as 'distributor' | 'retailer');
                setSearchQuery('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${searchType}s...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-3">
          {paginatedData.map((distributor) => (
            <div key={distributor.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <button
                      onClick={() => handleDistributorClick(distributor)}
                      className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-left underline decoration-2 decoration-blue-300 hover:decoration-blue-500 flex items-center gap-1.5"
                    >
                      {distributor.name}
                      <Eye className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600">Code: {distributor.code}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    distributor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {distributor.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    distributor.priority === 'High' ? 'bg-red-100 text-red-800' :
                    distributor.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {distributor.priority}
                  </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="mb-3">
                <p className="text-xs text-blue-600 font-medium">{distributor.product}</p>
                <p className="text-xs text-gray-500">{distributor.territory} • {distributor.region}</p>
                {searchType === 'retailer' && (distributor as any).linkedDistributors && (
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Linked to {(distributor as any).linkedDistributors.length} distributor(s)
                  </p>
                )}
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-orange-50 rounded p-2 text-center border border-orange-200">
                  <div className="text-xs text-orange-600 mb-1">Opening</div>
                  <div className="text-lg font-bold text-orange-800 my-1">₹{distributor.openingStock.value}L</div>
                  <button
                    onClick={() => {
                      setSelectedDistributorForMetric(distributor);
                      setSelectedMetric('opening');
                      setShowMetricModal(true);
                      setMetricModalTab('details');
                      setSkuAccordionOpen(false);
                    }}
                    className="text-xs text-orange-700 underline hover:text-orange-900 font-medium"
                  >
                    View
                  </button>
                </div>
                <div className="bg-blue-50 rounded p-2 text-center border border-blue-200">
                  <div className="text-xs text-blue-600 mb-1">YTD Sales</div>
                  <div className="text-lg font-bold text-blue-800 my-1">₹{distributor.ytdNetSales.value}L</div>
                  <button
                    onClick={() => {
                      setSelectedDistributorForMetric(distributor);
                      setSelectedMetric('ytd');
                      setShowMetricModal(true);
                      setMetricModalTab('details');
                      setSkuAccordionOpen(false);
                    }}
                    className="text-xs text-blue-700 underline hover:text-blue-900 font-medium"
                  >
                    View
                  </button>
                </div>
                <div className="bg-green-50 rounded p-2 text-center border border-green-200">
                  <div className="text-xs text-green-600 mb-1">Liquidation</div>
                  <div className="text-lg font-bold text-green-800 my-1">₹{distributor.liquidation.value}L</div>
                  <button
                    onClick={() => {
                      setSelectedDistributorForMetric(distributor);
                      setSelectedMetric('liquidation');
                      setShowMetricModal(true);
                      setMetricModalTab('details');
                      setSkuAccordionOpen(false);
                    }}
                    className="text-xs text-green-700 underline hover:text-green-900 font-medium"
                  >
                    View
                  </button>
                </div>
                <div className="bg-purple-50 rounded p-2 text-center border border-purple-200">
                  <div className="text-xs text-purple-600 mb-1">Balance</div>
                  <div className="text-lg font-bold text-purple-800 my-1">₹{distributor.balanceStock.value}L</div>
                  <button
                    onClick={() => {
                      setSelectedDistributorForMetric(distributor);
                      setSelectedMetric('balance');
                      setShowMetricModal(true);
                      setMetricModalTab('details');
                      setSkuAccordionOpen(false);
                    }}
                    className="text-xs text-purple-700 underline hover:text-purple-900 font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>% Liquidation</span>
                  <span className="font-semibold">{distributor.liquidationPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${distributor.liquidationPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDistributorClick(distributor)}
                  className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  360° View
                </button>
                <button
                  onClick={() => {
                    setSelectedDistributorForVerify(distributor);
                    setVerifyTab('stock-details');
                    setSkuQuantities({});
                    setUploadedProofs([]);
                    setSelectedVerificationMethod('');
                    setShowStockVerifyModal(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verify Stock
                </button>
              </div>
              
              {/* Footer Info */}
              <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Updated: {distributor.lastUpdated}</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {distributor.zone}
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{distributor.remarks}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredData.length}
              itemsPerPage={5}
              onPageChange={goToPage}
              itemName={searchType === 'distributor' ? 'distributors' : 'retailers'}
            />
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderTeamContent = () => (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
        <div className="space-y-3">
          {MOCK_TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role} • {member.territory}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {MOCK_ORDERS.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{order.distributorName}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{order.amount.toLocaleString()}</span>
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTasksContent = () => (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h3>
        <div className="space-y-3">
          {MOCK_TASKS.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsContent = () => (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>
        <div className="space-y-3">
          {MOCK_REPORTS.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{report.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{new Date(report.date).toLocaleDateString()}</span>
                <button 
                  onClick={() => alert(`Downloading ${report.title}`)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMoreContent = () => (
    <div className="flex-1 p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 mr-2" />
            New Visit
          </button>
          <button className="bg-green-600 text-white p-3 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Create Order
          </button>
          <button className="bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Payment
          </button>
          <button className="bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 mr-2" />
            Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">Profile Settings</button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">Notifications</button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">Sync Data</button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg text-red-600">Logout</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'team':
        return renderTeamContent();
      case 'orders':
        return renderOrdersContent();
      case 'liquidation':
        return renderLiquidationContent();
      case 'tasks':
        return renderTasksContent();
      case 'reports':
        return renderReportsContent();
      case 'more':
        return renderMoreContent();
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SK'}
              </span>
            </div>
            <div>
              <h2 className="font-bold">Sandeep</h2>
              <p className="text-sm opacity-90">Kumar</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">{currentUserRole}</p>
            <p className="text-xs opacity-75">Delhi Region</p>
          </div>
        </div>
        
        {/* Monthly Plan Section */}
        <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-4 border border-white border-opacity-30">
          <button
            onClick={() => setShowWorkPlan(!showWorkPlan)}
            className="w-full flex items-center justify-between p-2 hover:bg-white hover:bg-opacity-10 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Work Plan Assignment</h3>
                <p className="text-xs text-white opacity-75">January 2024 Monthly Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Approved
              </span>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${showWorkPlan ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {showWorkPlan && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-30 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-white opacity-75">Created by:</span>
                  <span className="font-medium ml-1 text-white">Priya Sharma (TSM)</span>
                </div>
                <div>
                  <span className="text-white opacity-75">Approved by:</span>
                  <span className="font-medium ml-1 text-white">Amit Patel</span>
                </div>
              </div>
              
              {/* Daily Activities */}
              <div className="space-y-2">
                <h4 className="font-medium text-white text-sm">This Week's Activities</h4>
                {[
                  { day: 'Monday', village: 'Green Valley', distributor: 'Ram Kumar', target: 5 },
                  { day: 'Tuesday', village: 'Sector 12', distributor: 'Suresh Traders', target: 3 },
                  { day: 'Wednesday', village: 'Industrial Area', distributor: 'Amit Agro', target: 4 }
                ].map((activity, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-white">{activity.day}</p>
                        <p className="text-xs text-white opacity-75">{activity.village} - {activity.distributor}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        Target: {activity.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Notification Icons */}
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => alert('Tasks: 4 pending')}
            className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors relative"
          >
            <CheckSquare className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              4
            </span>
          </button>
          <button 
            onClick={() => alert('Alerts: 3 active')}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors relative"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              3
            </span>
          </button>
          <button 
            onClick={() => alert('Messages: 5 unread')}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors relative"
          >
            <Mail className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              5
            </span>
          </button>
          <button 
            onClick={() => alert('Approvals: 2 pending')}
            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors relative"
          >
            <User className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'home' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('team')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'team' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Team</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Orders</span>
          </button>
          
          <button
            onClick={() => setActiveTab('liquidation')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'liquidation' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Droplets className="w-5 h-5 mb-1" />
            <span className="text-xs">Liquidation</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'tasks' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-1" />
            <span className="text-xs">Tasks</span>
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'reports' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-xs">Reports</span>
          </button>
        </div>
      </div>

      {/* 360° View Modal - FIXED */}
      {/* Old 360 View Modal - Disabled */}
      {false && show360View && selected360Distributor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-0">
          <div className="bg-white w-full max-w-[375px] h-full max-h-screen overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selected360Distributor.name}</h3>
                  <p className="text-sm opacity-90">Code: {selected360Distributor.code}</p>
                  <p className="text-xs opacity-75">{selected360Distributor.businessType}</p>
                </div>
                <button
                  onClick={() => setShow360View(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-white flex-shrink-0 overflow-x-auto">
              <button
                onClick={() => setActive360Tab('contact')}
                className={`flex-1 min-w-fit py-3 px-3 text-xs font-medium whitespace-nowrap ${
                  active360Tab === 'contact'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActive360Tab('financial')}
                className={`flex-1 min-w-fit py-3 px-3 text-xs font-medium whitespace-nowrap ${
                  active360Tab === 'financial'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600'
                }`}
              >
                Financial
              </button>
              <button
                onClick={() => setActive360Tab('performance')}
                className={`flex-1 min-w-fit py-3 px-3 text-xs font-medium whitespace-nowrap ${
                  active360Tab === 'performance'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setActive360Tab('history')}
                className={`flex-1 min-w-fit py-3 px-3 text-xs font-medium whitespace-nowrap ${
                  active360Tab === 'history'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600'
                }`}
              >
                History
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Contact Information */}
              {active360Tab === 'contact' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{selected360Distributor.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selected360Distributor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selected360Distributor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{selected360Distributor.address}</span>
                  </div>
                </div>
              </div>
              )}

              {/* Financial Overview */}
              {active360Tab === 'financial' && (
              <>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Financial Overview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm text-blue-600 mb-1">Total Credit Limit</div>
                    <div className="text-lg font-bold text-blue-800">₹{(selected360Distributor.creditLimit / 100000).toFixed(1)}L</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm text-green-600 mb-1">Total Purchases</div>
                    <div className="text-lg font-bold text-green-800">₹{(selected360Distributor.totalPurchases / 100000).toFixed(1)}L</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm text-purple-600 mb-1">Balance Credit Limit</div>
                    <div className="text-lg font-bold text-purple-800">₹{(selected360Distributor.balanceCreditLimit / 100000).toFixed(1)}L</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Banknote className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm text-orange-600 mb-1">Total Payments</div>
                    <div className="text-lg font-bold text-orange-800">₹{(selected360Distributor.totalPayments / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              </div>

              {/* Ageing Analysis */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold text-gray-900">Ageing Analysis</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getAgeingBuckets(selected360Distributor.id).map((bucket, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-lg font-bold ${bucket.color} mb-1`}>
                        ₹{bucket.amount === 0 ? '0K' : `${(bucket.amount / 1000).toFixed(0)}K`}
                      </div>
                      <div className="text-xs text-gray-600">{bucket.range}</div>
                    </div>
                  ))}
                </div>
              </div>
              </>
              )}

              {/* Performance Overview */}
              {active360Tab === 'performance' && (
              <>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Performance Overview</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Liquidation Progress</span>
                      <span className="font-semibold">{selected360Distributor.liquidationPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                        style={{ width: `${selected360Distributor.liquidationPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Credit Utilization</span>
                      <span className="font-semibold">{selected360Distributor.creditUtilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
                        style={{ width: `${selected360Distributor.creditUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              </>
              )}

              {/* 360° Activity History */}
              {active360Tab === 'history' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">360° Activity History</h4>
                
                {/* Activity Tabs */}
                <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                  {['Timeline', 'Visits', 'Orders', 'Payments', 'Advances', 'Liquidations'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveHistoryTab(tab)}
                      className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                        activeHistoryTab === tab
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Activity Items */}
                <div className="space-y-3">
                  {getActivityHistory(selected360Distributor.id)
                    .filter(activity => {
                      if (activeHistoryTab === 'Timeline') return true;
                      return activity.type === activeHistoryTab.slice(0, -1);
                    })
                    .map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900 text-sm">{activity.title}</h5>
                            <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">By: {activity.performedBy} ({activity.performedByRole})</p>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        {activity.amount && (
                          <span className="text-sm font-semibold text-green-600">₹{activity.amount.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Additional Details */}
                      {activity.type === 'Order' && activity.items && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-900 mb-1">Items Purchased:</p>
                          {activity.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{item.name}</span>
                              <span>{item.qty} × ₹{item.rate} = ₹{item.total.toLocaleString()}</span>
                            </div>
                          ))}
                          {activity.invoiceNumber && (
                            <p className="text-xs text-gray-500 mt-1">Invoice: {activity.invoiceNumber}</p>
                          )}
                        </div>
                      )}

                      {activity.type === 'Payment' && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Payment Mode:</span>
                            <span className="font-medium">{activity.paymentMode}</span>
                          </div>
                          {activity.invoiceNumber && (
                            <div className="flex justify-between">
                              <span>Invoice:</span>
                              <span className="font-medium">{activity.invoiceNumber}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {activity.type === 'Visit' && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{activity.location}</span>
                          </div>
                          {activity.duration && (
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="font-medium">{activity.duration} minutes</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>

            {/* Quick Actions - Always visible at bottom */}
            <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">Schedule Visit</span>
                  </button>
                  <button className="bg-green-600 text-white p-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className="text-sm">Create Order</span>
                  </button>
                  <button className="bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">Record Payment</span>
                  </button>
                  <button className="bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">Generate Report</span>
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Location Deviations */}
          <div className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Location Deviations</h3>
              </div>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                2 Pending
              </span>
            </div>

            <div className="space-y-3">
              <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-900">6.2km deviation</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
                </div>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Assigned:</strong> Green Valley, Sector 12</p>
                  <p><strong>Actual:</strong> Sector 15 Community Hall</p>
                  <p><strong>Date:</strong> Jan 20, 10:30 AM</p>
                </div>
                <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
                  <strong>Reason:</strong> Venue changed due to local festival, community hall was more accessible for farmers
                </div>
              </div>

              <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">8.5km deviation</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Assigned:</strong> Village Khera</p>
                  <p><strong>Actual:</strong> Highway Rest Stop</p>
                  <p><strong>Date:</strong> Jan 19, 2:15 PM</p>
                  <p><strong>Approved by:</strong> TSM - Priya Sharma</p>
                </div>
                <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
                  <strong>Reason:</strong> Emergency meeting with distributor due to urgent stock issue
                </div>
              </div>
            </div>
          </div>

          {/* Other Alert Types */}
          <div className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Time Deviations</h3>
            </div>
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No time deviations</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Target Alerts</h3>
            </div>
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">All targets on track</p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Verification Modal */}
      {showStockVerifyModal && selectedDistributorForVerify && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-0">
          <div className="bg-white w-full max-w-[375px] h-full max-h-screen overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-white p-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Verify Stock</h3>
                  <p className="text-xs text-gray-600">Outlet details and transaction history</p>
                </div>
                <button
                  onClick={() => {
                    setShowStockVerifyModal(false);
                    setShowLetterPreview(false);
                    setUploadedProofs([]);
                    setVerifyTab('stock-details');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Total Liquidation Box */}
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">₹7.71L</div>
                  <div className="text-xs text-orange-600 font-medium">Total Liquidation</div>
                </div>
              </div>

              {/* Outlet Info */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center text-xs text-gray-700">
                  <Building className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="font-semibold">{selectedDistributorForVerify.name}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">Code: 1325</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>Green Valley, Delhi NCR, North Zone, Delhi</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setVerifyTab('stock-details')}
                className={`flex-1 py-2 px-3 text-xs font-semibold ${
                  verifyTab === 'stock-details'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600'
                }`}
              >
                SKU WISE VERIFY
              </button>
              <button
                onClick={() => setVerifyTab('verification')}
                className={`flex-1 py-2 px-3 text-xs font-semibold ${
                  verifyTab === 'verification'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600'
                }`}
              >
                Submit Proof
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {verifyTab === 'stock-details' && (
                <>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Product & SKU Breakdown</h4>

                  {/* Product List */}
                  <div className="space-y-2">
                    {/* Agrosatva Product */}
                    <div className="bg-orange-500 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedProduct(expandedProduct === 'agrosatva' ? null : 'agrosatva')}
                        className="w-full p-3 flex items-center justify-between text-white"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-bold text-sm">Agrosatva</div>
                            <div className="text-xs opacity-90">Code: FGCMGM0092 • Category: Biostimulant</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-bold text-sm">₹2.17L</div>
                            <div className="text-xs opacity-90">700 units</div>
                          </div>
                          {expandedProduct === 'agrosatva' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {expandedProduct === 'agrosatva' && (
                        <div className="bg-white p-3 space-y-3">
                          {/* Transaction History Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-2 font-semibold text-gray-700">Invoice Date</th>
                                  <th className="text-left p-2 font-semibold text-gray-700">Sale/Return</th>
                                  <th className="text-right p-2 font-semibold text-gray-700">Quantity</th>
                                  <th className="text-right p-2 font-semibold text-gray-700">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-gray-100">
                                  <td className="p-2">10.04</td>
                                  <td className="p-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Sale</span></td>
                                  <td className="p-2 text-right text-green-600 font-semibold">+120</td>
                                  <td className="p-2 text-right font-semibold">₹0.27L</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                  <td className="p-2">24.04</td>
                                  <td className="p-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Sale</span></td>
                                  <td className="p-2 text-right text-green-600 font-semibold">+160</td>
                                  <td className="p-2 text-right font-semibold">₹0.36L</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                  <td className="p-2">08.05</td>
                                  <td className="p-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Sale</span></td>
                                  <td className="p-2 text-right text-green-600 font-semibold">+200</td>
                                  <td className="p-2 text-right font-semibold">₹0.45L</td>
                                </tr>
                                <tr className="border-t border-gray-200 bg-gray-50 font-bold">
                                  <td colSpan={2} className="p-2">Liquidation Total:</td>
                                  <td className="p-2 text-right">480</td>
                                  <td className="p-2 text-right">₹1.08L</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* SKU Details */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700">SKU Breakdown:</div>
                            <div className="bg-gray-50 rounded p-2 text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-700">Agrosatva - 500 ml</span>
                                <span className="font-semibold text-gray-900">300 Nos</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700">Agrosatva - 1 litre</span>
                                <span className="font-semibold text-gray-900">180 Nos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Agrobest Product */}
                    <div className="bg-orange-500 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedProduct(expandedProduct === 'agrobest' ? null : 'agrobest')}
                        className="w-full p-3 flex items-center justify-between text-white"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-bold text-sm">Agrobest</div>
                            <div className="text-xs opacity-90">Code: FGPMPGM0002 • Category: Plant Stimulant</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-bold text-sm">₹1.64L</div>
                            <div className="text-xs opacity-90">820 units</div>
                          </div>
                          {expandedProduct === 'agrobest' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {expandedProduct === 'agrobest' && (
                        <div className="bg-white p-3 space-y-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-2 font-semibold text-gray-700">Invoice Date</th>
                                  <th className="text-left p-2 font-semibold text-gray-700">Sale/Return</th>
                                  <th className="text-right p-2 font-semibold text-gray-700">Quantity</th>
                                  <th className="text-right p-2 font-semibold text-gray-700">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-gray-100">
                                  <td className="p-2">15.04</td>
                                  <td className="p-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Sale</span></td>
                                  <td className="p-2 text-right text-green-600 font-semibold">+320</td>
                                  <td className="p-2 text-right font-semibold">₹0.64L</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                  <td className="p-2">22.04</td>
                                  <td className="p-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Sale</span></td>
                                  <td className="p-2 text-right text-green-600 font-semibold">+500</td>
                                  <td className="p-2 text-right font-semibold">₹1.00L</td>
                                </tr>
                                <tr className="border-t border-gray-200 bg-gray-50 font-bold">
                                  <td colSpan={2} className="p-2">Liquidation Total:</td>
                                  <td className="p-2 text-right">820</td>
                                  <td className="p-2 text-right">₹1.64L</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700">SKU Breakdown:</div>
                            <div className="bg-gray-50 rounded p-2 text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-700">Agrobest - 250 ml</span>
                                <span className="font-semibold text-gray-900">420 Nos</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700">Agrobest - 500 ml</span>
                                <span className="font-semibold text-gray-900">400 Nos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {verifyTab === 'verification' && (
                <>
                  {/* Upload Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Proof</h4>
                    <div className="flex justify-center items-center space-x-4 mb-3">
                      <button
                        onClick={async () => {
                          setIsCapturing(true);
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          const newProof = {
                            id: `photo_${Date.now()}`,
                            type: 'photo',
                            name: `Photo_${Date.now()}.jpg`,
                            timestamp: new Date().toISOString()
                          };
                          setUploadedProofs(prev => [...prev, newProof]);
                          setIsCapturing(false);
                        }}
                        disabled={isCapturing}
                        className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                      >
                        <Camera className="w-12 h-12 text-blue-500 mb-2" />
                        <span className="text-sm font-semibold text-gray-700">Click Picture</span>
                        <span className="text-xs text-gray-500 mt-1">Take photo</span>
                      </button>

                      <div className="text-lg text-gray-400 font-semibold">
                        OR
                      </div>

                      <button
                        onClick={() => setShowSignatureCapture(true)}
                        className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                      >
                        <PenTool className="w-12 h-12 text-green-500 mb-2" />
                        <span className="text-sm font-semibold text-gray-700">Add E-Sign</span>
                        <span className="text-xs text-gray-500 mt-1">Digital signature</span>
                      </button>
                    </div>

                    {isCapturing && (
                      <div className="text-center py-2">
                        <div className="inline-flex items-center space-x-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Processing...</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-3 py-2">
                      <button
                        onClick={() => setShowLetterPreview(!showLetterPreview)}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors text-base underline"
                      >
                        <FileText className="w-5 h-5" />
                        <span>{showLetterPreview ? 'Hide Letter' : 'View Letter'}</span>
                      </button>
                    </div>

                    {showLetterPreview && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Letter Preview</h4>
                          <button
                            onClick={downloadVerificationLetter}
                            className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="bg-white border border-gray-300 rounded p-2 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {generateVerificationLetter()}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Download, print, add signature and stamp, then upload above.
                        </p>
                      </div>
                    )}

                    {/* Uploaded Proofs List */}
                    {uploadedProofs.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-sm font-semibold text-gray-900">Uploaded Proofs ({uploadedProofs.length})</h5>
                        {uploadedProofs.map((proof) => (
                          <div key={proof.id} className={`flex items-center justify-between rounded-lg p-3 border ${
                            proof.type === 'photo' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                proof.type === 'photo' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {proof.type === 'photo' ? (
                                  <Camera className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <PenTool className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{proof.name}</p>
                                <p className="text-xs text-gray-500 flex items-center space-x-1">
                                  <span>{proof.type === 'photo' ? 'Photo' : 'E-Signature'}</span>
                                  <span>•</span>
                                  <span>{new Date(proof.timestamp).toLocaleTimeString()}</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setUploadedProofs(prev => prev.filter(p => p.id !== proof.id));
                              }}
                              className="p-2 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <X className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location Info */}
                  {latitude && longitude && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Location Captured</p>
                      </div>
                      <p className="text-xs text-green-700">
                        Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {/* Location Status */}
                  {(() => {
                    const check = isWithinGeofence();
                    return (
                      <div className={`mb-3 p-3 rounded-lg ${
                        check.valid
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2 flex-1 min-w-0">
                            <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${check.valid ? 'text-green-600' : 'text-red-600'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold ${check.valid ? 'text-green-900' : 'text-red-900'}`}>
                                {check.valid ? 'Location Verified' : 'Outside Geofence'}
                              </div>
                              <div className={`text-xs mt-0.5 break-words ${check.valid ? 'text-green-700' : 'text-red-700'}`}>
                                {check.message}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {check.valid ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="sticky bottom-0 bg-white pt-2 pb-1">
                    <button
                      onClick={() => {
                        const geofenceCheck = isWithinGeofence();

                        if (!geofenceCheck.valid) {
                          alert(`❌ Location Verification Failed\n\n${geofenceCheck.message}\n\nYou must be at the outlet location to submit proof.`);
                          return;
                        }

                        if (uploadedProofs.length === 0) {
                          alert('Please upload at least one proof');
                          return;
                        }

                        // Update product data with new quantities
                        const updatedData = verifyProductData.map(product => ({
                          ...product,
                          skus: product.skus.map(sku => ({
                            ...sku,
                            currentStock: skuQuantities[sku.code] ?? sku.currentStock
                          }))
                        }));
                        setVerifyProductData(updatedData);

                        alert(`✓ Verification submitted successfully!\n\n${geofenceCheck.message}\n\nStock quantities updated!`);
                        setShowStockVerifyModal(false);
                        setShowLetterPreview(false);
                        setUploadedProofs([]);
                        setSkuQuantities({});
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Submit Verification
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metric Details Modal */}
      {showMetricModal && selectedDistributorForMetric && selectedMetric && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedMetric === 'opening' ? 'Opening Stock' :
                   selectedMetric === 'ytd' ? 'YTD Sales' :
                   selectedMetric === 'liquidation' ? 'Liquidation' : 'Balance Stock'}
                </h3>
                <p className="text-xs text-gray-600">{selectedDistributorForMetric.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowMetricModal(false);
                  setSelectedMetric(null);
                  setSelectedDistributorForMetric(null);
                  setShowLetterPreview(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setMetricModalTab('details')}
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-colors ${
                  metricModalTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stock Details
              </button>
              <button
                onClick={() => setMetricModalTab('update')}
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-colors ${
                  metricModalTab === 'update'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Update Stock
              </button>
              <button
                onClick={() => setMetricModalTab('verification')}
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-colors ${
                  metricModalTab === 'verification'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Verification
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {metricModalTab === 'update' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-blue-600" />
                      Update Current Stock
                    </h4>
                    <p className="text-xs text-gray-600">Update the current stock quantities for each SKU based on physical verification</p>
                  </div>

                  {/* Product-wise SKU Update */}
                  {verifyProductData.map((product, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white">
                        <h5 className="font-bold text-sm">{product.productName}</h5>
                      </div>
                      <div className="p-3 space-y-3">
                        {product.skus.map((sku) => {
                          const currentQty = skuQuantities[sku.code] !== undefined
                            ? skuQuantities[sku.code]
                            : sku.currentStock;
                          const difference = currentQty - sku.openingStock;
                          const diffColor = difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600';

                          return (
                            <div key={sku.code} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">{sku.name}</p>
                                  <p className="text-xs text-gray-600">Code: {sku.code} • Unit: {sku.unit}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-orange-100 rounded p-2">
                                  <p className="text-xs text-orange-700">Opening Stock</p>
                                  <p className="text-lg font-bold text-orange-900">{sku.openingStock}</p>
                                </div>
                                <div className="bg-purple-100 rounded p-2">
                                  <p className="text-xs text-purple-700">Current Stock</p>
                                  <p className="text-lg font-bold text-purple-900">{currentQty}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 mb-2">
                                <button
                                  onClick={() => {
                                    setSkuQuantities(prev => ({
                                      ...prev,
                                      [sku.code]: Math.max(0, (prev[sku.code] || sku.currentStock) - 1)
                                    }));
                                  }}
                                  className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center font-bold"
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <input
                                  type="number"
                                  value={currentQty}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setSkuQuantities(prev => ({
                                      ...prev,
                                      [sku.code]: Math.max(0, value)
                                    }));
                                  }}
                                  className="flex-1 text-center text-xl font-bold border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => {
                                    setSkuQuantities(prev => ({
                                      ...prev,
                                      [sku.code]: (prev[sku.code] || sku.currentStock) + 1
                                    }));
                                  }}
                                  className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-bold"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>

                              <div className={`text-center p-2 rounded-lg ${difference > 0 ? 'bg-green-50' : difference < 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
                                <p className="text-xs text-gray-600">Net Change</p>
                                <p className={`text-lg font-bold ${diffColor}`}>
                                  {difference > 0 ? '+' : ''}{difference} {sku.unit}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      const geofenceCheck = isWithinGeofence();
                      if (!geofenceCheck.valid) {
                        alert(`❌ Location Verification Failed\n\n${geofenceCheck.message}\n\nYou must be at the outlet location to update stock.`);
                        return;
                      }
                      alert('✓ Stock updated successfully! Please proceed to verification tab to submit proof.');
                      setMetricModalTab('verification');
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Stock Updates
                  </button>
                </div>
              ) : metricModalTab === 'details' ? (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className={`rounded-lg p-4 ${
                    selectedMetric === 'opening' ? 'bg-orange-50 border border-orange-200' :
                    selectedMetric === 'ytd' ? 'bg-blue-50 border border-blue-200' :
                    selectedMetric === 'liquidation' ? 'bg-green-50 border border-green-200' :
                    'bg-purple-50 border border-purple-200'
                  }`}>
                    <div className="text-center mb-3">
                      <div className={`text-4xl font-bold ${
                        selectedMetric === 'opening' ? 'text-orange-600' :
                        selectedMetric === 'ytd' ? 'text-blue-600' :
                        selectedMetric === 'liquidation' ? 'text-green-600' :
                        'text-purple-600'
                      }`}>
                        ₹{selectedMetric === 'opening' ? selectedDistributorForMetric.openingStock.value :
                           selectedMetric === 'ytd' ? selectedDistributorForMetric.ytdNetSales.value :
                           selectedMetric === 'liquidation' ? selectedDistributorForMetric.liquidation.value :
                           selectedDistributorForMetric.balanceStock.value}L
                      </div>
                    </div>
                  </div>

                  {/* SKU Breakdown Accordion */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setSkuAccordionOpen(!skuAccordionOpen)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">SKU Breakdown</h4>
                      {skuAccordionOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {skuAccordionOpen && (
                      <div className="px-4 pb-4 space-y-2 border-t border-gray-200 pt-3">
                        {[
                          {
                            product: 'DAP (Di-Ammonium Phosphate)',
                            productCode: 'DAP',
                            skus: [
                              { name: 'DAP 25kg Bag', code: 'DAP-25KG', transactions: [
                                { invoiceDate: '2024-12-15', type: 'Sale', quantity: 50, value: 67500 },
                                { invoiceDate: '2024-12-10', type: 'Sale', quantity: 80, value: 108000 },
                                { invoiceDate: '2024-12-05', type: 'Return', quantity: -10, value: -13500 }
                              ]},
                              { name: 'DAP 50kg Bag', code: 'DAP-50KG', transactions: [
                                { invoiceDate: '2024-12-14', type: 'Sale', quantity: 60, value: 81000 },
                                { invoiceDate: '2024-12-08', type: 'Sale', quantity: 70, value: 94500 },
                                { invoiceDate: '2024-12-01', type: 'Sale', quantity: 90, value: 121500 }
                              ]}
                            ]
                          },
                          {
                            product: 'MOP (Muriate of Potash)',
                            productCode: 'MOP',
                            skus: [
                              { name: 'MOP 25kg Bag', code: 'MOP-25KG', transactions: [
                                { invoiceDate: '2024-12-13', type: 'Sale', quantity: 40, value: 54000 },
                                { invoiceDate: '2024-12-07', type: 'Sale', quantity: 55, value: 74250 }
                              ]},
                              { name: 'MOP 50kg Bag', code: 'MOP-50KG', transactions: [
                                { invoiceDate: '2024-12-16', type: 'Sale', quantity: 45, value: 60750 },
                                { invoiceDate: '2024-12-09', type: 'Sale', quantity: 65, value: 87750 },
                                { invoiceDate: '2024-12-03', type: 'Return', quantity: -8, value: -10800 }
                              ]}
                            ]
                          },
                          {
                            product: 'Urea',
                            productCode: 'UREA',
                            skus: [
                              { name: 'Urea 45kg Bag', code: 'UREA-45KG', transactions: [
                                { invoiceDate: '2024-12-16', type: 'Sale', quantity: 40, value: 54000 },
                                { invoiceDate: '2024-12-12', type: 'Return', quantity: -5, value: -6750 },
                                { invoiceDate: '2024-12-07', type: 'Sale', quantity: 75, value: 101250 }
                              ]},
                              { name: 'Urea 50kg Bag', code: 'UREA-50KG', transactions: [
                                { invoiceDate: '2024-12-11', type: 'Sale', quantity: 50, value: 67500 },
                                { invoiceDate: '2024-12-06', type: 'Sale', quantity: 60, value: 81000 }
                              ]}
                            ]
                          }
                        ].map((product, productIdx) => {
                          const productTotalValue = product.skus.reduce((sum, sku) =>
                            sum + sku.transactions.reduce((skuSum, txn) => skuSum + txn.value, 0), 0
                          );
                          const isProductExpanded = expandedProduct === product.productCode;

                          return (
                            <div key={productIdx} className="border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setExpandedProduct(isProductExpanded ? null : product.productCode)}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  <p className="font-bold text-gray-900 text-sm">{product.product}</p>
                                  {isProductExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{(productTotalValue / 100000).toFixed(2)}L</p>
                                </div>
                              </button>

                              {isProductExpanded && (
                                <div className="bg-gray-50 p-2 space-y-2">
                                  {product.skus.map((sku, skuIdx) => {
                                    const skuTotalValue = sku.transactions.reduce((sum, txn) => sum + txn.value, 0);
                                    const isSkuExpanded = expandedSku === sku.code;

                                    return (
                                      <div key={skuIdx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <button
                                          onClick={() => setExpandedSku(isSkuExpanded ? null : sku.code)}
                                          className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <p className="font-medium text-gray-900 text-sm">{sku.name}</p>
                                            {isSkuExpanded ? (
                                              <ChevronUp className="w-4 h-4 text-gray-600" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4 text-gray-600" />
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-gray-900">₹{(skuTotalValue / 100000).toFixed(2)}L</p>
                                          </div>
                                        </button>

                                        {isSkuExpanded && (
                                          <div className="bg-white p-3 space-y-2 border-t border-gray-200">
                                            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
                                              <div>Invoice Date</div>
                                              <div>Type</div>
                                              <div className="text-right">Quantity</div>
                                              <div className="text-right">Value</div>
                                            </div>
                                            {sku.transactions.map((txn, txnIdx) => (
                                              <div key={txnIdx} className="grid grid-cols-4 gap-2 text-xs">
                                                <div className="text-gray-700">{new Date(txn.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                                <div>
                                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    txn.type === 'Sale' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                  }`}>
                                                    {txn.type}
                                                  </span>
                                                </div>
                                                <div className={`text-right font-medium ${
                                                  txn.quantity > 0 ? 'text-gray-900' : 'text-red-600'
                                                }`}>
                                                  {txn.quantity > 0 ? '+' : ''}{txn.quantity}
                                                </div>
                                                <div className={`text-right font-semibold ${
                                                  txn.value > 0 ? 'text-gray-900' : 'text-red-600'
                                                }`}>
                                                  ₹{Math.abs(txn.value).toLocaleString()}
                                                </div>
                                              </div>
                                            ))}
                                            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200 text-xs font-bold">
                                              <div className="col-span-2">Total</div>
                                              <div className="text-right">{sku.transactions.reduce((sum, txn) => sum + txn.quantity, 0)}</div>
                                              <div className="text-right text-green-600">₹{skuTotalValue.toLocaleString()}</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-900">
                        {selectedMetric === 'opening' ? 'Opening stock as recorded at the beginning of the period.' :
                         selectedMetric === 'ytd' ? 'Year-to-date sales include all transactions from the beginning of the year.' :
                         selectedMetric === 'liquidation' ? 'Liquidation represents stock sold or moved out of inventory.' :
                         'Balance stock is calculated as: Opening + Purchases - Sales - Liquidation'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Verification Tab */}
                  <div className="space-y-4">
                    {/* Upload Section */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Upload Verification Proof</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setIsCapturing(true)}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Camera className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-xs font-semibold text-gray-700">Upload Pic</span>
                        </button>
                        <button
                          onClick={() => setIsCapturing(true)}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                          <Camera className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-xs font-semibold text-gray-700">E-sign</span>
                        </button>
                      </div>

                      <div className="text-center mb-3 py-2">
                        <button
                          onClick={() => setShowLetterPreview(!showLetterPreview)}
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors text-base underline"
                        >
                          <FileText className="w-5 h-5" />
                          <span>{showLetterPreview ? 'Hide Letter' : 'View Letter'}</span>
                        </button>
                      </div>

                      {showLetterPreview && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">Letter Preview</h4>
                            <button
                              onClick={() => {
                                const letterContent = `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
Gencrest Bio-Sciences Ltd.

Subject: Stock Verification Certificate

Dear Sir/Madam,

This is to certify that we have physically verified the stock at our premises done by ${user?.name || 'User'}, ${user?.role || 'N/A'} on ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}.

Distributor Details:
Name: ${selectedDistributorForMetric.name}
Code: ${selectedDistributorForMetric.code}
Location: ${selectedDistributorForMetric.address}

${selectedMetric === 'opening' ? 'Opening' : selectedMetric === 'ytd' ? 'YTD Sales' : selectedMetric === 'liquidation' ? 'Liquidation' : 'Balance'} Stock Details:
- Volume: ${selectedMetric === 'opening' ? selectedDistributorForMetric.openingStock.volume :
           selectedMetric === 'ytd' ? selectedDistributorForMetric.ytdNetSales.volume :
           selectedMetric === 'liquidation' ? selectedDistributorForMetric.liquidation.volume :
           selectedDistributorForMetric.balanceStock.volume} MT
- Total Value: ₹${selectedMetric === 'opening' ? selectedDistributorForMetric.openingStock.value :
                   selectedMetric === 'ytd' ? selectedDistributorForMetric.ytdNetSales.value :
                   selectedMetric === 'liquidation' ? selectedDistributorForMetric.liquidation.value :
                   selectedDistributorForMetric.balanceStock.value}L

We confirm that the above stock details are accurate and have been verified physically.

_______________________________
Dealer/Distributor Signature

Name: ${selectedDistributorForMetric.contactPerson || ''}
Stamp:


Visited and Liquidation done by:
Name: ${user?.name || 'User'}
Designation: ${user?.role || 'N/A'}
Date/Time: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;

                                const blob = new Blob([letterContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `verification-letter-${selectedDistributorForMetric.code}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                          <div className="bg-white border border-gray-300 rounded p-2 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
{`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

To,
Gencrest Bio-Sciences Ltd.

Subject: Stock Verification Certificate

Dear Sir/Madam,

This is to certify that we have physically verified the stock at our premises done by ${user?.name || 'User'}, ${user?.role || 'N/A'} on ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}.

Distributor Details:
Name: ${selectedDistributorForMetric.name}
Code: ${selectedDistributorForMetric.code}
Location: ${selectedDistributorForMetric.address}

${selectedMetric === 'opening' ? 'Opening' : selectedMetric === 'ytd' ? 'YTD Sales' : selectedMetric === 'liquidation' ? 'Liquidation' : 'Balance'} Stock Details:
- Volume: ${selectedMetric === 'opening' ? selectedDistributorForMetric.openingStock.volume :
           selectedMetric === 'ytd' ? selectedDistributorForMetric.ytdNetSales.volume :
           selectedMetric === 'liquidation' ? selectedDistributorForMetric.liquidation.volume :
           selectedDistributorForMetric.balanceStock.volume} MT
- Total Value: ₹${selectedMetric === 'opening' ? selectedDistributorForMetric.openingStock.value :
                   selectedMetric === 'ytd' ? selectedDistributorForMetric.ytdNetSales.value :
                   selectedMetric === 'liquidation' ? selectedDistributorForMetric.liquidation.value :
                   selectedDistributorForMetric.balanceStock.value}L

We confirm that the above stock details are accurate and have been verified physically.

_______________________________
Dealer/Distributor Signature

Name: ${selectedDistributorForMetric.contactPerson || ''}
Stamp:


Visited and Liquidation done by:
Name: ${user?.name || 'User'}
Designation: ${user?.role || 'N/A'}
Date/Time: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Download, print, add signature and stamp, then upload above.
                          </p>
                        </div>
                      )}

                      {uploadedProofs.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-900">Uploaded Proofs:</h5>
                          {uploadedProofs.map((proof) => (
                            <div key={proof.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-700">{proof.type}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setUploadedProofs(prev => prev.filter(p => p.id !== proof.id));
                                }}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location Status */}
                    {(() => {
                      const check = isWithinGeofence();
                      return (
                        <div className={`p-3 rounded-lg ${
                          check.valid
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2 flex-1 min-w-0">
                              <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${check.valid ? 'text-green-600' : 'text-red-600'}`} />
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold ${check.valid ? 'text-green-900' : 'text-red-900'}`}>
                                  {check.valid ? 'Location Verified' : 'Outside Geofence'}
                                </div>
                                <div className={`text-xs mt-0.5 break-words ${check.valid ? 'text-green-700' : 'text-red-700'}`}>
                                  {check.message}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {check.valid ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Submit Button */}
                    <button
                      onClick={() => {
                        const geofenceCheck = isWithinGeofence();

                        if (!geofenceCheck.valid) {
                          alert(`❌ Location Verification Failed\n\n${geofenceCheck.message}\n\nYou must be at the outlet location to submit proof.`);
                          return;
                        }

                        if (uploadedProofs.length === 0) {
                          alert('Please upload at least one proof');
                          return;
                        }
                        alert(`✓ Verification submitted successfully!\n\n${geofenceCheck.message}`);
                        setShowMetricModal(false);
                        setShowLetterPreview(false);
                        setUploadedProofs([]);
                      }}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Submit Verification
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced 360 View Modal */}
      {show360View && selected360Distributor && (
        <Entity360View
          entity={selected360Distributor}
          onClose={() => setShow360View(false)}
        />
      )}

      {/* Signature Capture Modal */}
      <SignatureCapture
        isOpen={showSignatureCapture}
        onClose={() => setShowSignatureCapture(false)}
        onSave={(signatureData) => {
          const newProof = {
            id: `esign_${Date.now()}`,
            type: 'esign',
            name: `E-Sign_${Date.now()}.jpg`,
            timestamp: new Date().toISOString(),
            signatureData: signatureData
          };
          setUploadedProofs(prev => [...prev, newProof]);
          setShowSignatureCapture(false);
        }}
        title="E-Signature Verification"
        outletName="Green Valley Outlet"
        entityName={selectedDistributorForVerify?.name || 'SRI RAMA SEEDS AND PESTICIDES'}
        entityCode="1325"
        entityType="Distributor"
      />

      {/* Batch Stock Update Modal */}
      <MobileBatchStockUpdate
        isOpen={showBatchStockUpdate}
        onClose={() => setShowBatchStockUpdate(false)}
        productData={MOCK_PRODUCTS}
        onSubmit={(updates) => {
          console.log('Batch stock updates:', updates);
          alert(`Successfully updated ${updates.length} SKU(s)!`);
          setShowBatchStockUpdate(false);
        }}
      />
    </div>
  );
};

export default MobileApp;