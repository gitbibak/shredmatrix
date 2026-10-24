-- A member can log more than one workout on the same day. Return one row per
-- member and day with the count so the panel's paged reader sees unique keys.
drop function if exists public.admin_workout_days(date);

create function public.admin_workout_days(p_since date)
returns table (user_id uuid, date date, workouts integer)
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
  select w.user_id, w.date, count(*)::integer
  from public.workout_logs w
  where w.date >= p_since
  group by w.user_id, w.date;
end;
$$;

revoke all on function public.admin_workout_days(date) from public, anon;
grant execute on function public.admin_workout_days(date) to authenticated;
