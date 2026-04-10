import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FoodLog } from '../types/app';
import { nutritionService } from '../services/nutritionService';

export function useNutritionActions(userId?: string) {
  const queryClient = useQueryClient();

  const addMeal = useMutation({
    mutationFn: (meal: Omit<FoodLog, 'id' | 'user_id' | 'logged_at'>) =>
      nutritionService.addMeal(userId ?? '', meal),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
    },
  });

  const deleteMeal = useMutation({
    mutationFn: (mealId: string) => nutritionService.deleteMeal(mealId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-nutrition', userId] });
    },
  });

  return { addMeal, deleteMeal };
}
