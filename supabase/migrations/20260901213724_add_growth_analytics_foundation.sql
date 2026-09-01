-- Additive growth analytics foundation. Anonymous events remain on-device until
-- authentication, so the Data API never accepts unauthenticated analytics writes.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_source TEXT,
  ADD COLUMN IF NOT EXISTS first_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_referral_code TEXT,
  ADD COLUMN IF NOT EXISTS first_creator_code TEXT,
  ADD COLUMN IF NOT EXISTS first_landing_page TEXT;

UPDATE public.profiles
SET first_source = COALESCE(first_source, acquisition_source),
    first_medium = COALESCE(first_medium, acquisition_medium),
    first_campaign = COALESCE(first_campaign, acquisition_campaign),
    first_referral_code = COALESCE(first_referral_code, referred_by_code),
    first_landing_page = COALESCE(first_landing_page, landing_path)
WHERE first_source IS NULL
   OR first_medium IS NULL
   OR first_campaign IS NULL
   OR first_referral_code IS NULL
   OR first_landing_page IS NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_first_referral_code_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_first_referral_code_format
  CHECK (first_referral_code IS NULL OR first_referral_code ~ '^[A-Z0-9]{4,16}$');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_first_creator_code_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_first_creator_code_format
  CHECK (first_creator_code IS NULL OR first_creator_code ~ '^[A-Z0-9_-]{4,40}$');

GRANT UPDATE (
  first_source, first_medium, first_campaign, first_referral_code,
  first_creator_code, first_landing_page
) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION private.analytics_properties_are_safe(properties JSONB)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN jsonb_typeof(properties) <> 'object' OR pg_column_size(properties) > 4096 THEN FALSE
    ELSE NOT EXISTS (
      SELECT 1
      FROM jsonb_each(properties) AS property(key, value)
      WHERE property.key ~* '(name|email|phone|weight|bmi|body|fat|allerg|health|condition|sleep_hours|message|subject|user_id)'
         OR jsonb_typeof(property.value) NOT IN ('string', 'number', 'boolean', 'null')
         OR length(property.value #>> '{}') > 100
    )
  END;
$$;

REVOKE ALL ON FUNCTION private.analytics_properties_are_safe(JSONB) FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_event_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_version SMALLINT NOT NULL DEFAULT 1,
  properties JSONB NOT NULL DEFAULT '{}'::JSONB,
  page_path TEXT,
  app_language TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT growth_events_event_name_format
    CHECK (event_name ~ '^[a-z][a-z0-9_]{0,39}$'),
  CONSTRAINT growth_events_event_version_range
    CHECK (event_version BETWEEN 1 AND 100),
  CONSTRAINT growth_events_page_path_length
    CHECK (page_path IS NULL OR length(page_path) <= 160),
  CONSTRAINT growth_events_language_check
    CHECK (app_language IS NULL OR app_language IN ('tr', 'en', 'es')),
  CONSTRAINT growth_events_properties_safe
    CHECK (private.analytics_properties_are_safe(properties)),
  CONSTRAINT growth_events_occurred_at_range
    CHECK (occurred_at >= TIMESTAMPTZ '2025-01-01' AND occurred_at <= NOW() + INTERVAL '1 day')
);

ALTER TABLE public.growth_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own growth events" ON public.growth_events;
CREATE POLICY "Users insert own growth events"
  ON public.growth_events
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own growth events" ON public.growth_events;
CREATE POLICY "Users read own growth events"
  ON public.growth_events
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT private.is_admin()));

REVOKE ALL ON public.growth_events FROM PUBLIC, anon, authenticated;
GRANT INSERT, SELECT ON public.growth_events TO authenticated;
GRANT ALL ON public.growth_events TO service_role;

CREATE INDEX IF NOT EXISTS idx_growth_events_user_occurred
  ON public.growth_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_events_name_occurred
  ON public.growth_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_events_anonymous_id
  ON public.growth_events(anonymous_id);

COMMENT ON TABLE public.growth_events IS
  'Privacy-filtered product events. No health measurements or direct identifiers.';
COMMENT ON COLUMN public.growth_events.anonymous_id IS
  'Random device identifier used to connect pre-auth events after sign-in.';
