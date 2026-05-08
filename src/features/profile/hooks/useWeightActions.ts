import { useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/features/profile/api/progress.service';

export function useWeightActions(userId?: string) {
  const queryClient = useQueryClient();

  const logWeight = useMutation({
    mutationFn: (weightKg: number) => progressService.logWeight(userId ?? '', weightKg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      await queryClient.invalidateQueries({ queryKey: ['weight-progress', userId] });
    },
  });

  return { logWeight };
}
