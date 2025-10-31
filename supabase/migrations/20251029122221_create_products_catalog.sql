/*
  # Create Products Catalog System

  ## Overview
  This migration creates a comprehensive products catalog with categories, products, and SKUs.
  It includes all Gencrest products organized by category (Biostimulant, Micronutrient, Super Speciality Fertilizer).

  ## New Tables
  
  ### `product_categories`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name
  - `description` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `products`
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key) - Links to product_categories
  - `product_code` (text, unique) - Unique product code (e.g., FGCMGM0092)
  - `product_name` (text) - Product display name
  - `description` (text, nullable)
  - `is_active` (boolean) - Active/inactive status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `product_skus`
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key) - Links to products
  - `sku_code` (text, unique) - SKU identifier
  - `sku_name` (text) - SKU display name (e.g., "250 ml", "1 Ltr", "5 Kg")
  - `unit_type` (text) - Unit of measurement (ml, ltr, kg, gm)
  - `unit_value` (numeric) - Numeric value of the unit
  - `price` (numeric, nullable) - Unit price
  - `is_active` (boolean) - Active/inactive status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read catalog data
  - Add policies for authorized users to manage catalog data

  ## Indexes
  - Index on product_code for fast lookups
  - Index on category_id for filtering
  - Index on sku_code for fast lookups
*/

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES product_categories(id) ON DELETE RESTRICT,
  product_code text UNIQUE NOT NULL,
  product_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_skus table
CREATE TABLE IF NOT EXISTS product_skus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku_code text UNIQUE NOT NULL,
  sku_name text NOT NULL,
  unit_type text NOT NULL,
  unit_value numeric NOT NULL,
  price numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_product_skus_code ON product_skus(sku_code);
CREATE INDEX IF NOT EXISTS idx_product_skus_active ON product_skus(is_active);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Anyone can view product categories"
  ON product_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert product categories"
  ON product_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product categories"
  ON product_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for product_skus
CREATE POLICY "Anyone can view active SKUs"
  ON product_skus FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all SKUs"
  ON product_skus FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert SKUs"
  ON product_skus FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SKUs"
  ON product_skus FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert product categories
INSERT INTO product_categories (name, description) VALUES
  ('Biostimulant', 'Biostimulant products for plant growth'),
  ('Micronutrient', 'Micronutrient fertilizers for plant nutrition'),
  ('Super Speciality Fertilizer', 'Specialized fertilizer products')
ON CONFLICT (name) DO NOTHING;

-- Insert products and SKUs from the catalog
DO $$
DECLARE
  v_biostimulant_id uuid;
  v_micronutrient_id uuid;
  v_super_speciality_id uuid;
  v_product_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO v_biostimulant_id FROM product_categories WHERE name = 'Biostimulant';
  SELECT id INTO v_micronutrient_id FROM product_categories WHERE name = 'Micronutrient';
  SELECT id INTO v_super_speciality_id FROM product_categories WHERE name = 'Super Speciality Fertilizer';

  -- Insert Agrosatva product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'FGCMGM0092', 'Agrosatva')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0092-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0091-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0093-1LTR', '1 Ltr', 'ltr', 1),
      (v_product_id, 'FGCMGM0095-250ML', '250 ml', 'ml', 250)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agrobest product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'FGCMGM0096', 'Agrobest')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0096-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0097-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna Mah Gr.2 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0098', 'Agropurna Mah Gr.2')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0098-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0099-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0100-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna Mah Gr.10 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0104', 'Agropurna Mah Gr.10')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0104-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0105-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0106-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna Mah Gr.9 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0107', 'Agropurna Mah Gr.9')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0107-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0108-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0109-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna GJ Gr.1 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0110', 'Agropurna GJ Gr.1')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0110-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0111-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0112-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna RJ Gr.1 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0116', 'Agropurna RJ Gr.1')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0116-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0117-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0118-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna AP Gr.2 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0119', 'Agropurna AP Gr.2')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0119-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0120-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0121-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna AP Gr.6 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0125', 'Agropurna AP Gr.6')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0125-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0126-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0127-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna TG Gr.2 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0128', 'Agropurna TG Gr.2')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0128-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0129-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0130-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna TG Gr.6 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0134', 'Agropurna TG Gr.6')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0134-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0135-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0136-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna KA Gr.1 (1) product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0137', 'Agropurna KA Gr.1 (1)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0137-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0138-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0139-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agropurna KA Gr.1 (3) product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGCMGM0140', 'Agropurna KA Gr.1 (3)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGCMGM0140-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGCMGM0141-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGCMGM0142-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert AgroPurna MP Gr-1 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_micronutrient_id, 'FGASM00092', 'AgroPurna MP Gr-1')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00092-250ML', '250 ml', 'ml', 250),
      (v_product_id, 'FGASM00093-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGASM00094-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Agrosatva (Gran.) product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'FGINVAG0001', 'Agrosatva (Gran.)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0001-5KG', '5 Kg', 'kg', 5),
      (v_product_id, 'FGINVAG0002-10KG', '10 Kg', 'kg', 10),
      (v_product_id, 'FGINVAG0009-25KG', '25 Kg', 'kg', 25),
      (v_product_id, 'FGINVAG0003-5KG', '5 Kg', 'kg', 5),
      (v_product_id, 'FGINVAG0001-30KG', '30 Kg', 'kg', 30)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert AgroBest (Gran.) product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'FGINVAG0004', 'AgroBest (Gran.)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0004-10KG', '10 Kg', 'kg', 10)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert MYCOGEN product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'FGINVAG0007', 'MYCOGEN')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0007-500GM', '500 GM', 'gm', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert SAMTA NPK products
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0025', 'SAMTA NPK (8:8:8 Sugarcane)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0025-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0024', 'SAMTA NPK (8:8:8 Sugarcane)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0024-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0021', 'SAMTA NPK (11:11:8 fortified with Zn, B)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0021-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0020', 'SAMTA NPK (11:11:8 fortified with Zn, B)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0020-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGINVAG0020-250ML', '250 ml', 'ml', 250)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta Boron product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0019', 'Samta Boron')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0019-1LTR', '1 Ltr', 'ltr', 1),
      (v_product_id, 'FGINVAG0008-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta NPK 7:21:00 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0023', 'Samta NPK 7:21:00')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0023-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0022', 'Samta NPK 7:21:0')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0022-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta ZOX product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINV00086', 'Samta ZOX')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINV00086-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINVAG0026', 'SAMTA ZOX')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINVAG0026-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00128', 'SAMTA ZOX')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00128-250ML', '250 ml', 'ml', 250)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert SAMTA MAGICAL product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINV00048', 'SAMTA MAGICAL (Calcium Nitrate fortified with Mg)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINV00048-1000ML', '1000 ml', 'ml', 1000)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINV00049', 'SAMTA MAGICAL (Calcium Nitrate fortified with Mg)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINV00049-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta KTS product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00056', 'Samta KTS')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00056-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00055', 'Samta KTS')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00055-500ML', '500 ml', 'ml', 500),
      (v_product_id, 'FGASM00055-250ML', '250 ml', 'ml', 250)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta NPK 6-0-18 product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00060', 'Samta NPK 6-0-18 fortified with Ca,Mg & Zn')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00060-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00059', 'Samta NPK 6-0-18 fortified with Ca,Mg & Zn')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00059-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert Samta Poly product
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00058', 'Samta Poly ( Amm Poly-phosphate) 10-34-00')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00058-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGASM00057', 'Samta Poly ( Amm Poly-phosphate) 10-34-00')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGASM00057-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert SAMTA UREA products
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINV00068', 'SAMTA UREA (32 %) Urea Ammonium Nitrate (32 % N)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINV00068-1LTR', '1 Ltr', 'ltr', 1)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_super_speciality_id, 'FGINV00069', 'SAMTA UREA (32 %) Urea Ammonium Nitrate (32 % N)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'FGINV00069-500ML', '500 ml', 'ml', 500)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  -- Insert bucket/gran products
  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'AGROSATVA-GRAN-30KG', 'Agrosatva (Gran.)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'AGROSATVA-GRAN-30KG-SKU', '30 Kg', 'kg', 30)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'AGROSATVA-GR-BUCKET', 'AgroSatva-GR ( Bucket)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'AGROSATVA-GR-BUCKET-10KG', '10 Kg', 'kg', 10)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

  INSERT INTO products (category_id, product_code, product_name)
  VALUES (v_biostimulant_id, 'AGROSATVA-GRAN', 'AgroSatva (Gran.)')
  ON CONFLICT (product_code) DO NOTHING
  RETURNING id INTO v_product_id;
  
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_skus (product_id, sku_code, sku_name, unit_type, unit_value) VALUES
      (v_product_id, 'AGROSATVA-GRAN-30KG-NEW', '30 Kg', 'kg', 30)
    ON CONFLICT (sku_code) DO NOTHING;
  END IF;

END $$;
