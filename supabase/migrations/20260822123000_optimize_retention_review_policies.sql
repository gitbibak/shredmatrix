drop policy if exists user_activity_days_own_select on public.user_activity_days;
drop policy if exists user_activity_days_admin_select on public.user_activity_days;
create policy user_activity_days_select_access on public.user_activity_days
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  );

drop policy if exists testimonials_public_read on public.testimonials;
drop policy if exists testimonials_own_read on public.testimonials;
drop policy if exists testimonials_own_insert on public.testimonials;
drop policy if exists testimonials_own_update on public.testimonials;
drop policy if exists testimonials_admin_all on public.testimonials;

create policy testimonials_public_read on public.testimonials
  for select to anon
  using (status = 'approved' and consent_public = true);

create policy testimonials_authenticated_read on public.testimonials
  for select to authenticated
  using (
    (status = 'approved' and consent_public = true)
    or (select auth.uid()) = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  );

create policy testimonials_own_insert on public.testimonials
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

create policy testimonials_update_access on public.testimonials
  for update to authenticated
  using (
    ((select auth.uid()) = user_id and status = 'pending')
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  )
  with check (
    ((select auth.uid()) = user_id and status = 'pending')
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    )
  );

create policy testimonials_admin_delete on public.testimonials
  for delete to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'
  ));

create index if not exists idx_testimonials_user_id on public.testimonials (user_id);
