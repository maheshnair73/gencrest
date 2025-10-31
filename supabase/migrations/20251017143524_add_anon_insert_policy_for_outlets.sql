/*
  # Add anon insert policy for outlets

  1. Security Changes
    - Add policy to allow anonymous users to insert outlets
    - This is needed for the liquidation flow where retailers are added without authentication
    - In production, this should be restricted to authenticated users only

  ## Note
  This is a temporary policy for demo/development purposes.
  In production, proper authentication should be enforced.
*/

-- Allow anonymous users to insert outlets (for demo purposes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'outlets' 
    AND policyname = 'Allow anon insert outlets for demo'
  ) THEN
    CREATE POLICY "Allow anon insert outlets for demo"
      ON outlets
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;