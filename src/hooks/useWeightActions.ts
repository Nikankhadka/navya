import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { WeightLog } from '../types/app';
import { profileService } from '../services/profileService';

export function useWeightActions(userId?: string) {
  const queryClient = useQueryClient();

  const addWeightLog = useMutation({
    mutationFn: (entry: Omit<WeightLog, 'id' | 'user_id' | 'logged_at'>) =>
      profileService.addWeightLog(userId ?? '', entry),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['weight-history', userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      await queryClient.invalidateQueries({ queryKey: ['profile-adherence', userId] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-coach-summary', userId] });
    },
  });

  return { addWeightLog };
}
