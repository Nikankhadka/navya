import type { HabitStreakSummary } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_DAILY_NUTRITION, MOCK_TODAY_SESSION } from '@/features/demo/mockData';

type FoodLogActivityRow = Pick<Database['public']['Tables']['food_logs']['Row'], 'logged_at'>;
type WaterLogActivityRow = Pick<Database['public']['Tables']['water_logs']['Row'], 'logged_at'>;
type WorkoutSessionActivityRow = Pick<
  Database['public']['Tables']['workout_sessions']['Row'],
  'started_at' | 'status'
>;

function dayKeyFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayKeyFromIso(value: string): string {
  return value.slice(0, 10);
}

function currentWeekKeys(): string[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const entry = new Date(monday);
    entry.setDate(monday.getDate() + index);
    return dayKeyFromDate(entry);
  });
}

function buildHabitSummary(activityKeys: Set<string>): HabitStreakSummary {
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - offset);
    const key = dayKeyFromDate(date);

    if (!activityKeys.has(key)) {
      break;
    }

    streak += 1;
  }

  const weekKeys = currentWeekKeys();
  const weeklyActivity = weekKeys.map((key) => activityKeys.has(key));

  return {
    current_streak_days: streak,
    weekly_activity: weeklyActivity,
    completed_days_this_week: weeklyActivity.filter(Boolean).length,
  };
}

export const habitService = {
  async getHabitStreak(userId: string): Promise<HabitStreakSummary> {
    if (!isSupabaseConfigured) {
      const activityKeys = new Set<string>([
        ...MOCK_DAILY_NUTRITION.meals.map((meal) => dayKeyFromIso(meal.logged_at)),
        ...MOCK_DAILY_NUTRITION.water_logs.map((entry) => dayKeyFromIso(entry.logged_at)),
      ]);

      if (MOCK_TODAY_SESSION.status === 'in_progress' || MOCK_TODAY_SESSION.status === 'completed') {
        activityKeys.add(dayKeyFromIso(MOCK_TODAY_SESSION.started_at));
      }

      return buildHabitSummary(activityKeys);
    }

    const [{ data: meals, error: mealsError }, { data: water, error: waterError }, { data: sessions, error: sessionsError }] =
      await Promise.all([
        supabase.from('food_logs').select('logged_at').eq('user_id', userId).order('logged_at', { ascending: false }).limit(60),
        supabase.from('water_logs').select('logged_at').eq('user_id', userId).order('logged_at', { ascending: false }).limit(60),
        supabase.from('workout_sessions').select('started_at,status').eq('user_id', userId).order('started_at', { ascending: false }).limit(30),
      ]);

    if (mealsError) {
      console.error('Error fetching meal activity:', mealsError);
    }

    if (waterError) {
      console.error('Error fetching water activity:', waterError);
    }

    if (sessionsError) {
      console.error('Error fetching workout activity:', sessionsError);
    }

    const activityKeys = new Set<string>();

    for (const meal of (meals as FoodLogActivityRow[] | null) ?? []) {
      activityKeys.add(dayKeyFromIso(meal.logged_at));
    }

    for (const entry of (water as WaterLogActivityRow[] | null) ?? []) {
      activityKeys.add(dayKeyFromIso(entry.logged_at));
    }

    for (const session of (sessions as WorkoutSessionActivityRow[] | null) ?? []) {
      if (session.status === 'completed') {
        activityKeys.add(dayKeyFromIso(session.started_at));
      }
    }

    return buildHabitSummary(activityKeys);
  },
};
