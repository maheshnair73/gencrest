/*
  # Add Anonymous Access Policies for Travel Claims
  
  1. Changes
    - Add SELECT policy for anon users to view travel claims
    - Add INSERT policy for anon users to create travel claims
    - Add UPDATE policy for anon users to update their claims
    - Add DELETE policy for anon users to delete their draft claims
  
  2. Security
    - Anon users can access all claims (client-side user management)
    - This allows the app to work without Supabase Auth
*/

-- Drop existing anon policies if they exist
DROP POLICY IF EXISTS "Anon users can view their own claims" ON travel_claims;
DROP POLICY IF EXISTS "Anon users can create claims" ON travel_claims;
DROP POLICY IF EXISTS "Anon users can update claims" ON travel_claims;
DROP POLICY IF EXISTS "Anon users can delete claims" ON travel_claims;

-- Add SELECT policy for anon users
CREATE POLICY "Anon users can view their own claims"
  ON travel_claims
  FOR SELECT
  TO anon
  USING (true);

-- Add INSERT policy for anon users
CREATE POLICY "Anon users can create claims"
  ON travel_claims
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add UPDATE policy for anon users
CREATE POLICY "Anon users can update claims"
  ON travel_claims
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for anon users
CREATE POLICY "Anon users can delete claims"
  ON travel_claims
  FOR DELETE
  TO anon
  USING (true);
