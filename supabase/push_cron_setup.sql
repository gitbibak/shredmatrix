-- ══════════════════════════════════════════════
-- Full Balance — Push Notification Cron Setup
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Create a dedicated encrypted secret for database-to-function calls.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'push_cron_secret') THEN
    PERFORM vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'push_cron_secret',
      'Authenticates scheduled send-push calls'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_push_cron_secret(candidate text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT candidate IS NOT NULL
    AND length(candidate) >= 32
    AND EXISTS (
      SELECT 1
      FROM vault.decrypted_secrets
      WHERE name = 'push_cron_secret'
        AND decrypted_secret = candidate
    );
$$;

REVOKE ALL ON FUNCTION public.verify_push_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_push_cron_secret(text) TO service_role;

-- 4. Schedule push notifications — runs every hour at minute 0
-- This calls the send-push Edge Function every hour
SELECT cron.schedule(
  'send-push-notifications',  -- job name
  '0 * * * *',                -- every hour at :00
  $$
  SELECT net.http_post(
    url := 'https://ildknnvlhpipzakiadys.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- The function chooses the correct message for the current hour. Additional
-- morning/evening jobs would send duplicate notifications at those hours.

-- ══════════════════════════════════════════════
-- View scheduled jobs
-- ══════════════════════════════════════════════
-- SELECT * FROM cron.job;

-- ══════════════════════════════════════════════
-- To remove a job:
-- SELECT cron.unschedule('send-push-notifications');
-- ══════════════════════════════════════════════
