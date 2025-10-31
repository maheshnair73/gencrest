/*
  # Create Distributors and Inventory Tables

  ## Overview
  Creates the core tables needed for liquidation tracking including distributors,
  distributor inventory, and outlets (retailers).

  ## New Tables
  
  ### `distributors`
  Stores distributor master data
  - `id` (uuid, primary key)
  - `code` (text, unique) - Distributor code
  - `name` (text) - Distributor name
  - `territory` (text) - Territory assignment
  - `zone` (text) - Zone assignment
  - `state` (text) - State location
  - `region` (text) - Region assignment
  - `status` (text) - Active/Inactive status
  - `contact_person` (text) - Contact name
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `address` (text) - Physical address
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `distributor_inventory`
  Tracks stock and sales for each SKU at distributor level
  - `id` (uuid, primary key)
  - `distributor_id` (text) - References distributor code
  - `sku_code` (text) - Product SKU code
  - `sku_name` (text) - Product name
  - `opening_stock` (numeric) - Opening stock volume
  - `opening_value` (numeric) - Opening stock value
  - `ytd_sales` (numeric) - Year-to-date sales volume
  - `ytd_sales_value` (numeric) - YTD sales value
  - `ytd_liquidation` (numeric) - YTD liquidation volume
  - `balance_stock` (numeric) - Current balance stock
  - `balance_value` (numeric) - Current balance value
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `outlets`
  Stores retailer/outlet information
  - `id` (uuid, primary key)
  - `code` (text, unique) - Outlet code
  - `name` (text) - Outlet name
  - `territory` (text) - Territory
  - `zone` (text) - Zone
  - `state` (text) - State
  - `region` (text) - Region
  - `address` (text) - Physical address
  - `pincode` (text) - Postal code
  - `contact_person` (text) - Contact name
  - `phone` (text) - Contact phone
  - `distributor_code` (text) - Associated distributor
  - `status` (text) - Active/Inactive
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read data
  - Add policies for anon users (for demo purposes)
*/

-- Create distributors table
CREATE TABLE IF NOT EXISTS distributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  territory text DEFAULT '',
  zone text DEFAULT '',
  state text DEFAULT '',
  region text DEFAULT '',
  status text DEFAULT 'Active',
  contact_person text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create distributor_inventory table
CREATE TABLE IF NOT EXISTS distributor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id text NOT NULL,
  sku_code text NOT NULL,
  sku_name text DEFAULT '',
  opening_stock numeric DEFAULT 0,
  opening_value numeric DEFAULT 0,
  ytd_sales numeric DEFAULT 0,
  ytd_sales_value numeric DEFAULT 0,
  ytd_liquidation numeric DEFAULT 0,
  balance_stock numeric DEFAULT 0,
  balance_value numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(distributor_id, sku_code)
);

-- Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  territory text DEFAULT '',
  zone text DEFAULT '',
  state text DEFAULT '',
  region text DEFAULT '',
  address text DEFAULT '',
  pincode text DEFAULT '',
  contact_person text DEFAULT '',
  phone text DEFAULT '',
  distributor_code text DEFAULT '',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(code);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_territory ON distributors(territory);
CREATE INDEX IF NOT EXISTS idx_distributors_zone ON distributors(zone);

CREATE INDEX IF NOT EXISTS idx_inventory_distributor ON distributor_inventory(distributor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON distributor_inventory(sku_code);

CREATE INDEX IF NOT EXISTS idx_outlets_code ON outlets(code);
CREATE INDEX IF NOT EXISTS idx_outlets_distributor ON outlets(distributor_code);
CREATE INDEX IF NOT EXISTS idx_outlets_territory ON outlets(territory);

-- Enable RLS
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distributors
CREATE POLICY "Anyone can read distributors"
  ON distributors FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert distributors"
  ON distributors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update distributors"
  ON distributors FOR UPDATE
  USING (true);

-- RLS Policies for distributor_inventory
CREATE POLICY "Anyone can read distributor inventory"
  ON distributor_inventory FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert distributor inventory"
  ON distributor_inventory FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update distributor inventory"
  ON distributor_inventory FOR UPDATE
  USING (true);

-- RLS Policies for outlets
CREATE POLICY "Anyone can read outlets"
  ON outlets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert outlets"
  ON outlets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update outlets"
  ON outlets FOR UPDATE
  USING (true);

-- Insert sample distributor data
INSERT INTO distributors (code, name, territory, zone, state, region, status, contact_person, phone, email, address)
VALUES 
  ('DIST001', 'Sharma Distributors', 'North Delhi', 'North Zone', 'Delhi', 'North India', 'Active', 'Rajesh Sharma', '+91-9876543210', 'rajesh@sharmadist.com', '123 Main Road, Delhi'),
  ('DIST002', 'Kumar Trading Co', 'South Delhi', 'North Zone', 'Delhi', 'North India', 'Active', 'Amit Kumar', '+91-9876543211', 'amit@kumartrading.com', '456 MG Road, Delhi'),
  ('DIST003', 'Patel Enterprises', 'Mumbai Central', 'West Zone', 'Maharashtra', 'West India', 'Active', 'Suresh Patel', '+91-9876543212', 'suresh@patelent.com', '789 Station Road, Mumbai'),
  ('TEST-DIST', 'Test Distributor (For Stock Verification)', 'Test Territory', 'Test Zone', 'Test State', 'Test Region', 'Active', 'Test Contact', '+91-9999999999', 'test@testdist.com', 'Test Address, Test City')
ON CONFLICT (code) DO NOTHING;

-- Insert sample inventory data
INSERT INTO distributor_inventory (distributor_id, sku_code, sku_name, opening_stock, opening_value, ytd_sales, ytd_sales_value, ytd_liquidation, balance_stock, balance_value)
VALUES
  -- Distributor 1 inventory
  ('DIST001', 'SKU001', 'Product A 500ml', 1000, 500000, 600, 300000, 400, 400, 200000),
  ('DIST001', 'SKU002', 'Product B 1L', 800, 640000, 500, 400000, 300, 300, 240000),
  ('DIST001', 'SKU003', 'Product C 250ml', 1500, 375000, 800, 200000, 700, 700, 175000),
  
  -- Distributor 2 inventory
  ('DIST002', 'SKU001', 'Product A 500ml', 1200, 600000, 700, 350000, 500, 500, 250000),
  ('DIST002', 'SKU002', 'Product B 1L', 900, 720000, 600, 480000, 300, 300, 240000),
  ('DIST002', 'SKU003', 'Product C 250ml', 1600, 400000, 900, 225000, 700, 700, 175000),
  
  -- Distributor 3 inventory
  ('DIST003', 'SKU001', 'Product A 500ml', 1500, 750000, 900, 450000, 600, 600, 300000),
  ('DIST003', 'SKU002', 'Product B 1L', 1000, 800000, 700, 560000, 300, 300, 240000),
  ('DIST003', 'SKU003', 'Product C 250ml', 2000, 500000, 1200, 300000, 800, 800, 200000),
  
  -- Test distributor with multiple SKUs
  ('TEST-DIST', 'TEST-SKU-001', 'Test Product A 500ml', 1000, 500000, 200, 100000, 50, 750, 375000),
  ('TEST-DIST', 'TEST-SKU-002', 'Test Product B 1L', 800, 640000, 150, 120000, 30, 620, 496000),
  ('TEST-DIST', 'TEST-SKU-003', 'Test Product C 250ml', 1500, 375000, 300, 75000, 100, 1100, 275000),
  ('TEST-DIST', 'TEST-SKU-004', 'Test Product D 2L', 500, 500000, 100, 100000, 20, 380, 380000),
  ('TEST-DIST', 'TEST-SKU-005', 'Test Product E 750ml', 1200, 720000, 250, 150000, 80, 870, 522000)
ON CONFLICT (distributor_id, sku_code) DO NOTHING;

-- Insert sample outlet data
INSERT INTO outlets (code, name, territory, zone, state, region, address, pincode, contact_person, phone, distributor_code, status)
VALUES
  ('RET001', 'Central Store', 'North Delhi', 'North Zone', 'Delhi', 'North India', '12 Market Street', '110001', 'Mohan Singh', '+91-9876540001', 'DIST001', 'Active'),
  ('RET002', 'Mini Mart', 'North Delhi', 'North Zone', 'Delhi', 'North India', '45 Shopping Complex', '110002', 'Priya Verma', '+91-9876540002', 'DIST001', 'Active'),
  ('RET003', 'Super Bazaar', 'South Delhi', 'North Zone', 'Delhi', 'North India', '78 Main Market', '110003', 'Vikram Rao', '+91-9876540003', 'DIST002', 'Active'),
  ('RET004', 'Quick Shop', 'South Delhi', 'North Zone', 'Delhi', 'North India', '90 Station Road', '110004', 'Neha Gupta', '+91-9876540004', 'DIST002', 'Active'),
  ('RET005', 'City Store', 'Mumbai Central', 'West Zone', 'Maharashtra', 'West India', '23 Church Street', '400001', 'Rahul Shah', '+91-9876540005', 'DIST003', 'Active')
ON CONFLICT (code) DO NOTHING;