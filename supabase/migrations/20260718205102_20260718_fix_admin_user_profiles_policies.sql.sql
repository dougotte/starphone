/*
  # Fix admin RLS policies for user_profiles

  The previous migration checked `raw_app_meta_data->>'role' = 'admin'`,
  but admin users in this project are identified by
  `raw_app_meta_data->>'is_admin' = 'true'` (boolean), matching the
  existing products/orders admin policies.

  This drops and recreates the admin read/update policies on
  user_profiles using the correct `is_admin` flag so the admin panel's
  Clientes tab can list all clients and toggle their purchase lock.

  User-scoped policies are left untouched.
*/

DROP POLICY IF EXISTS "Admins can read all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user_profiles" ON user_profiles;

CREATE POLICY "Admins can read all user_profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Admins can update all user_profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
