-- Navya tester seed template
-- Render this file with `npm run seed:tester -- <supabase-user-id>`.

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
