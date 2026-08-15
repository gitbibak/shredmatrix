-- Existing plans already contain the interface language. Backfill only this
-- reliable field; do not guess historical campaign sources.
UPDATE public.profiles AS profile
SET app_language = plan.plan_data->>'lang'
FROM public.plans AS plan
WHERE plan.user_id = profile.id
  AND profile.app_language IS NULL
  AND plan.plan_data->>'lang' IN ('tr', 'en', 'es');
