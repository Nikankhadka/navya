export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodSource = 'manual' | 'usda_foundation' | 'usda_sr_legacy';

export type NutritionSyncStatus = 'synced' | 'pending' | 'error';

export interface FoodNutrients {
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export interface FoodPortion {
  id: string;
  food_id: string;
  amount: number;
  unit: string | null;
  modifier: string | null;
  gram_weight: number | null;
  label: string;
  is_default: boolean;
}

export interface FoodSearchResult {
  id: string;
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  name: string;
  category: string | null;
  data_version: string;
  calories_per_100g: number | null;
  protein_g_per_100g: number | null;
  carbs_g_per_100g: number | null;
  fat_g_per_100g: number | null;
  default_serving_label: string | null;
  default_serving_grams: number | null;
  default_nutrients: FoodNutrients;
  portions: FoodPortion[];
  is_custom: boolean;
  is_favorite: boolean;
}

export interface FoodLog extends FoodNutrients {
  id: string;
  user_id: string;
  meal_name: string;
  meal_time: MealTime;
  logged_at: string;
  notes: string | null;
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  quantity: number;
  serving_label: string | null;
  serving_grams: number | null;
  is_custom: boolean;
  updated_at: string;
  deleted_at: string | null;
  sync_status?: NutritionSyncStatus;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface CustomFood extends FoodNutrients {
  id: string;
  user_id: string;
  name: string;
  default_serving_label: string;
  default_serving_grams: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status?: NutritionSyncStatus;
}

export interface FavoriteFood extends FoodNutrients {
  id: string;
  user_id: string;
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  food_name: string;
  category: string | null;
  default_serving_label: string | null;
  default_serving_grams: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status?: NutritionSyncStatus;
}

export interface RecentFood extends FoodNutrients {
  id: string;
  meal_name: string;
  meal_time: MealTime;
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  quantity: number;
  serving_label: string | null;
  serving_grams: number | null;
  is_custom: boolean;
  last_logged_at: string;
}

export interface NutritionSyncRecord {
  id: string;
  entity_type: 'food_log' | 'custom_food' | 'favorite_food';
  entity_id: string;
  operation: 'upsert' | 'delete';
  updated_at: string;
  payload_json: string | null;
  last_error: string | null;
}

export interface CreateFoodLogInput extends FoodNutrients {
  meal_name: string;
  meal_time: MealTime;
  notes: string | null;
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  quantity: number;
  serving_label: string | null;
  serving_grams: number | null;
  is_custom: boolean;
}

export interface CreateCustomFoodInput extends FoodNutrients {
  name: string;
  default_serving_label: string;
  default_serving_grams: number | null;
}

export interface FavoriteFoodInput extends FoodNutrients {
  source: FoodSource;
  source_food_id: string | null;
  custom_food_id: string | null;
  food_name: string;
  category: string | null;
  default_serving_label: string | null;
  default_serving_grams: number | null;
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
  recent_foods: RecentFood[];
  favorite_foods: FavoriteFood[];
  water_logs: WaterLog[];
}

// ---------------------------------------------------------------------------
// Meal Templates
// ---------------------------------------------------------------------------

export interface TemplateFoodEntry {
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  meal_time: MealTime;
  foods: TemplateFoodEntry[];
  is_system: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMealTemplateInput {
  name: string;
  meal_time: MealTime;
  foods: TemplateFoodEntry[];
}
