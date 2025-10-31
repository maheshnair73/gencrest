-- Populate retailer_inventory table with sample data for stock verification
-- This addresses the missing data issue in retailer stock verification

-- First, let's clear any existing data to avoid conflicts
DELETE FROM retailer_inventory;

-- Insert sample retailer inventory data
INSERT INTO retailer_inventory (
  retailer_id,
  retailer_name,
  retailer_business_name,
  retailer_location,
  distributor_id,
  distributor_name,
  product_code,
  product_name,
  sku_code,
  sku_name,
  current_stock,
  unit,
  last_received_date,
  last_received_quantity,
  total_received,
  total_sold,
  updated_at,
  created_at
) VALUES
-- Retailer 1: Vasudha Swaraj Pvt Ltd
('RET001', 'Vasudha Swaraj Pvt Ltd', 'Vasudha Swaraj', 'Khandwa', 'DIST001', 'ABC Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 8000, '1 Ltr', NOW() - INTERVAL '5 days', 10000, 15000, 7000, NOW(), NOW()),
('RET001', 'Vasudha Swaraj Pvt Ltd', 'Vasudha Swaraj', 'Khandwa', 'DIST001', 'ABC Distributors', 'FGINVAG0001', 'Agrosatva (Gran.)', 'AGR-5KG', 'Agrosatva (Gran.)', 1000, '5 Kg', NOW() - INTERVAL '3 days', 1500, 2000, 1000, NOW(), NOW()),
('RET001', 'Vasudha Swaraj Pvt Ltd', 'Vasudha Swaraj', 'Khandwa', 'DIST001', 'ABC Distributors', 'FGBIO001', 'BioGrow Plus', 'BIO-500ML', 'BioGrow Plus', 500, '500 ML', NOW() - INTERVAL '2 days', 800, 1200, 700, NOW(), NOW()),

-- Retailer 2: Green Valley Seeds
('RET002', 'Green Valley Seeds', 'Green Valley Seeds Pvt Ltd', 'Indore', 'DIST001', 'ABC Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 5500, '1 Ltr', NOW() - INTERVAL '4 days', 7000, 12000, 6500, NOW(), NOW()),
('RET002', 'Green Valley Seeds', 'Green Valley Seeds Pvt Ltd', 'Indore', 'DIST001', 'ABC Distributors', 'FGINVAG0001', 'Agrosatva (Gran.)', 'AGR-5KG', 'Agrosatva (Gran.)', 750, '5 Kg', NOW() - INTERVAL '6 days', 1000, 1800, 1050, NOW(), NOW()),
('RET002', 'Green Valley Seeds', 'Green Valley Seeds Pvt Ltd', 'Indore', 'DIST002', 'XYZ Distributors', 'FGFERT001', 'Premium Fertilizer', 'FERT-25KG', 'Premium Fertilizer 25Kg', 2000, '25 Kg', NOW() - INTERVAL '1 day', 2500, 4000, 2000, NOW(), NOW()),

-- Retailer 3: Krishi Kendra
('RET003', 'Krishi Kendra', 'Krishi Kendra Store', 'Ujjain', 'DIST002', 'XYZ Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 3200, '1 Ltr', NOW() - INTERVAL '7 days', 4000, 8000, 4800, NOW(), NOW()),
('RET003', 'Krishi Kendra', 'Krishi Kendra Store', 'Ujjain', 'DIST002', 'XYZ Distributors', 'FGBIO001', 'BioGrow Plus', 'BIO-500ML', 'BioGrow Plus', 300, '500 ML', NOW() - INTERVAL '3 days', 500, 900, 600, NOW(), NOW()),
('RET003', 'Krishi Kendra', 'Krishi Kendra Store', 'Ujjain', 'DIST002', 'XYZ Distributors', 'FGFERT001', 'Premium Fertilizer', 'FERT-25KG', 'Premium Fertilizer 25Kg', 1500, '25 Kg', NOW() - INTERVAL '2 days', 2000, 3500, 2000, NOW(), NOW()),

-- Retailer 4: Farmer's Choice
('RET004', 'Farmer''s Choice', 'Farmer''s Choice Agro', 'Dewas', 'DIST003', 'PQR Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 6800, '1 Ltr', NOW() - INTERVAL '1 day', 8000, 14000, 7200, NOW(), NOW()),
('RET004', 'Farmer''s Choice', 'Farmer''s Choice Agro', 'Dewas', 'DIST003', 'PQR Distributors', 'FGINVAG0001', 'Agrosatva (Gran.)', 'AGR-5KG', 'Agrosatva (Gran.)', 900, '5 Kg', NOW() - INTERVAL '5 days', 1200, 2100, 1200, NOW(), NOW()),
('RET004', 'Farmer''s Choice', 'Farmer''s Choice Agro', 'Dewas', 'DIST003', 'PQR Distributors', 'FGBIO001', 'BioGrow Plus', 'BIO-500ML', 'BioGrow Plus', 400, '500 ML', NOW() - INTERVAL '4 days', 600, 1000, 600, NOW(), NOW()),

-- Retailer 5: Agro Solutions
('RET005', 'Agro Solutions', 'Agro Solutions Ltd', 'Bhopal', 'DIST003', 'PQR Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 4500, '1 Ltr', NOW() - INTERVAL '6 days', 6000, 11000, 6500, NOW(), NOW()),
('RET005', 'Agro Solutions', 'Agro Solutions Ltd', 'Bhopal', 'DIST003', 'PQR Distributors', 'FGFERT001', 'Premium Fertilizer', 'FERT-25KG', 'Premium Fertilizer 25Kg', 1800, '25 Kg', NOW() - INTERVAL '3 days', 2200, 4000, 2200, NOW(), NOW()),

-- Retailer 6: Modern Agri Store
('RET006', 'Modern Agri Store', 'Modern Agri Store Pvt Ltd', 'Gwalior', 'DIST004', 'LMN Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 7200, '1 Ltr', NOW() - INTERVAL '2 days', 9000, 16000, 8800, NOW(), NOW()),
('RET006', 'Modern Agri Store', 'Modern Agri Store Pvt Ltd', 'Gwalior', 'DIST004', 'LMN Distributors', 'FGINVAG0001', 'Agrosatva (Gran.)', 'AGR-5KG', 'Agrosatva (Gran.)', 1100, '5 Kg', NOW() - INTERVAL '4 days', 1400, 2500, 1400, NOW(), NOW()),
('RET006', 'Modern Agri Store', 'Modern Agri Store Pvt Ltd', 'Gwalior', 'DIST004', 'LMN Distributors', 'FGBIO001', 'BioGrow Plus', 'BIO-500ML', 'BioGrow Plus', 600, '500 ML', NOW() - INTERVAL '1 day', 800, 1400, 800, NOW(), NOW()),

-- Retailer 7: Rural Agro Center
('RET007', 'Rural Agro Center', 'Rural Agro Center', 'Jabalpur', 'DIST004', 'LMN Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 3800, '1 Ltr', NOW() - INTERVAL '8 days', 5000, 9000, 5200, NOW(), NOW()),
('RET007', 'Rural Agro Center', 'Rural Agro Center', 'Jabalpur', 'DIST004', 'LMN Distributors', 'FGFERT001', 'Premium Fertilizer', 'FERT-25KG', 'Premium Fertilizer 25Kg', 1200, '25 Kg', NOW() - INTERVAL '5 days', 1500, 2700, 1500, NOW(), NOW()),

-- Retailer 8: Prime Seeds
('RET008', 'Prime Seeds', 'Prime Seeds & Fertilizers', 'Ratlam', 'DIST005', 'RST Distributors', 'FGCMGM0093', 'Agrosatva', 'AGR-1L', 'Agrosatva', 5900, '1 Ltr', NOW() - INTERVAL '3 days', 7500, 13500, 7600, NOW(), NOW()),
('RET008', 'Prime Seeds', 'Prime Seeds & Fertilizers', 'Ratlam', 'DIST005', 'RST Distributors', 'FGINVAG0001', 'Agrosatva (Gran.)', 'AGR-5KG', 'Agrosatva (Gran.)', 850, '5 Kg', NOW() - INTERVAL '7 days', 1100, 1950, 1100, NOW(), NOW()),
('RET008', 'Prime Seeds', 'Prime Seeds & Fertilizers', 'Ratlam', 'DIST005', 'RST Distributors', 'FGBIO001', 'BioGrow Plus', 'BIO-500ML', 'BioGrow Plus', 350, '500 ML', NOW() - INTERVAL '6 days', 450, 800, 450, NOW(), NOW());

-- Add some stock verification history entries
INSERT INTO stock_verification_history (
  retailer_id,
  verification_date,
  skus_checked,
  total_skus_count,
  verified_by_name,
  verified_by_role,
  proof_type,
  created_at
) VALUES
('RET001', NOW() - INTERVAL '10 days', '[{"sku_name": "Agrosatva", "sku_code": "AGR-1L", "verified_stock": 8500}]', 1, 'Rajesh Kumar', 'MDO', 'E-Signature', NOW() - INTERVAL '10 days'),
('RET001', NOW() - INTERVAL '20 days', '[{"sku_name": "Agrosatva (Gran.)", "sku_code": "AGR-5KG", "verified_stock": 1200}]', 1, 'Priya Sharma', 'TSM', 'Photo + E-Signature', NOW() - INTERVAL '20 days'),
('RET002', NOW() - INTERVAL '15 days', '[{"sku_name": "Agrosatva", "sku_code": "AGR-1L", "verified_stock": 6000}]', 1, 'Amit Patel', 'SO', 'E-Signature', NOW() - INTERVAL '15 days'),
('RET003', NOW() - INTERVAL '12 days', '[{"sku_name": "BioGrow Plus", "sku_code": "BIO-500ML", "verified_stock": 400}]', 1, 'Rajesh Kumar', 'MDO', 'Photo', NOW() - INTERVAL '12 days'),
('RET004', NOW() - INTERVAL '8 days', '[{"sku_name": "Agrosatva", "sku_code": "AGR-1L", "verified_stock": 7200}]', 1, 'Sneha Reddy', 'TSM', 'E-Signature', NOW() - INTERVAL '8 days');

-- Create the stock_verification_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS stock_verification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id text NOT NULL,
  verification_date timestamptz DEFAULT now(),
  skus_checked jsonb NOT NULL,
  total_skus_count integer DEFAULT 0,
  verified_by_name text NOT NULL,
  verified_by_role text NOT NULL,
  proof_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE stock_verification_history ENABLE ROW LEVEL SECURITY;

-- Add policies for the new table
CREATE POLICY "Anyone can read stock verification history"
  ON stock_verification_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert stock verification history"
  ON stock_verification_history FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_verification_history_retailer ON stock_verification_history(retailer_id);
CREATE INDEX IF NOT EXISTS idx_stock_verification_history_date ON stock_verification_history(verification_date DESC);

-- Display summary of inserted data
SELECT 
  'Retailer Inventory Records Inserted' as summary,
  COUNT(*) as total_records,
  COUNT(DISTINCT retailer_id) as unique_retailers,
  COUNT(DISTINCT product_code) as unique_products
FROM retailer_inventory;