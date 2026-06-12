import { useQuery } from '@tanstack/react-query';
import { coachService } from '@/features/coach/api/coach.service';

export function useWeeklyCoachSummary(userId?: string) {
  return useQuery({
    queryKey: ['weekly-coach-summary', userId],
    queryFn: () => coachService.getWeeklySummary(userId ?? ''),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
