import { fetchWithAuth } from './apiService';

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  metrics: {
    label: string;
    value: string | number;
  }[];
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  charts?: {
    [key: string]: ChartDataPoint[];
  };
  team?: TeamMember[];
  activities?: Activity[];
  alerts?: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }[];
}

export const dashboardApiService = {
  async getDashboardData(role: string): Promise<{ success: boolean; data?: DashboardData; error?: any }> {
    try {
      const response = await fetchWithAuth(`/api/v1/dashboard?role=${role}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { success: false, error };
    }
  },

  async getMetrics(role: string, filters?: any): Promise<{ success: boolean; data?: DashboardMetric[]; error?: any }> {
    try {
      const params = new URLSearchParams({ role });
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.set(key, filters[key]);
        });
      }

      const response = await fetchWithAuth(`/api/v1/dashboard/metrics?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return { success: false, error };
    }
  },

  async getChartData(chartType: string, role: string, filters?: any): Promise<{ success: boolean; data?: ChartDataPoint[]; error?: any }> {
    try {
      const params = new URLSearchParams({ chartType, role });
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.set(key, filters[key]);
        });
      }

      const response = await fetchWithAuth(`/api/v1/dashboard/charts?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return { success: false, error };
    }
  },

  async getTeamPerformance(role: string): Promise<{ success: boolean; data?: TeamMember[]; error?: any }> {
    try {
      const response = await fetchWithAuth(`/api/v1/dashboard/team?role=${role}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team performance');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return { success: false, error };
    }
  },

  async getActivities(role: string, limit: number = 10): Promise<{ success: boolean; data?: Activity[]; error?: any }> {
    try {
      const response = await fetchWithAuth(`/api/v1/dashboard/activities?role=${role}&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, error };
    }
  },
};

export const reportsApiService = {
  async getReportData(
    reportType: 'customer' | 'distributor' | 'product',
    filters?: {
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      zone?: string;
      region?: string;
      territory?: string;
      status?: string;
      category?: string;
    },
    page: number = 1,
    limit: number = 50
  ): Promise<{ success: boolean; data?: any; pagination?: any; error?: any }> {
    try {
      const params = new URLSearchParams({
        type: reportType,
        page: String(page),
        limit: String(limit),
      });

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key as keyof typeof filters]) {
            params.set(key, filters[key as keyof typeof filters] as string);
          }
        });
      }

      const response = await fetchWithAuth(`/api/v1/reports?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      return { success: true, data: result.data, pagination: result.pagination };
    } catch (error) {
      console.error('Error fetching report data:', error);
      return { success: false, error };
    }
  },

  async getReportSummary(
    reportType: 'customer' | 'distributor' | 'product',
    filters?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const params = new URLSearchParams({ type: reportType });

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.set(key, filters[key]);
        });
      }

      const response = await fetchWithAuth(`/api/v1/reports/summary?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report summary');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching report summary:', error);
      return { success: false, error };
    }
  },

  async exportReport(
    reportType: 'customer' | 'distributor' | 'product',
    format: 'excel' | 'pdf' | 'csv',
    filters?: any
  ): Promise<{ success: boolean; data?: Blob; error?: any }> {
    try {
      const params = new URLSearchParams({ type: reportType, format });

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.set(key, filters[key]);
        });
      }

      const response = await fetchWithAuth(`/api/v1/reports/export?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, error };
    }
  },
};
