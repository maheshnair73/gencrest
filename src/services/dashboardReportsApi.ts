interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const apiCache = new APICache();

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
}

interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  summary?: any;
}

export interface DashboardMetrics {
  totalLiquidation: {
    value: number;
    label: string;
    currency: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      percentage: number;
    };
  };
  ytdSales: {
    value: number;
    label: string;
    currency: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      percentage: number;
    };
  };
  balanceStock: {
    value: number;
    label: string;
    unit: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      percentage: number;
    };
  };
  activeMDOs: {
    value: number;
    label: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      percentage: number;
    };
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
  liquidationPercentage: number;
  visitsCompleted: number;
  visitsTarget: number;
  territory: string;
  region: string;
  zone: string;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'verified' | 'completed' | 'pending' | 'failed';
  user?: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: any;
}

export interface PendingApprovals {
  count: number;
  breakdown: {
    travelClaims: number;
    activityReimbursements: number;
    workPlans: number;
    stockTransfers: number;
  };
}

export interface DistributorReport {
  id: string;
  name: string;
  code: string;
  location: string;
  territory: string;
  region: string;
  zone: string;
  state: string;
  openingStock: {
    value: number;
    volume: number;
    unit: string;
  };
  ytdSales: {
    value: number;
    volume: number;
    unit: string;
  };
  liquidation: {
    value: number;
    volume: number;
    unit: string;
    percentage: number;
  };
  balanceStock: {
    value: number;
    volume: number;
    unit: string;
  };
  outstandingAmount: number;
  overdueAmount: number;
  status: string;
  lastUpdated: string;
}

export interface ProductReport {
  id: string;
  name: string;
  code: string;
  category: string;
  packSize: string;
  openingStock: {
    value: number;
    volume: number;
    unit: string;
  };
  ytdSales: {
    value: number;
    volume: number;
    unit: string;
  };
  liquidation: {
    value: number;
    volume: number;
    unit: string;
    percentage: number;
  };
  balanceStock: {
    value: number;
    volume: number;
    unit: string;
  };
  averagePrice: number;
  distributionCoverage: {
    totalDistributors: number;
    activeDistributors: number;
  };
}

export interface CustomerReport {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  territory: string;
  region: string;
  zone: string;
  state: string;
  pincode: string;
  contact: {
    phone: string;
    email: string;
  };
  purchases: {
    ytdValue: number;
    ytdVolume: number;
    unit: string;
    frequency: string;
  };
  outstandingAmount: number;
  creditLimit: number;
  lastVisit: string;
  status: string;
  geoTagged: boolean;
}

interface ReportFilters {
  search?: string;
  zone?: string;
  region?: string;
  state?: string;
  territory?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = true,
  cacheTTL?: number
): Promise<APIResponse<T>> {
  const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

  if (useCache) {
    const cached = apiCache.get<APIResponse<T>>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`
      }));

      return {
        success: false,
        error: {
          code: errorData.code || 'HTTP_ERROR',
          message: errorData.message || `Request failed with status ${response.status}`,
          details: errorData.details
        }
      };
    }

    const result = await response.json();

    if (useCache && result.success) {
      apiCache.set(cacheKey, result, cacheTTL);
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
        details: error
      }
    };
  }
}

export const dashboardReportsApi = {
  cache: apiCache,

  dashboard: {
    async getMetrics(): Promise<APIResponse<DashboardMetrics>> {
      return fetchAPI<DashboardMetrics>('/api/dashboard/metrics');
    },

    async getTeamPerformance(filters?: {
      userId?: string;
      role?: string;
      limit?: number;
    }): Promise<PaginatedResponse<TeamMember>> {
      const params = new URLSearchParams();
      if (filters?.userId) params.set('userId', filters.userId);
      if (filters?.role) params.set('role', filters.role);
      if (filters?.limit) params.set('limit', String(filters.limit));

      const endpoint = `/api/dashboard/team-performance${params.toString() ? '?' + params.toString() : ''}`;
      return fetchAPI<TeamMember[]>(endpoint);
    },

    async getRecentActivities(filters?: {
      limit?: number;
      type?: string;
      userId?: string;
    }): Promise<PaginatedResponse<Activity>> {
      const params = new URLSearchParams();
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.type) params.set('type', filters.type);
      if (filters?.userId) params.set('userId', filters.userId);

      const endpoint = `/api/dashboard/recent-activities${params.toString() ? '?' + params.toString() : ''}`;
      return fetchAPI<Activity[]>(endpoint, {}, true, 2 * 60 * 1000);
    },

    async getPendingApprovals(): Promise<APIResponse<PendingApprovals>> {
      return fetchAPI<PendingApprovals>('/api/dashboard/pending-approvals', {}, true, 1 * 60 * 1000);
    }
  },

  reports: {
    async getDistributors(
      filters?: ReportFilters,
      page: number = 1,
      pageSize: number = 10
    ): Promise<PaginatedResponse<DistributorReport>> {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      return fetchAPI<DistributorReport[]>(`/api/reports/distributors?${params.toString()}`);
    },

    async getProducts(
      filters?: ReportFilters & { productId?: string },
      page: number = 1,
      pageSize: number = 10
    ): Promise<PaginatedResponse<ProductReport>> {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      return fetchAPI<ProductReport[]>(`/api/reports/products?${params.toString()}`);
    },

    async getCustomers(
      filters?: ReportFilters & { type?: string },
      page: number = 1,
      pageSize: number = 10
    ): Promise<PaginatedResponse<CustomerReport>> {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      return fetchAPI<CustomerReport[]>(`/api/reports/customers?${params.toString()}`);
    },

    async exportReport(
      type: 'distributors' | 'products' | 'customers',
      format: 'excel' | 'pdf' | 'csv',
      filters?: ReportFilters
    ): Promise<Blob | null> {
      const params = new URLSearchParams({
        type,
        format
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      try {
        const response = await fetch(`/api/reports/export?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Export failed with status ${response.status}`);
        }
        return await response.blob();
      } catch (error) {
        console.error('Export error:', error);
        return null;
      }
    }
  },

  clearCache() {
    apiCache.clear();
  }
};
