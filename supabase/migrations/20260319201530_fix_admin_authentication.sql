/*
  # Corrigir Autenticação Admin

  1. Alterações
    - Atualiza a função verify_admin_login para criar sessão real no Supabase Auth
    - Garante que o admin tenha is_admin = true no metadata
  
  2. Segurança
    - Usa auth.users para autenticação real
    - Define is_admin no app_metadata
*/

-- Recriar função de verificação e login admin
CREATE OR REPLACE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_credentials;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Verificar credenciais do admin
  SELECT * INTO admin_record
  FROM admin_credentials
  WHERE username = p_username
  AND password_hash = crypt(p_password, password_hash);

  -- Se não encontrou admin, retornar null
  IF admin_record.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Criar email fictício para o admin (usando username)
  v_user_email := p_username || '@starphoneadmin.local';

  -- Verificar se já existe usuário com esse email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email;

  -- Se não existir, criar usuário
  IF v_user_id IS NULL THEN
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
      v_user_email,
      crypt(p_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'is_admin', true),
      jsonb_build_object('name', admin_record.name, 'username', p_username),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;
  ELSE
    -- Atualizar metadata para garantir que is_admin está definido
    UPDATE auth.users
    SET 
      raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{is_admin}',
        'true'::jsonb
      ),
      last_sign_in_at = NOW(),
      encrypted_password = crypt(p_password, gen_salt('bf'))
    WHERE id = v_user_id;
  END IF;

  -- Retornar dados do admin incluindo email e user_id
  RETURN json_build_object(
    'id', admin_record.id,
    'user_id', v_user_id,
    'username', admin_record.username,
    'name', admin_record.name,
    'email', v_user_email
  );
END;
$$;
