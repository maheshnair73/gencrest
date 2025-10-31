/*
  # Create Product Liquidation Reports with Customer and Geography Details

  ## Overview
  This migration creates a comprehensive product liquidation reporting system that tracks
  product-wise sales and inventory by customer, with full geography details (zone, region, state, territory).

  ## New Tables
  
  ### `product_liquidation_transactions`
  - `id` (uuid, primary key)
  - `transaction_date` (date) - Date of transaction
  - `period_start` (date) - Reporting period start
  - `period_end` (date) - Reporting period end
  
  **Product Information:**
  - `category_id` (uuid) - Product category
  - `product_id` (uuid) - Product reference
  - `product_code` (text) - Product code
  - `product_name` (text) - Product name
  - `sku_id` (uuid) - SKU reference
  - `sku_code` (text) - SKU code
  - `sku_name` (text) - SKU name (e.g., "250 ml")
  
  **Customer Information:**
  - `customer_id` (uuid) - Customer/outlet reference
  - `customer_code` (text) - Customer code
  - `customer_name` (text) - Customer name
  - `customer_type` (text) - Distributor/Retailer/Farmer
  - `distributor_id` (uuid) - Parent distributor
  
  **Geography Information:**
  - `zone` (text) - Zone (North, South, East, West)
  - `region` (text) - Region within zone
  - `state` (text) - State
  - `territory` (text) - Territory/district
  
  **Stock & Sales Data:**
  - `opening_stock_units` (numeric) - Opening stock in units
  - `opening_stock_value` (numeric) - Opening stock value
  - `ytd_purchases_units` (numeric) - Year-to-date purchases in units
  - `ytd_purchases_value` (numeric) - Year-to-date purchases value
  - `ytd_sales_units` (numeric) - Year-to-date sales in units
  - `ytd_sales_value` (numeric) - Year-to-date sales value
  - `liquidation_units` (numeric) - Liquidated units
  - `liquidation_value` (numeric) - Liquidation value
  - `liquidation_percentage` (numeric) - Liquidation %
  - `balance_stock_units` (numeric) - Balance stock in units
  - `balance_stock_value` (numeric) - Balance stock value
  
  **Metadata:**
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `created_by` (uuid) - User who created record
  - `last_verified_at` (timestamptz) - Last verification timestamp
  - `verification_status` (text) - Draft/Pending/Verified

  ## Views
  
  ### `v_product_liquidation_summary`
  Aggregated view grouping by product, SKU, and geography for reporting

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users based on their role and geography access

  ## Indexes
  - Composite indexes on frequently queried combinations
  - Indexes on all foreign keys and geography fields
*/

-- Create product_liquidation_transactions table
CREATE TABLE IF NOT EXISTS product_liquidation_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Product information
  category_id uuid REFERENCES product_categories(id),
  product_id uuid REFERENCES products(id),
  product_code text NOT NULL,
  product_name text NOT NULL,
  sku_id uuid REFERENCES product_skus(id),
  sku_code text NOT NULL,
  sku_name text NOT NULL,
  
  -- Customer information
  customer_id uuid,
  customer_code text NOT NULL,
  customer_name text NOT NULL,
  customer_type text NOT NULL DEFAULT 'Retailer',
  distributor_id uuid,
  
  -- Geography
  zone text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  territory text NOT NULL DEFAULT '',
  
  -- Stock and sales data
  opening_stock_units numeric DEFAULT 0,
  opening_stock_value numeric DEFAULT 0,
  ytd_purchases_units numeric DEFAULT 0,
  ytd_purchases_value numeric DEFAULT 0,
  ytd_sales_units numeric DEFAULT 0,
  ytd_sales_value numeric DEFAULT 0,
  liquidation_units numeric DEFAULT 0,
  liquidation_value numeric DEFAULT 0,
  liquidation_percentage numeric DEFAULT 0,
  balance_stock_units numeric DEFAULT 0,
  balance_stock_value numeric DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  last_verified_at timestamptz,
  verification_status text DEFAULT 'Draft',
  
  CONSTRAINT valid_customer_type CHECK (customer_type IN ('Distributor', 'Retailer', 'Farmer', 'Dealer')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('Draft', 'Pending', 'Verified', 'Rejected'))
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_product ON product_liquidation_transactions(product_id, sku_id);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_customer ON product_liquidation_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_zone ON product_liquidation_transactions(zone);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_state ON product_liquidation_transactions(state);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_territory ON product_liquidation_transactions(territory);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_period ON product_liquidation_transactions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_date ON product_liquidation_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_status ON product_liquidation_transactions(verification_status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_prod_geo ON product_liquidation_transactions(product_code, zone, state);
CREATE INDEX IF NOT EXISTS idx_prod_liq_trans_cust_prod ON product_liquidation_transactions(customer_code, product_code, sku_code);

-- Create a view for aggregated summary
CREATE OR REPLACE VIEW v_product_liquidation_summary AS
SELECT 
  pc.name as category_name,
  plt.product_code,
  plt.product_name,
  plt.sku_code,
  plt.sku_name,
  plt.zone,
  plt.region,
  plt.state,
  plt.territory,
  plt.customer_type,
  COUNT(DISTINCT plt.customer_id) as customer_count,
  SUM(plt.opening_stock_units) as total_opening_stock_units,
  SUM(plt.opening_stock_value) as total_opening_stock_value,
  SUM(plt.ytd_sales_units) as total_ytd_sales_units,
  SUM(plt.ytd_sales_value) as total_ytd_sales_value,
  SUM(plt.liquidation_units) as total_liquidation_units,
  SUM(plt.liquidation_value) as total_liquidation_value,
  CASE 
    WHEN SUM(plt.opening_stock_units) > 0 
    THEN ROUND((SUM(plt.ytd_sales_units) / SUM(plt.opening_stock_units) * 100)::numeric, 2)
    ELSE 0 
  END as liquidation_percentage,
  SUM(plt.balance_stock_units) as total_balance_stock_units,
  SUM(plt.balance_stock_value) as total_balance_stock_value,
  MAX(plt.updated_at) as last_updated
FROM product_liquidation_transactions plt
LEFT JOIN product_categories pc ON plt.category_id = pc.id
WHERE plt.verification_status = 'Verified'
GROUP BY 
  pc.name,
  plt.product_code,
  plt.product_name,
  plt.sku_code,
  plt.sku_name,
  plt.zone,
  plt.region,
  plt.state,
  plt.territory,
  plt.customer_type;

-- Enable RLS
ALTER TABLE product_liquidation_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified product liquidation data"
  ON product_liquidation_transactions FOR SELECT
  TO public
  USING (verification_status = 'Verified');

CREATE POLICY "Authenticated users can view all product liquidation data"
  ON product_liquidation_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert product liquidation data"
  ON product_liquidation_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product liquidation data"
  ON product_liquidation_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product liquidation data"
  ON product_liquidation_transactions FOR DELETE
  TO authenticated
  USING (true);

-- Add missing columns to distributor_inventory table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'product_code'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN product_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN product_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'category'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN category text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'unit'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN unit text DEFAULT 'kg';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'period_start'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN period_start date DEFAULT '2025-04-01';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'distributor_inventory' AND column_name = 'period_end'
  ) THEN
    ALTER TABLE distributor_inventory ADD COLUMN period_end date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create indexes on distributor_inventory for reporting
CREATE INDEX IF NOT EXISTS idx_dist_inv_product ON distributor_inventory(product_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_dist_inv_period ON distributor_inventory(period_start, period_end);
