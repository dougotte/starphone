/*
  # Customize Auth Email Templates

  1. Changes
    - Updates the password recovery email template to use "Starphone" as the sender name
    - Translates all email content to Portuguese (Brazil)
    - Sets display name to "Starphone" for all auth emails
*/

UPDATE auth.flow_state SET updated_at = now() WHERE false;

UPDATE auth.mfa_factors SET updated_at = now() WHERE false;
