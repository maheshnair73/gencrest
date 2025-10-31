import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not configured');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
};

export interface StockTransferData {
  transferType: 'distributor_to_retailer' | 'distributor_to_farmer' | 'retailer_return' | 'retailer_to_farmer';
  fromEntityType: 'distributor' | 'retailer';
  fromEntityId: string;
  fromEntityName: string;
  toEntityType: 'retailer' | 'farmer' | 'distributor';
  toEntityId: string;
  toEntityName: string;
  toEntityBusinessName?: string;
  toEntityLocation?: string;
  productCode: string;
  productName: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  latitude?: number;
  longitude?: number;
  recordedBy: string;
  notes?: string;
}

export interface RetailerInventoryData {
  retailerId: string;
  retailerName: string;
  retailerBusinessName: string;
  retailerLocation: string;
  distributorId?: string;
  distributorName?: string;
  productCode: string;
  productName: string;
  skuCode: string;
  skuName: string;
  unit: string;
}

export const stockTransferService = {
  async recordStockTransfer(transfer: StockTransferData) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const totalValue = transfer.quantity * transfer.unitPrice;

      const { data, error } = await supabase
        .from('stock_transfers')
        .insert({
          transfer_type: transfer.transferType,
          from_entity_type: transfer.fromEntityType,
          from_entity_id: transfer.fromEntityId,
          from_entity_name: transfer.fromEntityName,
          to_entity_type: transfer.toEntityType,
          to_entity_id: transfer.toEntityId,
          to_entity_name: transfer.toEntityName,
          to_entity_business_name: transfer.toEntityBusinessName,
          to_entity_location: transfer.toEntityLocation,
          product_code: transfer.productCode,
          product_name: transfer.productName,
          sku_code: transfer.skuCode,
          sku_name: transfer.skuName,
          quantity: transfer.quantity,
          unit: transfer.unit,
          unit_price: transfer.unitPrice,
          total_value: totalValue,
          latitude: transfer.latitude,
          longitude: transfer.longitude,
          recorded_by: transfer.recordedBy,
          notes: transfer.notes
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error recording stock transfer:', error);
      return { success: false, error };
    }
  },

  async updateRetailerInventory(
    inventoryData: RetailerInventoryData,
    quantityReceived: number
  ) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const retailerKey = `${inventoryData.retailerId}_${inventoryData.productCode}_${inventoryData.skuCode}`;

      const { data: existing, error: fetchError } = await supabase
        .from('retailer_inventory')
        .select('*')
        .eq('retailer_id', inventoryData.retailerId)
        .eq('product_code', inventoryData.productCode)
        .eq('sku_code', inventoryData.skuCode)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const { data, error } = await supabase
          .from('retailer_inventory')
          .update({
            current_stock: existing.current_stock + quantityReceived,
            total_received: existing.total_received + quantityReceived,
            last_received_date: new Date().toISOString(),
            last_received_quantity: quantityReceived,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data, isNew: false };
      } else {
        const { data, error } = await supabase
          .from('retailer_inventory')
          .insert({
            retailer_id: inventoryData.retailerId,
            retailer_name: inventoryData.retailerName,
            retailer_business_name: inventoryData.retailerBusinessName,
            retailer_location: inventoryData.retailerLocation,
            distributor_id: inventoryData.distributorId,
            distributor_name: inventoryData.distributorName,
            product_code: inventoryData.productCode,
            product_name: inventoryData.productName,
            sku_code: inventoryData.skuCode,
            sku_name: inventoryData.skuName,
            current_stock: quantityReceived,
            unit: inventoryData.unit,
            last_received_date: new Date().toISOString(),
            last_received_quantity: quantityReceived,
            total_received: quantityReceived,
            total_sold: 0
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data, isNew: true };
      }
    } catch (error) {
      console.error('Error updating retailer inventory:', error);
      return { success: false, error };
    }
  },

  async recordRetailerToFarmerSale(
    retailerId: string,
    productCode: string,
    skuCode: string,
    quantitySold: number
  ) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data: inventory, error: fetchError } = await supabase
        .from('retailer_inventory')
        .select('*')
        .eq('retailer_id', retailerId)
        .eq('product_code', productCode)
        .eq('sku_code', skuCode)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!inventory) {
        return { success: false, error: 'Inventory record not found' };
      }

      const newStock = inventory.current_stock - quantitySold;
      if (newStock < 0) {
        return { success: false, error: 'Insufficient stock' };
      }

      const { data, error } = await supabase
        .from('retailer_inventory')
        .update({
          current_stock: newStock,
          total_sold: inventory.total_sold + quantitySold,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventory.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error recording retailer sale:', error);
      return { success: false, error };
    }
  },

  async getRetailerInventory(retailerId: string) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('retailer_inventory')
        .select('*')
        .eq('retailer_id', retailerId)
        .order('product_name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching retailer inventory:', error);
      return { success: false, error };
    }
  },

  async getStockTransferHistory(entityId: string, entityType: 'from' | 'to' | 'both' = 'both') {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      let query = supabase
        .from('stock_transfers')
        .select('*')
        .order('transfer_date', { ascending: false });

      if (entityType === 'from') {
        query = query.eq('from_entity_id', entityId);
      } else if (entityType === 'to') {
        query = query.eq('to_entity_id', entityId);
      } else {
        query = query.or(`from_entity_id.eq.${entityId},to_entity_id.eq.${entityId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching stock transfer history:', error);
      return { success: false, error };
    }
  },

  async getDistributorToRetailerTransfers(distributorId: string) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('stock_transfers')
        .select('*')
        .eq('from_entity_id', distributorId)
        .eq('transfer_type', 'distributor_to_retailer')
        .order('transfer_date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching distributor transfers:', error);
      return { success: false, error };
    }
  },

  async getRetailerReceivedStock(retailerId: string) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('stock_transfers')
        .select('*')
        .eq('to_entity_id', retailerId)
        .eq('to_entity_type', 'retailer')
        .order('transfer_date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching retailer received stock:', error);
      return { success: false, error };
    }
  }
};
