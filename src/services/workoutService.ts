import type { WorkoutPlan, WorkoutSession } from '../types/app';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_PLAN, MOCK_TODAY_SESSION } from '../mocks/mockData';

export const workoutService = {
  async getActivePlan(userId: string): Promise<WorkoutPlan | null> {
    if (!isSupabaseConfigured) {
      return MOCK_PLAN;
    }

    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active plan:', error);
      return null;
    }

    return (data as unknown as WorkoutPlan) ?? null;
  },

  async getTodaySession(userId: string): Promise<WorkoutSession | null> {
    if (!isSupabaseConfigured) {
      return MOCK_TODAY_SESSION;
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }

    return (data as unknown as WorkoutSession) ?? null;
  },
};
