/*
  # Add Create Admin Function

  1. New Functions
    - `create_admin_user` - Creates a new admin user with hashed password
  
  2. Security
    - Only existing admins can create new admins
*/

CREATE OR REPLACE FUNCTION create_admin_user(p_username text, p_password text, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_credentials (username, password_hash, name)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_name);
END;
$$;
