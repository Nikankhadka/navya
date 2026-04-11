import { useQuery } from '@tanstack/react-query';
import { habitService } from '../services/habitService';

export function useHabitStreak(userId?: string) {
  return useQuery({
    queryKey: ['habit-streak', userId],
    queryFn: () => habitService.getHabitStreak(userId ?? ''),
    enabled: Boolean(userId),
  });
}
