/*
# Fix admin read policy for user_profiles

1. Changes
  - Drop and recreate the "Admins can read all user_profiles" policy
  - New policy checks BOTH app_metadata is_admin flag AND admin_users table
  - This ensures admins can always read all profiles even if JWT metadata check is delayed

2. Security
  - Policy still requires authenticated role
  - Checks either app_metadata or admin_users table membership
*/

DROP POLICY IF EXISTS "Admins can read all user_profiles" ON user_profiles;
CREATE POLICY "Admins can read all user_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true
    OR EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update all user_profiles" ON user_profiles;
CREATE POLICY "Admins can update all user_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true
    OR EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true
    OR EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );
