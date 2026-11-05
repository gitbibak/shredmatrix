-- Self-reported "how did you hear about Full Balance?" answer. Optional,
-- one value per member, editable only by the member; admins read it through
-- the existing profiles_select_access policy.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS heard_from TEXT,
  ADD COLUMN IF NOT EXISTS heard_from_at TIMESTAMPTZ;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_heard_from_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_heard_from_check
  CHECK (heard_from IS NULL OR heard_from IN (
    'instagram', 'tiktok', 'youtube', 'google', 'ai_assistant', 'friend', 'forum', 'other'
  ));

GRANT UPDATE (heard_from, heard_from_at) ON public.profiles TO authenticated;
