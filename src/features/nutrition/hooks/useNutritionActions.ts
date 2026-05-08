import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCustomFoodInput, CreateFoodLogInput, FavoriteFoodInput } from '@/types/app';
import { nutritionService } from '@/features/nutrition/api/nutrition.service';

export function useNutritionActions(userId?: string) {
  const queryClient = useQueryClient();

  const addMeal = useMutation({
    mutationFn: (meal: CreateFoodLogInput) =>
      nutritionService.addMeal(userId ?? '', meal),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
      await queryClient.invalidateQueries({ queryKey: ['habit-streak', userId] });
    },
  });

  const deleteMeal = useMutation({
    mutationFn: (mealId: string) => nutritionService.deleteMeal(userId ?? '', mealId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
      await queryClient.invalidateQueries({ queryKey: ['habit-streak', userId] });
    },
  });

  const saveCustomFood = useMutation({
    mutationFn: (input: CreateCustomFoodInput) =>
      nutritionService.saveCustomFood(userId ?? '', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: (input: FavoriteFoodInput) =>
      nutritionService.toggleFavorite(userId ?? '', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
    },
  });

  const addWater = useMutation({
    mutationFn: (amountMl: number) => nutritionService.addWater(userId ?? '', amountMl),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
      await queryClient.invalidateQueries({ queryKey: ['habit-streak', userId] });
    },
  });

  return { addMeal, deleteMeal, saveCustomFood, toggleFavorite, addWater };
}
