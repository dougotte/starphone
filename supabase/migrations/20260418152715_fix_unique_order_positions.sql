/*
  # Fix duplicate order_position values in products table

  ## Problem
  Multiple products share the same order_position value (317 products but only 313 unique positions),
  causing non-deterministic sort order in both the admin panel and home page.

  ## Fix
  Reassign all order_position values to be globally unique integers from 1 to N,
  preserving the existing relative ordering (sorted by current order_position then created_at).
*/

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_position ASC, created_at ASC) AS new_pos
  FROM products
)
UPDATE products
SET order_position = ranked.new_pos
FROM ranked
WHERE products.id = ranked.id;
