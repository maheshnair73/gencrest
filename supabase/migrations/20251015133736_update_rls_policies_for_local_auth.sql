/*
  # Update RLS Policies for Local Authentication

  1. Changes
    - Temporarily disable RLS or make it permissive for development
    - Allow anon access to read data for reports
    - Keep insert/update/delete restricted

  2. Notes
    - This is for demo/development purposes
    - In production, proper Supabase auth should be integrated
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view outlets based on hierarchy" ON outlets;
DROP POLICY IF EXISTS "Users can view transactions based on hierarchy" ON outlet_transactions;
DROP POLICY IF EXISTS "Users can view MDO summaries based on hierarchy" ON mdo_summary;

-- Create permissive read policies for anon users (development only)
CREATE POLICY "Allow anon read access to outlets"
  ON outlets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to outlet_transactions"
  ON outlet_transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to mdo_summary"
  ON mdo_summary FOR SELECT
  TO anon
  USING (true);

-- Keep existing insert/update policies for authenticated users
CREATE POLICY "Authenticated users can insert outlets"
  ON outlets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update outlets"
  ON outlets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON outlet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON outlet_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert mdo_summary"
  ON mdo_summary FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mdo_summary"
  ON mdo_summary FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);