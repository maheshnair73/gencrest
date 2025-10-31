import {
  DashboardMetrics,
  TeamMember,
  Activity,
  PendingApprovals,
  DistributorReport,
  ProductReport,
  CustomerReport
} from '../services/dashboardReportsApi';

export const mockDashboardMetrics: DashboardMetrics = {
  totalLiquidation: {
    value: 5000000000,
    label: 'Total Liquidation',
    currency: 'INR',
    trend: {
      direction: 'up',
      percentage: 1
    }
  },
  ytdSales: {
    value: 18000000000,
    label: 'YTD Sales',
    currency: 'INR',
    trend: {
      direction: 'up',
      percentage: 2
    }
  },
  balanceStock: {
    value: 600000,
    label: 'Balance Stock',
    unit: 'Units',
    trend: {
      direction: 'down',
      percentage: 0
    }
  },
  activeMDOs: {
    value: 471,
    label: 'Active MDOs',
    trend: {
      direction: 'neutral',
      percentage: 0
    }
  }
};

export const mockTeamPerformance: TeamMember[] = [
  {
    id: 'user_001',
    name: 'Rajesh Kumar',
    role: 'TSM',
    avatar: null,
    liquidationPercentage: 85,
    visitsCompleted: 60,
    visitsTarget: 70,
    territory: 'North Delhi',
    region: 'Delhi NCR',
    zone: 'North Zone'
  },
  {
    id: 'user_002',
    name: 'Priya Sharma',
    role: 'TSM',
    avatar: null,
    liquidationPercentage: 92,
    visitsCompleted: 68,
    visitsTarget: 70,
    territory: 'South Delhi',
    region: 'Delhi NCR',
    zone: 'North Zone'
  },
  {
    id: 'user_003',
    name: 'Amit Singh',
    role: 'MDO',
    avatar: null,
    liquidationPercentage: 78,
    visitsCompleted: 110,
    visitsTarget: 120,
    territory: 'East Delhi',
    region: 'Delhi NCR',
    zone: 'North Zone'
  }
];

export const mockRecentActivities: Activity[] = [
  {
    id: 'activity_001',
    type: 'liquidation_done',
    title: 'Liquidation Done',
    description: 'LIQ-2024-001 by Rajesh Kumar',
    timestamp: '2025-10-29T13:12:00Z',
    status: 'pending',
    user: {
      id: 'user_001',
      name: 'Rajesh Kumar',
      role: 'TSM'
    },
    metadata: {
      liquidationId: 'LIQ-2024-001',
      amount: 150000,
      retailer: 'Agro Enterprises',
      location: 'Connaught Place, New Delhi',
      products: 'NPK 12-32-16 (1000 Kg), Urea (750 Kg)'
    }
  },
  {
    id: 'activity_002',
    type: 'visit_completed',
    title: 'Visit Completed',
    description: 'Visit to Agrosatva Traders',
    timestamp: '2025-10-29T12:17:00Z',
    status: 'completed',
    user: {
      id: 'user_003',
      name: 'Amit Singh',
      role: 'MDO'
    },
    metadata: {
      outletName: 'Agrosatva Traders',
      location: 'South Delhi',
      visitDuration: 45
    }
  }
];

export const mockPendingApprovals: PendingApprovals = {
  count: 10,
  breakdown: {
    travelClaims: 3,
    activityReimbursements: 2,
    workPlans: 2,
    stockTransfers: 1,
    stockVerifications: 2
  }
};

export const mockDistributorReports: DistributorReport[] = Array.from({ length: 125 }, (_, i) => ({
  id: `dist_${String(i + 1).padStart(3, '0')}`,
  name: `Distributor ${i + 1}`,
  code: `DIS-${String(i + 1).padStart(3, '0')}`,
  location: `Location ${i + 1}`,
  territory: ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'][i % 4],
  region: 'Delhi NCR',
  zone: 'North Zone',
  state: 'Delhi',
  openingStock: {
    value: 150000 + (i * 1000),
    volume: 25 + i,
    unit: 'Kg/Ltr'
  },
  ytdSales: {
    value: 1200000 + (i * 10000),
    volume: 200 + (i * 2),
    unit: 'Kg/Ltr'
  },
  liquidation: {
    value: 180000 + (i * 1500),
    volume: 30 + i,
    unit: 'Kg/Ltr',
    percentage: 80 + (i % 20)
  },
  balanceStock: {
    value: 20000 + (i * 500),
    volume: 5 + (i % 10),
    unit: 'Kg/Ltr'
  },
  outstandingAmount: 50000 + (i * 1000),
  overdueAmount: 10000 + (i * 200),
  status: i % 10 === 0 ? 'inactive' : 'active',
  lastUpdated: new Date(Date.now() - i * 86400000).toISOString()
}));

export const mockProductReports: ProductReport[] = Array.from({ length: 45 }, (_, i) => ({
  id: `prod_${String(i + 1).padStart(3, '0')}`,
  name: `Product ${i + 1}`,
  code: `PROD-${String(i + 1).padStart(3, '0')}`,
  category: ['Fertilizer', 'Pesticide', 'Seeds', 'Tools'][i % 4],
  packSize: ['1 Ltr', '500 ml', '10 Kg', '5 Kg'][i % 4],
  openingStock: {
    value: 500000 + (i * 10000),
    volume: 500 + (i * 10),
    unit: 'Units'
  },
  ytdSales: {
    value: 4000000 + (i * 50000),
    volume: 4000 + (i * 50),
    unit: 'Units'
  },
  liquidation: {
    value: 600000 + (i * 15000),
    volume: 600 + (i * 15),
    unit: 'Units',
    percentage: 85 + (i % 15)
  },
  balanceStock: {
    value: 100000 + (i * 2000),
    volume: 100 + (i * 2),
    unit: 'Units'
  },
  averagePrice: 1000 + (i * 50),
  distributionCoverage: {
    totalDistributors: 50,
    activeDistributors: 45 - (i % 5)
  }
}));

export const mockCustomerReports: CustomerReport[] = Array.from({ length: 850 }, (_, i) => ({
  id: `cust_${String(i + 1).padStart(4, '0')}`,
  name: `Customer ${i + 1}`,
  code: `CUS-${String(i + 1).padStart(4, '0')}`,
  type: i % 3 === 0 ? 'distributor' : 'retailer',
  location: `Location ${i + 1}`,
  territory: ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'][i % 4],
  region: 'Delhi NCR',
  zone: 'North Zone',
  state: 'Delhi',
  pincode: `1100${String(i % 99).padStart(2, '0')}`,
  contact: {
    phone: `+91 ${90000 + i}`,
    email: `customer${i + 1}@example.com`
  },
  purchases: {
    ytdValue: 500000 + (i * 5000),
    ytdVolume: 50 + (i % 100),
    unit: 'Kg/Ltr',
    frequency: ['weekly', 'monthly', 'quarterly'][i % 3]
  },
  outstandingAmount: 25000 + (i * 500),
  creditLimit: 100000,
  lastVisit: new Date(Date.now() - (i % 30) * 86400000).toISOString(),
  status: i % 15 === 0 ? 'inactive' : 'active',
  geoTagged: i % 2 === 0
}));
