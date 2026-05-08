import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/features/profile/api/profile.service';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId ?? ''),
    enabled: Boolean(userId),
  });
}
