import type {
  CreateCustomFoodInput,
  CreateFoodLogInput,
  CustomFood,
  DailyNutritionSummary,
  FavoriteFood,
  FavoriteFoodInput,
  FoodLog,
  FoodSearchResult,
  WaterLog,
} from '@/types/app';
import { nutritionRepository } from '@/features/nutrition/api/nutrition.repository';

export const nutritionService = {
  getDailySummary(userId: string, dateKey?: string): Promise<DailyNutritionSummary> {
    return nutritionRepository.getDailySummary(userId, dateKey);
  },

  searchFoods(userId: string, query: string): Promise<FoodSearchResult[]> {
    return nutritionRepository.searchFoods(userId, query);
  },

  addMeal(userId: string, meal: CreateFoodLogInput): Promise<FoodLog> {
    return nutritionRepository.addMeal(userId, meal);
  },

  deleteMeal(userId: string, mealId: string): Promise<void> {
    return nutritionRepository.deleteMeal(userId, mealId);
  },

  saveCustomFood(userId: string, input: CreateCustomFoodInput): Promise<CustomFood> {
    return nutritionRepository.saveCustomFood(userId, input);
  },

  toggleFavorite(userId: string, input: FavoriteFoodInput): Promise<FavoriteFood | null> {
    return nutritionRepository.toggleFavorite(userId, input);
  },

  addWater(userId: string, amountMl: number): Promise<WaterLog> {
    return nutritionRepository.addWater(userId, amountMl);
  },

  syncPendingChanges(userId: string): Promise<void> {
    return nutritionRepository.syncPendingChanges(userId);
  },

  getLocalFoodActivityKeys(userId: string): Promise<string[]> {
    return nutritionRepository.getLocalFoodActivityKeys(userId);
  },
};
