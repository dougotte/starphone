/*
  # Fix create_admin_user function to use correct column name

  ## Changes
  - Drop and recreate create_admin_user function
  - admin_credentials table has column "username" (not "email")
  - Function now inserts into username column correctly
  - auth.users still uses a generated internal email for compatibility
*/

DROP FUNCTION IF EXISTS public.create_admin_user(text, text, text);

CREATE OR REPLACE FUNCTION public.create_admin_user(p_username text, p_password text, p_name text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
  v_fake_email TEXT;
BEGIN
  v_fake_email := p_username || '@admin.internal';

  IF EXISTS (SELECT 1 FROM admin_credentials WHERE username = p_username) THEN
    RETURN QUERY SELECT false, 'Usuário já existe';
    RETURN;
  END IF;

  v_password_hash := crypt(p_password, gen_salt('bf'));

  INSERT INTO admin_credentials (username, password_hash, name)
  VALUES (p_username, v_password_hash, p_name);

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_fake_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'is_admin', true),
    jsonb_build_object('name', p_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE
  SET raw_app_meta_data = jsonb_set(
    COALESCE(auth.users.raw_app_meta_data, '{}'::jsonb),
    '{is_admin}',
    'true'::jsonb
  );

  RETURN QUERY SELECT true, 'Admin criado com sucesso';
END;
$$;
