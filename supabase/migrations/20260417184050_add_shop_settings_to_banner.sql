/*
  # Add shop control settings to banner_settings

  ## Changes
  - Add `disable_out_of_stock` boolean column to banner_settings (default false)
    - When true: products with stock = 0 show as unavailable and cannot be added to cart
  - Add `disable_zero_price` boolean column to banner_settings (default false)
    - When true: products with price = 0 show as unavailable and cannot be added to cart
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banner_settings' AND column_name = 'disable_out_of_stock'
  ) THEN
    ALTER TABLE banner_settings ADD COLUMN disable_out_of_stock boolean DEFAULT false NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banner_settings' AND column_name = 'disable_zero_price'
  ) THEN
    ALTER TABLE banner_settings ADD COLUMN disable_zero_price boolean DEFAULT false NOT NULL;
  END IF;
END $$;
