import { useQuery } from '@tanstack/react-query';
import { workoutService } from '../services/workoutService';

export function useWorkoutHistory(userId?: string, limit = 5) {
  return useQuery({
    queryKey: ['workout-history', userId, limit],
    queryFn: () => workoutService.getWorkoutHistory(userId ?? '', limit),
    enabled: Boolean(userId),
  });
}
