-- Applied as 20260922202347 through the Supabase migration API.
create schema if not exists private;
create table private.coach_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 80)
);
create table private.coach_invites (
 code text primary key default replace(gen_random_uuid()::text,'-',''),
 coach_id uuid not null references private.coach_accounts(user_id) on delete cascade,
 months integer not null check(months in (0,3,6)),
 expires_at timestamptz not null default now()+interval '1 year'
);
create index on private.coach_invites(coach_id);
create table private.coach_links (
 id uuid primary key default gen_random_uuid(),
 coach_id uuid not null references private.coach_accounts(user_id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','active','revoked')),
 share_metrics boolean not null default false,
 months integer not null check(months in (0,3,6)),
 consent_version text not null default '2026-09-22-v1',
 consent_at timestamptz not null default now(), starts_at timestamptz, ends_at timestamptz,
 check(coach_id<>student_id)
);
create unique index coach_one_current on private.coach_links(student_id) where status in ('active','pending');
create index on private.coach_links(coach_id);
create table private.coach_programs (
 id uuid primary key default gen_random_uuid(),
 link_id uuid not null references private.coach_links(id) on delete cascade,
 program jsonb not null,created_at timestamptz not null default now()
);
create index on private.coach_programs(link_id,created_at desc);
create table private.coach_sessions (
 id uuid primary key,link_id uuid not null references private.coach_links(id) on delete cascade,
 program_id uuid not null references private.coach_programs(id),day_index integer not null,
 log_id uuid not null references public.workout_logs(id) on delete cascade,
 feedback text not null default '' check(length(feedback)<=600),created_at timestamptz not null default now()
);
create index on private.coach_sessions(link_id,created_at desc);
alter table private.coach_accounts enable row level security;
alter table private.coach_invites enable row level security;
alter table private.coach_links enable row level security;
alter table private.coach_programs enable row level security;
alter table private.coach_sessions enable row level security;
revoke all on private.coach_accounts,private.coach_invites,private.coach_links,private.coach_programs,private.coach_sessions from public,anon,authenticated;

-- Narrow broker: every cross-user read rechecks identity, consent and expiry.
-- Existing personal data policies and retired trainer privileges stay unchanged.
create or replace function private.coach_api(action text,payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); link private.coach_links; invite private.coach_invites; assignment private.coach_programs;
 value jsonb; day jsonb; exercise jsonb; actual jsonb; sets jsonb; answer jsonb;
 log_id uuid; session_id uuid; position integer; i integer; j integer;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then
  raise exception 'AUTH_REQUIRED' using errcode='42501';
 end if;
 if action='enable' then
  insert into private.coach_accounts(user_id,name) values(uid,trim(payload->>'name')) on conflict(user_id) do update set name=excluded.name;
  return '{}'::jsonb;
 elsif action='invite' then
  if not exists(select 1 from private.coach_accounts where user_id=uid) then raise exception 'NOT_COACH'; end if;
  delete from private.coach_invites where coach_id=uid;
  insert into private.coach_invites(coach_id,months) values(uid,(payload->>'months')::integer) returning * into invite;
  return to_jsonb(invite)-'coach_id';
 elsif action in ('preview','join') then
  select * into invite from private.coach_invites where code=payload->>'code' and expires_at>now();
  if not found or invite.coach_id=uid then raise exception 'INVALID_INVITE'; end if;
  if action='preview' then return (select jsonb_build_object('name',name,'months',invite.months) from private.coach_accounts where user_id=invite.coach_id); end if;
  if payload->>'consent' is distinct from 'true' then raise exception 'CONSENT_REQUIRED'; end if;
  perform 1 from auth.users where id=uid for update;
  update private.coach_links set status='revoked' where student_id=uid and status in ('active','pending') and ends_at<=now();
  insert into private.coach_links(coach_id,student_id,share_metrics,months) values(invite.coach_id,uid,coalesce((payload->>'share_metrics')::boolean,false),invite.months);
  return '{}'::jsonb;
 elsif action='workspace' then
  return jsonb_build_object('coach',(select jsonb_build_object('name',name) from private.coach_accounts where user_id=uid),
   'invite',(select jsonb_build_object('code',code,'months',months,'expires_at',expires_at) from private.coach_invites where coach_id=uid and expires_at>now() order by expires_at desc limit 1),
   'links',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'coach_id',l.coach_id,'student_id',l.student_id,
    'name',case when l.coach_id=uid then coalesce(p.name,'Member') else c.name end,
    'status',case when l.ends_at<=now() then 'expired' else l.status end,'ends_at',l.ends_at,'months',l.months,'share_metrics',l.share_metrics,'starts_at',l.starts_at,
    'last_session',case when l.status='active' and (l.ends_at is null or l.ends_at>now()) then (select max(s.created_at) from private.coach_sessions s where s.link_id=l.id) end,
    'week_count',case when l.status='active' and (l.ends_at is null or l.ends_at>now()) then (select count(*) from private.coach_sessions s where s.link_id=l.id and s.created_at>=now()-interval '7 days') end)
    order by l.consent_at desc) from private.coach_links l join private.coach_accounts c on c.user_id=l.coach_id left join public.profiles p on p.id=l.student_id
    where (l.coach_id=uid or l.student_id=uid) and l.status<>'revoked'),'[]'::jsonb));
 end if;
 select * into link from private.coach_links where id=(payload->>'link_id')::uuid for update;
 if not found or (uid<>link.coach_id and uid<>link.student_id) then raise exception 'FORBIDDEN' using errcode='42501'; end if;
 if action='disconnect' then
  update private.coach_links set status='revoked' where id=link.id; return '{}'::jsonb;
 elsif action='respond' and link.coach_id=uid and link.status='pending' then
  update private.coach_links set status=case when payload->>'accept'='true' then 'active' else 'revoked' end,
   starts_at=now(),ends_at=case when link.months=0 then null else now()+make_interval(months=>link.months) end where id=link.id;
  return '{}'::jsonb;
 end if;
 if link.status<>'active' or link.ends_at<=now() then raise exception 'CONNECTION_INACTIVE' using errcode='42501'; end if;
 if action='sharing' and uid=link.student_id then
  update private.coach_links set share_metrics=(payload->>'share_metrics')::boolean,consent_at=now() where id=link.id; return '{}'::jsonb;
 elsif action='details' then
  select * into assignment from private.coach_programs where link_id=link.id order by created_at desc,id desc limit 1;
  answer:=jsonb_build_object('assignment',case when assignment.id is null then null else to_jsonb(assignment) end,
   'sessions',coalesce((select jsonb_agg(to_jsonb(q)) from (select s.created_at,s.feedback,s.day_index,p.program->'days'->s.day_index->>'name' as day_name,w.exercises
    from private.coach_sessions s join private.coach_programs p on p.id=s.program_id join public.workout_logs w on w.id=s.log_id
    where s.link_id=link.id order by s.created_at desc limit 30) q),'[]'::jsonb),'weights','[]'::jsonb,'measurements','[]'::jsonb);
  if link.share_metrics then
   answer:=answer||jsonb_build_object('weights',coalesce((select jsonb_agg(to_jsonb(q)) from (select date,weight,body_fat from public.progress_entries
    where user_id=link.student_id and created_at>=link.starts_at order by date desc limit 30) q),'[]'::jsonb),
    'measurements',coalesce((select jsonb_agg(to_jsonb(q)) from (select date,chest,waist,hip,arm,leg from public.measurements
    where user_id=link.student_id and created_at>=link.starts_at order by date desc limit 30) q),'[]'::jsonb));
  end if; return answer;
 elsif action='assign' and uid=link.coach_id then
  value:=payload->'program';
  if jsonb_typeof(value->'title') is distinct from 'string' or length(trim(value->>'title')) not between 1 and 100 or jsonb_typeof(value->'days') is distinct from 'array' then raise exception 'INVALID_PROGRAM'; end if;
  if jsonb_array_length(value->'days') not between 1 and 7 then raise exception 'INVALID_PROGRAM'; end if;
  answer:=jsonb_build_object('title',trim(value->>'title'),'days','[]'::jsonb);
  for day in select * from jsonb_array_elements(value->'days') loop
   if jsonb_typeof(day->'name') is distinct from 'string' or length(trim(day->>'name')) not between 1 and 80 or jsonb_typeof(day->'exercises') is distinct from 'array' then raise exception 'INVALID_PROGRAM'; end if;
   if jsonb_array_length(day->'exercises') not between 1 and 20 then raise exception 'INVALID_PROGRAM'; end if;
   sets:='[]'::jsonb;
   for exercise in select * from jsonb_array_elements(day->'exercises') loop
    if jsonb_typeof(exercise->'name') is distinct from 'string' or length(trim(exercise->>'name')) not between 1 and 100
     or coalesce((exercise->>'sets')::numeric,0) not between 1 and 10 or coalesce((exercise->>'reps')::numeric,0) not between 1 and 100
     or (exercise->>'sets')::numeric<>trunc((exercise->>'sets')::numeric) or (exercise->>'reps')::numeric<>trunc((exercise->>'reps')::numeric) then raise exception 'INVALID_PROGRAM'; end if;
    sets:=sets||jsonb_build_array(jsonb_build_object('name',trim(exercise->>'name'),'sets',(exercise->>'sets')::integer,'reps',(exercise->>'reps')::integer));
   end loop;
   answer:=jsonb_set(answer,'{days}',(answer->'days')||jsonb_build_array(jsonb_build_object('name',trim(day->>'name'),'exercises',sets)));
  end loop;
  insert into private.coach_programs(link_id,program) values(link.id,answer); return '{}'::jsonb;
 elsif action='session' and uid=link.student_id then
  session_id:=(payload->>'session_id')::uuid;
  if exists(select 1 from private.coach_sessions where id=session_id and link_id=link.id) then return '{}'::jsonb; end if;
  select * into assignment from private.coach_programs where link_id=link.id order by created_at desc,id desc limit 1;
  if assignment.id is null or assignment.id is distinct from (payload->>'program_id')::uuid then raise exception 'PROGRAM_CHANGED'; end if;
  position:=(payload->>'day_index')::integer;
  if position is null or position<0 or position>=jsonb_array_length(assignment.program->'days') then raise exception 'INVALID_DAY'; end if;
  day:=assignment.program->'days'->position;
  if jsonb_typeof(payload->'exercises') is distinct from 'array' then raise exception 'INVALID_SESSION'; end if;
  if jsonb_array_length(payload->'exercises')<>jsonb_array_length(day->'exercises') then raise exception 'INVALID_SESSION'; end if;
  answer:='[]'::jsonb;
  for i in 0..jsonb_array_length(day->'exercises')-1 loop
   exercise:=day->'exercises'->i; actual:=payload->'exercises'->i;
   if jsonb_typeof(actual->'sets') is distinct from 'array' then raise exception 'INVALID_SESSION'; end if;
   if jsonb_array_length(actual->'sets')<>(exercise->>'sets')::integer then raise exception 'INVALID_SESSION'; end if;
   sets:='[]'::jsonb;
   for j in 0..jsonb_array_length(actual->'sets')-1 loop
    value:=actual->'sets'->j;
    if coalesce((value->>'weight')::numeric,-1) not between 0 and 1000 or coalesce((value->>'reps')::numeric,-1) not between 0 and 100
     or (value->>'reps')::numeric<>trunc((value->>'reps')::numeric) then raise exception 'INVALID_SESSION'; end if;
    sets:=sets||jsonb_build_array(jsonb_build_object('weight',(value->>'weight')::numeric,'reps',(value->>'reps')::integer,'completed',true));
   end loop;
   answer:=answer||jsonb_build_array(jsonb_build_object('name',exercise->>'name','sets',sets));
  end loop;
  if length(coalesce(payload->>'feedback',''))>600 then raise exception 'INVALID_FEEDBACK'; end if;
  insert into public.workout_logs(user_id,date,day_focus,exercises) values(uid,(now() at time zone 'Europe/Istanbul')::date,day->>'name',answer) returning id into log_id;
  insert into private.coach_sessions(id,link_id,program_id,day_index,log_id,feedback) values(session_id,link.id,assignment.id,position,log_id,coalesce(payload->>'feedback',''));
  return '{}'::jsonb;
 end if;
 raise exception 'FORBIDDEN' using errcode='42501';
end;
$$;
revoke all on function private.coach_api(text,jsonb) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.coach_api(text,jsonb) to authenticated;
create or replace function public.coach_api(action text,payload jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.coach_api(action,payload); $$;
revoke all on function public.coach_api(text,jsonb) from public,anon;
grant execute on function public.coach_api(text,jsonb) to authenticated;
