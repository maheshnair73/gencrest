// Data format required for Reports page

export interface OutletTransaction {
  id: string;
  outlet_id: string;
  outlet_code: string;
  outlet_name: string;
  owner_name: string;
  transaction_date: string;
  opening_stock: number;
  opening_stock_units?: number;
  purchases: number;
  sales: number;
  sales_units?: number;
  liquidation: number;
  liquidation_units?: number;
  balance_stock: number;
  balance_stock_units?: number;
  zone?: string;
  region?: string;
  territory?: string;
  state?: string;
  updated_at: string;
}

export interface MDOSummary {
  mdo_id: string;
  mdo_name: string;
  zone: string;
  region: string;
  territory: string;
  state?: string;
  opening_stock: number;
  ytd_sales: number;
  liquidation: number;
  balance_stock: number;
  outlet_count: number;
  updated_at: string;
  outlets: OutletTransaction[];
}

export interface ProductSKUData {
  product_code: string;
  product_name: string;
  sku_code: string;
  sku_name: string;
  opening_stock: number;
  opening_stock_units: number;
  ytd_sales: number;
  ytd_sales_units: number;
  balance_stock: number;
  balance_stock_units: number;
  unit: string;
  category?: string;
  zone?: string;
  region?: string;
  state?: string;
  territory?: string;
  customer_code?: string;
  customer_name?: string;
  customer_type?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

// API Response format expected
export interface ReportsAPIResponse {
  mdoData?: MDOSummary[];
  productData?: ProductSKUData[];
  lastUpdated?: string;
}

// Filter options format
export interface FilterOptions {
  zones?: string[];
  regions?: string[];
  states?: string[];
  territories?: string[];
  categories?: string[];
  products?: string[];
  outlets?: string[];
  distributors?: string[];
}
