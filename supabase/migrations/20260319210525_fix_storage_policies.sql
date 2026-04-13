/*
  # Corrigir Políticas de Storage para Uploads

  1. Alterações
    - Remove políticas antigas que podem estar causando conflitos
    - Cria políticas corretas para upload de imagens
    - Permite que admins façam upload de imagens
  
  2. Segurança
    - Apenas admins autenticados podem fazer upload
    - Todos podem visualizar imagens públicas
*/

-- Drop políticas antigas do bucket product-images se existirem
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Política para permitir que admins façam upload de imagens
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que admins atualizem imagens
CREATE POLICY "Admins can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
)
WITH CHECK (
  bucket_id = 'product-images' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que admins deletem imagens
CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que todos vejam as imagens
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
