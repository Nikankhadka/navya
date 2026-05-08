import { useQuery } from '@tanstack/react-query';
import { progressService } from '@/features/profile/api/progress.service';

export function useWeightProgress(userId?: string) {
  return useQuery({
    queryKey: ['weight-progress', userId],
    queryFn: () => progressService.getWeightProgress(userId ?? ''),
    enabled: Boolean(userId),
  });
}
