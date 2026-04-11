import type { DailyNutritionSummary, FoodLog, RecentMealTemplate, WaterLog } from '../types/app';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_DAILY_NUTRITION, MOCK_PROFILE } from '../mocks/mockData';
import { mapFoodLogRow, mapWaterLogRow } from './supabaseMappers';

function isTodayIso(isoString: string): boolean {
  return isoString.startsWith(new Date().toISOString().slice(0, 10));
}

const DEFAULT_WATER_GOAL_ML = 2500;

function shouldUseDemoNutrition(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

function buildRecentMeals(meals: FoodLog[]): RecentMealTemplate[] {
  const seen = new Set<string>();
  const recent: RecentMealTemplate[] = [];

  for (const meal of meals) {
    const key = `${meal.meal_time}:${meal.meal_name.trim().toLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    recent.push({
      id: key,
      meal_name: meal.meal_name,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      meal_time: meal.meal_time,
      last_logged_at: meal.logged_at,
    });

    if (recent.length >= 6) {
      break;
    }
  }

  return recent;
}

function buildDailySummary(meals: FoodLog[], waterLogs: WaterLog[]): DailyNutritionSummary {
  const todaysMeals = meals.filter((meal) => isTodayIso(meal.logged_at));
  const todaysWaterLogs = waterLogs.filter((entry) => isTodayIso(entry.logged_at));

  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todaysMeals.reduce((sum, meal) => sum + (meal.protein_g ?? 0), 0);
  const totalCarbs = todaysMeals.reduce((sum, meal) => sum + (meal.carbs_g ?? 0), 0);
  const totalFat = todaysMeals.reduce((sum, meal) => sum + (meal.fat_g ?? 0), 0);
  const totalWater = todaysWaterLogs.reduce((sum, entry) => sum + entry.amount_ml, 0);

  return {
    date: new Date().toISOString(),
    total_calories: totalCalories,
    total_protein_g: totalProtein,
    total_carbs_g: totalCarbs,
    total_fat_g: totalFat,
    calorie_goal: MOCK_DAILY_NUTRITION.calorie_goal,
    protein_goal_g: MOCK_DAILY_NUTRITION.protein_goal_g,
    water_total_ml: totalWater,
    water_goal_ml: DEFAULT_WATER_GOAL_ML,
    meals: todaysMeals,
    recent_meals: buildRecentMeals(meals),
    water_logs: todaysWaterLogs,
  };
}

export const nutritionService = {
  async getDailySummary(userId: string): Promise<DailyNutritionSummary> {
    if (shouldUseDemoNutrition(userId)) {
      return MOCK_DAILY_NUTRITION;
    }

    const [{ data: foodData, error: foodError }, { data: waterData, error: waterError }] =
      await Promise.all([
        supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false }),
        supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false }),
      ]);

    if (foodError) {
      console.error('Error fetching food logs:', foodError);
      return MOCK_DAILY_NUTRITION;
    }

    if (waterError) {
      console.error('Error fetching water logs:', waterError);
    }

    return buildDailySummary(
      (foodData ?? []).map(mapFoodLogRow),
      (waterData ?? []).map(mapWaterLogRow),
    );
  },

  async addMeal(userId: string, meal: Omit<FoodLog, 'id' | 'user_id' | 'logged_at'>): Promise<FoodLog> {
    const payload: FoodLog = {
      id: `meal-${Date.now()}`,
      user_id: userId,
      logged_at: new Date().toISOString(),
      ...meal,
    };

    if (shouldUseDemoNutrition(userId)) {
      return payload;
    }

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        meal_name: payload.meal_name,
        calories: payload.calories,
        protein_g: payload.protein_g,
        carbs_g: payload.carbs_g,
        fat_g: payload.fat_g,
        meal_time: payload.meal_time,
        notes: payload.notes,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating food log:', error);
      return payload;
    }

    return mapFoodLogRow(data);
  },

  async deleteMeal(mealId: string): Promise<void> {
    if (!isSupabaseConfigured || mealId.startsWith('meal-')) {
      return;
    }

    const { error } = await supabase.from('food_logs').delete().eq('id', mealId);

    if (error) {
      console.error('Error deleting food log:', error);
    }
  },

  async addWater(userId: string, amountMl: number): Promise<WaterLog> {
    const payload: WaterLog = {
      id: `water-${Date.now()}`,
      user_id: userId,
      amount_ml: amountMl,
      logged_at: new Date().toISOString(),
    };

    if (shouldUseDemoNutrition(userId)) {
      return payload;
    }

    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        amount_ml: amountMl,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating water log:', error);
      return payload;
    }

    return mapWaterLogRow(data);
  },
};
