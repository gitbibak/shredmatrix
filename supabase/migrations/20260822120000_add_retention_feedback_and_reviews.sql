alter table public.workout_logs
  add column if not exists session_duration_minutes smallint,
  add column if not exists energy_after smallint,
  add column if not exists adaptation_action text;

alter table public.workout_logs
  drop constraint if exists workout_logs_session_duration_check,
  add constraint workout_logs_session_duration_check
    check (session_duration_minutes is null or session_duration_minutes between 1 and 600),
  drop constraint if exists workout_logs_energy_after_check,
  add constraint workout_logs_energy_after_check
    check (energy_after is null or energy_after between 1 and 3),
  drop constraint if exists workout_logs_adaptation_action_check,
  add constraint workout_logs_adaptation_action_check
    check (adaptation_action is null or adaptation_action in ('maintain', 'reduce', 'progress', 'hold'));

create table if not exists public.user_activity_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

alter table public.user_activity_days enable row level security;

drop policy if exists user_activity_days_own_select on public.user_activity_days;
create policy user_activity_days_own_select on public.user_activity_days
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists user_activity_days_own_insert on public.user_activity_days;
create policy user_activity_days_own_insert on public.user_activity_days
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists user_activity_days_own_update on public.user_activity_days;
create policy user_activity_days_own_update on public.user_activity_days
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_activity_days_admin_select on public.user_activity_days;
create policy user_activity_days_admin_select on public.user_activity_days
  for select to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ));

grant select, insert, update on public.user_activity_days to authenticated;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 30 and 600),
  result_summary text check (result_summary is null or char_length(result_summary) <= 180),
  language text not null default 'en' check (language in ('tr', 'en', 'es')),
  consent_public boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated
  using (status = 'approved' and consent_public = true);

drop policy if exists testimonials_own_read on public.testimonials;
create policy testimonials_own_read on public.testimonials
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists testimonials_own_insert on public.testimonials;
create policy testimonials_own_insert on public.testimonials
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists testimonials_own_update on public.testimonials;
create policy testimonials_own_update on public.testimonials
  for update to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists testimonials_admin_all on public.testimonials;
create policy testimonials_admin_all on public.testimonials
  for all to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ));

grant select on public.testimonials to anon;
grant select, insert, update on public.testimonials to authenticated;

create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_area text not null unique check (content_area in ('strength', 'fat_loss', 'nutrition', 'yoga', 'pilates', 'reformer', 'meditation')),
  review_status text not null default 'pending' check (review_status in ('pending', 'in_review', 'approved', 'changes_requested')),
  reviewer_name text,
  reviewer_credential text,
  evidence_url text,
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_reviews enable row level security;

drop policy if exists content_reviews_admin_all on public.content_reviews;
create policy content_reviews_admin_all on public.content_reviews
  for all to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ));

grant select, insert, update on public.content_reviews to authenticated;

insert into public.content_reviews (content_area)
values ('strength'), ('fat_loss'), ('nutrition'), ('yoga'), ('pilates'), ('reformer'), ('meditation')
on conflict (content_area) do nothing;

create index if not exists idx_user_activity_days_date on public.user_activity_days (activity_date, user_id);
create index if not exists idx_testimonials_status on public.testimonials (status, created_at desc);

