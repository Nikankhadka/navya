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

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

export interface WeightProgressSummary {
  current_weight_kg: number | null;
  change_kg_14d: number | null;
  last_logged_at: string | null;
  recent_logs: WeightLog[];
  check_ins_this_month: number;
}
