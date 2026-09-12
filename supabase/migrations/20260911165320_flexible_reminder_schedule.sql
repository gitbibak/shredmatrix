-- Additive: NULL settings retain the existing daily reminder.
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS reminder_settings jsonb;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_reminder_settings_object
  CHECK (reminder_settings IS NULL OR (jsonb_typeof(reminder_settings) = 'object' AND octet_length(reminder_settings::text) < 4096));

CREATE TABLE IF NOT EXISTS public.push_deliveries (
  subscription_id uuid NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('workout', 'water')),
  scheduled_time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subscription_id, local_date, kind, scheduled_time)
);
ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS push_deliveries_created_at_idx ON public.push_deliveries(created_at);
REVOKE ALL ON public.push_deliveries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.push_deliveries TO service_role;

SELECT cron.alter_job(jobid, schedule := '*/5 * * * *')
FROM cron.job WHERE jobname = 'send-push-notifications';

-- Rollback: restore the previous sender and hourly cron first. Leave additive
-- columns/table in place; no existing subscription or preference is destroyed.
