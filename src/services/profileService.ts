import { supabase, isSupabaseConfigured } from './supabase';
import type { UserProfile, WeightLog } from '../types/app';
import { MOCK_PROFILE, MOCK_WEIGHT_LOGS } from '../mocks/mockData';
import { mapWeightLogRow } from './supabaseMappers';

let demoProfile: UserProfile = { ...MOCK_PROFILE };
let demoWeightLogs: WeightLog[] = [...MOCK_WEIGHT_LOGS].sort((left, right) =>
  right.logged_at.localeCompare(left.logged_at)
);

function shouldUseDemoProfile(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

export const profileService = {
  /**
   * Fetch a user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (shouldUseDemoProfile(userId)) {
      return userId === MOCK_PROFILE.id ? { ...demoProfile } : null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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
      demoProfile = {
        ...demoProfile,
        ...profile,
        updated_at: new Date().toISOString(),
      };
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

  async getWeightHistory(userId: string): Promise<WeightLog[]> {
    if (shouldUseDemoProfile(userId)) {
      return demoWeightLogs.map((entry) => ({ ...entry }));
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error fetching weight history:', error);
      return [];
    }

    return (data ?? []).map(mapWeightLogRow);
  },

  async addWeightLog(
    userId: string,
    entry: Omit<WeightLog, 'id' | 'user_id' | 'logged_at'>,
  ): Promise<WeightLog> {
    const payload: WeightLog = {
      id: `weight-${Date.now()}`,
      user_id: userId,
      logged_at: new Date().toISOString(),
      ...entry,
    };

    if (shouldUseDemoProfile(userId)) {
      demoWeightLogs = [payload, ...demoWeightLogs].sort((left, right) =>
        right.logged_at.localeCompare(left.logged_at)
      );
      demoProfile = {
        ...demoProfile,
        weight_kg: payload.weight_kg,
        updated_at: payload.logged_at,
      };
      return payload;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight_kg: payload.weight_kg,
        notes: payload.notes,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating weight log:', error);
      return payload;
    }

    try {
      await this.upsertProfile(userId, { weight_kg: payload.weight_kg });
    } catch (profileError) {
      console.error('Error syncing profile weight:', profileError);
    }

    return mapWeightLogRow(data);
  },
};
