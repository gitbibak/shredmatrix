-- Admin panel: per-member activity without opening the tables to admins.
--
-- workout_logs, progress_entries, water_logs and sleep_logs only allow the
-- owner to read their rows, so the admin panel showed 0 workouts for every
-- member. These read-only SECURITY DEFINER functions return exactly what the
-- panel needs and refuse anyone who is not an admin.

create or replace function public.admin_member_activity(p_since date)
returns table (
  user_id uuid,
  total_workouts integer,
  recent_workouts integer,
  last_workout date,
  water_days integer,
  sleep_days integer,
  last_weight real,
  last_weight_date date
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  with workouts as (
    select w.user_id,
           count(*)::integer as total_workouts,
           (count(*) filter (where w.date >= p_since))::integer as recent_workouts,
           max(w.date) as last_workout
    from public.workout_logs w
    group by w.user_id
  ),
  water as (
    select l.user_id, count(distinct l.date)::integer as days
    from public.water_logs l
    where l.date >= p_since
    group by l.user_id
  ),
  sleep as (
    select l.user_id, count(distinct l.date)::integer as days
    from public.sleep_logs l
    where l.date >= p_since
    group by l.user_id
  ),
  weight as (
    select distinct on (p.user_id) p.user_id, p.weight, p.date
    from public.progress_entries p
    where p.weight is not null
    order by p.user_id, p.date desc, p.created_at desc
  ),
  -- Qualified names: unqualified user_id would clash with the OUT column.
  members as (
    select workouts.user_id from workouts
    union select water.user_id from water
    union select sleep.user_id from sleep
    union select weight.user_id from weight
  )
  select m.user_id,
         coalesce(w.total_workouts, 0),
         coalesce(w.recent_workouts, 0),
         w.last_workout,
         coalesce(wa.days, 0),
         coalesce(s.days, 0),
         wt.weight,
         wt.date
  from members m
  left join workouts w on w.user_id = m.user_id
  left join water wa on wa.user_id = m.user_id
  left join sleep s on s.user_id = m.user_id
  left join weight wt on wt.user_id = m.user_id;
end;
$$;

-- One row per member and workout day, for the panel's daily and weekly counts.
create or replace function public.admin_workout_days(p_since date)
returns table (user_id uuid, date date)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select w.user_id, w.date
  from public.workout_logs w
  where w.date >= p_since;
end;
$$;

-- Everything the member detail panel shows below the profile and plan.
create or replace function public.admin_member_detail(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'workouts', coalesce((
      select jsonb_agg(row_to_json(w)::jsonb order by w.date desc, w.created_at desc)
      from (
        select date, day_focus, exercises, perceived_exertion, pain_reported, energy_after,
               session_duration_minutes, created_at
        from public.workout_logs
        where user_id = p_user
        order by date desc, created_at desc
        limit 20
      ) w
    ), '[]'::jsonb),
    'weights', coalesce((
      select jsonb_agg(row_to_json(p)::jsonb order by p.date desc)
      from (
        select date, weight, body_fat
        from public.progress_entries
        where user_id = p_user
        order by date desc, created_at desc
        limit 12
      ) p
    ), '[]'::jsonb),
    'measurements', coalesce((
      select jsonb_agg(row_to_json(m)::jsonb order by m.date desc)
      from (
        select date, chest, waist, hip, arm, leg
        from public.measurements
        where user_id = p_user
        order by date desc, created_at desc
        limit 3
      ) m
    ), '[]'::jsonb),
    'water', coalesce((
      select jsonb_agg(row_to_json(l)::jsonb order by l.date desc)
      from (
        select date, glasses, target_met
        from public.water_logs
        where user_id = p_user and date >= current_date - 14
        order by date desc
      ) l
    ), '[]'::jsonb),
    'sleep', coalesce((
      select jsonb_agg(row_to_json(l)::jsonb order by l.date desc)
      from (
        select date, hours
        from public.sleep_logs
        where user_id = p_user and date >= current_date - 14
        order by date desc
      ) l
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_member_activity(date) from public, anon;
revoke all on function public.admin_workout_days(date) from public, anon;
revoke all on function public.admin_member_detail(uuid) from public, anon;
grant execute on function public.admin_member_activity(date) to authenticated;
grant execute on function public.admin_workout_days(date) to authenticated;
grant execute on function public.admin_member_detail(uuid) to authenticated;
