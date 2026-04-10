import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkoutPlan, WorkoutSession } from '../types/app';
import { workoutService } from '../services/workoutService';

export function useWorkoutActions(userId?: string) {
  const queryClient = useQueryClient();

  const startSession = useMutation({
    mutationFn: (plan: WorkoutPlan | null) => workoutService.startSession(userId ?? '', plan),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['today-session', userId] });
    },
  });

  const saveSession = useMutation({
    mutationFn: ({ session, elapsedSeconds }: { session: WorkoutSession; elapsedSeconds: number }) =>
      workoutService.saveSession(session, elapsedSeconds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['today-session', userId] });
    },
  });

  return { startSession, saveSession };
}
