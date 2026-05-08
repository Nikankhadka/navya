import { useQuery } from '@tanstack/react-query';
import { nutritionService } from '@/features/nutrition/api/nutrition.service';

export function useDailyNutrition(userId?: string) {
  return useQuery({
    queryKey: ['daily-nutrition', userId],
    queryFn: () => nutritionService.getDailySummary(userId ?? ''),
    enabled: Boolean(userId),
  });
}
