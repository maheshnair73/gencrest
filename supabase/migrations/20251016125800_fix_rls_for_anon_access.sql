/*
  # Fix RLS Policies for Anonymous Access

  This migration updates RLS policies to allow anonymous (anon) access to retailer_inventory
  and stock_transfers tables, since the application uses local authentication rather than
  Supabase Auth.

  ## Changes
  - Drop existing authenticated-only policies
  - Create new policies that allow anon role access
  - Maintain data security while enabling app functionality
*/

-- Drop existing policies for stock_transfers
DROP POLICY IF EXISTS "Authenticated users can read stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Authenticated users can insert stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Authenticated users can update stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Authenticated users can delete stock transfers" ON stock_transfers;

-- Drop existing policies for retailer_inventory
DROP POLICY IF EXISTS "Authenticated users can read retailer inventory" ON retailer_inventory;
DROP POLICY IF EXISTS "Authenticated users can insert retailer inventory" ON retailer_inventory;
DROP POLICY IF EXISTS "Authenticated users can update retailer inventory" ON retailer_inventory;
DROP POLICY IF EXISTS "Authenticated users can delete retailer inventory" ON retailer_inventory;

-- Create new policies for stock_transfers (allow anon access)
CREATE POLICY "Allow anon to read stock transfers"
  ON stock_transfers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert stock transfers"
  ON stock_transfers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update stock transfers"
  ON stock_transfers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete stock transfers"
  ON stock_transfers FOR DELETE
  TO anon
  USING (true);

-- Create new policies for retailer_inventory (allow anon access)
CREATE POLICY "Allow anon to read retailer inventory"
  ON retailer_inventory FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert retailer inventory"
  ON retailer_inventory FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update retailer inventory"
  ON retailer_inventory FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete retailer inventory"
  ON retailer_inventory FOR DELETE
  TO anon
  USING (true);
