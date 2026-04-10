import { useQuery } from '@tanstack/react-query';
import { featureFlagService } from '../services/featureFlagService';

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => featureFlagService.getFlags(),
  });
}
