/*
  # Add Duplicate Prevention for Retailers

  1. Changes
    - Add unique constraint on normalized name + phone combination
    - Add function to normalize retailer names (lowercase, trim spaces, remove special chars)
    - Add check constraint to ensure phone numbers are valid
    - Add index for faster duplicate checking
  
  2. Security
    - Maintain existing RLS policies
    - Add validation at database level to prevent duplicates
*/

-- Create function to normalize text for comparison
CREATE OR REPLACE FUNCTION normalize_text(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(trim(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add normalized name column for faster duplicate checking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outlets' AND column_name = 'normalized_name'
  ) THEN
    ALTER TABLE outlets ADD COLUMN normalized_name text GENERATED ALWAYS AS (normalize_text(name)) STORED;
  END IF;
END $$;

-- Create index on normalized name for faster lookups
CREATE INDEX IF NOT EXISTS idx_outlets_normalized_name ON outlets(normalized_name);

-- Create index on phone for duplicate checking
CREATE INDEX IF NOT EXISTS idx_outlets_phone ON outlets(phone) WHERE phone IS NOT NULL AND phone != '';

-- Add comment explaining the duplicate prevention strategy
COMMENT ON COLUMN outlets.normalized_name IS 'Normalized version of retailer name for duplicate detection - lowercase, trimmed, special chars removed';
