/*
  # Corrigir Metadata do Admin

  1. Alterações
    - Remove e recria funções admin_login e create_admin_user
    - Define is_admin = true no metadata do usuário
    - Atualiza usuários admin existentes
  
  2. Segurança
    - A flag is_admin é armazenada em raw_app_meta_data (não pode ser alterada pelo cliente)
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS admin_login(TEXT, TEXT);
DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT);

-- Recriar função de login admin para definir is_admin
CREATE FUNCTION admin_login(login_email TEXT, login_password TEXT)
RETURNS TABLE(user_id UUID, email TEXT, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_admin_credential admin_credentials;
  v_auth_user auth.users;
  v_user_id UUID;
BEGIN
  -- Buscar credencial de admin
  SELECT * INTO v_admin_credential
  FROM admin_credentials
  WHERE admin_credentials.email = login_email
  AND admin_credentials.is_active = true;

  -- Verificar se admin existe
  IF v_admin_credential.id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Admin não encontrado';
    RETURN;
  END IF;

  -- Verificar senha
  IF v_admin_credential.password_hash != crypt(login_password, v_admin_credential.password_hash) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Senha incorreta';
    RETURN;
  END IF;

  -- Buscar ou criar usuário no auth.users
  SELECT * INTO v_auth_user
  FROM auth.users
  WHERE auth.users.email = login_email;

  IF v_auth_user.id IS NULL THEN
    -- Criar usuário se não existir
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
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
      login_email,
      crypt(login_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'is_admin', true),
      jsonb_build_object('name', v_admin_credential.name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;
  ELSE
    v_user_id := v_auth_user.id;
    
    -- Atualizar metadata para garantir que is_admin está definido
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{is_admin}',
      'true'::jsonb
    ),
    last_sign_in_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Atualizar último login
  UPDATE admin_credentials
  SET last_login_at = NOW()
  WHERE id = v_admin_credential.id;

  RETURN QUERY SELECT v_user_id, login_email, true, 'Login realizado com sucesso';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar função de criar admin
CREATE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_password_hash TEXT;
  v_user_id UUID;
BEGIN
  -- Verificar se já existe
  IF EXISTS (SELECT 1 FROM admin_credentials WHERE email = admin_email) THEN
    RETURN QUERY SELECT false, 'Admin já existe';
    RETURN;
  END IF;

  -- Criar hash da senha
  v_password_hash := crypt(admin_password, gen_salt('bf'));

  -- Inserir credencial de admin
  INSERT INTO admin_credentials (email, password_hash, name)
  VALUES (admin_email, v_password_hash, admin_name);

  -- Criar usuário no auth.users com is_admin
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
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'is_admin', true),
    jsonb_build_object('name', admin_name),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar usuários admin existentes para ter is_admin = true
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email IN (SELECT email FROM admin_credentials);
