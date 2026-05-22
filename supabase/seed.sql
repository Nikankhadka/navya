-- Seed default feature flags
insert into public.feature_flags (ai_enabled, food_search_enabled, notifications_enabled, weekly_summary_enabled)
select true, true, false, false
where not exists (select 1 from public.feature_flags);

-- Seed exercise library with common exercises
insert into public.exercise_library (name, muscle_groups, equipment_required, difficulty, instructions) values
('Barbell Bench Press', ARRAY['Chest', 'Triceps', 'Shoulders'], ARRAY['Barbell', 'Bench'], 'intermediate', 'Lie on a flat bench. Grip the barbell slightly wider than shoulder width. Lower to mid-chest, press back up.'),
('Barbell Back Squat', ARRAY['Quads', 'Glutes', 'Hamstrings'], ARRAY['Barbell', 'Squat Rack'], 'intermediate', 'Stand with feet shoulder-width. Bar on upper back. Break at hips and knees, descend until thighs parallel, drive back up.'),
('Barbell Deadlift', ARRAY['Hamstrings', 'Glutes', 'Lower Back'], ARRAY['Barbell'], 'intermediate', 'Stand with feet hip-width. Hinge at hips, grip bar. Keep back flat, drive through heels to standing.'),
('Dumbbell Shoulder Press', ARRAY['Shoulders', 'Triceps'], ARRAY['Dumbbells'], 'beginner', 'Sit or stand. Press dumbbells from shoulder height overhead until arms extended.'),
('Pull-Up', ARRAY['Back', 'Biceps'], ARRAY['Pull-Up Bar'], 'intermediate', 'Hang from bar with overhand grip. Pull chin over bar, lower with control.'),
('Dumbbell Row', ARRAY['Back', 'Biceps'], ARRAY['Dumbbells', 'Bench'], 'beginner', 'One knee and hand on bench. Pull dumbbell to hip, squeeze back, lower with control.'),
('Plank', ARRAY['Core'], ARRAY['None'], 'beginner', 'Forearms on ground, body straight line from head to heels. Hold position.'),
('Dumbbell Bicep Curl', ARRAY['Biceps'], ARRAY['Dumbbells'], 'beginner', 'Stand with dumbbells at sides. Curl up keeping elbows fixed, squeeze at top, lower slowly.'),
('Tricep Dips', ARRAY['Triceps', 'Chest'], ARRAY['Dip Bars', 'Bench'], 'beginner', 'Support body on parallel bars or bench edge. Lower by bending elbows, push back up.'),
('Leg Press', ARRAY['Quads', 'Glutes', 'Hamstrings'], ARRAY['Leg Press Machine'], 'beginner', 'Sit in machine, feet on platform. Push platform away by extending knees, return with control.'),
('Lat Pulldown', ARRAY['Back', 'Biceps'], ARRAY['Cable Machine'], 'beginner', 'Sit at machine, grip bar wide. Pull bar to upper chest, squeeze back, return slowly.'),
('Dumbbell Lunges', ARRAY['Quads', 'Glutes', 'Hamstrings'], ARRAY['Dumbbells'], 'beginner', 'Step forward into lunge, front knee at 90 degrees. Push back to start. Alternate legs.');
