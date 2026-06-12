import type { WorkoutPlan, WorkoutSession } from '@/types/app';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_PLAN, MOCK_PROFILE } from '@/features/demo/mockData';
import { mapWorkoutPlanRow } from '@/lib/supabase/mappers';
import { fromDateKey } from '@/utils/date';

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
    return MOCK_PLAN;
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
