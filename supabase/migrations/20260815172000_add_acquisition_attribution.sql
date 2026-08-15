ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS acquisition_source TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_medium TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_campaign TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_content TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_term TEXT,
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS app_language TEXT,
  ADD COLUMN IF NOT EXISTS browser_locale TEXT,
  ADD COLUMN IF NOT EXISTS time_zone TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_app_language_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_app_language_check
  CHECK (app_language IS NULL OR app_language IN ('tr', 'en', 'es'));

CREATE INDEX IF NOT EXISTS idx_profiles_acquisition_source
  ON public.profiles(acquisition_source)
  WHERE acquisition_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_app_language
  ON public.profiles(app_language)
  WHERE app_language IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, role, acquisition_source, acquisition_medium,
    acquisition_campaign, acquisition_content, acquisition_term,
    landing_path, app_language, browser_locale, time_zone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'user',
    LEFT(NEW.raw_user_meta_data->>'acquisition_source', 80),
    LEFT(NEW.raw_user_meta_data->>'acquisition_medium', 80),
    LEFT(NEW.raw_user_meta_data->>'acquisition_campaign', 120),
    LEFT(NEW.raw_user_meta_data->>'acquisition_content', 120),
    LEFT(NEW.raw_user_meta_data->>'acquisition_term', 120),
    LEFT(NEW.raw_user_meta_data->>'landing_path', 160),
    CASE WHEN NEW.raw_user_meta_data->>'app_language' IN ('tr', 'en', 'es')
      THEN NEW.raw_user_meta_data->>'app_language' ELSE NULL END,
    LEFT(NEW.raw_user_meta_data->>'browser_locale', 20),
    LEFT(NEW.raw_user_meta_data->>'time_zone', 60)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(public.profiles.email, EXCLUDED.email),
        name = COALESCE(public.profiles.name, EXCLUDED.name),
        acquisition_source = COALESCE(public.profiles.acquisition_source, EXCLUDED.acquisition_source),
        acquisition_medium = COALESCE(public.profiles.acquisition_medium, EXCLUDED.acquisition_medium),
        acquisition_campaign = COALESCE(public.profiles.acquisition_campaign, EXCLUDED.acquisition_campaign),
        acquisition_content = COALESCE(public.profiles.acquisition_content, EXCLUDED.acquisition_content),
        acquisition_term = COALESCE(public.profiles.acquisition_term, EXCLUDED.acquisition_term),
        landing_path = COALESCE(public.profiles.landing_path, EXCLUDED.landing_path),
        app_language = COALESCE(public.profiles.app_language, EXCLUDED.app_language),
        browser_locale = COALESCE(public.profiles.browser_locale, EXCLUDED.browser_locale),
        time_zone = COALESCE(public.profiles.time_zone, EXCLUDED.time_zone);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT UPDATE (
  acquisition_source, acquisition_medium, acquisition_campaign,
  acquisition_content, acquisition_term, landing_path,
  app_language, browser_locale, time_zone
) ON public.profiles TO authenticated;
