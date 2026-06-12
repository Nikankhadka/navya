import type { WorkoutPlan, WorkoutSession } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_PLAN, MOCK_PROFILE } from '@/features/demo/mockData';
import { mapWorkoutPlanRow } from '@/lib/supabase/mappers';
import { fromDateKey } from '@/utils/date';
import type { SplitTemplate } from '@/features/workout/data/splitTemplates';

let demoActivePlan: WorkoutPlan | null = null;

/**
 * Build a local WorkoutSession from an active plan for a given date.
 * Maps the plan's day-of-week to the appropriate plan day and generates
 * session exercises from the plan exercises template.
 */
export function buildSessionFromPlan(plan: WorkoutPlan, dateKey: string): WorkoutSession | null {
  const date = fromDateKey(dateKey);
  const todayDayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(date)
    .toLowerCase();
  const planDay =
    plan.workout_plan_days.find((entry) => entry.day_of_week === todayDayOfWeek) ??
    plan.workout_plan_days[0];

  if (!planDay) {
    return null;
  }

  const sessionId = `local-session-${Date.now()}`;

  return {
    id: sessionId,
    user_id: plan.user_id,
    plan_day_id: planDay.id,
    day_name: planDay.day_name,
    status: 'in_progress',
    started_at: date.toISOString(),
    completed_at: null,
    duration_seconds: null,
    session_exercises: planDay.plan_exercises.map((exercise, index) => ({
      id: `local-session-exercise-${index}`,
      session_id: sessionId,
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise.name,
      planned_sets: exercise.sets,
      planned_reps: exercise.reps,
      completed_sets: [],
      notes: exercise.notes,
      is_skipped: false,
    })),
  };
}

/**
 * Determines if demo/workout data should be used instead of live Supabase.
 * Returns true when the user matches the demo profile or Supabase isn't configured.
 */
export function shouldUseDemoWorkout(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

/**
 * Fetch the active workout plan (with days and exercises) for a user.
 */
export async function getActivePlan(userId: string): Promise<WorkoutPlan | null> {
  if (shouldUseDemoWorkout(userId)) {
    return demoActivePlan ?? MOCK_PLAN;
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      `
        *,
        workout_plan_days (
          *,
          plan_exercises (
            *,
            exercise:exercise_library (*)
          )
        )
      `,
    )
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active plan:', error);
    return null;
  }

  return data ? mapWorkoutPlanRow(data) : null;
}

/**
 * PPL (Push/Pull/Legs) template — exercises mapped by muscle group from
 * exercise_library. Uses exercise_name strings to match against the seed data.
 */
const PPL_TEMPLATE = [
  {
    day_of_week: 'monday',
    day_name: 'Push — Chest & Shoulders',
    order_index: 0,
    estimated_minutes: 50,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest_seconds: 120, order_index: 0 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-10', rest_seconds: 90, order_index: 1 },
      { name: 'Tricep Dips', sets: 3, reps: '10-12', rest_seconds: 60, order_index: 2 },
      { name: 'Plank', sets: 3, reps: '30-60s', rest_seconds: 60, order_index: 3 },
    ],
  },
  {
    day_of_week: 'wednesday',
    day_name: 'Pull — Back & Biceps',
    order_index: 1,
    estimated_minutes: 50,
    exercises: [
      { name: 'Pull-Up', sets: 4, reps: '6-10', rest_seconds: 120, order_index: 0 },
      { name: 'Dumbbell Row', sets: 3, reps: '8-10', rest_seconds: 90, order_index: 1 },
      { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_seconds: 90, order_index: 2 },
      { name: 'Dumbbell Bicep Curl', sets: 3, reps: '10-12', rest_seconds: 60, order_index: 3 },
    ],
  },
  {
    day_of_week: 'friday',
    day_name: 'Legs — Quads & Hamstrings',
    order_index: 2,
    estimated_minutes: 55,
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: '5-8', rest_seconds: 150, order_index: 0 },
      { name: 'Barbell Deadlift', sets: 3, reps: '6-8', rest_seconds: 120, order_index: 1 },
      { name: 'Leg Press', sets: 3, reps: '10-12', rest_seconds: 90, order_index: 2 },
      { name: 'Dumbbell Lunges', sets: 3, reps: '10-12', rest_seconds: 90, order_index: 3 },
    ],
  },
] as const;

/**
 * Generate a default PPL workout plan for a newly onboarded user.
 * Fetches exercise IDs from exercise_library by name, then inserts
 * the plan, days, and exercises into the database.
 */
export async function createDefaultPlan(userId: string): Promise<WorkoutPlan | null> {
  if (shouldUseDemoWorkout(userId)) {
    return MOCK_PLAN;
  }

  // Fetch exercise IDs matching the template exercise names
  const exerciseNames = PPL_TEMPLATE.flatMap((day) => day.exercises.map((ex) => ex.name));

  const { data: exercises, error: fetchError } = await supabase
    .from('exercise_library')
    .select('id, name')
    .in('name', exerciseNames);

  if (fetchError) {
    console.error('Error fetching exercises for default plan:', fetchError);
    return null;
  }

  const exerciseMap = new Map<string, string>();
  for (const ex of exercises ?? []) {
    exerciseMap.set(ex.name, ex.id);
  }

  // Insert the plan
  const { data: planRow, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      name: 'Push / Pull / Legs',
      goal: 'build_muscle',
      version: 1,
      is_active: true,
    } as never)
    .select('*')
    .single();

  if (planError || !planRow) {
    console.error('Error creating default plan:', planError);
    return null;
  }

  const plan = planRow as Database['public']['Tables']['workout_plans']['Row'];

  // Insert plan days and exercises
  const planDays: Database['public']['Tables']['workout_plan_days']['Row'][] = [];

  for (const dayTemplate of PPL_TEMPLATE) {
    const { data: dayRow, error: dayError } = await supabase
      .from('workout_plan_days')
      .insert({
        plan_id: plan.id,
        day_of_week: dayTemplate.day_of_week,
        day_name: dayTemplate.day_name,
        order_index: dayTemplate.order_index,
        estimated_minutes: dayTemplate.estimated_minutes,
      } as never)
      .select('*')
      .single();

    if (dayError || !dayRow) {
      console.error('Error creating plan day:', dayError);
      continue;
    }

    const day = dayRow as Database['public']['Tables']['workout_plan_days']['Row'];
    planDays.push(day);

    const planExercises = dayTemplate.exercises
      .map((ex) => {
        const exerciseId = exerciseMap.get(ex.name);
        return exerciseId
          ? {
              plan_day_id: day.id,
              exercise_id: exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              rest_seconds: ex.rest_seconds,
              order_index: ex.order_index,
              notes: null,
            }
          : null;
      })
      .filter((pe): pe is NonNullable<typeof pe> => pe !== null);

    if (planExercises.length > 0) {
      await supabase.from('plan_exercises').insert(planExercises as never);
    }
  }

  // Fetch the full plan with days and exercises to return
  const { data: fullPlan } = await supabase
    .from('workout_plans')
    .select(
      `
        *,
        workout_plan_days (
          *,
          plan_exercises (
            *,
            exercise:exercise_library (*)
          )
        )
      `,
    )
    .eq('id', plan.id)
    .single();

  return fullPlan ? mapWorkoutPlanRow(fullPlan) : null;
}

/**
 * Build a local WorkoutPlan from a SplitTemplate (demo mode).
 * Generates UUID-like IDs for plan, days, and exercises.
 */
export function createPlanFromTemplate(template: SplitTemplate, userId: string): WorkoutPlan {
  const planId = `plan-${template.id}-${Date.now()}`;
  const createdDate = new Date().toISOString();

  const workoutPlanDays = template.days.map((day, dayIndex) => {
    const dayId = `${planId}-day-${dayIndex}`;

    const planExercises = day.exercises.map((ex, exIndex) => ({
      id: `${dayId}-pe-${exIndex}`,
      plan_day_id: dayId,
      exercise_id: `ex-${ex.name.toLowerCase().replace(/\s+/g, '-')}`,
      exercise: {
        id: `ex-${ex.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: ex.name,
        muscle_groups:
          day.focusAreas as WorkoutPlan['workout_plan_days'][0]['plan_exercises'][0]['exercise']['muscle_groups'],
        equipment_required: [],
        difficulty: template.difficulty,
        instructions: '',
        video_url: null,
      },
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.restSeconds,
      order_index: exIndex,
      notes: ex.notes ?? null,
    }));

    return {
      id: dayId,
      plan_id: planId,
      day_of_week: day.dayOfWeek as WorkoutPlan['workout_plan_days'][0]['day_of_week'],
      day_name: day.dayName,
      order_index: dayIndex,
      estimated_minutes: day.exercises.reduce(
        (total, ex) => total + ex.sets * Math.ceil(ex.restSeconds / 60) + 1,
        0,
      ),
      plan_exercises: planExercises,
    };
  });

  const plan: WorkoutPlan = {
    id: planId,
    user_id: userId,
    name: template.name,
    goal: 'build_muscle',
    version: 1,
    is_active: true,
    created_at: createdDate,
    workout_plan_days: workoutPlanDays,
  };

  if (shouldUseDemoWorkout(userId)) {
    demoActivePlan = plan;
  }

  return plan;
}
