/**
 * Centralized Mock Data
 *
 * This file contains all mock data used throughout the application.
 * Each data set is structured to match the expected API response format.
 *
 * To replace with real APIs:
 * 1. Create corresponding API service functions in src/services/
 * 2. Replace data imports with API calls
 * 3. Handle loading states and errors appropriately
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MockDistributor {
  id: string;
  name: string;
  code: string;
  product: string;
  territory: string;
  region: string;
  zone: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';
  businessType: string;

  // Contact Info
  phone: string;
  email: string;
  address: string;

  // Financial Metrics (value in Lakhs INR, volume in Kg)
  openingStock: { value: number; volume: number };
  ytdNetSales: { value: number; volume: number };
  liquidation: { value: number; volume: number };
  balanceStock: { value: number; volume: number };

  // Location
  latitude?: number;
  longitude?: number;
}

export interface MockRetailer {
  id: string;
  name: string;
  code: string;
  distributorId: string;
  distributorName: string;
  territory: string;
  region: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';

  // Contact Info
  phone: string;
  email: string;
  address: string;

  // Financial Metrics (value in Lakhs INR, volume in Kg)
  openingStock: { value: number; volume: number };
  ytdNetSales: { value: number; volume: number };
  liquidation: { value: number; volume: number };
  balanceStock: { value: number; volume: number };

  // Location
  latitude?: number;
  longitude?: number;
}

export interface MockTransaction {
  invoiceDate: string;
  type: 'Sale' | 'Return';
  quantity: number;
  value: number;
}

export interface MockSKU {
  name: string;
  code: string;
  unit: string;
  openingStock: number;
  currentStock: number;
  transactions: MockTransaction[];
}

export interface MockProduct {
  productName: string;
  productCode: string;
  category: string;
  skus: MockSKU[];
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedBy: string;
  category: string;
}

export interface MockVisit {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'distributor' | 'retailer';
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  purpose: string;
  notes: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface MockReport {
  id: string;
  title: string;
  date: string;
  status: 'Generated' | 'Pending';
  type: string;
}

export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  territory: string;
  phone: string;
  email: string;
  status: 'Available' | 'On Field' | 'Offline';
  avatar?: string;
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  distributorId: string;
  distributorName: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Delivered';
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface MockMeeting {
  id: string;
  title: string;
  entityName: string;
  time: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  type: 'distributor' | 'retailer';
}

export interface LiveMeeting {
  id: string;
  participantName: string;
  participantRole: string;
  location: string;
  address: string;
  startTime: string;
  duration: number;
  status: 'active' | 'paused' | 'ended';
  type: 'Visit' | 'Call' | 'Meeting';
  phone: string;
  notes: string;
}

export interface DashboardStats {
  todayVisits: { planned: number; completed: number; pending: number };
  monthlyTarget: { target: number; achieved: number; percentage: number };
  ytdPerformance: number;
  pendingApprovals: number;
}

// ============================================================================
// LIQUIDATION INTERFACES
// ============================================================================

export interface LiquidationMetrics {
  openingStock: { volume: number; value: number };
  ytdNetSales: { volume: number; value: number };
  liquidation: { volume: number; value: number };
  balanceStock: { volume: number; value: number };
  liquidationPercentage: number;
  lastUpdated: string;
}

export interface DistributorLiquidation {
  id: string;
  distributorName: string;
  distributorCode: string;
  metrics: LiquidationMetrics;
  territory: string;
  region: string;
  zone: string;
  state: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Medium' | 'Low';
}

export interface ProductSKU {
  skuCode: string;
  skuName: string;
  unit: string;
  openingStock: number;
  ytdSales: number;
  liquidated: number;
  currentStock: number;
  unitPrice: number;
}

export interface ProductData {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  skus: ProductSKU[];
}

// ============================================================================
// DISTRIBUTORS DATA
// ============================================================================

export const MOCK_DISTRIBUTORS: MockDistributor[] = [
  {
    id: 'dist-001',
    name: 'Green Valley Distributors',
    code: 'GVD001',
    product: 'DAP',
    territory: 'North Delhi',
    region: 'NCR',
    zone: 'North',
    status: 'Active',
    priority: 'High',
    businessType: 'Wholesale',
    phone: '+91 98765 43210',
    email: 'contact@greenvalley.com',
    address: '123 Main Street, Green Valley, Delhi - 110001',
    openingStock: { value: 45.2, volume: 8500 },
    ytdNetSales: { value: 128.5, volume: 24600 },
    liquidation: { value: 68, volume: 13000 },
    balanceStock: { value: 32.7, volume: 6100 },
    latitude: 28.5355,
    longitude: 77.3910
  },
  {
    id: 'dist-002',
    name: 'Sunrise Agro Solutions',
    code: 'SAS002',
    product: 'NPK',
    territory: 'South Delhi',
    region: 'NCR',
    zone: 'North',
    status: 'Active',
    priority: 'Medium',
    businessType: 'Retail & Wholesale',
    phone: '+91 98765 43211',
    email: 'info@sunriseagro.com',
    address: '456 Park Road, Sunrise Colony, Delhi - 110002',
    openingStock: { value: 38.5, volume: 7400 },
    ytdNetSales: { value: 95.3, volume: 18200 },
    liquidation: { value: 72, volume: 13800 },
    balanceStock: { value: 28.2, volume: 5400 },
    latitude: 28.5245,
    longitude: 77.2066
  },
  {
    id: 'dist-003',
    name: 'Prime Fertilizers Ltd',
    code: 'PFL003',
    product: 'Urea',
    territory: 'West Delhi',
    region: 'NCR',
    zone: 'North',
    status: 'Active',
    priority: 'High',
    businessType: 'Wholesale',
    phone: '+91 98765 43212',
    email: 'sales@primefert.com',
    address: '789 Industrial Area, West Delhi - 110003',
    openingStock: { value: 52.8, volume: 10100 },
    ytdNetSales: { value: 145.2, volume: 27800 },
    liquidation: { value: 65, volume: 12400 },
    balanceStock: { value: 35.6, volume: 6800 },
    latitude: 28.6139,
    longitude: 77.2090
  }
];

// ============================================================================
// RETAILERS DATA
// ============================================================================

export const MOCK_RETAILERS: MockRetailer[] = [
  {
    id: 'ret-001',
    name: 'Farmers Choice Outlet',
    code: 'FCO001',
    distributorId: 'dist-001',
    distributorName: 'Green Valley Distributors',
    territory: 'North Delhi',
    region: 'NCR',
    status: 'Active',
    priority: 'High',
    phone: '+91 98765 43220',
    email: 'farmerschoice@email.com',
    address: '12 Market Street, North Delhi - 110001',
    openingStock: { value: 8.5, volume: 1600 },
    ytdNetSales: { value: 24.3, volume: 4650 },
    liquidation: { value: 75, volume: 1430 },
    balanceStock: { value: 6.2, volume: 1200 },
    latitude: 28.5355,
    longitude: 77.3910
  },
  {
    id: 'ret-002',
    name: 'Agri-Pro Store',
    code: 'APS002',
    distributorId: 'dist-001',
    distributorName: 'Green Valley Distributors',
    territory: 'North Delhi',
    region: 'NCR',
    status: 'Active',
    priority: 'Medium',
    phone: '+91 98765 43221',
    email: 'agripro@email.com',
    address: '34 Village Road, North Delhi - 110001',
    openingStock: { value: 6.2, volume: 1180 },
    ytdNetSales: { value: 18.5, volume: 3540 },
    liquidation: { value: 70, volume: 1340 },
    balanceStock: { value: 4.7, volume: 900 },
    latitude: 28.5400,
    longitude: 77.3950
  }
];

// ============================================================================
// PRODUCTS & SKU DATA
// ============================================================================

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    productName: 'DAP (Di-Ammonium Phosphate)',
    productCode: 'DAP',
    category: 'Fertilizer',
    skus: [
      {
        name: 'DAP 25kg Bag',
        code: 'DAP-25KG',
        unit: 'Kg',
        openingStock: 2500,
        currentStock: 1850,
        transactions: [
          { invoiceDate: '2024-12-15', type: 'Sale', quantity: 50, value: 67500 },
          { invoiceDate: '2024-12-10', type: 'Sale', quantity: 80, value: 108000 },
          { invoiceDate: '2024-12-05', type: 'Return', quantity: 10, value: -13500 },
          { invoiceDate: '2024-12-01', type: 'Sale', quantity: 120, value: 162000 }
        ]
      },
      {
        name: 'DAP 50kg Bag',
        code: 'DAP-50KG',
        unit: 'Kg',
        openingStock: 5000,
        currentStock: 3200,
        transactions: [
          { invoiceDate: '2024-12-18', type: 'Sale', quantity: 100, value: 270000 },
          { invoiceDate: '2024-12-12', type: 'Sale', quantity: 150, value: 405000 },
          { invoiceDate: '2024-12-08', type: 'Sale', quantity: 80, value: 216000 }
        ]
      }
    ]
  },
  {
    productName: 'NPK (Nitrogen Phosphorus Potassium)',
    productCode: 'NPK',
    category: 'Fertilizer',
    skus: [
      {
        name: 'NPK 12:32:16 - 25kg',
        code: 'NPK-12-32-16-25KG',
        unit: 'Kg',
        openingStock: 1800,
        currentStock: 1200,
        transactions: [
          { invoiceDate: '2024-12-14', type: 'Sale', quantity: 60, value: 108000 },
          { invoiceDate: '2024-12-09', type: 'Sale', quantity: 90, value: 162000 }
        ]
      },
      {
        name: 'NPK 12:32:16 - 50kg',
        code: 'NPK-12-32-16-50KG',
        unit: 'Kg',
        openingStock: 3500,
        currentStock: 2400,
        transactions: [
          { invoiceDate: '2024-12-16', type: 'Sale', quantity: 120, value: 432000 },
          { invoiceDate: '2024-12-11', type: 'Sale', quantity: 80, value: 288000 }
        ]
      }
    ]
  },
  {
    productName: 'Urea',
    productCode: 'UREA',
    category: 'Fertilizer',
    skus: [
      {
        name: 'Urea 45kg Bag',
        code: 'UREA-45KG',
        unit: 'Kg',
        openingStock: 4000,
        currentStock: 2800,
        transactions: [
          { invoiceDate: '2024-12-17', type: 'Sale', quantity: 150, value: 202500 },
          { invoiceDate: '2024-12-13', type: 'Sale', quantity: 100, value: 135000 },
          { invoiceDate: '2024-12-07', type: 'Sale', quantity: 200, value: 270000 }
        ]
      }
    ]
  }
];

// ============================================================================
// TASKS DATA
// ============================================================================

export const MOCK_TASKS: MockTask[] = [
  {
    id: 'task-001',
    title: 'Follow up with Green Valley Distributors',
    description: 'Discuss pending payment and new order placement',
    priority: 'High',
    status: 'pending',
    dueDate: '2024-01-25',
    assignedBy: 'Regional Manager',
    category: 'Follow-up'
  },
  {
    id: 'task-002',
    title: 'Visit Sunrise Agro for stock verification',
    description: 'Verify stock levels and update system',
    priority: 'Medium',
    status: 'in-progress',
    dueDate: '2024-01-23',
    assignedBy: 'Territory Manager',
    category: 'Visit'
  },
  {
    id: 'task-003',
    title: 'Submit weekly sales report',
    description: 'Compile and submit sales data for the week',
    priority: 'High',
    status: 'pending',
    dueDate: '2024-01-22',
    assignedBy: 'Sales Manager',
    category: 'Report'
  },
  {
    id: 'task-004',
    title: 'Complete training module',
    description: 'Finish product knowledge training',
    priority: 'Low',
    status: 'completed',
    dueDate: '2024-01-20',
    assignedBy: 'HR Manager',
    category: 'Training'
  }
];

// ============================================================================
// VISITS DATA
// ============================================================================

export const MOCK_VISITS: MockVisit[] = [
  {
    id: 'visit-001',
    entityId: 'dist-001',
    entityName: 'Green Valley Distributors',
    entityType: 'distributor',
    date: '2024-01-22',
    checkInTime: '10:30 AM',
    checkOutTime: '11:45 AM',
    duration: 75,
    purpose: 'Stock verification and order discussion',
    notes: 'Verified stock levels. Discussed new product launch. Received order for 500 bags.',
    status: 'completed'
  },
  {
    id: 'visit-002',
    entityId: 'ret-001',
    entityName: 'Farmers Choice Outlet',
    entityType: 'retailer',
    date: '2024-01-22',
    checkInTime: '02:15 PM',
    purpose: 'Routine check and feedback collection',
    notes: 'In progress...',
    status: 'in-progress'
  },
  {
    id: 'visit-003',
    entityId: 'dist-002',
    entityName: 'Sunrise Agro Solutions',
    entityType: 'distributor',
    date: '2024-01-23',
    checkInTime: '09:00 AM',
    purpose: 'Payment follow-up and new orders',
    notes: '',
    status: 'scheduled'
  }
];

// ============================================================================
// REPORTS DATA
// ============================================================================

export const MOCK_REPORTS: MockReport[] = [
  {
    id: 'report-001',
    title: 'Daily Activity Report',
    date: '2024-01-20',
    status: 'Generated',
    type: 'Activity'
  },
  {
    id: 'report-002',
    title: 'Weekly Performance Report',
    date: '2024-01-19',
    status: 'Pending',
    type: 'Performance'
  },
  {
    id: 'report-003',
    title: 'Monthly Liquidation Report',
    date: '2024-01-18',
    status: 'Generated',
    type: 'Liquidation'
  }
];

// ============================================================================
// TEAM MEMBERS DATA
// ============================================================================

export const MOCK_TEAM_MEMBERS: MockTeamMember[] = [
  {
    id: 'team-001',
    name: 'Rajesh Kumar',
    role: 'Territory Sales Manager',
    territory: 'North Delhi',
    phone: '+91 98765 43230',
    email: 'rajesh.kumar@company.com',
    status: 'On Field'
  },
  {
    id: 'team-002',
    name: 'Priya Sharma',
    role: 'Territory Sales Manager',
    territory: 'South Delhi',
    phone: '+91 98765 43231',
    email: 'priya.sharma@company.com',
    status: 'Available'
  },
  {
    id: 'team-003',
    name: 'Amit Patel',
    role: 'Regional Manager',
    territory: 'NCR Region',
    phone: '+91 98765 43232',
    email: 'amit.patel@company.com',
    status: 'Available'
  },
  {
    id: 'team-004',
    name: 'Sneha Reddy',
    role: 'Territory Sales Manager',
    territory: 'West Delhi',
    phone: '+91 98765 43233',
    email: 'sneha.reddy@company.com',
    status: 'Offline'
  }
];

// ============================================================================
// ORDERS DATA
// ============================================================================

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'ORD-2024-001',
    distributorId: 'dist-001',
    distributorName: 'Green Valley Distributors',
    date: '2024-01-20',
    amount: 450000,
    status: 'Approved',
    items: [
      { productCode: 'DAP-25KG', productName: 'DAP 25kg Bag', quantity: 200, price: 1350 },
      { productCode: 'NPK-12-32-16-50KG', productName: 'NPK 12:32:16 - 50kg', quantity: 100, price: 1800 }
    ]
  },
  {
    id: 'order-002',
    orderNumber: 'ORD-2024-002',
    distributorId: 'dist-002',
    distributorName: 'Sunrise Agro Solutions',
    date: '2024-01-21',
    amount: 320000,
    status: 'Pending',
    items: [
      { productCode: 'UREA-45KG', productName: 'Urea 45kg Bag', quantity: 150, price: 1350 },
      { productCode: 'DAP-50KG', productName: 'DAP 50kg Bag', quantity: 80, price: 2700 }
    ]
  },
  {
    id: 'order-003',
    orderNumber: 'ORD-2024-003',
    distributorId: 'dist-003',
    distributorName: 'Prime Fertilizers Ltd',
    date: '2024-01-22',
    amount: 580000,
    status: 'Dispatched',
    items: [
      { productCode: 'DAP-50KG', productName: 'DAP 50kg Bag', quantity: 150, price: 2700 },
      { productCode: 'UREA-45KG', productName: 'Urea 45kg Bag', quantity: 100, price: 1350 }
    ]
  }
];

// ============================================================================
// MEETINGS DATA
// ============================================================================

export const MOCK_MEETINGS: MockMeeting[] = [
  {
    id: 'meeting-001',
    title: 'Product Discussion',
    entityName: 'Green Valley Distributors',
    time: '10:00 AM',
    status: 'in-progress',
    type: 'distributor'
  },
  {
    id: 'meeting-002',
    title: 'Stock Review',
    entityName: 'Sunrise Agro Solutions',
    time: '02:00 PM',
    status: 'upcoming',
    type: 'distributor'
  },
  {
    id: 'meeting-003',
    title: 'Payment Follow-up',
    entityName: 'Prime Fertilizers Ltd',
    time: '04:30 PM',
    status: 'upcoming',
    type: 'distributor'
  }
];

// ============================================================================
// WORK PLAN DATA
// ============================================================================

export interface MockWorkPlanDay {
  date: string;
  day: string;
  visits: number;
  target: number;
  completed: boolean;
}

export const MOCK_WORK_PLAN: MockWorkPlanDay[] = [
  { date: '20', day: 'Mon', visits: 5, target: 5, completed: true },
  { date: '21', day: 'Tue', visits: 4, target: 4, completed: true },
  { date: '22', day: 'Wed', visits: 3, target: 6, completed: false },
  { date: '23', day: 'Thu', visits: 0, target: 5, completed: false },
  { date: '24', day: 'Fri', visits: 0, target: 4, completed: false },
  { date: '25', day: 'Sat', visits: 0, target: 3, completed: false },
  { date: '26', day: 'Sun', visits: 0, target: 0, completed: false }
];

// ============================================================================
// GEOLOCATION DATA
// ============================================================================

export const MOCK_GEOFENCE_CONFIG = {
  radius: 1000, // meters
  defaultLocation: {
    latitude: 28.5355,
    longitude: 77.3910,
    name: 'Green Valley Outlet'
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR API REPLACEMENT
// ============================================================================

/**
 * Simulate API delay
 */
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get distributor by ID
 */
export const getMockDistributorById = (id: string): MockDistributor | undefined => {
  return MOCK_DISTRIBUTORS.find(d => d.id === id);
};

/**
 * Get retailer by ID
 */
export const getMockRetailerById = (id: string): MockRetailer | undefined => {
  return MOCK_RETAILERS.find(r => r.id === id);
};

/**
 * Get products for a distributor
 */
export const getMockProductsForDistributor = (distributorId: string): MockProduct[] => {
  // In a real API, this would filter based on distributor
  return MOCK_PRODUCTS;
};

/**
 * Get tasks for a user
 */
export const getMockTasksForUser = (userId: string, status?: string): MockTask[] => {
  if (status) {
    return MOCK_TASKS.filter(t => t.status === status);
  }
  return MOCK_TASKS;
};

/**
 * Get visits for a date range
 */
export const getMockVisitsForDateRange = (startDate: string, endDate: string): MockVisit[] => {
  return MOCK_VISITS;
};

/**
 * Get orders for a distributor
 */
export const getMockOrdersForDistributor = (distributorId: string): MockOrder[] => {
  return MOCK_ORDERS.filter(o => o.distributorId === distributorId);
};

// ============================================================================
// LIQUIDATION DATA
// ============================================================================

export const MOCK_OVERALL_LIQUIDATION_METRICS: LiquidationMetrics = {
  openingStock: { volume: 211820, value: 1036.66 },
  ytdNetSales: { volume: 145844, value: 693.06 },
  liquidation: { volume: 115942, value: 594.90 },
  balanceStock: { volume: 122860, value: 628.92 },
  liquidationPercentage: 65,
  lastUpdated: new Date().toISOString()
};

export const MOCK_DISTRIBUTOR_LIQUIDATION: DistributorLiquidation[] = [
  {
    id: 'DIST001',
    distributorName: 'Sri Lakshmi Seeds',
    distributorCode: 'AP001',
    territory: 'Anantapur City',
    region: 'Rayalaseema',
    zone: 'ANDHRA PRADESH',
    state: 'Andhra Pradesh',
    status: 'Active',
    priority: 'High',
    metrics: {
      openingStock: { volume: 18500, value: 92.50 },
      ytdNetSales: { volume: 12800, value: 64.20 },
      liquidation: { volume: 10240, value: 52.80 },
      balanceStock: { volume: 9520, value: 48.90 },
      liquidationPercentage: 68,
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: 'DIST002',
    distributorName: 'Venkat Agro Traders',
    distributorCode: 'AP002',
    territory: 'Anantapur Rural',
    region: 'Rayalaseema',
    zone: 'ANDHRA PRADESH',
    state: 'Andhra Pradesh',
    status: 'Active',
    priority: 'High',
    metrics: {
      openingStock: { volume: 16200, value: 81.00 },
      ytdNetSales: { volume: 11400, value: 57.00 },
      liquidation: { volume: 9120, value: 46.80 },
      balanceStock: { volume: 8280, value: 42.60 },
      liquidationPercentage: 66,
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: 'DIST003',
    distributorName: 'Rama Krishna Seeds',
    distributorCode: 'AP003',
    territory: 'Kadapa City',
    region: 'Rayalaseema',
    zone: 'ANDHRA PRADESH',
    state: 'Andhra Pradesh',
    status: 'Active',
    priority: 'Medium',
    metrics: {
      openingStock: { volume: 14800, value: 74.00 },
      ytdNetSales: { volume: 9600, value: 48.00 },
      liquidation: { volume: 7200, value: 37.20 },
      balanceStock: { volume: 6840, value: 35.28 },
      liquidationPercentage: 59,
      lastUpdated: new Date().toISOString()
    }
  }
];

export const MOCK_PRODUCT_DATA: ProductData[] = [
  {
    productId: 'PROD001',
    productCode: 'DAP',
    productName: 'DAP (Di-Ammonium Phosphate)',
    category: 'Fertilizer',
    skus: [
      {
        skuCode: 'DAP-50KG',
        skuName: 'DAP 50 Kg',
        unit: 'Kg',
        openingStock: 45000,
        ytdSales: 28000,
        liquidated: 22400,
        currentStock: 23600,
        unitPrice: 5.2
      },
      {
        skuCode: 'DAP-25KG',
        skuName: 'DAP 25 Kg',
        unit: 'Kg',
        openingStock: 22000,
        ytdSales: 15000,
        liquidated: 12000,
        currentStock: 11000,
        unitPrice: 5.4
      }
    ]
  },
  {
    productId: 'PROD002',
    productCode: 'MOP',
    productName: 'MOP (Muriate of Potash)',
    category: 'Fertilizer',
    skus: [
      {
        skuCode: 'MOP-50KG',
        skuName: 'MOP 50 Kg',
        unit: 'Kg',
        openingStock: 38000,
        ytdSales: 24000,
        liquidated: 19200,
        currentStock: 19800,
        unitPrice: 4.8
      }
    ]
  }
];

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export const MOCK_LIVE_MEETINGS: LiveMeeting[] = [
  {
    id: 'LM001',
    participantName: 'Ram Kumar',
    participantRole: 'Farmer',
    location: 'Ram Kumar Farm',
    address: 'Green Valley, Sector 12',
    startTime: '09:30 AM',
    duration: 30,
    status: 'active',
    type: 'Visit',
    phone: '+91 98765 43210',
    notes: 'Product demo and feedback collection'
  },
  {
    id: 'LM002',
    participantName: 'Sita Devi',
    participantRole: 'Retailer',
    location: 'Sita Agro Store',
    address: 'Main Market, Village Road',
    startTime: '11:00 AM',
    duration: 45,
    status: 'active',
    type: 'Meeting',
    phone: '+91 98765 43211',
    notes: 'Order discussion and payment follow-up'
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  todayVisits: { planned: 5, completed: 2, pending: 3 },
  monthlyTarget: { target: 100, achieved: 68, percentage: 68 },
  ytdPerformance: 78,
  pendingApprovals: 2
};

// ============================================================================
// API REPLACEMENT GUIDE
// ============================================================================

/**
 * TO REPLACE WITH REAL APIs:
 *
 * 1. Create API service file (e.g., src/services/distributorService.ts)
 *
 * Example:
 * ```typescript
 * import { supabase } from '../lib/supabase';
 *
 * export const fetchDistributors = async () => {
 *   const { data, error } = await supabase
 *     .from('distributors')
 *     .select('*')
 *     .eq('status', 'Active');
 *
 *   if (error) throw error;
 *   return data;
 * };
 * ```
 *
 * 2. Replace imports in components:
 *
 * Before:
 * ```typescript
 * import { MOCK_DISTRIBUTORS } from '../data/mockData';
 * const distributors = MOCK_DISTRIBUTORS;
 * ```
 *
 * After:
 * ```typescript
 * import { fetchDistributors } from '../services/distributorService';
 * const [distributors, setDistributors] = useState([]);
 * const [loading, setLoading] = useState(true);
 *
 * useEffect(() => {
 *   const loadData = async () => {
 *     try {
 *       setLoading(true);
 *       const data = await fetchDistributors();
 *       setDistributors(data);
 *     } catch (error) {
 *       console.error('Error loading distributors:', error);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   loadData();
 * }, []);
 * ```
 *
 * 3. Add loading and error states to UI
 * 4. Handle empty states appropriately
 */
