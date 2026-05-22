-- Fix Supabase CLI security lint warnings
-- Issues: 0011, 0026, 0027, 0028, 0029

-- 0011: Fix mutable search_path on handle_new_user (SECURITY DEFINER)
-- Setting search_path to '' prevents callers from injecting malicious objects
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
as $$
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
$$ language plpgsql;

-- 0026: Revoke SELECT from anon for all tables — prevents GraphQL schema
-- discovery by unauthenticated users. RLS still governs row-level access.
revoke select on table public.user_profiles from anon;
revoke select on table public.exercise_library from anon;
revoke select on table public.workout_plans from anon;
revoke select on table public.workout_plan_days from anon;
revoke select on table public.plan_exercises from anon;
revoke select on table public.workout_sessions from anon;
revoke select on table public.session_exercises from anon;
revoke select on table public.food_logs from anon;
revoke select on table public.water_logs from anon;
revoke select on table public.weight_logs from anon;
revoke select on table public.coach_messages from anon;
revoke select on table public.ai_usage_logs from anon;
revoke select on table public.feature_flags from anon;
revoke select on table public.push_tokens from anon;
revoke select on table public.custom_foods from anon;
revoke select on table public.favorite_foods from anon;

-- 0027: Revoke SELECT from authenticated for internal-only tables
-- ai_usage_logs is internal analytics — no user should discover it
revoke select on table public.ai_usage_logs from authenticated;

-- 0028 & 0029: Revoke EXECUTE on handle_new_user from public roles
-- This is a trigger-only function — only the auth trigger should invoke it
revoke execute on function public.handle_new_user() from public, anon, authenticated;
