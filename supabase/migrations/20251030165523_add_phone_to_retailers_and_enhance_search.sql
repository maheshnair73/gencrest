/*
  # Add Phone Numbers to Retailers and Enhance Search

  ## Overview
  Adds phone number fields to retailer_inventory table for enhanced search capabilities
  
  ## Changes
  1. Add retailer_phone column to retailer_inventory
  2. Add retailer_contact_person column to retailer_inventory
  3. Create indexes for fast searching
  4. Add sample phone numbers to existing data
  
  ## Search Enhancement
  - Search by name (retailer_name, business_name)
  - Search by phone number
  - Search by retailer code (retailer_id)
  - Search by location
*/

-- Add phone and contact person columns to retailer_inventory
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retailer_inventory' AND column_name = 'retailer_phone'
  ) THEN
    ALTER TABLE retailer_inventory ADD COLUMN retailer_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retailer_inventory' AND column_name = 'retailer_contact_person'
  ) THEN
    ALTER TABLE retailer_inventory ADD COLUMN retailer_contact_person text;
  END IF;
END $$;

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_phone ON retailer_inventory(retailer_phone);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_name ON retailer_inventory(retailer_name);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_business_name ON retailer_inventory(retailer_business_name);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_location ON retailer_inventory(retailer_location);
CREATE INDEX IF NOT EXISTS idx_retailer_inventory_retailer_id ON retailer_inventory(retailer_id);

-- Create indexes for distributors (if not already exist)
CREATE INDEX IF NOT EXISTS idx_distributors_phone ON distributors(phone);
CREATE INDEX IF NOT EXISTS idx_distributors_name ON distributors(name);
CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(code);
CREATE INDEX IF NOT EXISTS idx_distributors_territory ON distributors(territory);

-- Update existing retailer records with phone numbers (if any exist)
UPDATE retailer_inventory
SET 
  retailer_phone = CASE retailer_id
    WHEN 'RET001' THEN '+91 98765 11001'
    WHEN 'RET002' THEN '+91 98765 11002'
    WHEN 'RET003' THEN '+91 98765 11003'
    ELSE '+91 98765 1' || LPAD(SUBSTRING(retailer_id FROM '[0-9]+'), 4, '0')
  END,
  retailer_contact_person = CASE retailer_id
    WHEN 'RET001' THEN 'Vasudha Representative'
    WHEN 'RET002' THEN 'Krishi Seva Contact'
    WHEN 'RET003' THEN 'Agro Store Manager'
    ELSE 'Store Manager'
  END
WHERE retailer_phone IS NULL;

-- Create a function for full-text search on retailers
CREATE OR REPLACE FUNCTION search_retailers(search_term text)
RETURNS TABLE (
  id uuid,
  retailer_id text,
  retailer_name text,
  retailer_business_name text,
  retailer_location text,
  retailer_phone text,
  retailer_contact_person text,
  distributor_id text,
  distributor_name text,
  match_score integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (r.retailer_id)
    r.id,
    r.retailer_id,
    r.retailer_name,
    r.retailer_business_name,
    r.retailer_location,
    r.retailer_phone,
    r.retailer_contact_person,
    r.distributor_id,
    r.distributor_name,
    CASE
      WHEN LOWER(r.retailer_id) = LOWER(search_term) THEN 100
      WHEN LOWER(r.retailer_phone) = LOWER(search_term) THEN 95
      WHEN LOWER(r.retailer_name) LIKE LOWER(search_term) || '%' THEN 90
      WHEN LOWER(r.retailer_business_name) LIKE LOWER(search_term) || '%' THEN 85
      WHEN LOWER(r.retailer_id) LIKE LOWER(search_term) || '%' THEN 80
      WHEN LOWER(r.retailer_phone) LIKE '%' || LOWER(search_term) || '%' THEN 75
      WHEN LOWER(r.retailer_name) LIKE '%' || LOWER(search_term) || '%' THEN 70
      WHEN LOWER(r.retailer_business_name) LIKE '%' || LOWER(search_term) || '%' THEN 65
      WHEN LOWER(r.retailer_location) LIKE '%' || LOWER(search_term) || '%' THEN 60
      ELSE 50
    END as match_score
  FROM retailer_inventory r
  WHERE 
    LOWER(r.retailer_name) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(r.retailer_business_name) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(r.retailer_id) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(r.retailer_phone) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(r.retailer_location) LIKE '%' || LOWER(search_term) || '%'
  ORDER BY r.retailer_id, match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function for full-text search on distributors
CREATE OR REPLACE FUNCTION search_distributors(search_term text)
RETURNS TABLE (
  id uuid,
  code text,
  name text,
  territory text,
  zone text,
  state text,
  region text,
  phone text,
  contact_person text,
  email text,
  match_score integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.code,
    d.name,
    d.territory,
    d.zone,
    d.state,
    d.region,
    d.phone,
    d.contact_person,
    d.email,
    CASE
      WHEN LOWER(d.code) = LOWER(search_term) THEN 100
      WHEN LOWER(d.phone) = LOWER(search_term) THEN 95
      WHEN LOWER(d.name) LIKE LOWER(search_term) || '%' THEN 90
      WHEN LOWER(d.code) LIKE LOWER(search_term) || '%' THEN 85
      WHEN LOWER(d.phone) LIKE '%' || LOWER(search_term) || '%' THEN 80
      WHEN LOWER(d.name) LIKE '%' || LOWER(search_term) || '%' THEN 75
      WHEN LOWER(d.territory) LIKE '%' || LOWER(search_term) || '%' THEN 70
      WHEN LOWER(d.contact_person) LIKE '%' || LOWER(search_term) || '%' THEN 65
      ELSE 50
    END as match_score
  FROM distributors d
  WHERE 
    LOWER(d.name) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(d.code) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(d.phone) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(d.territory) LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(d.contact_person) LIKE '%' || LOWER(search_term) || '%'
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;
