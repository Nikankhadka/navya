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

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface RecentMealTemplate {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  last_logged_at: string;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  calorie_goal: number;
  protein_goal_g: number;
  water_total_ml: number;
  water_goal_ml: number;
  meals: FoodLog[];
  recent_meals: RecentMealTemplate[];
  water_logs: WaterLog[];
}
