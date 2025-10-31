/*
  # Create Technical Documentation System

  1. New Tables
    - `technical_documentation`
      - `id` (uuid, primary key)
      - `module_name` (text) - Name of the module/feature
      - `category` (text) - Category (Database, Frontend, API, Authentication, etc.)
      - `description` (text) - Detailed description
      - `tech_stack` (jsonb) - Technologies used
      - `implementation_details` (text) - Technical implementation details
      - `database_schema` (jsonb) - Database tables and fields involved
      - `api_endpoints` (jsonb) - API endpoints if applicable
      - `dependencies` (jsonb) - External dependencies
      - `security_notes` (text) - Security considerations
      - `last_updated` (timestamptz) - Last update timestamp
      - `updated_by` (text) - Who made the update
      - `version` (text) - Version number
      - `status` (text) - Active, Deprecated, In Development
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `technical_documentation` table
    - Allow anonymous access for now (will be restricted via frontend)
*/

CREATE TABLE IF NOT EXISTS technical_documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  tech_stack jsonb DEFAULT '[]'::jsonb,
  implementation_details text,
  database_schema jsonb DEFAULT '{}'::jsonb,
  api_endpoints jsonb DEFAULT '[]'::jsonb,
  dependencies jsonb DEFAULT '[]'::jsonb,
  security_notes text,
  last_updated timestamptz DEFAULT now(),
  updated_by text,
  version text DEFAULT '1.0.0',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technical_documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to technical documentation"
  ON technical_documentation
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to technical documentation"
  ON technical_documentation
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to technical documentation"
  ON technical_documentation
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to technical documentation"
  ON technical_documentation
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tech_docs_category ON technical_documentation(category);
CREATE INDEX IF NOT EXISTS idx_tech_docs_status ON technical_documentation(status);
CREATE INDEX IF NOT EXISTS idx_tech_docs_updated ON technical_documentation(last_updated DESC);
