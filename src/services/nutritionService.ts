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
};
