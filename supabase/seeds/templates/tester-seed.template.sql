-- Navya tester seed template
-- Render this file with `npm run seed:tester -- <supabase-user-id>`.

insert into public.user_profiles (
  id,
  full_name,
  age_range,
  gender,
  weight_kg,
  height_cm,
  goal,
  activity_level,
  experience_level,
  diet_preference,
  equipment,
  workouts_per_week,
  country,
  onboarding_complete,
  glow_focus,
  updated_at
)
values (
  '__TEST_USER_ID__'::uuid,
  'Navya Tester',
  '25-34',
  'prefer_not_to_say',
  79.4,
  178,
  'build_muscle',
  'moderately_active',
  'intermediate',
  'high_protein',
  array['gym', 'dumbbells', 'barbell'],
  4,
  'AU',
  true,
  'Body',
  timezone('utc', now())
)
on conflict (id) do update
set
  full_name = excluded.full_name,
  age_range = excluded.age_range,
  gender = excluded.gender,
  weight_kg = excluded.weight_kg,
  height_cm = excluded.height_cm,
  goal = excluded.goal,
  activity_level = excluded.activity_level,
  experience_level = excluded.experience_level,
  diet_preference = excluded.diet_preference,
  equipment = excluded.equipment,
  workouts_per_week = excluded.workouts_per_week,
  country = excluded.country,
  onboarding_complete = excluded.onboarding_complete,
  glow_focus = excluded.glow_focus,
  updated_at = excluded.updated_at;

insert into public.feature_flags (
  ai_enabled,
  food_search_enabled,
  notifications_enabled,
  weekly_summary_enabled
)
select true, false, false, true
where not exists (select 1 from public.feature_flags);

update public.feature_flags
set
  ai_enabled = true,
  food_search_enabled = false,
  notifications_enabled = false,
  weekly_summary_enabled = true;

with target_user as (
  select '__TEST_USER_ID__'::uuid as user_id
),
insert_exercises as (
  insert into public.exercise_library (
    name,
    muscle_groups,
    equipment_required,
    difficulty,
    instructions,
    video_url
  )
  values
    (
      'Bench Press',
      array['chest', 'triceps', 'shoulders'],
      array['barbell'],
      'intermediate',
      'Lower the bar to the chest and press back to full extension.',
      null
    ),
    (
      'Overhead Press',
      array['shoulders', 'triceps'],
      array['barbell'],
      'intermediate',
      'Press the bar from shoulder height overhead with control.',
      null
    ),
    (
      'Lateral Raise',
      array['shoulders'],
      array['dumbbells'],
      'beginner',
      'Raise dumbbells to shoulder height with a slight elbow bend.',
      null
    )
  on conflict do nothing
  returning id, name
),
all_exercises as (
  select id, name from insert_exercises
  union
  select id, name
  from public.exercise_library
  where name in ('Bench Press', 'Overhead Press', 'Lateral Raise')
),
insert_plan as (
  insert into public.workout_plans (user_id, name, goal, version, is_active)
  select
    target_user.user_id,
    'Manual Tester Plan',
    'build_muscle',
    1,
    true
  from target_user
  where not exists (
    select 1
    from public.workout_plans
    where user_id = target_user.user_id
      and name = 'Manual Tester Plan'
  )
  returning id
),
active_plan as (
  select id from insert_plan
  union
  select id
  from public.workout_plans, target_user
  where user_id = target_user.user_id
    and name = 'Manual Tester Plan'
  limit 1
),
insert_day as (
  insert into public.workout_plan_days (
    plan_id,
    day_of_week,
    day_name,
    order_index,
    estimated_minutes
  )
  select
    active_plan.id,
    'monday',
    'Push Day',
    0,
    45
  from active_plan
  where not exists (
    select 1
    from public.workout_plan_days
    where plan_id = active_plan.id
      and day_name = 'Push Day'
  )
  returning id
),
plan_day as (
  select id from insert_day
  union
  select id
  from public.workout_plan_days
  where plan_id in (select id from active_plan)
    and day_name = 'Push Day'
  limit 1
)
insert into public.plan_exercises (
  plan_day_id,
  exercise_id,
  sets,
  reps,
  rest_seconds,
  order_index,
  notes
)
select
  plan_day.id,
  exercise.id,
  seed.sets,
  seed.reps,
  seed.rest_seconds,
  seed.order_index,
  seed.notes
from plan_day
join (
  values
    ('Bench Press', 4, '6-8', 120, 0, 'Focus on control'),
    ('Overhead Press', 3, '8-10', 90, 1, null),
    ('Lateral Raise', 3, '12-15', 60, 2, 'Light weight, strict form')
) as seed(exercise_name, sets, reps, rest_seconds, order_index, notes)
  on true
join all_exercises exercise
  on exercise.name = seed.exercise_name
where not exists (
  select 1
  from public.plan_exercises pe
  where pe.plan_day_id = plan_day.id
    and pe.order_index = seed.order_index
);

insert into public.food_logs (
  user_id,
  meal_name,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  meal_time,
  logged_at,
  notes
)
select
  target_user.user_id,
  seed.meal_name,
  seed.calories,
  seed.protein_g,
  seed.carbs_g,
  seed.fat_g,
  seed.meal_time,
  timezone('utc', now()) - seed.logged_offset,
  seed.notes
from target_user
join (
  values
    ('Oats with Banana', 380, 12, 68, 6, 'breakfast', interval '5 hours', null),
    ('Chicken Rice Bowl', 620, 48, 65, 12, 'lunch', interval '2 hours', null),
    ('Protein Shake', 180, 30, 8, 3, 'snack', interval '1 hour', null)
) as seed(meal_name, calories, protein_g, carbs_g, fat_g, meal_time, logged_offset, notes)
  on true
where not exists (
  select 1
  from public.food_logs existing
  where existing.user_id = target_user.user_id
    and existing.meal_name = seed.meal_name
    and existing.logged_at::date = current_date
);

insert into public.water_logs (
  user_id,
  amount_ml,
  logged_at
)
select
  target_user.user_id,
  seed.amount_ml,
  timezone('utc', now()) - seed.logged_offset
from target_user
join (
  values
    (500, interval '8 hours'),
    (1000, interval '3 hours')
) as seed(amount_ml, logged_offset)
  on true
where not exists (
  select 1
  from public.water_logs existing
  where existing.user_id = target_user.user_id
    and existing.amount_ml = seed.amount_ml
    and existing.logged_at::date = current_date
);

insert into public.weight_logs (
  user_id,
  weight_kg,
  logged_at
)
select
  target_user.user_id,
  seed.weight_kg,
  timezone('utc', now()) - seed.logged_offset
from target_user
join (
  values
    (80.2::numeric, interval '14 days'),
    (79.8::numeric, interval '7 days'),
    (79.4::numeric, interval '1 day')
) as seed(weight_kg, logged_offset)
  on true
where not exists (
  select 1
  from public.weight_logs existing
  where existing.user_id = target_user.user_id
    and existing.logged_at::date = (timezone('utc', now()) - seed.logged_offset)::date
);

with target_user as (
  select '__TEST_USER_ID__'::uuid as user_id
),
plan_day as (
  select day.id
  from public.workout_plan_days day
  join public.workout_plans plan on plan.id = day.plan_id
  join target_user on true
  where plan.user_id = target_user.user_id
    and day.day_name = 'Push Day'
  limit 1
),
inserted_sessions as (
  insert into public.workout_sessions (
    user_id,
    plan_day_id,
    day_name,
    status,
    started_at,
    completed_at,
    duration_seconds
  )
  select
    target_user.user_id,
    plan_day.id,
    seed.day_name,
    'completed',
    timezone('utc', now()) - seed.started_offset,
    timezone('utc', now()) - seed.completed_offset,
    seed.duration_seconds
  from target_user
  join plan_day on true
  join (
    values
      ('Push Day', interval '3 days 1 hour', interval '3 days', 2820),
      ('Push Day', interval '8 days 1 hour', interval '8 days', 2580)
  ) as seed(day_name, started_offset, completed_offset, duration_seconds)
    on true
  where not exists (
    select 1
    from public.workout_sessions existing
    where existing.user_id = target_user.user_id
      and existing.day_name = seed.day_name
      and existing.completed_at::date = (timezone('utc', now()) - seed.completed_offset)::date
  )
  returning id, completed_at
),
seeded_sessions as (
  select id, completed_at from inserted_sessions
  union
  select existing.id, existing.completed_at
  from public.workout_sessions existing
  join target_user on true
  where existing.user_id = target_user.user_id
    and existing.status = 'completed'
    and existing.day_name = 'Push Day'
    and existing.completed_at::date in (
      (timezone('utc', now()) - interval '3 days')::date,
      (timezone('utc', now()) - interval '8 days')::date
    )
)
insert into public.session_exercises (
  session_id,
  exercise_id,
  exercise_name,
  planned_sets,
  planned_reps,
  completed_sets,
  notes,
  is_skipped
)
select
  session.id,
  exercise.id,
  seed.exercise_name,
  seed.planned_sets,
  seed.planned_reps,
  seed.completed_sets::jsonb,
  seed.notes,
  false
from seeded_sessions session
join (
  values
    (
      'Bench Press',
      4,
      '6-8',
      '[{"set_number":1,"reps_completed":8,"weight_kg":75,"completed_at":"2026-01-01T00:00:00Z"},{"set_number":2,"reps_completed":8,"weight_kg":75,"completed_at":"2026-01-01T00:05:00Z"},{"set_number":3,"reps_completed":7,"weight_kg":75,"completed_at":"2026-01-01T00:10:00Z"},{"set_number":4,"reps_completed":6,"weight_kg":75,"completed_at":"2026-01-01T00:15:00Z"}]',
      'Controlled reps'
    ),
    (
      'Overhead Press',
      3,
      '8-10',
      '[{"set_number":1,"reps_completed":10,"weight_kg":42.5,"completed_at":"2026-01-01T00:20:00Z"},{"set_number":2,"reps_completed":9,"weight_kg":42.5,"completed_at":"2026-01-01T00:24:00Z"},{"set_number":3,"reps_completed":8,"weight_kg":42.5,"completed_at":"2026-01-01T00:28:00Z"}]',
      null
    ),
    (
      'Lateral Raise',
      3,
      '12-15',
      '[{"set_number":1,"reps_completed":15,"weight_kg":10,"completed_at":"2026-01-01T00:32:00Z"},{"set_number":2,"reps_completed":14,"weight_kg":10,"completed_at":"2026-01-01T00:35:00Z"},{"set_number":3,"reps_completed":12,"weight_kg":10,"completed_at":"2026-01-01T00:38:00Z"}]',
      'Strict form'
    )
) as seed(exercise_name, planned_sets, planned_reps, completed_sets, notes)
  on true
join public.exercise_library exercise
  on exercise.name = seed.exercise_name
where not exists (
  select 1
  from public.session_exercises existing
  where existing.session_id = session.id
    and existing.exercise_name = seed.exercise_name
);

insert into public.coach_messages (
  user_id,
  action_type,
  role,
  text
)
select
  target_user.user_id,
  'daily_insight',
  'coach',
  'Welcome to Navya. Your tester workout plan and nutrition data are ready to explore.'
from target_user
where not exists (
  select 1
  from public.coach_messages
  where user_id = target_user.user_id
    and text = 'Welcome to Navya. Your tester workout plan and nutrition data are ready to explore.'
);
