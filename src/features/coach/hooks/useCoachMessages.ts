import { useQuery } from '@tanstack/react-query';
import { coachService } from '@/features/coach/api/coach.service';

export function useCoachMessages(userId?: string) {
  return useQuery({
    queryKey: ['coach-messages', userId],
    queryFn: () => coachService.getMessages(userId ?? ''),
    enabled: Boolean(userId),
  });
}
