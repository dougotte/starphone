/*
  # Criar Bucket de Armazenamento para Imagens

  1. Novo Bucket
    - Cria bucket 'banners' para armazenar imagens de banners
    - Configurado como público para permitir acesso direto às imagens
  
  2. Políticas de Segurança
    - Qualquer pessoa pode visualizar imagens
    - Apenas admins podem fazer upload e deletar imagens
*/

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public can view banner images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'banners');

-- Allow admins to upload
CREATE POLICY "Admins can upload banner images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true
    )
  );

-- Allow admins to delete
CREATE POLICY "Admins can delete banner images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true
    )
  );
