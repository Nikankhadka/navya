import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/features/workout/api/workout.service';

export function useTodaySession(userId?: string) {
  return useQuery({
    queryKey: ['today-session', userId],
    queryFn: () => workoutService.getTodaySession(userId ?? ''),
    enabled: Boolean(userId),
  });
}
