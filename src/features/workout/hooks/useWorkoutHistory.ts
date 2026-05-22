import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/features/workout/api/workout.service';

export function useWorkoutHistory(userId?: string, weeklyTarget = 3, dateKey?: string) {
  return useQuery({
    queryKey: ['workout-history', userId, weeklyTarget, dateKey],
    queryFn: () => workoutService.getWorkoutHistory(userId ?? '', weeklyTarget, dateKey),
    enabled: Boolean(userId),
  });
}
