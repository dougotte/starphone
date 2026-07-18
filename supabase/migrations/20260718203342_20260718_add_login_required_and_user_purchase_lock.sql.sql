/*
  # Add login-to-view-prices and per-user purchase lock

  ## Changes
  1. banner_settings
     - Add `require_login_to_view_prices` boolean column (default false).
       When true, the storefront hides product prices and the "Add to cart"
       button for unauthenticated visitors, replacing them with a
       "Faça seu login para comprar" prompt.
  2. user_profiles
     - Add `purchase_locked` boolean column (default false).
       When true for a given user, even if they are logged in, the
       storefront hides prices/cart and shows an "Entre em contato para
       poder comprar" button linking to WhatsApp.
  3. Security (RLS)
     - Allow admin users to read and update all rows in user_profiles.
       Admins are identified by `raw_app_meta_data->>'role' = 'admin'`
       on auth.users, matching the existing admin_users policy pattern.
     - The existing user-scoped policies are preserved so a normal user
       can still read/update their own profile.

  ## Notes
  - Uses DO blocks with IF NOT EXISTS so the migration is idempotent and
    safe to re-run.
  - No data is dropped or renamed.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banner_settings' AND column_name = 'require_login_to_view_prices'
  ) THEN
    ALTER TABLE banner_settings ADD COLUMN require_login_to_view_prices boolean DEFAULT false NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'purchase_locked'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN purchase_locked boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Admins can read all user_profiles (needed for the Clientes tab in the admin panel)
DROP POLICY IF EXISTS "Admins can read all user_profiles" ON user_profiles;
CREATE POLICY "Admins can read all user_profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update all user_profiles (needed to toggle purchase_locked per user)
DROP POLICY IF EXISTS "Admins can update all user_profiles" ON user_profiles;
CREATE POLICY "Admins can update all user_profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );
