-- The deployed client now uses an own-profile role check and the authenticated
-- delete-account Edge Function. Keep these legacy functions inaccessible via
-- the public Data API so they cannot bypass the newer authorization flow.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC, anon, authenticated;
