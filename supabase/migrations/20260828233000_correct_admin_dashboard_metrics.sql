-- Restore legacy auth accounts whose profile trigger did not run.
insert into public.profiles (
  id,
  created_at,
  name,
  email,
  role,
  acquisition_source,
  acquisition_medium,
  acquisition_campaign,
  acquisition_content,
  acquisition_term,
  landing_path,
  app_language,
  browser_locale,
  time_zone
)
select
  users.id,
  users.created_at,
  coalesce(users.raw_user_meta_data->>'name', users.raw_user_meta_data->>'full_name', 'User'),
  users.email,
  'user',
  left(users.raw_user_meta_data->>'acquisition_source', 80),
  left(users.raw_user_meta_data->>'acquisition_medium', 80),
  left(users.raw_user_meta_data->>'acquisition_campaign', 120),
  left(users.raw_user_meta_data->>'acquisition_content', 120),
  left(users.raw_user_meta_data->>'acquisition_term', 120),
  left(users.raw_user_meta_data->>'landing_path', 160),
  case when users.raw_user_meta_data->>'app_language' in ('tr', 'en', 'es')
    then users.raw_user_meta_data->>'app_language' else null end,
  left(users.raw_user_meta_data->>'browser_locale', 20),
  left(users.raw_user_meta_data->>'time_zone', 60)
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null
  and users.deleted_at is null
on conflict (id) do nothing;

-- Aggregate-only dashboard endpoint. The authorization check is mandatory
-- because the function reads the non-exposed auth schema.
create or replace function public.get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
stable
set search_path = public, auth, private, pg_catalog
as $$
declare
  istanbul_today date := (now() at time zone 'Europe/Istanbul')::date;
  result jsonb;
begin
  if not private.is_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  with member_accounts as (
    select users.id, users.created_at
    from auth.users as users
    left join public.profiles as profiles on profiles.id = users.id
    where users.deleted_at is null
      and users.email_confirmed_at is not null
      and coalesce(profiles.role, 'user') <> 'admin'
  ),
  profile_totals as (
    select count(*)::integer as completed
    from member_accounts
    join public.profiles on profiles.id = member_accounts.id
  ),
  plan_totals as (
    select count(distinct plans.user_id)::integer as completed
    from public.plans
    join member_accounts on member_accounts.id = plans.user_id
  ),
  registration_totals as (
    select
      count(*)::integer as total,
      count(*) filter (
        where (created_at at time zone 'Europe/Istanbul')::date = istanbul_today
      )::integer as today,
      count(*) filter (
        where (created_at at time zone 'Europe/Istanbul')::date >= istanbul_today - 7
          and (created_at at time zone 'Europe/Istanbul')::date < istanbul_today
      )::integer as last_7_completed,
      count(*) filter (
        where (created_at at time zone 'Europe/Istanbul')::date >= istanbul_today - 30
          and (created_at at time zone 'Europe/Istanbul')::date < istanbul_today
      )::integer as last_30_completed,
      count(*) filter (
        where (created_at at time zone 'Europe/Istanbul')::date >= istanbul_today - 60
          and (created_at at time zone 'Europe/Istanbul')::date < istanbul_today - 30
      )::integer as previous_30_completed
    from member_accounts
  ),
  support_totals as (
    select count(*) filter (where status <> 'resolved')::integer as open
    from public.support_tickets
  )
  select jsonb_build_object(
    'total_members', registration_totals.total,
    'profiles_completed', profile_totals.completed,
    'today_registrations', registration_totals.today,
    'last_7_completed_registrations', registration_totals.last_7_completed,
    'last_30_completed_registrations', registration_totals.last_30_completed,
    'previous_30_completed_registrations', registration_totals.previous_30_completed,
    'registration_delta', registration_totals.last_30_completed - registration_totals.previous_30_completed,
    'members_with_plans', plan_totals.completed,
    'open_support_tickets', support_totals.open,
    'timezone', 'Europe/Istanbul',
    'current_day_complete', false
  ) into result
  from registration_totals, profile_totals, plan_totals, support_totals;

  return result;
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public, anon;
grant execute on function public.get_admin_dashboard_stats() to authenticated;

comment on function public.get_admin_dashboard_stats() is
  'Returns aggregate-only registration metrics to verified administrators; excludes admin accounts and incomplete current-day values from rolling windows.';
