import type { FeatureFlags } from '@/types/app';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mapFeatureFlagsRow } from '@/lib/supabase/mappers';

const DEFAULT_FLAGS: FeatureFlags = {
  ai_enabled: true,
  food_search_enabled: false,
  notifications_enabled: false,
  weekly_summary_enabled: false,
};

export const featureFlagService = {
  async getFlags(): Promise<FeatureFlags> {
    if (!isSupabaseConfigured) {
      return DEFAULT_FLAGS;
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching feature flags:', error);
      return DEFAULT_FLAGS;
    }

    return mapFeatureFlagsRow(data) ?? DEFAULT_FLAGS;
  },
};
