import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/features/workout/api/workout.service';

export function useWorkoutHistory(userId?: string, weeklyTarget = 3) {
  return useQuery({
    queryKey: ['workout-history', userId, weeklyTarget],
    queryFn: () => workoutService.getWorkoutHistory(userId ?? '', weeklyTarget),
    enabled: Boolean(userId),
  });
}
