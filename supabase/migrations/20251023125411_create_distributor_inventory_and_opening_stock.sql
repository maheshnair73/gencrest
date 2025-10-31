/*
  # Create Distributor Inventory and Opening Stock Tables

  1. New Tables
    - `distributor_opening_stock`: Stores opening stock balance for distributors at financial year start
      - Distributor information (id, name, code)
      - Product and SKU details
      - Opening stock volume and value (as of April 1st)
      - Unit of measurement
      - Timestamps for tracking

    - `distributor_inventory`: Tracks current inventory levels for distributors
      - Real-time stock levels per SKU
      - Running totals (purchases, sales, liquidation)
      - Calculated balance stock
      - Last updated tracking

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read all records
    - Authenticated users can insert/update records
    - No delete operations allowed (audit trail preservation)

  3. Indexes
    - Optimize queries by distributor_id, product_code, and sku_code
    - Support date-based queries for opening stock
*/

-- Create distributor_opening_stock table
CREATE TABLE IF NOT EXISTS distributor_opening_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id text NOT NULL,
  distributor_name text NOT NULL,
  distributor_code text NOT NULL,
  product_code text NOT NULL,
  product_name text NOT NULL,
  sku_code text NOT NULL,
  sku_name text NOT NULL,
  opening_volume numeric(12, 2) DEFAULT 0 NOT NULL CHECK (opening_volume >= 0),
  opening_value numeric(14, 2) DEFAULT 0 NOT NULL CHECK (opening_value >= 0),
  unit text NOT NULL,
  as_of_date date DEFAULT '2025-04-01' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(distributor_id, product_code, sku_code, as_of_date)
);

-- Create distributor_inventory table
CREATE TABLE IF NOT EXISTS distributor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id text NOT NULL,
  distributor_name text NOT NULL,
  distributor_code text NOT NULL,
  product_code text NOT NULL,
  product_name text NOT NULL,
  sku_code text NOT NULL,
  sku_name text NOT NULL,
  opening_stock numeric(12, 2) DEFAULT 0 NOT NULL,
  ytd_purchases numeric(12, 2) DEFAULT 0 NOT NULL,
  ytd_sales numeric(12, 2) DEFAULT 0 NOT NULL,
  ytd_liquidation numeric(12, 2) DEFAULT 0 NOT NULL,
  balance_stock numeric(12, 2) DEFAULT 0 NOT NULL,
  unit text NOT NULL,
  opening_value numeric(14, 2) DEFAULT 0 NOT NULL,
  ytd_purchases_value numeric(14, 2) DEFAULT 0 NOT NULL,
  ytd_sales_value numeric(14, 2) DEFAULT 0 NOT NULL,
  balance_value numeric(14, 2) DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(distributor_id, product_code, sku_code)
);

-- Create indexes for distributor_opening_stock
CREATE INDEX IF NOT EXISTS idx_dist_opening_distributor ON distributor_opening_stock(distributor_id);
CREATE INDEX IF NOT EXISTS idx_dist_opening_product ON distributor_opening_stock(product_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_dist_opening_date ON distributor_opening_stock(as_of_date DESC);
CREATE INDEX IF NOT EXISTS idx_dist_opening_composite ON distributor_opening_stock(distributor_id, product_code, sku_code);

-- Create indexes for distributor_inventory
CREATE INDEX IF NOT EXISTS idx_dist_inventory_distributor ON distributor_inventory(distributor_id);
CREATE INDEX IF NOT EXISTS idx_dist_inventory_product ON distributor_inventory(product_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_dist_inventory_composite ON distributor_inventory(distributor_id, product_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_dist_inventory_updated ON distributor_inventory(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE distributor_opening_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distributor_opening_stock
CREATE POLICY "Authenticated users can read opening stock"
  ON distributor_opening_stock FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert opening stock"
  ON distributor_opening_stock FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update opening stock"
  ON distributor_opening_stock FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "No deletes on opening stock"
  ON distributor_opening_stock FOR DELETE TO authenticated USING (false);

-- RLS Policies for distributor_inventory
CREATE POLICY "Authenticated users can read distributor inventory"
  ON distributor_inventory FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert distributor inventory"
  ON distributor_inventory FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update distributor inventory"
  ON distributor_inventory FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "No deletes on distributor inventory"
  ON distributor_inventory FOR DELETE TO authenticated USING (false);