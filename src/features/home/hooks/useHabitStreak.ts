import { useQuery } from '@tanstack/react-query';
import { habitService } from '@/features/home/api/habit.service';

export function useHabitStreak(userId?: string) {
  return useQuery({
    queryKey: ['habit-streak', userId],
    queryFn: () => habitService.getHabitStreak(userId ?? ''),
    enabled: Boolean(userId),
  });
}
