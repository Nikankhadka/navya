with target_user as (
  select '__TEST_USER_ID__'::uuid as user_id
),
checks as (
  select
    'profile_complete' as check_name,
    case
      when exists (
        select 1
        from public.user_profiles profile, target_user
        where profile.id = target_user.user_id
          and profile.full_name is not null
          and profile.goal is not null
          and profile.weight_kg is not null
          and profile.height_cm is not null
          and profile.onboarding_complete = true
      ) then 'pass'
      else 'fail'
    end as status
  union all
  select
    'active_plan',
    case
      when exists (
        select 1
        from public.workout_plans plan, target_user
        where plan.user_id = target_user.user_id
          and plan.name = 'Manual Tester Plan'
          and plan.is_active = true
      ) then 'pass'
      else 'fail'
    end
  union all
  select
    'plan_day_and_exercises',
    case
      when (
        select count(*)
        from public.plan_exercises exercise
        join public.workout_plan_days day on day.id = exercise.plan_day_id
        join public.workout_plans plan on plan.id = day.plan_id
        join target_user on true
        where plan.user_id = target_user.user_id
          and day.day_name = 'Push Day'
      ) >= 3 then 'pass'
      else 'fail'
    end
  union all
  select
    'food_logs_today',
    case
      when (
        select count(*)
        from public.food_logs food, target_user
        where food.user_id = target_user.user_id
          and food.logged_at::date = current_date
      ) >= 3 then 'pass'
      else 'fail'
    end
  union all
  select
    'water_logs_today',
    case
      when (
        select coalesce(sum(amount_ml), 0)
        from public.water_logs water, target_user
        where water.user_id = target_user.user_id
          and water.logged_at::date = current_date
      ) >= 1500 then 'pass'
      else 'fail'
    end
  union all
  select
    'weight_history',
    case
      when (
        select count(*)
        from public.weight_logs weight, target_user
        where weight.user_id = target_user.user_id
      ) >= 3 then 'pass'
      else 'fail'
    end
  union all
  select
    'completed_workouts',
    case
      when (
        select count(*)
        from public.workout_sessions session, target_user
        where session.user_id = target_user.user_id
          and session.status = 'completed'
      ) >= 2 then 'pass'
      else 'fail'
    end
  union all
  select
    'completed_session_exercises',
    case
      when (
        select count(*)
        from public.session_exercises exercise
        join public.workout_sessions session on session.id = exercise.session_id
        join target_user on true
        where session.user_id = target_user.user_id
          and session.status = 'completed'
      ) >= 6 then 'pass'
      else 'fail'
    end
  union all
  select
    'coach_messages',
    case
      when (
        select count(*)
        from public.coach_messages message, target_user
        where message.user_id = target_user.user_id
      ) >= 1 then 'pass'
      else 'fail'
    end
  union all
  select
    'feature_flags',
    case
      when exists (select 1 from public.feature_flags) then 'pass'
      else 'fail'
    end
)
select check_name, status
from checks
order by check_name;
