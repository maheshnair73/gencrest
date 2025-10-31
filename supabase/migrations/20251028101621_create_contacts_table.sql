/*
  # Create Contacts Table with Geolocation

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `name` (text) - Contact person name
      - `company` (text) - Company/Shop name
      - `role` (text) - Person's role
      - `phone` (text) - Phone number
      - `email` (text) - Email address
      - `location` (text) - Address/location description
      - `latitude` (numeric) - Geolocation latitude
      - `longitude` (numeric) - Geolocation longitude
      - `geo_saved_at` (timestamptz) - When lat/long was saved
      - `type` (text) - Retailer or Distributor
      - `status` (text) - Active or Inactive
      - `tags` (jsonb) - Tags for categorization
      - `territory` (text) - Territory name
      - `region` (text) - Region name
      - `zone` (text) - Zone name
      - `state` (text) - State name
      - `pincode` (text) - Pincode
      - `notes` (text) - Additional notes
      - `credit_limit` (numeric) - For distributors
      - `outstanding_amount` (numeric) - Outstanding balance
      - `last_visit_date` (date) - Last visit date
      - `created_by` (uuid) - User who created the contact
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `contacts` table
    - Add policies for anon users to manage contacts
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  role text,
  phone text NOT NULL,
  email text,
  location text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  geo_saved_at timestamptz,
  type text NOT NULL DEFAULT 'Retailer' CHECK (type IN ('Retailer', 'Distributor')),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  tags jsonb DEFAULT '[]'::jsonb,
  territory text,
  region text,
  zone text,
  state text,
  pincode text,
  notes text,
  credit_limit numeric(12, 2) DEFAULT 0,
  outstanding_amount numeric(12, 2) DEFAULT 0,
  last_visit_date date,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon users can view all contacts"
  ON contacts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can create contacts"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update contacts"
  ON contacts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete contacts"
  ON contacts
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_territory ON contacts(territory);
CREATE INDEX IF NOT EXISTS idx_contacts_region ON contacts(region);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_geo ON contacts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
