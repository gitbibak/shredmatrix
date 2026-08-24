alter table public.user_activity_days
  add column if not exists today_viewed boolean not null default false,
  add column if not exists workout_plan_viewed boolean not null default false,
  add column if not exists workout_day_opened boolean not null default false,
  add column if not exists workout_completed boolean not null default false;

comment on column public.user_activity_days.today_viewed is
  'Daily first-party activation flag: the authenticated user viewed the Today tab.';
comment on column public.user_activity_days.workout_plan_viewed is
  'Daily first-party activation flag: the authenticated user viewed their workout plan.';
comment on column public.user_activity_days.workout_day_opened is
  'Daily first-party activation flag: the authenticated user opened a workout day.';
comment on column public.user_activity_days.workout_completed is
  'Daily first-party activation flag: the authenticated user successfully saved a completed workout.';
