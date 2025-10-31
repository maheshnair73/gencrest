/* eslint-disable @typescript-eslint/no-explicit-any */
// gencrest_ui/src/services/apiService.ts

import { supabase } from '../lib/supabase';

// const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://gencrestdev.effybiz.com';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
//export const apiBaseUrl="http://localhost:3000";

// This function will store the new token from the refresh call
function setNewAccessToken(token: string) {
  localStorage.setItem('authToken', token);
}

// This function will be called by AuthContext to log the user out
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  // This will force a reload to the login page
  window.location.href = '/';
}

// The new function to get a new token from the backend
// Assumes refreshToken is in an HttpOnly cookie
async function getNewToken(): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      // 'credentials: "include"' is vital for sending HttpOnly cookies
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.accessToken) {
      setNewAccessToken(data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Refresh token failed:', error);
    return false;
  }
}

// This is your new "fetch" wrapper
// It needs to track if a refresh is already in progress
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('authToken');

  // 1. Add the token to the header
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // ✅ Detect if body is FormData (for file uploads)
  const isFormData = options.body instanceof FormData;

  // ❌ Do NOT set Content-Type manually for FormData
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  options.headers = headers;
  // 2. Make the initial request
  let response = await fetch(`${apiBaseUrl}${url}`, options);

  // 3. Check for 401 Unauthorized
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // 4. Try to get a new token
        const gotNewToken = await getNewToken();

        if (gotNewToken) {
          // 5a. Refresh Success: update header and retry
          const newToken = localStorage.getItem('authToken');
          headers.set('Authorization', `Bearer ${newToken}`);
          options.headers = headers;
          processQueue(null, newToken); // Process queued requests
          response = await fetch(`${apiBaseUrl}${url}`, options); // Retry original request
        } else {
          // 5b. Refresh Fail: Logout
          processQueue(new Error('Session expired'), null);
          handleLogout();
        }
      } catch (e) {
        processQueue(e, null);
        handleLogout();
      } finally {
        isRefreshing = false;
      }
    } else {
      // A refresh is already in progress, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        // This will run after the refresh is complete
        const newToken = localStorage.getItem('authToken');
        headers.set('Authorization', `Bearer ${newToken}`);
        options.headers = headers;
        return fetch(`${apiBaseUrl}${url}`, options);
      });
    }
  }

  return response;
};

// --- Your existing API service functions, but using fetchWithAuth ---

export const liquidationApiService = {
  async getLiquidationOverview(type:string='') {
    try {
      // Use fetchWithAuth instead of fetch
      let url=`/api/v1/liquidation/overall-metrics`
      if(type){
        url+=`?type=${type}`
      }
      const response = await fetchWithAuth(url, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch liquidation overview');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching liquidation overview:', error);
      return { success: false, error };
    }
  },
  async getProducts(id: string) {
    try {
      // Use fetchWithAuth instead of fetch
      const response = await fetchWithAuth(`/api/v1/liquidation/products/${id}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch liquidation overview');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching liquidation overview:', error);
      return { success: false, error };
    }
  },

  async getProductTransactionsData(distributorId: string, productId: string, selectedMetric: string) {
    try {
      // API Integration: Fetching product data
      const response = await fetchWithAuth(`/api/v1/liquidation/products/${distributorId}/${productId}?type=${selectedMetric}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Error: getProductData failed', error);
      throw new Error('Could not fetch product data.');
    }
  },

  async getDistributorsPaginated(page: number, limit: number, filters: any = {}) {
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if(filters.search){
        params.set('search', filters.search);
      }
      if(filters.type){
        params.set('type', filters.type);
      }

      const response = await fetchWithAuth(`/api/v1/liquidation/distributors?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch distributors');
      }

      const data = await response.json();
      // The API response is { data: [...], pagination: {...} }
      return { success: true, data: data };
    } catch (error: any) {
      console.log('[API] Backend unavailable, will fallback to Supabase');
      return { success: false, error: { message: error.message } };
    }
  },

  async getRetailers() {
    try {
      // API Integration: Fetching product data
      const response = await fetchWithAuth(`/api/v1/retailer`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch retailers data');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Error: getProductData failed', error);
      throw new Error('Could not fetch product data.');
    }
  },

  async createRetailer(reqObj: {
    territory: string;
    zone: string;
    state: string;
    region: string;
    address: string;
    name: string;
    pincode: string
  }) {
    try {
      const response = await fetchWithAuth(`/api/v1/retailer`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
      });
      if (!response.ok) throw new Error('Failed to create retailer');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating retailer:', error);
      return { success: false, error };
    }
  },
  async uploadMedia(file: File) {
    try {
      // 1. Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file); // 'file' is a common key, check your backend's expectation

      const response = await fetchWithAuth(`/api/v1/liquidation/upload-proof`, {
        method: 'POST',
        // 2. Send FormData as the body.
        // DO NOT set Content-Type header manually, fetch does it.

        body: formData,
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload file');
      }

      const data = await response.json();

      // 3. Return a success object with the response data (e.g., { fileUrl: "..." })
      return { success: true, ...data }; // Assuming data is { url: "..." } or { fileUrl: "..." }

    } catch (error: any) {
      console.error('Error uploading media:', error);
      return { success: false, error: { message: error.message || 'Unknown upload error' } };
    }
  },

  async submitLiquidation(reqObj: any) {
    try {
      const response = await fetchWithAuth(`/api/v1/liquidation/add`, {
        method: 'POST',
        body: JSON.stringify(reqObj),
      });
      if (!response.ok) throw new Error('Failed to create liquidation');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating retailer:', error);
      return { success: false, error };
    }
  },

  async submitStockVerification(verificationData: any) {
    try {
      // Use fetchWithAuth instead of fetch
      const response = await fetchWithAuth(`/api/liquidation/verify-stock`, {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit verification');
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting stock verification:', error);
      return { success: false, error };
    }
  },

  async getDistributorStats(distributorCode: string) {
    try {
      console.log('apiService.getDistributorStats called for:', distributorCode);

      // Fetch distributor data from Supabase
      const { data: distributor, error: distError } = await supabase
        .from('distributors')
        .select('*')
        .eq('code', distributorCode)
        .maybeSingle();

      if (distError) {
        console.warn('Error fetching distributor, using mock data:', distError);
      }

      // Fetch inventory data for financial calculations
      const { data: inventory, error: invError } = await supabase
        .from('distributor_inventory')
        .select('*')
        .eq('distributor_id', distributorCode);

      if (invError) {
        console.error('Error fetching inventory:', invError);
      }

      // Calculate financials from inventory
      const financials = inventory?.reduce((acc, item) => {
        return {
          creditLimit: acc.creditLimit + (parseFloat(item.opening_value) || 0),
          totalPurchases: acc.totalPurchases + (parseFloat(item.ytd_sales_value) || 0),
          balanceCredit: acc.balanceCredit + (parseFloat(item.balance_value) || 0),
          totalPayments: acc.totalPayments + (parseFloat(item.ytd_sales_value) * 0.8 || 0),
          creditUtilization: acc.creditUtilization + (parseFloat(item.ytd_liquidation) || 0),
          liquidationProgress: 0
        };
      }, {
        creditLimit: 0,
        totalPurchases: 0,
        balanceCredit: 0,
        totalPayments: 0,
        creditUtilization: 0,
        liquidationProgress: 0
      }) || {
        creditLimit: 7.5,
        totalPurchases: 3.0,
        balanceCredit: 7.0,
        totalPayments: 2.3,
        creditUtilization: 6.7,
        liquidationProgress: 71
      };

      // Calculate liquidation percentage
      if (financials.creditLimit > 0) {
        financials.liquidationProgress = Math.round((financials.creditUtilization / financials.creditLimit) * 100);
      }

      const data = {
        "distributorCode": distributor?.code || distributorCode,
        "distributorName": distributor?.name || "Unknown Distributor",
        "status": distributor?.status || "Active",
        "territory": distributor?.territory || "N/A",
        "established": "2018",

        "financials": financials,

        "contact": {
          "person": distributor?.contact_person || "N/A",
          "phone": distributor?.phone || "N/A",
          "email": distributor?.email || "N/A",
          "address": distributor?.address || "N/A"
        },

        "businessDetails": {
          "gstNumber": "07AABCU9603R1ZX",
          "panNumber": "AABCU9603R",
          "assignedMDO": {
            "name": "Rajesh Kumar",
            "designation": "MDO"
          }
        },

        "ageing": {
          "days0_30": 0,
          "days31_60": 0,
          "days61_90": 0,
          "days91Plus": 305000
        },

        "orders": [
          {
            "id": "ORD-2024-001",
            "date": "2024-09-15",
            "products": "Pesticide Mix, Seed Pack A",
            "quantity": 500,
            "value": 45000,
            "status": "Delivered"
          },
          {
            "id": "ORD-2024-002",
            "date": "2024-08-22",
            "products": "Fertilizer Premium, Seed Pack B",
            "quantity": 750,
            "value": 68000,
            "status": "Delivered"
          }
        ],

        "visits": [
          {
            "title": "Product Demo",
            "description": "Product demonstration and stock review",
            "date": "2024-07-04",
            "time": "10:30 AM",
            "status": "Scheduled",
            "assignedTo": "Rajesh Kumar"
          },
          {
            "title": "Routine Check",
            "description": "Monthly stock verification and order collection",
            "date": "2024-06-10",
            "time": "3:00 PM",
            "status": "Completed",
            "completedBy": "Rajesh Kumar"
          }
        ],

        "liquidations": [
          {
            "id": "LIQ-2024-001",
            "date": "2024-10-05",
            "products": "Pesticide Mix",
            "quantity": 250,
            "value": 22500,
            "proofType": "E-Signature",
            "liquidatedBy": "Rajesh Kumar (MDO)",
            "liquidatedAt": "2024-10-05 14:30:00",
            "verifiedBy": "Priya Sharma",
            "verifiedDesignation": "TSM",
            "verifiedAt": "2024-10-05 16:45:00",
            "status": "Verified",
            "proofData": {
              "type": "esignature",
              "signatureImage": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop",
              "signerName": "Venkat Reddy",
              "signerDesignation": "Proprietor",
              "signerLocation": "Hyderabad, Telangana",
              "timestamp": "2024-10-05 14:30:00",
              "gencrestStaffName": "Rajesh Kumar",
              "gencrestStaffDesignation": "MDO"
            }
          },
          {
            "id": "LIQ-2024-002",
            "date": "2024-09-28",
            "products": "Seed Pack A, Fertilizer",
            "quantity": 400,
            "value": 38000,
            "proofType": "Photo + E-Signature",
            "liquidatedBy": "Rajesh Kumar (MDO)",
            "liquidatedAt": "2024-09-28 11:20:00",
            "verifiedBy": "Priya Sharma",
            "verifiedDesignation": "TSM",
            "verifiedAt": "2024-09-28 15:30:00",
            "status": "Verified",
            "proofData": {
              "type": "photo_esignature",
              "photos": [
                "https://images.pexels.com/photos/7489063/pexels-photo-7489063.jpeg?auto=compress&cs=tinysrgb&w=800",
                "https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800",
                "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800"
              ],
              "signatureImage": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop",
              "signerName": "Venkat Reddy",
              "signerDesignation": "Proprietor",
              "signerLocation": "Hyderabad, Telangana",
              "timestamp": "2024-09-28 11:20:00",
              "gencrestStaffName": "Rajesh Kumar",
              "gencrestStaffDesignation": "MDO"
            }
          }
        ],

        "activityTimeline": [
          {
            "type": "Visit",
            "title": "Product Demo",
            "description": "Product demonstration and stock review",
            "date": "2024-07-04",
            "time": "10:30 AM",
            "status": "Scheduled"
          },
          {
            "type": "Payment",
            "title": "Payment Received",
            "description": "₹50,000 received via NEFT",
            "date": "2024-06-28",
            "time": "2:15 PM",
            "status": "Completed"
          },
          {
            "type": "Order",
            "title": "Order Delivered",
            "description": "Order #ORD-2024-001 • 500 units",
            "date": "2024-06-15",
            "time": "11:00 AM",
            "status": "Completed"
          },
          {
            "type": "Liquidation",
            "title": "Liquidation Verified",
            "description": "LIQ-2024-001 • 250 units • E-Signature",
            "date": "2024-06-10",
            "time": "2:30 PM",
            "status": "Verified"
          }
        ]
      };
      console.log('apiService.getDistributorStats returning data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('API Error: getDistributorStats failed, returning mock data', error);

      // Return mock data as fallback
      const mockData = {
        "distributorCode": distributorCode,
        "distributorName": "Sample Distributor",
        "status": "Active",
        "territory": "Sample Territory",
        "established": "2018",
        "financials": {
          creditLimit: 7.5,
          totalPurchases: 3.0,
          balanceCredit: 7.0,
          totalPayments: 2.3,
          creditUtilization: 6.7,
          liquidationProgress: 71
        },
        "contact": {
          "person": "Sample Contact",
          "phone": "+91 98765 43210",
          "email": "sample@example.com",
          "address": "Sample Address"
        },
        "businessDetails": {
          "gstNumber": "07AABCU9603R1ZX",
          "panNumber": "AABCU9603R",
          "assignedMDO": {
            "name": "Rajesh Kumar",
            "designation": "MDO"
          }
        },
        "ageing": {
          "days0_30": 0,
          "days31_60": 0,
          "days61_90": 0,
          "days91Plus": 305000
        },
        "orders": [],
        "visits": [],
        "liquidations": [],
        "activityTimeline": []
      };

      return { success: true, data: mockData };
    }

  },
};
