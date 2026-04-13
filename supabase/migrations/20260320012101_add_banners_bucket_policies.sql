/*
  # Adicionar Políticas de Storage para o Bucket Banners

  1. Alterações
    - Cria políticas de storage para o bucket 'banners'
    - Permite que admins façam upload de imagens de banner
  
  2. Segurança
    - Apenas admins autenticados podem fazer upload, update e delete
    - Todos podem visualizar as imagens (bucket é público)
*/

-- Remover políticas antigas do bucket banners se existirem
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;

-- Política para permitir que admins façam upload de imagens de banner
CREATE POLICY "Admins can upload banner images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que admins atualizem imagens de banner
CREATE POLICY "Admins can update banner images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
)
WITH CHECK (
  bucket_id = 'banners' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que admins deletem imagens de banner
CREATE POLICY "Admins can delete banner images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' AND
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Política para permitir que todos vejam as imagens de banner
CREATE POLICY "Public can view banner images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');