/*
  # Add order_position and segunda_opcao to products table

  1. Changes
    - Add `order_position` (integer) column to `products` table for manual ordering
    - Add `segunda_opcao` (text) column to `products` table for alphanumeric second option field
    - Initialize order_position with row_number based on created_at for existing products

  2. Notes
    - order_position default is 0
    - segunda_opcao default is empty string
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'order_position'
  ) THEN
    ALTER TABLE products ADD COLUMN order_position integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'segunda_opcao'
  ) THEN
    ALTER TABLE products ADD COLUMN segunda_opcao text DEFAULT '';
  END IF;
END $$;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM products
  WHERE order_position = 0
)
UPDATE products
SET order_position = numbered.rn
FROM numbered
WHERE products.id = numbered.id;
