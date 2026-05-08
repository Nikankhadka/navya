import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/app';
import { MOCK_PROFILE } from '@/features/demo/mockData';

function shouldUseDemoProfile(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

export const profileService = {
  /**
   * Fetch a user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (shouldUseDemoProfile(userId)) {
      return userId === MOCK_PROFILE.id ? MOCK_PROFILE : null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data as UserProfile;
  },

  /**
   * Upsert a user profile
   */
  async upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    if (shouldUseDemoProfile(userId)) {
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        } as unknown as never
      );

    if (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
  },
};
