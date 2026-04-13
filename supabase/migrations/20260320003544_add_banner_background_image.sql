/*
  # Adicionar campo de imagem de fundo para o banner

  1. Alterações
    - Adiciona coluna `background_image_url` na tabela `banner_settings`
    - Permite armazenar URL da imagem de fundo do banner da home
  
  2. Segurança
    - Não afeta as políticas RLS existentes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banner_settings' AND column_name = 'background_image_url'
  ) THEN
    ALTER TABLE banner_settings ADD COLUMN background_image_url text;
  END IF;
END $$;