/*
  # Fix admin_users infinite recursion + wrong metadata key

  Problems:
  1. "Admins can view admin users" queries admin_users itself to verify
     admin status → infinite recursion (42P17) → 500 on every admin_users
     read. This breaks checkAdminStatus() in AuthContext, which cascades
     into the App.tsx auth guard redirecting admin-dashboard → home.
  2. "Admins can view all admin users" and "Admins can delete admin users"
     check raw_app_meta_data->>'role' = 'admin', but admins are created
     with is_admin = true (see create_admin_user function).

  Fix: replace all admin_users policies with the JWT is_admin check used
  by the working user_profiles admin policies.
*/

DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON admin_users;

CREATE POLICY "Admins can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Admins can insert admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Admins can update admin users"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY "Admins can delete admin users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
