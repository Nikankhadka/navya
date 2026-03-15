// ─── User & Auth ─────────────────────────────────────────────────────────────

export type GoalType =
  | 'build_muscle'
  | 'lose_weight'
  | 'maintain'
  | 'improve_endurance'
  | 'general_fitness';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type DietPreference =
  | 'no_preference'
  | 'high_protein'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'low_carb';

export type EquipmentType =
  | 'gym'
  | 'dumbbells'
  | 'barbell'
  | 'resistance_bands'
  | 'bodyweight'
  | 'kettlebells'
  | 'pull_up_bar';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  age_range: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  weight_kg: number | null;
  height_cm: number | null;
  goal: GoalType;
  activity_level: ActivityLevel;
  experience_level: ExperienceLevel;
  diet_preference: DietPreference;
  equipment: EquipmentType[];
  workouts_per_week: number;
  country: 'AU' | 'NP' | 'other';
  onboarding_complete: boolean;
  glow_focus: 'Skin' | 'Hair' | 'Body' | 'Mind';
  created_at: string;
  updated_at: string;
}

// ─── Workout ──────────────────────────────────────────────────────────────────

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
  reps: string; // "8-10" or "12" or "AMRAP"
  rest_seconds: number;
  order_index: number;
  notes: string | null;
}

export interface WorkoutPlanDay {
  id: string;
  plan_id: string;
  day_of_week: DayOfWeek;
  day_name: string; // "Upper Body A"
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

export interface CompletedSet {
  set_number: number;
  reps_completed: number;
  weight_kg: number | null;
  completed_at: string;
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

// ─── Nutrition ────────────────────────────────────────────────────────────────

export interface FoodLog {
  id: string;
  user_id: string;
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  notes: string | null;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  calorie_goal: number;
  protein_goal_g: number;
  meals: FoodLog[];
}

// ─── AI Coach ─────────────────────────────────────────────────────────────────

export type CoachActionType =
  | 'daily_insight'
  | 'create_plan'
  | 'adjust_workout'
  | 'nutrition_tip'
  | 'weekly_summary'
  | 'quick_reply';

export interface CoachMessage {
  id: string;
  user_id: string;
  action_type: CoachActionType;
  role: 'coach' | 'user';
  text: string;
  created_at: string;
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export interface FeatureFlags {
  ai_enabled: boolean;
  food_search_enabled: boolean;
  notifications_enabled: boolean;
  weekly_summary_enabled: boolean;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type TabRoute = 'index' | 'workout' | 'nutrition' | 'coach' | 'profile';
