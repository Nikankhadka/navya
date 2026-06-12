-- Seed exercise_library with all exercises used by the 4 pre-built split templates.
-- Also covers exercises used by createDefaultPlan (PPL template).
-- Adds a unique constraint on name to prevent duplicates across all seed runs.

-- Add unique constraint on exercise name for safe repeatable seeding
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.exercise_library'::regclass
      and conname = 'uq_exercise_library_name'
  ) then
    alter table public.exercise_library
    add constraint uq_exercise_library_name unique (name);
  end if;
end $$;

insert into public.exercise_library (name, muscle_groups, equipment_required, difficulty, instructions)
values
  ('Barbell Bench Press', '{chest,triceps,shoulders}', '{barbell}', 'intermediate',
   'Lie on a flat bench, grip slightly wider than shoulder width. Lower bar to mid-chest, press back to full extension.'),
  ('Overhead Press', '{shoulders,triceps}', '{barbell}', 'intermediate',
   'Stand with bar at shoulder height, press directly overhead until elbows lock out, lower under control.'),
  ('Incline Dumbbell Press', '{chest,shoulders}', '{dumbbells}', 'intermediate',
   'Set bench to 30-45 degree incline. Press dumbbells up and slightly inward, lower to chest level.'),
  ('Lateral Raise', '{shoulders}', '{dumbbells}', 'beginner',
   'Stand with dumbbells at sides. Raise arms to shoulder height with slight elbow bend, lower slowly.'),
  ('Tricep Pushdowns', '{triceps}', '{gym}', 'beginner',
   'Using cable machine with bar attachment, keep elbows fixed at sides. Press bar down until arms fully extend.'),
  ('Deadlift', '{back,legs,glutes}', '{barbell}', 'intermediate',
   'Stand with feet hip-width, bar over midfoot. Hinge at hips, grip bar, drive through heels to stand tall.'),
  ('Barbell Row', '{back,biceps}', '{barbell}', 'intermediate',
   'Hinge at hips until torso is near-parallel. Pull barbell to lower chest, squeeze shoulder blades.'),
  ('Lat Pulldown', '{back,biceps}', '{gym}', 'beginner',
   'Grip wide bar on cable machine. Pull bar to upper chest while squeezing lats, control on return.'),
  ('Face Pull', '{shoulders,back}', '{gym}', 'beginner',
   'Using rope attachment on cable at face height. Pull toward face while externally rotating shoulders.'),
  ('Barbell Curl', '{biceps}', '{barbell}', 'beginner',
   'Stand holding barbell with underhand grip. Curl bar toward shoulders keeping elbows at sides.'),
  ('Barbell Squat', '{legs,glutes}', '{barbell}', 'intermediate',
   'Bar on upper back, feet shoulder-width. Squat below parallel, drive through heels to stand.'),
  ('Romanian Deadlift', '{legs,glutes,back}', '{barbell}', 'intermediate',
   'Hold bar at hip level, slight knee bend. Hinge hips back, lower bar along legs, return squeezing glutes.'),
  ('Leg Press', '{legs,glutes}', '{gym}', 'beginner',
   'Sit in leg press machine, feet shoulder-width on platform. Press until legs extend, lower with control.'),
  ('Calf Raise', '{calves}', '{gym}', 'beginner',
   'Stand on calf raise machine or platform edge. Raise heels as high as possible, lower below level for stretch.'),
  ('Dumbbell Bench Press', '{chest,triceps,shoulders}', '{dumbbells}', 'intermediate',
   'Lie on flat bench with dumbbells at chest. Press straight up, lower until elbows form 90 degrees.'),
  ('Cable Flyes', '{chest}', '{gym}', 'intermediate',
   'Stand centered between cable posts, arms extended at chest height. Bring hands together in arc, control return.'),
  ('Skull Crushers', '{triceps}', '{barbell}', 'intermediate',
   'Lie on bench, bar at arm''s length. Lower bar toward forehead by bending elbows, extend back up.'),
  ('Pull Ups', '{back,biceps}', '{pull_up_bar}', 'intermediate',
   'Hang from bar with overhand grip. Pull chest to bar level, lower under control to full hang.'),
  ('Seated Cable Row', '{back,biceps}', '{gym}', 'beginner',
   'Sit at cable row station, feet on platform. Pull handle to torso while squeezing shoulder blades.'),
  ('Hammer Curl', '{biceps}', '{dumbbells}', 'beginner',
   'Hold dumbbells at sides with neutral (hammer) grip. Curl toward shoulders, keep elbows stationary.'),
  ('Leg Curl', '{legs}', '{gym}', 'beginner',
   'Lie face down on leg curl machine. Curl pad toward glutes, squeeze at top, lower with control.'),
  ('Leg Extension', '{legs}', '{gym}', 'beginner',
   'Sit at leg extension machine. Extend legs to horizontal, squeeze quads at top, lower slowly.'),
  ('Plank', '{core}', '{none}', 'beginner',
   'Forearms on ground, body in straight line from head to heels. Hold position engaging abs and glutes.'),

  -- Variants used by createDefaultPlan PPL_TEMPLATE
  ('Dumbbell Shoulder Press', '{shoulders,triceps}', '{dumbbells}', 'intermediate',
   'Sit on bench with back support, dumbbells at shoulder height. Press overhead, lower to start.'),
  ('Dumbbell Bicep Curl', '{biceps}', '{dumbbells}', 'beginner',
   'Stand with dumbbells at sides, palms forward. Curl weights toward shoulders, squeeze at top.'),
  ('Tricep Dips', '{triceps,chest}', '{gym}', 'intermediate',
   'Use parallel bars or bench. Lower body by bending elbows to 90 degrees, press back up.'),
  ('Pull-Up', '{back,biceps}', '{pull_up_bar}', 'intermediate',
   'Hang with overhand grip. Pull until chin clears bar, lower under control to dead hang.'),
  ('Barbell Back Squat', '{legs,glutes}', '{barbell}', 'intermediate',
   'Bar on upper back, feet shoulder-width. Squat to depth, drive through heels to standing.'),
  ('Barbell Deadlift', '{back,legs,glutes}', '{barbell}', 'intermediate',
   'Approach bar with midfoot under bar. Hinge at hips, grip, drive through heels to lockout.'),
  ('Dumbbell Row', '{back,biceps}', '{dumbbells}', 'intermediate',
   'One knee and hand on bench for support. Row dumbbell to hip, squeeze back at top.'),
  ('Dumbbell Lunges', '{legs,glutes}', '{dumbbells}', 'beginner',
   'Hold dumbbells at sides. Step forward, lower back knee toward ground, push through front heel to return.')
on conflict (name) do nothing;
