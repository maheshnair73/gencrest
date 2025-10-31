/*
  # Create Reports and Hierarchy Tables

  1. New Tables
    - `outlets`
      - `id` (uuid, primary key)
      - `outlet_code` (text, unique)
      - `outlet_name` (text)
      - `owner_name` (text)
      - `contact_phone` (text)
      - `address` (text)
      - `territory` (text)
      - `region` (text)
      - `zone` (text)
      - `state` (text)
      - `mdo_id` (text, references employee_code)
      - `tsm_id` (text, references employee_code)
      - `rbh_id` (text, references employee_code)
      - `zbh_id` (text, references employee_code)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `outlet_transactions`
      - `id` (uuid, primary key)
      - `outlet_id` (uuid, references outlets)
      - `transaction_date` (date)
      - `opening_stock` (numeric)
      - `purchases` (numeric)
      - `sales` (numeric)
      - `liquidation` (numeric)
      - `balance_stock` (numeric)
      - `mdo_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `mdo_summary`
      - `id` (uuid, primary key)
      - `mdo_id` (text)
      - `mdo_name` (text)
      - `period_start` (date)
      - `period_end` (date)
      - `opening_stock` (numeric)
      - `ytd_sales` (numeric)
      - `liquidation` (numeric)
      - `balance_stock` (numeric)
      - `outlet_count` (integer)
      - `zone` (text)
      - `region` (text)
      - `territory` (text)
      - `tsm_id` (text)
      - `rbh_id` (text)
      - `zbh_id` (text)
      - `updated_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - TSM can only see their MDOs' data
    - ZBH can only see their zone's data
    - Higher roles can see all data

  3. Indexes
    - Add indexes on foreign keys and frequently queried columns
*/

-- Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_code text UNIQUE NOT NULL,
  outlet_name text NOT NULL,
  owner_name text,
  contact_phone text,
  address text,
  territory text,
  region text,
  zone text,
  state text,
  mdo_id text,
  tsm_id text,
  rbh_id text,
  zbh_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create outlet_transactions table
CREATE TABLE IF NOT EXISTS outlet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES outlets(id) ON DELETE CASCADE,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  opening_stock numeric(15,2) DEFAULT 0,
  purchases numeric(15,2) DEFAULT 0,
  sales numeric(15,2) DEFAULT 0,
  liquidation numeric(15,2) DEFAULT 0,
  balance_stock numeric(15,2) DEFAULT 0,
  mdo_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mdo_summary table
CREATE TABLE IF NOT EXISTS mdo_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mdo_id text NOT NULL,
  mdo_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_stock numeric(15,2) DEFAULT 0,
  ytd_sales numeric(15,2) DEFAULT 0,
  liquidation numeric(15,2) DEFAULT 0,
  balance_stock numeric(15,2) DEFAULT 0,
  outlet_count integer DEFAULT 0,
  zone text,
  region text,
  territory text,
  tsm_id text,
  rbh_id text,
  zbh_id text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outlets_mdo_id ON outlets(mdo_id);
CREATE INDEX IF NOT EXISTS idx_outlets_tsm_id ON outlets(tsm_id);
CREATE INDEX IF NOT EXISTS idx_outlets_zbh_id ON outlets(zbh_id);
CREATE INDEX IF NOT EXISTS idx_outlets_zone ON outlets(zone);
CREATE INDEX IF NOT EXISTS idx_outlet_transactions_outlet_id ON outlet_transactions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_transactions_date ON outlet_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_outlet_transactions_mdo_id ON outlet_transactions(mdo_id);
CREATE INDEX IF NOT EXISTS idx_mdo_summary_mdo_id ON mdo_summary(mdo_id);
CREATE INDEX IF NOT EXISTS idx_mdo_summary_tsm_id ON mdo_summary(tsm_id);
CREATE INDEX IF NOT EXISTS idx_mdo_summary_zbh_id ON mdo_summary(zbh_id);
CREATE INDEX IF NOT EXISTS idx_mdo_summary_period ON mdo_summary(period_start, period_end);

-- Enable RLS
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdo_summary ENABLE ROW LEVEL SECURITY;

-- Policies for outlets table
CREATE POLICY "Users can view outlets based on hierarchy"
  ON outlets FOR SELECT
  TO authenticated
  USING (
    -- MDO can see their own outlets
    (mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- TSM can see outlets of their MDOs
    (tsm_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- RBH can see outlets in their region
    (rbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- ZBH can see outlets in their zone
    (zbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- Upper management can see all
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('MD', 'VP_SM', 'MH', 'RMM', 'CHRO', 'CFO'))
  );

CREATE POLICY "Users can insert outlets based on hierarchy"
  ON outlets FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD')
  );

CREATE POLICY "Users can update outlets based on hierarchy"
  ON outlets FOR UPDATE
  TO authenticated
  USING (
    (tsm_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  )
  WITH CHECK (
    (tsm_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  );

-- Policies for outlet_transactions table
CREATE POLICY "Users can view transactions based on hierarchy"
  ON outlet_transactions FOR SELECT
  TO authenticated
  USING (
    -- MDO can see their own transactions
    (mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- Check through outlet relationship
    EXISTS (
      SELECT 1 FROM outlets o
      WHERE o.id = outlet_transactions.outlet_id
      AND (
        o.mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
        OR o.tsm_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
        OR o.rbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
        OR o.zbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
        OR ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('MD', 'VP_SM', 'MH', 'RMM', 'CHRO', 'CFO'))
      )
    )
  );

CREATE POLICY "MDO can insert their own transactions"
  ON outlet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
    OR
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  );

CREATE POLICY "Users can update transactions based on hierarchy"
  ON outlet_transactions FOR UPDATE
  TO authenticated
  USING (
    mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
    OR
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  )
  WITH CHECK (
    mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid())
    OR
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  );

-- Policies for mdo_summary table
CREATE POLICY "Users can view MDO summaries based on hierarchy"
  ON mdo_summary FOR SELECT
  TO authenticated
  USING (
    -- MDO can see their own summary
    (mdo_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- TSM can see summaries of their MDOs
    (tsm_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- RBH can see summaries in their region
    (rbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- ZBH can see summaries in their zone
    (zbh_id = (SELECT raw_user_meta_data->>'employee_code' FROM auth.users WHERE id = auth.uid()))
    OR
    -- Upper management can see all
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('MD', 'VP_SM', 'MH', 'RMM', 'CHRO', 'CFO'))
  );

CREATE POLICY "System can insert MDO summaries"
  ON mdo_summary FOR INSERT
  TO authenticated
  WITH CHECK (
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  );

CREATE POLICY "System can update MDO summaries"
  ON mdo_summary FOR UPDATE
  TO authenticated
  USING (
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  )
  WITH CHECK (
    ((SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD'))
  );

-- Insert sample data for outlets (North Zone - TSM Priya Sharma's MDOs)
INSERT INTO outlets (outlet_code, outlet_name, owner_name, contact_phone, address, territory, region, zone, state, mdo_id, tsm_id, rbh_id, zbh_id, is_active) VALUES
('OUT001', 'City Medical Store', 'Ramesh Gupta', '+91 98765 11111', 'Connaught Place, New Delhi', 'North Delhi', 'Delhi NCR', 'North Zone', 'Delhi', 'MDO001', 'TSM001', 'RBH001', 'ZBH001', true),
('OUT002', 'Health Plus Pharmacy', 'Suresh Kumar', '+91 98765 22222', 'Karol Bagh, New Delhi', 'North Delhi', 'Delhi NCR', 'North Zone', 'Delhi', 'MDO001', 'TSM001', 'RBH001', 'ZBH001', true),
('OUT003', 'Care Pharmacy', 'Amit Sharma', '+91 98765 33333', 'Lajpat Nagar, New Delhi', 'North Delhi', 'Delhi NCR', 'North Zone', 'Delhi', 'MDO001', 'TSM001', 'RBH001', 'ZBH001', true)
ON CONFLICT (outlet_code) DO NOTHING;

-- Insert sample data for outlets (South Zone - Different TSM and ZBH)
INSERT INTO outlets (outlet_code, outlet_name, owner_name, contact_phone, address, territory, region, zone, state, mdo_id, tsm_id, rbh_id, zbh_id, is_active) VALUES
('OUT004', 'Sri Venkateswara Medical', 'Venkata Rao', '+91 98765 44444', 'Anantapur Town, AP', 'Anantapur', 'Rayalaseema', 'ANDHRA PRADESH', 'Andhra Pradesh', 'MDO_AP001', 'TSM_AP001', 'RBH_AP001', 'ZBH_AP001', true),
('OUT005', 'Lakshmi Pharmacy', 'Lakshmi Devi', '+91 98765 55555', 'Gooty, AP', 'Anantapur', 'Rayalaseema', 'ANDHRA PRADESH', 'Andhra Pradesh', 'MDO_AP001', 'TSM_AP001', 'RBH_AP001', 'ZBH_AP001', true)
ON CONFLICT (outlet_code) DO NOTHING;

-- Insert sample transaction data for North Zone outlets
INSERT INTO outlet_transactions (outlet_id, transaction_date, opening_stock, purchases, sales, liquidation, balance_stock, mdo_id) 
SELECT 
  o.id,
  CURRENT_DATE,
  450000,
  200000,
  350000,
  50000,
  250000,
  o.mdo_id
FROM outlets o
WHERE o.outlet_code = 'OUT001'
ON CONFLICT DO NOTHING;

INSERT INTO outlet_transactions (outlet_id, transaction_date, opening_stock, purchases, sales, liquidation, balance_stock, mdo_id) 
SELECT 
  o.id,
  CURRENT_DATE,
  380000,
  150000,
  280000,
  40000,
  210000,
  o.mdo_id
FROM outlets o
WHERE o.outlet_code = 'OUT002'
ON CONFLICT DO NOTHING;

INSERT INTO outlet_transactions (outlet_id, transaction_date, opening_stock, purchases, sales, liquidation, balance_stock, mdo_id) 
SELECT 
  o.id,
  CURRENT_DATE,
  420000,
  180000,
  320000,
  45000,
  235000,
  o.mdo_id
FROM outlets o
WHERE o.outlet_code = 'OUT003'
ON CONFLICT DO NOTHING;

-- Insert sample transaction data for South Zone outlets
INSERT INTO outlet_transactions (outlet_id, transaction_date, opening_stock, purchases, sales, liquidation, balance_stock, mdo_id) 
SELECT 
  o.id,
  CURRENT_DATE,
  350000,
  120000,
  250000,
  35000,
  185000,
  o.mdo_id
FROM outlets o
WHERE o.outlet_code = 'OUT004'
ON CONFLICT DO NOTHING;

INSERT INTO outlet_transactions (outlet_id, transaction_date, opening_stock, purchases, sales, liquidation, balance_stock, mdo_id) 
SELECT 
  o.id,
  CURRENT_DATE,
  320000,
  100000,
  220000,
  30000,
  170000,
  o.mdo_id
FROM outlets o
WHERE o.outlet_code = 'OUT005'
ON CONFLICT DO NOTHING;

-- Insert MDO summary data
INSERT INTO mdo_summary (mdo_id, mdo_name, period_start, period_end, opening_stock, ytd_sales, liquidation, balance_stock, outlet_count, zone, region, territory, tsm_id, rbh_id, zbh_id) VALUES
('MDO001', 'Rajesh Kumar', '2025-04-01', '2025-10-15', 1250000, 950000, 135000, 695000, 3, 'North Zone', 'Delhi NCR', 'North Delhi', 'TSM001', 'RBH001', 'ZBH001'),
('MDO_AP001', 'Gabannagaru Thimmappa', '2025-04-01', '2025-10-15', 670000, 470000, 65000, 355000, 2, 'ANDHRA PRADESH', 'Rayalaseema', 'Anantapur', 'TSM_AP001', 'RBH_AP001', 'ZBH_AP001')
ON CONFLICT DO NOTHING;