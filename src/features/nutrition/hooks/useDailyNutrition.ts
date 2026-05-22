import { useQuery } from '@tanstack/react-query';
import { nutritionService } from '@/features/nutrition/api/nutrition.service';

export function useDailyNutrition(userId?: string, dateKey?: string) {
  return useQuery({
    queryKey: ['daily-nutrition', userId, dateKey],
    queryFn: () => nutritionService.getDailySummary(userId ?? '', dateKey),
    enabled: Boolean(userId),
  });
}
