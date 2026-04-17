import { useQuery } from '@tanstack/react-query';
import { adherenceService } from '../services/adherenceService';

export function useProfileAdherence(userId?: string) {
  return useQuery({
    queryKey: ['profile-adherence', userId],
    queryFn: () => adherenceService.getProfileAdherenceSummary(userId ?? ''),
    enabled: Boolean(userId),
  });
}
