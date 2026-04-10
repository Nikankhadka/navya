import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachService } from '../services/coachService';

export function useCoachActions(userId?: string) {
  const queryClient = useQueryClient();

  const requestQuickReply = useMutation({
    mutationFn: (text: string) => coachService.requestQuickReply(userId ?? '', text),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coach-messages', userId] });
    },
  });

  return { requestQuickReply };
}
