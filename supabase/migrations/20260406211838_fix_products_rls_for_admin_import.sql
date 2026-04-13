/*
  # Fix Products RLS for Admin Import

  1. Changes
    - Drop existing INSERT policy for products
    - Create new INSERT policy that allows authenticated admins to insert products
    - Verify admin status using app_metadata
  
  2. Security
    - Only authenticated users with is_admin = true in app_metadata can insert
    - Maintains security while allowing CSV import functionality
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Admins can insert products" ON products;

-- Create new INSERT policy for admins
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role' = 'authenticated') AND
    (auth.jwt()->'app_metadata'->>'is_admin')::boolean = true
  );