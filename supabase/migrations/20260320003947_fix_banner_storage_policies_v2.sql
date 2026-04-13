/*
  # Corrigir Políticas de Storage para Upload de Imagem de Banner

  1. Alterações
    - Redefine políticas de storage para o bucket product-images
    - Usa app_metadata do JWT para verificar se usuário é admin
  
  2. Segurança
    - Apenas admins autenticados podem fazer upload
    - Todos podem visualizar imagens públicas
*/

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

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