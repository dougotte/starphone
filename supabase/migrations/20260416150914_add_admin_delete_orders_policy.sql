/*
  # Add admin DELETE policy for orders

  ## Problem
  Admins could not delete orders because there was no DELETE RLS policy for admin users.
  The delete appeared to succeed on the frontend but the row was never removed.

  ## Changes
  - Add DELETE policy on orders table for admin users (those with is_admin in app_metadata)
*/

CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true)
  );
