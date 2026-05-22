import { useQuery } from '@tanstack/react-query';
import { habitService } from '@/features/home/api/habit.service';

export function useHabitStreak(userId?: string, dateKey?: string) {
  return useQuery({
    queryKey: ['habit-streak', userId, dateKey],
    queryFn: () => habitService.getHabitStreak(userId ?? '', dateKey),
    enabled: Boolean(userId),
  });
}
