import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId ?? ''),
    enabled: Boolean(userId),
  });
}
