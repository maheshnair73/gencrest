/*
  # Stock Transfers and Retailer Inventory System

  ## Overview
  This migration creates a comprehensive system for tracking stock movements from distributors to retailers,
  and maintaining retailer inventory levels. This enables full visibility into the supply chain.

  ## 1. New Tables

  ### `stock_transfers`
  Tracks all stock movements between entities in the supply chain.
  - `id` (uuid, primary key) - Unique transfer ID
  - `transfer_date` (timestamptz) - When the transfer occurred
  - `transfer_type` (text) - Type: 'distributor_to_retailer', 'distributor_to_farmer', 'retailer_return'
  - `from_entity_type` (text) - Source entity type: 'distributor', 'retailer'
  - `from_entity_id` (text) - Source entity identifier (distributor code, retailer code, etc.)
  - `from_entity_name` (text) - Source entity name for easy reference
  - `to_entity_type` (text) - Destination entity type: 'retailer', 'farmer'
  - `to_entity_id` (text) - Destination entity identifier
  - `to_entity_name` (text) - Destination entity name
  - `to_entity_business_name` (text, nullable) - Business name for retailers
  - `to_entity_location` (text, nullable) - Location details
  - `product_code` (text) - Product identifier
  - `product_name` (text) - Product name
  - `sku_code` (text) - SKU identifier
  - `sku_name` (text) - SKU name/size
  - `quantity` (integer) - Number of units transferred
  - `unit` (text) - Unit of measurement (Nos, Kg, etc.)
  - `unit_price` (numeric) - Price per unit at time of transfer
  - `total_value` (numeric) - Total value of transfer (quantity × unit_price)
  - `latitude` (numeric, nullable) - GPS latitude where transfer was recorded
  - `longitude` (numeric, nullable) - GPS longitude where transfer was recorded
  - `recorded_by` (text) - User who recorded the transfer (TSM, MDO, etc.)
  - `notes` (text, nullable) - Additional notes about the transfer
  - `created_at` (timestamptz) - Record creation timestamp

  ### `retailer_inventory`
  Maintains current stock levels for each retailer by SKU.
  - `id` (uuid, primary key) - Unique inventory record ID
  - `retailer_id` (text) - Retailer identifier (business name or code)
  - `retailer_name` (text) - Retailer name
  - `retailer_business_name` (text) - Retailer business name
  - `retailer_location` (text) - Retailer location
  - `distributor_id` (text, nullable) - Associated distributor (if applicable)
  - `distributor_name` (text, nullable) - Distributor name
  - `product_code` (text) - Product identifier
  - `product_name` (text) - Product name
  - `sku_code` (text) - SKU identifier
  - `sku_name` (text) - SKU name/size
  - `current_stock` (integer) - Current stock quantity (default: 0)
  - `unit` (text) - Unit of measurement
  - `last_received_date` (timestamptz, nullable) - When stock was last received
  - `last_received_quantity` (integer, nullable) - Last quantity received
  - `total_received` (integer) - Total quantity ever received (default: 0)
  - `total_sold` (integer) - Total quantity sold to farmers (default: 0)
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Indexes
  - Stock transfers indexed by transfer_date, from_entity_id, to_entity_id, product_code, sku_code
  - Retailer inventory indexed by retailer_id, sku_code for fast lookups
  - Composite index on (retailer_id, product_code, sku_code) for unique constraint

  ## 3. Security
  - RLS enabled on both tables
  - Authenticated users can read all records
  - Only authenticated users can insert records
  - Update and delete policies restrict to authenticated users

  ## 4. Important Notes
  - All stock movements must be recorded in stock_transfers table
  - Retailer inventory is automatically updated when transfers occur
  - GPS coordinates are optional but recommended for audit purposes
  - Stock transfers are immutable once created (no updates/deletes in normal flow)
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

-- Allow authenticated users to read all stock transfers
CREATE POLICY "Authenticated users can read stock transfers"
  ON stock_transfers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert stock transfers
CREATE POLICY "Authenticated users can insert stock transfers"
  ON stock_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Restrict updates (stock transfers should be immutable)
CREATE POLICY "Only system can update stock transfers"
  ON stock_transfers
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Restrict deletes (stock transfers should be permanent)
CREATE POLICY "Only system can delete stock transfers"
  ON stock_transfers
  FOR DELETE
  TO authenticated
  USING (false);

-- RLS Policies for retailer_inventory

-- Allow authenticated users to read all retailer inventory
CREATE POLICY "Authenticated users can read retailer inventory"
  ON retailer_inventory
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert retailer inventory
CREATE POLICY "Authenticated users can insert retailer inventory"
  ON retailer_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update retailer inventory
CREATE POLICY "Authenticated users can update retailer inventory"
  ON retailer_inventory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Restrict deletes (inventory records should be permanent)
CREATE POLICY "Only system can delete retailer inventory"
  ON retailer_inventory
  FOR DELETE
  TO authenticated
  USING (false);
