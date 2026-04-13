/*
  # Simplificar e Corrigir Políticas RLS para Admin

  1. Alterações
    - Remove políticas antigas que podem estar causando conflitos
    - Cria políticas mais simples e diretas
    - Garante que admins possam fazer todas as operações
  
  2. Segurança
    - Verifica is_admin no raw_app_meta_data
    - Políticas separadas para usuários normais e admins
*/

-- PRODUTOS: Drop e recriar políticas
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;

-- Todos podem ver produtos
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Apenas admins podem inserir produtos
CREATE POLICY "Admins insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Apenas admins podem atualizar produtos
CREATE POLICY "Admins update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Apenas admins podem deletar produtos
CREATE POLICY "Admins delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- CATEGORIAS: Drop e recriar políticas
DROP POLICY IF EXISTS "Admins can insert categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON product_categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON product_categories;

-- Todos podem ver categorias ativas
CREATE POLICY "Public view active categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins podem inserir categorias
CREATE POLICY "Admins insert categories"
  ON product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins podem atualizar categorias
CREATE POLICY "Admins update categories"
  ON product_categories
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins podem deletar categorias
CREATE POLICY "Admins delete categories"
  ON product_categories
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- BANNERS: Drop e recriar políticas
DROP POLICY IF EXISTS "Admins can insert banners" ON home_banners;
DROP POLICY IF EXISTS "Admins can update banners" ON home_banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON home_banners;
DROP POLICY IF EXISTS "Anyone can view active banners" ON home_banners;

-- Todos podem ver banners ativos
CREATE POLICY "Public view active banners"
  ON home_banners
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins podem inserir banners
CREATE POLICY "Admins insert banners"
  ON home_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins podem atualizar banners
CREATE POLICY "Admins update banners"
  ON home_banners
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admins podem deletar banners
CREATE POLICY "Admins delete banners"
  ON home_banners
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
