-- Referral program: every profile gets a stable invite code, new accounts that
-- arrive through an invite link are linked to the inviter, and users can read
-- an aggregate summary of their invites without seeing other people's data.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_referral_code_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_referral_code_format
  CHECK (referral_code IS NULL OR referral_code ~ '^[A-Z0-9]{4,16}$');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON public.profiles(referral_code)
  WHERE referral_code IS NOT NULL;

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_unique
  ON public.referrals(referred_id)
  WHERE referred_id IS NOT NULL;

-- Codes avoid ambiguous characters (0/O, 1/I/L) so they survive being read aloud.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SET search_path = public, pg_catalog
AS $$
DECLARE
  alphabet CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate TEXT;
  i INTEGER;
BEGIN
  LOOP
    candidate := 'FB';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;

-- Existing members get a code too so they can invite friends immediately.
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  invite_code TEXT := upper(LEFT(NEW.raw_user_meta_data->>'referral_code', 16));
  inviter_id UUID;
BEGIN
  IF invite_code IS NULL OR invite_code !~ '^[A-Z0-9]{4,16}$' THEN
    invite_code := NULL;
  ELSE
    SELECT id INTO inviter_id FROM public.profiles WHERE referral_code = invite_code AND id <> NEW.id;
    IF inviter_id IS NULL THEN
      invite_code := NULL;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, name, email, role, acquisition_source, acquisition_medium,
    acquisition_campaign, acquisition_content, acquisition_term,
    landing_path, app_language, browser_locale, time_zone,
    referral_code, referred_by_code
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
    LEFT(NEW.raw_user_meta_data->>'time_zone', 60),
    public.generate_referral_code(),
    invite_code
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
        time_zone = COALESCE(public.profiles.time_zone, EXCLUDED.time_zone),
        referral_code = COALESCE(public.profiles.referral_code, EXCLUDED.referral_code),
        referred_by_code = COALESCE(public.profiles.referred_by_code, EXCLUDED.referred_by_code);

  IF inviter_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, code, status)
    VALUES (inviter_id, NEW.id, invite_code, 'signed_up')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- An invite counts as "activated" once the invited person creates a plan.
CREATE OR REPLACE FUNCTION public.handle_referral_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.referrals
  SET status = 'activated',
      activated_at = COALESCE(activated_at, NOW()),
      completed_at = COALESCE(completed_at, NOW())
  WHERE referred_id = NEW.user_id
    AND status <> 'activated';
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_referral_activation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_plan_created_activate_referral ON public.plans;
CREATE TRIGGER on_plan_created_activate_referral
  AFTER INSERT ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_activation();

-- Aggregate view for the signed-in member; never exposes who the invitees are.
CREATE OR REPLACE FUNCTION public.get_referral_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
DECLARE
  uid UUID := auth.uid();
  code TEXT;
  invited INTEGER;
  activated INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT referral_code INTO code FROM public.profiles WHERE id = uid;
  IF code IS NULL THEN
    code := public.generate_referral_code();
    UPDATE public.profiles SET referral_code = code WHERE id = uid AND referral_code IS NULL;
    SELECT referral_code INTO code FROM public.profiles WHERE id = uid;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'activated')
  INTO invited, activated
  FROM public.referrals
  WHERE referrer_id = uid AND referred_id IS NOT NULL;

  RETURN jsonb_build_object('code', code, 'invited', invited, 'activated', activated);
END;
$$;

REVOKE ALL ON FUNCTION public.get_referral_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_referral_summary() TO authenticated;
