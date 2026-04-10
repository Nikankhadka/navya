import type { DailyNutritionSummary, FoodLog } from '../types/app';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_DAILY_NUTRITION } from '../mocks/mockData';

function isTodayIso(isoString: string): boolean {
  return isoString.startsWith(new Date().toISOString().slice(0, 10));
}

export const nutritionService = {
  async getDailySummary(userId: string): Promise<DailyNutritionSummary> {
    if (!isSupabaseConfigured) {
      return MOCK_DAILY_NUTRITION;
    }

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching food logs:', error);
      return MOCK_DAILY_NUTRITION;
    }

    const todaysMeals = ((data as unknown as FoodLog[]) ?? []).filter((meal) =>
      isTodayIso(meal.logged_at),
    );

    const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + (meal.protein_g ?? 0), 0);
    const totalCarbs = todaysMeals.reduce((sum, meal) => sum + (meal.carbs_g ?? 0), 0);
    const totalFat = todaysMeals.reduce((sum, meal) => sum + (meal.fat_g ?? 0), 0);

    return {
      date: new Date().toISOString(),
      total_calories: totalCalories,
      total_protein_g: totalProtein,
      total_carbs_g: totalCarbs,
      total_fat_g: totalFat,
      calorie_goal: MOCK_DAILY_NUTRITION.calorie_goal,
      protein_goal_g: MOCK_DAILY_NUTRITION.protein_goal_g,
      meals: todaysMeals,
    };
  },

  async addMeal(userId: string, meal: Omit<FoodLog, 'id' | 'user_id' | 'logged_at'>): Promise<FoodLog> {
    const payload: FoodLog = {
      id: `meal-${Date.now()}`,
      user_id: userId,
      logged_at: new Date().toISOString(),
      ...meal,
    };

    if (!isSupabaseConfigured) {
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

    return data as unknown as FoodLog;
  },

  async deleteMeal(mealId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase.from('food_logs').delete().eq('id', mealId);

    if (error) {
      console.error('Error deleting food log:', error);
    }
  },
};
