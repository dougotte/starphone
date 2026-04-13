/*
  # Add Admin Login Function

  1. New Functions
    - `verify_admin_login` - Verifies admin credentials and returns admin data
  
  2. Security
    - Function is accessible to anyone (needed for login)
    - Uses bcrypt to verify password hash
*/

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_credentials;
BEGIN
  SELECT * INTO admin_record
  FROM admin_credentials
  WHERE username = p_username
  AND password_hash = crypt(p_password, password_hash);

  IF admin_record.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', admin_record.id,
    'username', admin_record.username,
    'name', admin_record.name
  );
END;
$$;
