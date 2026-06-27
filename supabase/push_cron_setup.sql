-- ══════════════════════════════════════════════
-- Full Balance — Push Notification Cron Setup
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Schedule push notifications — runs every hour at minute 0
-- This calls the send-push Edge Function every hour
SELECT cron.schedule(
  'send-push-notifications',  -- job name
  '0 * * * *',                -- every hour at :00
  $$
  SELECT net.http_post(
    url := 'https://ildknnvlhpipzakiadys.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ══════════════════════════════════════════════
-- OPTIONAL: Additional schedules
-- ══════════════════════════════════════════════

-- Morning motivation (08:00 Turkey = 05:00 UTC)
SELECT cron.schedule(
  'morning-push',
  '0 5 * * *',  -- 05:00 UTC = 08:00 Turkey
  $$
  SELECT net.http_post(
    url := 'https://ildknnvlhpipzakiadys.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := '{"category": "workout"}'::jsonb
  );
  $$
);

-- Evening reminder (21:00 Turkey = 18:00 UTC)
SELECT cron.schedule(
  'evening-push',
  '0 18 * * *',  -- 18:00 UTC = 21:00 Turkey
  $$
  SELECT net.http_post(
    url := 'https://ildknnvlhpipzakiadys.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := '{"category": "sleep"}'::jsonb
  );
  $$
);

-- ══════════════════════════════════════════════
-- View scheduled jobs
-- ══════════════════════════════════════════════
-- SELECT * FROM cron.job;

-- ══════════════════════════════════════════════
-- To remove a job:
-- SELECT cron.unschedule('send-push-notifications');
-- ══════════════════════════════════════════════
