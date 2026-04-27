import type { EquipmentType, ExperienceLevel, GoalType } from '@/features/profile/types';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calves'
  | 'full_body';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Exercise {
  id: string;
  name: string;
  muscle_groups: MuscleGroup[];
  equipment_required: EquipmentType[];
  difficulty: ExperienceLevel;
  instructions: string;
  video_url: string | null;
}

export interface PlanExercise {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  notes: string | null;
}

export interface WorkoutPlanDay {
  id: string;
  plan_id: string;
  day_of_week: DayOfWeek;
  day_name: string;
  order_index: number;
  estimated_minutes: number;
  plan_exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  goal: GoalType;
  version: number;
  is_active: boolean;
  created_at: string;
  workout_plan_days: WorkoutPlanDay[];
}

export interface CompletedSet {
  set_number: number;
  reps_completed: number;
  weight_kg: number | null;
  completed_at: string;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  planned_sets: number;
  planned_reps: string;
  completed_sets: CompletedSet[];
  notes: string | null;
  is_skipped: boolean;
}

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_day_id: string | null;
  day_name: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  session_exercises: SessionExercise[];
}
