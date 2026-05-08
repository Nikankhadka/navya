import { useQuery } from '@tanstack/react-query';
import { nutritionService } from '@/features/nutrition/api/nutrition.service';

export function useFoodSearch(userId: string | undefined, query: string, enabled = true) {
  return useQuery({
    queryKey: ['food-search', userId, query],
    queryFn: () => nutritionService.searchFoods(userId ?? '', query),
    enabled: enabled && Boolean(userId) && query.trim().length > 0,
    staleTime: 30_000,
  });
}
