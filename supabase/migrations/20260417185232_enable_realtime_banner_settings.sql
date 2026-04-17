/*
  # Enable Realtime on banner_settings

  Adds banner_settings to the realtime publication so that
  the homepage can listen for live changes to shop settings.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE banner_settings;
