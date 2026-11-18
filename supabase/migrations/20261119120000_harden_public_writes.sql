-- Hardening from the 2026-11-19 audit. No app behaviour changes: every column and
-- limit below matches what the client already sends.

-- 1. Support tickets: visitors may only set the fields the form sends, within the
--    form's own length limits. Status, priority overrides and admin notes stay admin-only.
revoke insert on public.support_tickets from anon, authenticated;
grant insert (user_id, name, email, category, subject, message, priority, page_url, user_agent)
  on public.support_tickets to anon, authenticated;

alter table public.support_tickets drop constraint if exists support_tickets_sizes;
alter table public.support_tickets add constraint support_tickets_sizes check (
  char_length(subject) <= 160
  and char_length(message) <= 4000
  and (name is null or char_length(name) <= 120)
  and (email is null or char_length(email) <= 254)
  and (category is null or char_length(category) <= 32)
  and (page_url is null or char_length(page_url) <= 2000)
  and (user_agent is null or char_length(user_agent) <= 1000)
) not valid;

-- 2. Reviews: the app never edits a submitted review, so only admins may update one.
--    This stops a review being swapped between moderation and approval.
drop policy if exists testimonials_update_access on public.testimonials;
drop policy if exists testimonials_update_admin on public.testimonials;
create policy testimonials_update_admin on public.testimonials
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

--    Signed-out visitors can read the published text, not who wrote it.
revoke select on public.testimonials from anon;
grant select (id, rating, body, result_summary, language, display_name, status, consent_public, created_at)
  on public.testimonials to anon;

-- 3. Push endpoints must belong to a real browser push service, so the reminder
--    job never posts to an arbitrary host.
alter table public.push_subscriptions drop constraint if exists push_endpoint_known_service;
alter table public.push_subscriptions add constraint push_endpoint_known_service check (
  endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)/'
) not valid;

-- 4. Referral rows are written only by the server-side triggers; members could
--    otherwise forge "activated" invites.
drop policy if exists referrals_insert_own on public.referrals;
drop policy if exists referrals_update_linked on public.referrals;
drop policy if exists referrals_delete_own on public.referrals;
revoke insert, update, delete on public.referrals from anon, authenticated;
