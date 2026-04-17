import { useQuery } from '@tanstack/react-query';
import { coachSummaryService } from '../services/coachSummaryService';

export function useWeeklyCoachSummary(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['weekly-coach-summary', userId],
    queryFn: () => coachSummaryService.getWeeklySummary(userId ?? ''),
    enabled: Boolean(userId) && enabled,
  });
}
