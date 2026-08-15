-- Repair and authenticate the scheduled push notification pipeline.
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

SELECT cron.schedule(
  'send-push-notifications',
  '0 * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://ildknnvlhpipzakiadys.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $job$
);

DO $$
DECLARE
  duplicate_job_id bigint;
BEGIN
  FOR duplicate_job_id IN
    SELECT jobid FROM cron.job WHERE jobname IN ('morning-push', 'evening-push')
  LOOP
    PERFORM cron.unschedule(duplicate_job_id);
  END LOOP;
END;
$$;
