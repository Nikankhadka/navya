import { useQuery } from '@tanstack/react-query';
import { featureFlagService } from '@/features/coach/api/featureFlag.service';

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => featureFlagService.getFlags(),
  });
}
