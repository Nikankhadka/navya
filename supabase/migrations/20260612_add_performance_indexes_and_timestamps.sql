-- Add missing updated_at columns and performance indexes for query patterns
-- used by the daily-diary, workout, nutrition, and profile feature services.

-- ── Updated at columns ──────────────────────────────────────────────
-- water_logs, weight_logs, and coach_messages lacked updated_at timestamps
-- that other log tables (food_logs, custom_foods, favorite_foods) carry.
-- Code only performs INSERTs on these tables, so default now() is safe.

alter table public.water_logs
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.weight_logs
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.coach_messages
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- ── User-scoped date-range indexes ───────────────────────────────────
-- All queries fetch rows WHERE user_id = ? ORDER BY <date_col> DESC LIMIT N.
-- Without a matching composite index Postgres resorts to a full seqscan + sort.

-- weight_logs — getWeightProgress (LIMIT 12)
create index if not exists idx_weight_logs_user_logged_at
  on public.weight_logs(user_id, logged_at desc);

-- water_logs — getRemoteWaterLogs, getHabitStreak (LIMIT 60)
create index if not exists idx_water_logs_user_logged_at
  on public.water_logs(user_id, logged_at desc);

-- food_logs — getDailyNutrition remote fallback, getLocalFoodActivityKeys (ordered by logged_at, not updated_at)
create index if not exists idx_food_logs_user_logged_at
  on public.food_logs(user_id, logged_at desc);

-- workout_sessions — getTodaySession, getHabitStreak (LIMIT 30)
create index if not exists idx_workout_sessions_user_started_at
  on public.workout_sessions(user_id, started_at desc);

-- workout_sessions — getWorkoutHistory (LIMIT 8, filtered by status=completed)
create index if not exists idx_workout_sessions_user_status_completed_at
  on public.workout_sessions(user_id, status, completed_at desc);

-- coach_messages — getMessages (ordered by created_at ASC)
create index if not exists idx_coach_messages_user_created_at
  on public.coach_messages(user_id, created_at);

-- workout_plans — getActivePlan (LIMIT 1, filtered by is_active)
create index if not exists idx_workout_plans_user_active_created_at
  on public.workout_plans(user_id, is_active, created_at desc);

-- ── Foreign-key join indexes ─────────────────────────────────────────
-- The nested Supabase client .select('*, child(*, grandchild(*))') chains
-- issue separate lateral joins. FK columns without indexes cause nested
-- loop seqscans when resolving child rows.

create index if not exists idx_workout_plan_days_plan_id
  on public.workout_plan_days(plan_id);

create index if not exists idx_plan_exercises_plan_day_id
  on public.plan_exercises(plan_day_id);

create index if not exists idx_session_exercises_session_id
  on public.session_exercises(session_id);

-- ── Lookup index ─────────────────────────────────────────────────────
-- createDefaultPlan looks up exercises by name (IN clause).

create index if not exists idx_exercise_library_name
  on public.exercise_library(name);
