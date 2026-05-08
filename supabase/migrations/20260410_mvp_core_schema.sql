create extension if not exists pgcrypto;

alter table if exists profiles rename to user_profiles;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  full_name text,
  avatar_url text,
  age_range text check (age_range in ('18-24', '25-34', '35-44', '45-54', '55+')),
  gender text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  weight_kg numeric,
  height_cm numeric,
  goal text,
  activity_level text,
  experience_level text,
  diet_preference text,
  equipment text[] not null default '{}',
  workouts_per_week integer not null default 3,
  country text check (country in ('AU', 'NP', 'other')) default 'AU',
  onboarding_complete boolean not null default false,
  glow_focus text check (glow_focus in ('Skin', 'Hair', 'Body', 'Mind')) default 'Body'
);

alter table public.user_profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on public.user_profiles;
drop policy if exists "Users can insert their own profile." on public.user_profiles;
drop policy if exists "Users can update own profile." on public.user_profiles;

create policy "Users can view own profile"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.user_profiles
for update
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      trim(
        concat(
          coalesce(new.raw_user_meta_data->>'first_name', ''),
          ' ',
          coalesce(new.raw_user_meta_data->>'last_name', '')
        )
      )
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_groups text[] not null default '{}',
  equipment_required text[] not null default '{}',
  difficulty text not null,
  instructions text,
  video_url text
);

alter table public.exercise_library enable row level security;

drop policy if exists "Authenticated users can read exercise library" on public.exercise_library;
create policy "Authenticated users can read exercise library"
on public.exercise_library
for select
using (auth.role() = 'authenticated');

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  day_of_week text not null,
  day_name text not null,
  order_index integer not null default 0,
  estimated_minutes integer not null default 45
);

create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.workout_plan_days(id) on delete cascade,
  exercise_id uuid not null references public.exercise_library(id) on delete restrict,
  sets integer not null,
  reps text not null,
  rest_seconds integer not null default 60,
  order_index integer not null default 0,
  notes text
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day_id uuid references public.workout_plan_days(id) on delete set null,
  day_name text not null,
  status text not null default 'in_progress',
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  duration_seconds integer
);

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid references public.exercise_library(id) on delete set null,
  exercise_name text not null,
  planned_sets integer not null,
  planned_reps text not null,
  completed_sets jsonb not null default '[]'::jsonb,
  notes text,
  is_skipped boolean not null default false
);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  calories integer not null,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  meal_time text not null,
  logged_at timestamptz not null default timezone('utc', now()),
  notes text
);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  role text not null,
  text text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_date date not null default current_date,
  action_count integer not null default 0,
  tokens_used integer not null default 0,
  unique (user_id, action_date)
);

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  ai_enabled boolean not null default true,
  food_search_enabled boolean not null default false,
  notifications_enabled boolean not null default false,
  weekly_summary_enabled boolean not null default false
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  device_type text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.workout_plans enable row level security;
alter table public.workout_plan_days enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.food_logs enable row level security;
alter table public.coach_messages enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.push_tokens enable row level security;

drop policy if exists "Users can access own workout plans" on public.workout_plans;
create policy "Users can access own workout plans"
on public.workout_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own workout sessions" on public.workout_sessions;
create policy "Users can access own workout sessions"
on public.workout_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own food logs" on public.food_logs;
create policy "Users can access own food logs"
on public.food_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own coach messages" on public.coach_messages;
create policy "Users can access own coach messages"
on public.coach_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own ai usage logs" on public.ai_usage_logs;
create policy "Users can access own ai usage logs"
on public.ai_usage_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own push tokens" on public.push_tokens;
create policy "Users can access own push tokens"
on public.push_tokens
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can read feature flags" on public.feature_flags;
create policy "Authenticated users can read feature flags"
on public.feature_flags
for select
using (auth.role() = 'authenticated');

drop policy if exists "Users can read plan days for owned plans" on public.workout_plan_days;
create policy "Users can read plan days for owned plans"
on public.workout_plan_days
for select
using (
  exists (
    select 1
    from public.workout_plans plan
    where plan.id = workout_plan_days.plan_id
      and plan.user_id = auth.uid()
  )
);

drop policy if exists "Users can mutate plan days for owned plans" on public.workout_plan_days;
create policy "Users can mutate plan days for owned plans"
on public.workout_plan_days
for all
using (
  exists (
    select 1
    from public.workout_plans plan
    where plan.id = workout_plan_days.plan_id
      and plan.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_plans plan
    where plan.id = workout_plan_days.plan_id
      and plan.user_id = auth.uid()
  )
);

drop policy if exists "Users can read plan exercises for owned plans" on public.plan_exercises;
create policy "Users can read plan exercises for owned plans"
on public.plan_exercises
for select
using (
  exists (
    select 1
    from public.workout_plan_days day
    join public.workout_plans plan on plan.id = day.plan_id
    where day.id = plan_exercises.plan_day_id
      and plan.user_id = auth.uid()
  )
);

drop policy if exists "Users can mutate plan exercises for owned plans" on public.plan_exercises;
create policy "Users can mutate plan exercises for owned plans"
on public.plan_exercises
for all
using (
  exists (
    select 1
    from public.workout_plan_days day
    join public.workout_plans plan on plan.id = day.plan_id
    where day.id = plan_exercises.plan_day_id
      and plan.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_plan_days day
    join public.workout_plans plan on plan.id = day.plan_id
    where day.id = plan_exercises.plan_day_id
      and plan.user_id = auth.uid()
  )
);

drop policy if exists "Users can read session exercises for owned sessions" on public.session_exercises;
create policy "Users can read session exercises for owned sessions"
on public.session_exercises
for select
using (
  exists (
    select 1
    from public.workout_sessions session
    where session.id = session_exercises.session_id
      and session.user_id = auth.uid()
  )
);

drop policy if exists "Users can mutate session exercises for owned sessions" on public.session_exercises;
create policy "Users can mutate session exercises for owned sessions"
on public.session_exercises
for all
using (
  exists (
    select 1
    from public.workout_sessions session
    where session.id = session_exercises.session_id
      and session.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sessions session
    where session.id = session_exercises.session_id
      and session.user_id = auth.uid()
  )
);

insert into public.feature_flags (ai_enabled, food_search_enabled, notifications_enabled, weekly_summary_enabled)
select true, false, false, false
where not exists (select 1 from public.feature_flags);
