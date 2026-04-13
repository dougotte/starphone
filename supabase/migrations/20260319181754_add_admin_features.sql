/*
  # Add Admin Features

  1. New Tables
    - `admin_credentials` - Stores admin username and password (separate from auth.users)
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `home_banners` - Stores banner information for home page
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `image_url` (text)
      - `is_active` (boolean)
      - `order_position` (integer)
      - `created_at` (timestamp)
    
    - `product_categories` - Custom categories/tabs that can be created
      - `id` (uuid, primary key)
      - `name` (text)
      - `icon` (text)
      - `color` (text) - Background color for the category
      - `order_position` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Updates to Products Table
    - Add `description` column
    - Add `image_url` column
    - Add `stock` column

  3. Security
    - Enable RLS on all new tables
    - Add policies for admin access
*/

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin credentials"
  ON admin_credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert admin credentials"
  ON admin_credentials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update admin credentials"
  ON admin_credentials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete admin credentials"
  ON admin_credentials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create home_banners table
CREATE TABLE IF NOT EXISTS home_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON home_banners FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Only admins can insert banners"
  ON home_banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update banners"
  ON home_banners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete banners"
  ON home_banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text DEFAULT '📱',
  color text DEFAULT '#000000',
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON product_categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Only admins can insert categories"
  ON product_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update categories"
  ON product_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON product_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Update products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE products ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock integer DEFAULT 0;
  END IF;
END $$;

-- Insert default admin user
INSERT INTO admin_credentials (username, password_hash, name)
VALUES ('StaphoneConchal', crypt('StarphoneGeral2026', gen_salt('bf')), 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- Insert default categories with colors
INSERT INTO product_categories (name, icon, color, order_position) VALUES
  ('iPhone', '🍎', '#000000', 1),
  ('Samsung', '📱', '#1428A0', 2),
  ('Motorola', '📱', '#E4002B', 3),
  ('Xiaomi', '📱', '#FF6900', 4),
  ('Infinix', '📱', '#6C63FF', 5),
  ('Realme', '📱', '#FFC600', 6),
  ('LG', '📱', '#A50034', 7),
  ('Tablet', '📱', '#00A8E1', 8),
  ('Outros', '📱', '#6B7280', 9)
ON CONFLICT DO NOTHING;
