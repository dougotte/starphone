/*
  # Corrigir Políticas RLS da Tabela Orders

  1. Alterações
    - Remove políticas duplicadas
    - Cria políticas corretas para inserção e atualização de pedidos
    - Permite que usuários criem e atualizem seus próprios pedidos
  
  2. Segurança
    - Usuários podem ver apenas seus próprios pedidos
    - Usuários podem criar pedidos
    - Usuários podem atualizar seus próprios pedidos (para confirmar pagamento)
    - Admins podem ver todos os pedidos
*/

-- Drop todas as políticas existentes
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Usuários podem ver seus próprios pedidos
CREATE POLICY "Users view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuários podem criar pedidos
CREATE POLICY "Users create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios pedidos
CREATE POLICY "Users update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os pedidos
CREATE POLICY "Admins view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins podem atualizar todos os pedidos
CREATE POLICY "Admins update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
