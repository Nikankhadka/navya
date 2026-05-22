import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/features/workout/api/workout.service';

export function useTodaySession(userId?: string, dateKey?: string) {
  return useQuery({
    queryKey: ['today-session', userId, dateKey],
    queryFn: () => workoutService.getTodaySession(userId ?? '', dateKey),
    enabled: Boolean(userId),
  });
}
