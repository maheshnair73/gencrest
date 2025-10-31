/*
  # Add Location Fields to Distributors Table

  ## Overview
  Adds latitude, longitude, and location verification tracking to distributors table
  to support location-based stock verification workflow.

  ## Changes
  
  ### Modified Tables
  - `distributors`
    - Add `latitude` (numeric) - Latitude coordinate
    - Add `longitude` (numeric) - Longitude coordinate
    - Add `location_verified` (boolean) - Whether location has been verified
    - Add `location_verified_at` (timestamptz) - When location was verified
    - Add `location_verified_by` (text) - User ID who verified the location

  ## Notes
  - Location verification is required before stock verification can proceed
  - Latitude/longitude can be null for distributors that haven't been visited yet
*/

-- Add location fields to distributors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE distributors ADD COLUMN latitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE distributors ADD COLUMN longitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'location_verified'
  ) THEN
    ALTER TABLE distributors ADD COLUMN location_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'location_verified_at'
  ) THEN
    ALTER TABLE distributors ADD COLUMN location_verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'location_verified_by'
  ) THEN
    ALTER TABLE distributors ADD COLUMN location_verified_by text;
  END IF;
END $$;

-- Update Gencrest HO to have verified location (Mumbai coordinates)
UPDATE distributors
SET 
  latitude = 19.0760,
  longitude = 72.8777,
  location_verified = true,
  location_verified_at = NOW()
WHERE code = 'HO-001';
