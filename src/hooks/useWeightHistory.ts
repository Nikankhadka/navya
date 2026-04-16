import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useWeightHistory(userId?: string) {
  return useQuery({
    queryKey: ['weight-history', userId],
    queryFn: () => profileService.getWeightHistory(userId ?? ''),
    enabled: Boolean(userId),
  });
}
