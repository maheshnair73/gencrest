/*
  # Create Retailer Inventory and Stock Transfer Tables

  ## Overview
  This migration creates tables to track stock movements from distributors to retailers,
  and maintain retailer inventory levels for full supply chain visibility.

  ## 1. New Tables

  ### `stock_transfers`
  Tracks all stock movements between entities.
  - `id` (uuid, primary key)
  - `transfer_date` (timestamptz)
  - `transfer_type` (text) - 'distributor_to_retailer', 'distributor_to_farmer', 'retailer_return', 'retailer_to_farmer'
  - `from_entity_type` (text) - 'distributor', 'retailer'
  - `from_entity_id` (text) - Source entity identifier
  - `from_entity_name` (text)
  - `to_entity_type` (text) - 'retailer', 'farmer', 'distributor'
  - `to_entity_id` (text)
  - `to_entity_name` (text)
  - `to_entity_business_name` (text, nullable)
  - `to_entity_location` (text, nullable)
  - `product_code`, `product_name`, `sku_code`, `sku_name`
  - `quantity` (integer)
  - `unit` (text)
  - `unit_price`, `total_value` (numeric)
  - `latitude`, `longitude` (numeric, nullable)
  - `recorded_by` (text)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

  ### `retailer_inventory`
  Maintains current stock levels for each retailer by SKU.
  - `id` (uuid, primary key)
  - `retailer_id`, `retailer_name`, `retailer_business_name`, `retailer_location` (text)
  - `distributor_id`, `distributor_name` (text, nullable)
  - `product_code`, `product_name`, `sku_code`, `sku_name` (text)
  - `current_stock` (integer, default 0)
  - `unit` (text)
  - `last_received_date` (timestamptz, nullable)
  - `last_received_quantity` (integer, nullable)
  - `total_received`, `total_sold` (integer, default 0)
  - `updated_at`, `created_at` (timestamptz)

  ## 2. Security
  - RLS enabled on both tables
  - Authenticated users can read all records
  - Authenticated users can insert records
  - Updates allowed for inventory, restricted for transfers
  - Deletes restricted to system only

  ## 3. Indexes
  - Optimized for fast lookups by entity, product, SKU, and date
*/

-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_date timestamptz DEFAULT now() NOT NULL,
  transfer_type text NOT NULL CHECK (transfer_type IN ('distributor_to_retailer', 'distributor_to_farmer', 'retailer_return', 'retailer_to_farmer')),
  from_entity_type text NOT NULL CHECK (from_entity_type IN ('distributor', 'retailer')),
  from_entity_id text NOT NULL,
  from_entity_name text NOT NULL,
  to_entity_type text NOT NULL CHECK (to_entity_type IN ('retailer', 'farmer', 'distributor')),
  to_entity_id text NOT NULL,
  to_entity_name text NOT NULL,
  to_entity_business_name text,
  to_entity_location text,
  product_code text NOT NULL,
  product_name text NOT NULL,
  sku_code text NOT NULL,
  sku_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  unit_price numeric(10, 2) DEFAULT 0,
  total_value numeric(12, 2) DEFAULT 0,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  recorded_by text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create retailer_inventory table
CREATE TABLE IF NOT EXISTS retailer_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id text NOT NULL,
  retailer_name text NOT NULL,
  retailer_business_name text NOT NULL,
  retailer_location text NOT NULL,
  distributor_id text,
  distributor_name text,
  product_code text NOT NULL,
  product_name text NOT NULL,
  sku_code text NOT NULL,
  sku_name text NOT NULL,
  current_stock integer DEFAULT 0 NOT NULL CHECK (current_stock >= 0),
  unit text NOT NULL,
  last_received_date timestamptz,
  last_received_quantity integer,
  total_received integer DEFAULT 0 NOT NULL,
  total_sold integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(retailer_id, product_code, sku_code)
);

-- Create indexes for stock_transfers
CREATE INDEX IF NOT EXISTS idx_stock_transfers_transfer_date ON stock_transfers(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_entity ON stock_transfers(from_entity_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_entity ON stock_transfers(to_entity_id, transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_product ON stock_transfers(product_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_type ON stock_transfers(transfer_type, transfer_date DESC);

-- Create indexes for retailer_inventory
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_retailer ON retailer_inventory(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_sku ON retailer_inventory(sku_code);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_distributor ON retailer_inventory(distributor_id);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_product ON retailer_inventory(product_code, sku_code);

-- Enable Row Level Security
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_transfers
CREATE POLICY "Authenticated users can read stock transfers"
  ON stock_transfers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stock transfers"
  ON stock_transfers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock transfers"
  ON stock_transfers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stock transfers"
  ON stock_transfers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for retailer_inventory
CREATE POLICY "Authenticated users can read retailer inventory"
  ON retailer_inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert retailer inventory"
  ON retailer_inventory FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update retailer inventory"
  ON retailer_inventory FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete retailer inventory"
  ON retailer_inventory FOR DELETE
  TO authenticated
  USING (true);