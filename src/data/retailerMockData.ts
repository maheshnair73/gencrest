// Enhanced mock data specifically for retailer stock verification
// This provides comprehensive sample data when the database is empty

export interface RetailerInventoryItem {
  id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_business_name: string;
  retailer_location: string;
  distributor_id: string;
  distributor_name: string;
  product_code: string;
  product_name: string;
  sku_code: string;
  sku_name: string;
  current_stock: number;
  unit: string;
  last_received_date: string;
  last_received_quantity: number;
  total_received: number;
  total_sold: number;
  updated_at: string;
  latitude?: number;
  longitude?: number;
}

export interface VerificationHistoryItem {
  id: string;
  verification_date: string;
  skus_checked: any[];
  total_skus_count: number;
  verified_by_name: string;
  verified_by_role: string;
  proof_type: string;
}

export const MOCK_RETAILER_INVENTORY: RetailerInventoryItem[] = [
  // Retailer 1: Vasudha Swaraj Pvt Ltd
  {
    id: '1',
    retailer_id: 'RET001',
    retailer_name: 'Vasudha Swaraj Pvt Ltd',
    retailer_business_name: 'Vasudha Swaraj',
    retailer_location: 'Khandwa, Madhya Pradesh',
    distributor_id: 'DIST001',
    distributor_name: 'ABC Distributors',
    product_code: 'FGCMGM0093',
    product_name: 'Agrosatva',
    sku_code: 'AGR-1L',
    sku_name: 'Agrosatva 1 Ltr',
    current_stock: 8000,
    unit: '1 Ltr',
    last_received_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 10000,
    total_received: 15000,
    total_sold: 7000,
    updated_at: new Date().toISOString(),
    latitude: 22.1991,
    longitude: 76.3500
  },
  {
    id: '2',
    retailer_id: 'RET001',
    retailer_name: 'Vasudha Swaraj Pvt Ltd',
    retailer_business_name: 'Vasudha Swaraj',
    retailer_location: 'Khandwa, Madhya Pradesh',
    distributor_id: 'DIST001',
    distributor_name: 'ABC Distributors',
    product_code: 'FGINVAG0001',
    product_name: 'Agrosatva (Gran.)',
    sku_code: 'AGR-5KG',
    sku_name: 'Agrosatva Granules 5 Kg',
    current_stock: 1000,
    unit: '5 Kg',
    last_received_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 1500,
    total_received: 2000,
    total_sold: 1000,
    updated_at: new Date().toISOString(),
    latitude: 22.1991,
    longitude: 76.3500
  },
  {
    id: '3',
    retailer_id: 'RET001',
    retailer_name: 'Vasudha Swaraj Pvt Ltd',
    retailer_business_name: 'Vasudha Swaraj',
    retailer_location: 'Khandwa, Madhya Pradesh',
    distributor_id: 'DIST001',
    distributor_name: 'ABC Distributors',
    product_code: 'FGBIO001',
    product_name: 'BioGrow Plus',
    sku_code: 'BIO-500ML',
    sku_name: 'BioGrow Plus 500 ML',
    current_stock: 500,
    unit: '500 ML',
    last_received_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 800,
    total_received: 1200,
    total_sold: 700,
    updated_at: new Date().toISOString(),
    latitude: 22.1991,
    longitude: 76.3500
  },

  // Retailer 2: Green Valley Seeds
  {
    id: '4',
    retailer_id: 'RET002',
    retailer_name: 'Green Valley Seeds',
    retailer_business_name: 'Green Valley Seeds Pvt Ltd',
    retailer_location: 'Indore, Madhya Pradesh',
    distributor_id: 'DIST001',
    distributor_name: 'ABC Distributors',
    product_code: 'FGCMGM0093',
    product_name: 'Agrosatva',
    sku_code: 'AGR-1L',
    sku_name: 'Agrosatva 1 Ltr',
    current_stock: 5500,
    unit: '1 Ltr',
    last_received_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 7000,
    total_received: 12000,
    total_sold: 6500,
    updated_at: new Date().toISOString(),
    latitude: 22.7196,
    longitude: 75.8577
  },
  {
    id: '5',
    retailer_id: 'RET002',
    retailer_name: 'Green Valley Seeds',
    retailer_business_name: 'Green Valley Seeds Pvt Ltd',
    retailer_location: 'Indore, Madhya Pradesh',
    distributor_id: 'DIST002',
    distributor_name: 'XYZ Distributors',
    product_code: 'FGFERT001',
    product_name: 'Premium Fertilizer',
    sku_code: 'FERT-25KG',
    sku_name: 'Premium Fertilizer 25 Kg',
    current_stock: 2000,
    unit: '25 Kg',
    last_received_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 2500,
    total_received: 4000,
    total_sold: 2000,
    updated_at: new Date().toISOString(),
    latitude: 22.7196,
    longitude: 75.8577
  },

  // Retailer 3: Krishi Kendra
  {
    id: '6',
    retailer_id: 'RET003',
    retailer_name: 'Krishi Kendra',
    retailer_business_name: 'Krishi Kendra Store',
    retailer_location: 'Ujjain, Madhya Pradesh',
    distributor_id: 'DIST002',
    distributor_name: 'XYZ Distributors',
    product_code: 'FGCMGM0093',
    product_name: 'Agrosatva',
    sku_code: 'AGR-1L',
    sku_name: 'Agrosatva 1 Ltr',
    current_stock: 3200,
    unit: '1 Ltr',
    last_received_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 4000,
    total_received: 8000,
    total_sold: 4800,
    updated_at: new Date().toISOString(),
    latitude: 23.1765,
    longitude: 75.7885
  },
  {
    id: '7',
    retailer_id: 'RET003',
    retailer_name: 'Krishi Kendra',
    retailer_business_name: 'Krishi Kendra Store',
    retailer_location: 'Ujjain, Madhya Pradesh',
    distributor_id: 'DIST002',
    distributor_name: 'XYZ Distributors',
    product_code: 'FGBIO001',
    product_name: 'BioGrow Plus',
    sku_code: 'BIO-500ML',
    sku_name: 'BioGrow Plus 500 ML',
    current_stock: 300,
    unit: '500 ML',
    last_received_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 500,
    total_received: 900,
    total_sold: 600,
    updated_at: new Date().toISOString(),
    latitude: 23.1765,
    longitude: 75.7885
  },

  // Retailer 4: Farmer's Choice
  {
    id: '8',
    retailer_id: 'RET004',
    retailer_name: 'Farmer\'s Choice',
    retailer_business_name: 'Farmer\'s Choice Agro',
    retailer_location: 'Dewas, Madhya Pradesh',
    distributor_id: 'DIST003',
    distributor_name: 'PQR Distributors',
    product_code: 'FGCMGM0093',
    product_name: 'Agrosatva',
    sku_code: 'AGR-1L',
    sku_name: 'Agrosatva 1 Ltr',
    current_stock: 6800,
    unit: '1 Ltr',
    last_received_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 8000,
    total_received: 14000,
    total_sold: 7200,
    updated_at: new Date().toISOString(),
    latitude: 22.9676,
    longitude: 76.0534
  },
  {
    id: '9',
    retailer_id: 'RET004',
    retailer_name: 'Farmer\'s Choice',
    retailer_business_name: 'Farmer\'s Choice Agro',
    retailer_location: 'Dewas, Madhya Pradesh',
    distributor_id: 'DIST003',
    distributor_name: 'PQR Distributors',
    product_code: 'FGINVAG0001',
    product_name: 'Agrosatva (Gran.)',
    sku_code: 'AGR-5KG',
    sku_name: 'Agrosatva Granules 5 Kg',
    current_stock: 900,
    unit: '5 Kg',
    last_received_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 1200,
    total_received: 2100,
    total_sold: 1200,
    updated_at: new Date().toISOString(),
    latitude: 22.9676,
    longitude: 76.0534
  },

  // Retailer 5: Agro Solutions
  {
    id: '10',
    retailer_id: 'RET005',
    retailer_name: 'Agro Solutions',
    retailer_business_name: 'Agro Solutions Ltd',
    retailer_location: 'Bhopal, Madhya Pradesh',
    distributor_id: 'DIST003',
    distributor_name: 'PQR Distributors',
    product_code: 'FGCMGM0093',
    product_name: 'Agrosatva',
    sku_code: 'AGR-1L',
    sku_name: 'Agrosatva 1 Ltr',
    current_stock: 4500,
    unit: '1 Ltr',
    last_received_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_received_quantity: 6000,
    total_received: 11000,
    total_sold: 6500,
    updated_at: new Date().toISOString(),
    latitude: 23.2599,
    longitude: 77.4126
  }
];

export const MOCK_VERIFICATION_HISTORY: VerificationHistoryItem[] = [
  {
    id: 'VH001',
    verification_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    skus_checked: [{ sku_name: 'Agrosatva 1 Ltr', sku_code: 'AGR-1L', verified_stock: 8500 }],
    total_skus_count: 1,
    verified_by_name: 'Rajesh Kumar',
    verified_by_role: 'MDO',
    proof_type: 'E-Signature'
  },
  {
    id: 'VH002',
    verification_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    skus_checked: [{ sku_name: 'Agrosatva Granules 5 Kg', sku_code: 'AGR-5KG', verified_stock: 1200 }],
    total_skus_count: 1,
    verified_by_name: 'Priya Sharma',
    verified_by_role: 'TSM',
    proof_type: 'Photo + E-Signature'
  },
  {
    id: 'VH003',
    verification_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    skus_checked: [{ sku_name: 'Agrosatva 1 Ltr', sku_code: 'AGR-1L', verified_stock: 6000 }],
    total_skus_count: 1,
    verified_by_name: 'Amit Patel',
    verified_by_role: 'SO',
    proof_type: 'E-Signature'
  },
  {
    id: 'VH004',
    verification_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    skus_checked: [{ sku_name: 'BioGrow Plus 500 ML', sku_code: 'BIO-500ML', verified_stock: 400 }],
    total_skus_count: 1,
    verified_by_name: 'Rajesh Kumar',
    verified_by_role: 'MDO',
    proof_type: 'Photo'
  },
  {
    id: 'VH005',
    verification_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    skus_checked: [{ sku_name: 'Agrosatva 1 Ltr', sku_code: 'AGR-1L', verified_stock: 7200 }],
    total_skus_count: 1,
    verified_by_name: 'Sneha Reddy',
    verified_by_role: 'TSM',
    proof_type: 'E-Signature'
  }
];

// Helper function to get verification history for a specific retailer
export const getVerificationHistoryForRetailer = (retailerId: string): VerificationHistoryItem[] => {
  // In a real implementation, this would filter by retailer_id
  // For now, return all history as sample data
  return MOCK_VERIFICATION_HISTORY;
};

// Helper function to get inventory for a specific retailer
export const getInventoryForRetailer = (retailerId: string): RetailerInventoryItem[] => {
  return MOCK_RETAILER_INVENTORY.filter(item => item.retailer_id === retailerId);
};

// Helper function to get all unique retailers
export const getAllRetailers = () => {
  const uniqueRetailers = new Map();
  
  MOCK_RETAILER_INVENTORY.forEach(item => {
    if (!uniqueRetailers.has(item.retailer_id)) {
      uniqueRetailers.set(item.retailer_id, {
        retailer_id: item.retailer_id,
        retailer_name: item.retailer_name,
        retailer_business_name: item.retailer_business_name,
        retailer_location: item.retailer_location,
        latitude: item.latitude,
        longitude: item.longitude
      });
    }
  });
  
  return Array.from(uniqueRetailers.values());
};