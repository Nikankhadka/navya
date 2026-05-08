import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/features/workout/api/workout.service';

export function useActivePlan(userId?: string) {
  return useQuery({
    queryKey: ['active-plan', userId],
    queryFn: () => workoutService.getActivePlan(userId ?? ''),
    enabled: Boolean(userId),
  });
}
