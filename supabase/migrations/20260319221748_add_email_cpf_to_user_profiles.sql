/*
  # Add Email and CPF to User Profiles

  1. Changes
    - Add `email` column to `user_profiles` table
    - Add `cpf` column to `user_profiles` table

  2. Notes
    - Using DO blocks to check if columns exist before adding them
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'cpf'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN cpf text;
  END IF;
END $$;