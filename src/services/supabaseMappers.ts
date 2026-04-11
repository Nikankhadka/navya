import type {
  CoachMessage,
  CompletedSet,
  EquipmentType,
  Exercise,
  FeatureFlags,
  FoodLog,
  MuscleGroup,
  PlanExercise,
  WorkoutPlan,
  WorkoutPlanDay,
  WorkoutSession,
  SessionExercise,
} from '../types/app';
import type { Database, Json } from '../types/supabase';

type Tables = Database['public']['Tables'];

type ExerciseRow = Tables['exercise_library']['Row'];
type FeatureFlagsRow = Tables['feature_flags']['Row'];
type FoodLogRow = Tables['food_logs']['Row'];
type CoachMessageRow = Tables['coach_messages']['Row'];
type SessionExerciseRow = Tables['session_exercises']['Row'];
type WorkoutSessionRow = Tables['workout_sessions']['Row'];
type PlanExerciseRow = Tables['plan_exercises']['Row'] & {
  exercise?: ExerciseRow | ExerciseRow[] | null;
};
type WorkoutPlanDayRow = Tables['workout_plan_days']['Row'] & {
  plan_exercises?: PlanExerciseRow[] | null;
};
type WorkoutPlanRow = Tables['workout_plans']['Row'] & {
  workout_plan_days?: WorkoutPlanDayRow[] | null;
};

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isCompletedSet(value: unknown): value is CompletedSet {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.set_number === 'number' &&
    typeof entry.reps_completed === 'number' &&
    typeof entry.completed_at === 'string' &&
    (typeof entry.weight_kg === 'number' || entry.weight_kg === null)
  );
}

function mapCompletedSets(value: Json | null): CompletedSet[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => (isCompletedSet(entry) ? [entry] : []));
}

export function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscle_groups: (row.muscle_groups ?? []) as MuscleGroup[],
    equipment_required: (row.equipment_required ?? []) as EquipmentType[],
    difficulty: row.difficulty as Exercise['difficulty'],
    instructions: row.instructions ?? '',
    video_url: row.video_url,
  };
}

export function mapPlanExerciseRow(row: PlanExerciseRow): PlanExercise {
  const exerciseRow = asSingle(row.exercise);

  return {
    id: row.id,
    plan_day_id: row.plan_day_id,
    exercise_id: row.exercise_id,
    exercise: exerciseRow
      ? mapExerciseRow(exerciseRow)
      : {
          id: row.exercise_id,
          name: 'Exercise',
          muscle_groups: [],
          equipment_required: [],
          difficulty: 'beginner',
          instructions: '',
          video_url: null,
        },
    sets: row.sets,
    reps: row.reps,
    rest_seconds: row.rest_seconds,
    order_index: row.order_index,
    notes: row.notes,
  };
}

export function mapWorkoutPlanDayRow(row: WorkoutPlanDayRow): WorkoutPlanDay {
  return {
    id: row.id,
    plan_id: row.plan_id,
    day_of_week: row.day_of_week as WorkoutPlanDay['day_of_week'],
    day_name: row.day_name,
    order_index: row.order_index,
    estimated_minutes: row.estimated_minutes,
    plan_exercises: asArray(row.plan_exercises)
      .sort((left, right) => left.order_index - right.order_index)
      .map(mapPlanExerciseRow),
  };
}

export function mapWorkoutPlanRow(row: WorkoutPlanRow): WorkoutPlan {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    goal: row.goal as WorkoutPlan['goal'],
    version: row.version,
    is_active: row.is_active,
    created_at: row.created_at,
    workout_plan_days: asArray(row.workout_plan_days)
      .sort((left, right) => left.order_index - right.order_index)
      .map(mapWorkoutPlanDayRow),
  };
}

export function mapSessionExerciseRow(row: SessionExerciseRow): SessionExercise {
  return {
    id: row.id,
    session_id: row.session_id,
    exercise_id: row.exercise_id,
    exercise_name: row.exercise_name,
    planned_sets: row.planned_sets,
    planned_reps: row.planned_reps,
    completed_sets: mapCompletedSets(row.completed_sets),
    notes: row.notes,
    is_skipped: row.is_skipped,
  };
}

export function mapWorkoutSessionRow(
  row: WorkoutSessionRow & { session_exercises?: SessionExerciseRow[] | null },
): WorkoutSession {
  return {
    id: row.id,
    user_id: row.user_id,
    plan_day_id: row.plan_day_id,
    day_name: row.day_name,
    status: row.status as WorkoutSession['status'],
    started_at: row.started_at,
    completed_at: row.completed_at,
    duration_seconds: row.duration_seconds,
    session_exercises: asArray(row.session_exercises).map(mapSessionExerciseRow),
  };
}

export function mapFoodLogRow(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    user_id: row.user_id,
    meal_name: row.meal_name,
    calories: row.calories,
    protein_g: row.protein_g,
    carbs_g: row.carbs_g,
    fat_g: row.fat_g,
    meal_time: row.meal_time,
    logged_at: row.logged_at,
    notes: row.notes,
  };
}

export function mapCoachMessageRow(row: CoachMessageRow): CoachMessage {
  return {
    id: row.id,
    user_id: row.user_id,
    action_type: row.action_type as CoachMessage['action_type'],
    role: row.role,
    text: row.text,
    created_at: row.created_at,
  };
}

export function mapFeatureFlagsRow(row: FeatureFlagsRow | null | undefined): FeatureFlags | null {
  if (!row) {
    return null;
  }

  return {
    ai_enabled: row.ai_enabled,
    food_search_enabled: row.food_search_enabled,
    notifications_enabled: row.notifications_enabled,
    weekly_summary_enabled: row.weekly_summary_enabled,
  };
}
