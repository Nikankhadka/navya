import type {
  FoodLog,
  GoalType,
  UserProfile,
  WaterLog,
  WeightLog,
  WeeklyCoachSummary,
  WeeklyCoachSummaryMetric,
  WorkoutHistoryEntry,
} from '../types/app';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  MOCK_FOOD_LOGS,
  MOCK_PROFILE,
  MOCK_WATER_LOGS,
  MOCK_WEIGHT_LOGS,
  MOCK_WORKOUT_HISTORY,
} from '../mocks/mockData';
import { mapFoodLogRow, mapWaterLogRow } from './supabaseMappers';
import { habitService } from './habitService';
import { profileService } from './profileService';
import { workoutService } from './workoutService';

const WEEK_WINDOW_DAYS = 7;
const HYDRATION_DAY_GOAL_ML = 2000;

function startOfTrackingWindow(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (WEEK_WINDOW_DAYS - 1));
  return date;
}

function sameMonthLabel(start: Date, end: Date): string {
  return `${start.getDate()}-${end.getDate()} ${end.toLocaleDateString('en-AU', {
    month: 'short',
  })}`;
}

function formatTimeframeLabel(start: Date, end: Date): string {
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return sameMonthLabel(start, end);
  }

  return `${start.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  })} - ${end.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  })}`;
}

function uniqueLoggedDays(items: Array<{ logged_at: string }>): number {
  return new Set(items.map((item) => item.logged_at.slice(0, 10))).size;
}

function hydrationGoalDays(waterLogs: WaterLog[]): number {
  const totalsByDay = new Map<string, number>();

  for (const entry of waterLogs) {
    const key = entry.logged_at.slice(0, 10);
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + entry.amount_ml);
  }

  return Array.from(totalsByDay.values()).filter((amount) => amount >= HYDRATION_DAY_GOAL_ML).length;
}

function completedWorkoutsThisWeek(
  workoutHistory: WorkoutHistoryEntry[],
  startDate: Date,
): WorkoutHistoryEntry[] {
  const startMs = startDate.getTime();
  return workoutHistory.filter((entry) => new Date(entry.completed_at).getTime() >= startMs);
}

function buildWeightNote(goal: GoalType | null | undefined, weightHistory: WeightLog[]): string | null {
  const [latest, previous] = weightHistory;

  if (!latest || !previous) {
    return null;
  }

  const delta = Number((latest.weight_kg - previous.weight_kg).toFixed(1));

  if (Math.abs(delta) < 0.2) {
    return 'Weight is holding steady, which is fine while you lock in consistency.';
  }

  if (goal === 'lose_weight' && delta < 0) {
    return `Weight is down ${Math.abs(delta).toFixed(1)} kg from the last check-in.`;
  }

  if (goal === 'build_muscle' && delta > 0) {
    return `Weight is up ${delta.toFixed(1)} kg from the last check-in, which can fit the current muscle-building block.`;
  }

  return null;
}

function buildMetrics(
  workoutsCompleted: number,
  workoutTarget: number,
  activeDays: number,
  streakDays: number,
): WeeklyCoachSummaryMetric[] {
  return [
    {
      label: 'Workouts',
      value: `${workoutsCompleted}/${workoutTarget}`,
      tone: workoutsCompleted >= Math.max(1, Math.ceil(workoutTarget * 0.6)) ? 'success' : 'warning',
    },
    {
      label: 'Active Days',
      value: `${activeDays}/7`,
      tone: activeDays >= 4 ? 'success' : 'neutral',
    },
    {
      label: 'Streak',
      value: `${streakDays} days`,
      tone: streakDays >= 3 ? 'accent' : 'neutral',
    },
  ];
}

function buildSummaryCopy(input: {
  workoutsCompleted: number;
  workoutTarget: number;
  activeDays: number;
  streakDays: number;
  mealDays: number;
  hydrationDays: number;
  weightNote: string | null;
}): Pick<WeeklyCoachSummary, 'title' | 'body' | 'next_step'> {
  const {
    workoutsCompleted,
    workoutTarget,
    activeDays,
    streakDays,
    mealDays,
    hydrationDays,
    weightNote,
  } = input;

  const strongWorkoutPace = workoutsCompleted >= Math.max(1, Math.ceil(workoutTarget * 0.6));
  const nutritionVisible = mealDays >= 3;
  const hydrationSteady = hydrationDays >= 3;

  if (workoutsCompleted === 0 && mealDays === 0) {
    return {
      title: 'No weekly summary yet',
      body: 'Log one workout and one meal to unlock your first check-in and give the coach a real signal to work with.',
      next_step: 'Open Workout and finish the next planned session.',
    };
  }

  if (strongWorkoutPace && nutritionVisible) {
    return {
      title: 'You’re on track this week',
      body: weightNote
        ? `Training and logging have stayed steady. ${weightNote}`
        : 'Training and logging have stayed steady. Keep the plan simple: finish your next workout and stay close to your food target.',
      next_step: hydrationSteady
        ? 'Finish your next scheduled workout and protect the streak.'
        : 'Hit your water target today so recovery keeps pace with the training load.',
    };
  }

  if (workoutsCompleted === 0) {
    return {
      title: 'This week needs one strong reset',
      body: 'You have not logged a completed workout yet this week. Start with today’s session and let the rest of the plan follow from there.',
      next_step: 'Complete one workout before the day closes.',
    };
  }

  if (!nutritionVisible) {
    return {
      title: 'Training is moving, nutrition needs more visibility',
      body: 'Workouts are showing up, but food logging is still patchy. One full day of meals will give the coach a cleaner read on your week.',
      next_step: 'Log your next full day of meals and hydration.',
    };
  }

  if (!hydrationSteady) {
    return {
      title: 'Your habits are building',
      body: 'The week has momentum, and hydration is the easiest next lever to tighten. Keep the rhythm simple and repeatable.',
      next_step: 'Reach your water target today and roll that same rhythm into tomorrow.',
    };
  }

  return {
    title: 'Training and habits are steady',
    body:
      streakDays > 0 || activeDays > 0
        ? 'You’ve kept the week moving. Next best move: finish the next session and keep the food log honest.'
        : 'The signals are still light, but the structure is there. Keep the next action small and repeatable.',
    next_step: 'Protect the streak with one useful action today.',
  };
}

function shouldUseDemoSummary(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

export const coachSummaryService = {
  async getWeeklySummary(userId: string): Promise<WeeklyCoachSummary | null> {
    const startDate = startOfTrackingWindow();
    const endDate = new Date();
    const startIso = startDate.toISOString();

    const [habitStreak, profile, weightHistory, workoutHistory, meals, waterLogs] = await Promise.all([
      habitService.getHabitStreak(userId),
      profileService.getProfile(userId),
      profileService.getWeightHistory(userId),
      workoutService.getWorkoutHistory(userId, 10),
      (async (): Promise<FoodLog[]> => {
        if (shouldUseDemoSummary(userId)) {
          return MOCK_FOOD_LOGS.filter((entry) => new Date(entry.logged_at).getTime() >= startDate.getTime());
        }

        const { data, error } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', startIso)
          .order('logged_at', { ascending: false });

        if (error) {
          console.error('Error fetching weekly food logs:', error);
          return [];
        }

        return (data ?? []).map(mapFoodLogRow);
      })(),
      (async (): Promise<WaterLog[]> => {
        if (shouldUseDemoSummary(userId)) {
          return MOCK_WATER_LOGS.filter((entry) => new Date(entry.logged_at).getTime() >= startDate.getTime());
        }

        const { data, error } = await supabase
          .from('water_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', startIso)
          .order('logged_at', { ascending: false });

        if (error) {
          console.error('Error fetching weekly water logs:', error);
          return [];
        }

        return (data ?? []).map(mapWaterLogRow);
      })(),
    ]);

    const workoutsThisWeek = completedWorkoutsThisWeek(workoutHistory, startDate);
    const workoutsCompleted = workoutsThisWeek.length;
    const workoutTarget = Math.min(7, Math.max(1, profile?.workouts_per_week ?? 3));
    const activeDays = habitStreak.completed_days_this_week;
    const streakDays = habitStreak.current_streak_days;
    const mealDays = uniqueLoggedDays(meals);
    const hydrationDays = hydrationGoalDays(waterLogs);
    const weightNote = buildWeightNote(profile?.goal, weightHistory);

    if (
      workoutsCompleted === 0 &&
      activeDays === 0 &&
      streakDays === 0 &&
      mealDays === 0 &&
      hydrationDays === 0 &&
      weightHistory.length === 0
    ) {
      return null;
    }

    const copy = buildSummaryCopy({
      workoutsCompleted,
      workoutTarget,
      activeDays,
      streakDays,
      mealDays,
      hydrationDays,
      weightNote,
    });

    return {
      timeframe_label: formatTimeframeLabel(startDate, endDate),
      focus_label: 'Weekly check-in',
      title: copy.title,
      body: copy.body,
      next_step: copy.next_step,
      source_label: shouldUseDemoSummary(userId)
        ? 'Seeded from demo workouts, food logs, hydration, and streak data.'
        : 'Based on logged workouts, food, hydration, and habit streaks.',
      metrics: buildMetrics(workoutsCompleted, workoutTarget, activeDays, streakDays),
      is_demo: shouldUseDemoSummary(userId),
    };
  },
};
