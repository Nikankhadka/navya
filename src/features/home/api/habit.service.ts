import type { HabitStreakSummary } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_DAILY_NUTRITION, MOCK_TODAY_SESSION } from '@/features/demo/mockData';
import { nutritionService } from '@/features/nutrition/api/nutrition.service';
import { fromDateKey, getTodayDateString, toDateKey } from '@/utils/date';

type WaterLogActivityRow = Pick<Database['public']['Tables']['water_logs']['Row'], 'logged_at'>;
type WorkoutSessionActivityRow = Pick<
  Database['public']['Tables']['workout_sessions']['Row'],
  'started_at' | 'status'
>;

function dayKeyFromIso(value: string): string {
  return value.slice(0, 10);
}

function weekKeysFromDate(dateKey: string): string[] {
  const date = fromDateKey(dateKey);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const entry = new Date(monday);
    entry.setDate(monday.getDate() + index);
    return toDateKey(entry);
  });
}

function buildHabitSummary(activityKeys: Set<string>, dateKey: string): HabitStreakSummary {
  const baseDate = fromDateKey(dateKey);
  let streak = 0;

  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(baseDate.getDate() - offset);
    const key = toDateKey(date);

    if (!activityKeys.has(key)) {
      break;
    }

    streak += 1;
  }

  const weekKeys = weekKeysFromDate(dateKey);
  const weeklyActivity = weekKeys.map((key) => activityKeys.has(key));

  return {
    current_streak_days: streak,
    weekly_activity: weeklyActivity,
    completed_days_this_week: weeklyActivity.filter(Boolean).length,
    activity_dates: Array.from(activityKeys),
  };
}

export const habitService = {
  async getHabitStreak(userId: string, dateKey?: string): Promise<HabitStreakSummary> {
    const targetDate = dateKey ?? getTodayDateString();

    if (!isSupabaseConfigured) {
      const activityKeys = new Set<string>([
        ...MOCK_DAILY_NUTRITION.meals.map((meal) => dayKeyFromIso(meal.logged_at)),
        ...MOCK_DAILY_NUTRITION.water_logs.map((entry) => dayKeyFromIso(entry.logged_at)),
      ]);

      if (
        MOCK_TODAY_SESSION.status === 'in_progress' ||
        MOCK_TODAY_SESSION.status === 'completed'
      ) {
        activityKeys.add(dayKeyFromIso(MOCK_TODAY_SESSION.started_at));
      }

      return buildHabitSummary(activityKeys, targetDate);
    }

    const [mealKeys, { data: water, error: waterError }, { data: sessions, error: sessionsError }] =
      await Promise.all([
        nutritionService.getLocalFoodActivityKeys(userId),
        supabase
          .from('water_logs')
          .select('logged_at')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false })
          .limit(60),
        supabase
          .from('workout_sessions')
          .select('started_at,status')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(30),
      ]);

    if (waterError) {
      console.error('Error fetching water activity:', waterError);
    }

    if (sessionsError) {
      console.error('Error fetching workout activity:', sessionsError);
    }

    const activityKeys = new Set<string>();

    for (const key of mealKeys) {
      activityKeys.add(key);
    }

    for (const entry of (water as WaterLogActivityRow[] | null) ?? []) {
      activityKeys.add(dayKeyFromIso(entry.logged_at));
    }

    for (const session of (sessions as WorkoutSessionActivityRow[] | null) ?? []) {
      if (session.status === 'completed') {
        activityKeys.add(dayKeyFromIso(session.started_at));
      }
    }

    return buildHabitSummary(activityKeys, targetDate);
  },
};
