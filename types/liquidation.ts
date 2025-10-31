export interface SKUData {
  skuCode: string;
  skuName: string;
  unit: string;
  openingStock: number;
  ytdSales: number;
  liquidated: number;
  currentStock: number;
  unitPrice: number;
}

export interface TransactionData {
  date: string;
  type: 'Sale' | 'Return';
  quantity: number;
  value: number;
}

export interface ProductData {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  skus: SKUData[];
}

export interface ProofData {
  id: string;
  type: 'photo' | 'document' | 'signature';
  name: string;
  url: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata: {
    capturedAt: string;
    deviceInfo: string;
    capturedBy: string;
    fileSize?: number;
    fileType?: string;
  };
}

export interface StockMovement {
  type: 'farmer' | 'retailer' | 'return';
  quantity: number;
  retailerName?: string;
  remarks?: string;
}

export interface RetailerData {
  name: string;
  businessName: string;
  location: string;
  quantity?: number;
}

export interface AllocationWarningData {
  stockDecrease: number;
  totalAllocated: number;
  missing: number;
  unit: string;
}
