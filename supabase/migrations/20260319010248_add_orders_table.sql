/*
  # Add Orders Table

  ## New Table
  - `orders` - Stores customer orders
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `items` (jsonb) - Order items (product details and quantities)
    - `customer_name` (text) - Customer full name
    - `customer_email` (text) - Customer email
    - `customer_phone` (text) - Customer phone
    - `customer_cpf` (text) - Customer CPF
    - `cep` (text) - Customer postal code
    - `street` (text) - Street address
    - `number` (text) - Address number
    - `complement` (text) - Additional address info
    - `neighborhood` (text) - Neighborhood
    - `city` (text) - City
    - `state` (text) - State
    - `total_amount` (numeric) - Total order amount
    - `payment_method` (text) - PIX or Dinheiro
    - `status` (text) - pending, completed, cancelled
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled for secure access
  - Users can only view their own orders
  - Public read access for admin (via separate policy)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  items jsonb NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_cpf text NOT NULL,
  cep text NOT NULL,
  street text NOT NULL,
  number text NOT NULL,
  complement text DEFAULT '',
  neighborhood text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
