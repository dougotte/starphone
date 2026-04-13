/*
  # Adicionar Configurações de Banner e Status de Pedidos

  1. Nova Tabela
    - `banner_settings` - Configurações do banner da home
      - `id` (uuid, primary key)
      - `title` (text) - Título principal
      - `subtitle` (text) - Subtítulo
      - `location_info` (text) - Informações de localização
      - `updated_at` (timestamptz) - Data de atualização

  2. Alterações
    - Adicionar campo `admin_notes` na tabela `orders`
    - Adicionar campo `status` na tabela `orders` para controle do admin

  3. Segurança
    - RLS habilitado em `banner_settings`
    - Apenas admins podem editar
    - Todos podem visualizar
*/

-- Criar tabela de configurações do banner
CREATE TABLE IF NOT EXISTS banner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'PEÇAS & ACESSÓRIOS',
  subtitle text NOT NULL DEFAULT 'Hardware de qualidade para o seu celular',
  location_info text NOT NULL DEFAULT 'Conchal - SP • (19) 99562-7428',
  updated_at timestamptz DEFAULT now()
);

-- Inserir configuração padrão se não existir
INSERT INTO banner_settings (title, subtitle, location_info)
SELECT 'PEÇAS & ACESSÓRIOS', 'Hardware de qualidade para o seu celular', 'Conchal - SP • (19) 99562-7428'
WHERE NOT EXISTS (SELECT 1 FROM banner_settings LIMIT 1);

-- Habilitar RLS
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- Política para todos visualizarem
CREATE POLICY "Public can view banner settings"
ON banner_settings
FOR SELECT
TO public
USING (true);

-- Política para admins editarem
CREATE POLICY "Admins can update banner settings"
ON banner_settings
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true)
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Adicionar campos na tabela orders se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN admin_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
