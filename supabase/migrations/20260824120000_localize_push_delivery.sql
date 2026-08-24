ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS notification_hour SMALLINT NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS last_notified_on DATE;

ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_language_check,
  ADD CONSTRAINT push_subscriptions_language_check CHECK (language IN ('tr', 'en', 'es')),
  DROP CONSTRAINT IF EXISTS push_subscriptions_notification_hour_check,
  ADD CONSTRAINT push_subscriptions_notification_hour_check CHECK (notification_hour BETWEEN 7 AND 21);

COMMENT ON COLUMN public.push_subscriptions.timezone IS
  'IANA time zone supplied by the user device; used only to schedule local reminders.';

COMMENT ON COLUMN public.push_subscriptions.last_notified_on IS
  'Last local calendar date on which a notification was delivered.';
