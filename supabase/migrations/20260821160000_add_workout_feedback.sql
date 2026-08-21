alter table public.workout_logs
  add column if not exists perceived_exertion smallint,
  add column if not exists pain_reported boolean,
  add column if not exists feedback_at timestamptz;

alter table public.workout_logs
  drop constraint if exists workout_logs_perceived_exertion_check;

alter table public.workout_logs
  add constraint workout_logs_perceived_exertion_check
  check (perceived_exertion is null or perceived_exertion between 1 and 3);

comment on column public.workout_logs.perceived_exertion is
  'Optional post-workout effort feedback: 1 easy, 2 appropriate, 3 hard.';

comment on column public.workout_logs.pain_reported is
  'Optional user-reported pain or unusual discomfort during the session.';

create index if not exists idx_workout_logs_user_feedback
  on public.workout_logs (user_id, date desc)
  where feedback_at is not null;
