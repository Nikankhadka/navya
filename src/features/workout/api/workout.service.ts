import type { WorkoutHistorySummary, WorkoutPlan, WorkoutSession } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  MOCK_PLAN,
  MOCK_PROFILE,
  MOCK_TODAY_SESSION,
  MOCK_WORKOUT_HISTORY,
} from '@/features/demo/mockData';
import {
  mapSessionExerciseRow,
  mapWorkoutPlanRow,
  mapWorkoutSessionRow,
} from '@/lib/supabase/mappers';

function buildSessionFromPlan(plan: WorkoutPlan): WorkoutSession | null {
  const todayDayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const planDay =
    plan.workout_plan_days.find((entry) => entry.day_of_week === todayDayOfWeek) ??
    plan.workout_plan_days[0];

  if (!planDay) {
    return null;
  }

  const sessionId = `local-session-${Date.now()}`;

  return {
    id: sessionId,
    user_id: plan.user_id,
    plan_day_id: planDay.id,
    day_name: planDay.day_name,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    completed_at: null,
    duration_seconds: null,
    session_exercises: planDay.plan_exercises.map((exercise, index) => ({
      id: `local-session-exercise-${index}`,
      session_id: sessionId,
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise.name,
      planned_sets: exercise.sets,
      planned_reps: exercise.reps,
      completed_sets: [],
      notes: exercise.notes,
      is_skipped: false,
    })),
  };
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  now.setDate(now.getDate() + diff);
  now.setHours(0, 0, 0, 0);

  return now;
}

function buildWorkoutHistorySummary(
  sessions: WorkoutSession[],
  weeklyTarget: number,
): WorkoutHistorySummary {
  const completedSessions = [...sessions]
    .filter((entry) => entry.status === 'completed' && entry.completed_at)
    .sort(
      (left, right) =>
        new Date(right.completed_at ?? right.started_at).getTime() -
        new Date(left.completed_at ?? left.started_at).getTime(),
    );
  const weekStart = getWeekStart().getTime();
  const completedThisWeek = completedSessions.filter(
    (entry) => new Date(entry.completed_at ?? entry.started_at).getTime() >= weekStart,
  ).length;
  const durations = completedSessions
    .map((entry) => entry.duration_seconds)
    .filter((entry): entry is number => typeof entry === 'number' && entry > 0);

  return {
    recent_sessions: completedSessions.slice(0, 5),
    completed_this_week: completedThisWeek,
    weekly_target: weeklyTarget,
    adherence_pct:
      weeklyTarget > 0
        ? Math.min(Math.round((completedThisWeek / weeklyTarget) * 100), 100)
        : 0,
    last_completed_at: completedSessions[0]?.completed_at ?? null,
    total_completed_sessions: completedSessions.length,
    average_duration_seconds:
      durations.length > 0
        ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
        : null,
  };
}

function shouldUseDemoWorkout(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

export const workoutService = {
  async getActivePlan(userId: string): Promise<WorkoutPlan | null> {
    if (shouldUseDemoWorkout(userId)) {
      return MOCK_PLAN;
    }

    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_plan_days (
          *,
          plan_exercises (
            *,
            exercise:exercise_library (*)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active plan:', error);
      return null;
    }

    return data ? mapWorkoutPlanRow(data) : null;
  },

  async getTodaySession(userId: string): Promise<WorkoutSession | null> {
    if (shouldUseDemoWorkout(userId)) {
      return MOCK_TODAY_SESSION;
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        session_exercises (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }

    if (data) {
      return mapWorkoutSessionRow(data);
    }

    const activePlan = await this.getActivePlan(userId);

    return activePlan ? buildSessionFromPlan(activePlan) : null;
  },

  async getWorkoutHistory(userId: string, weeklyTarget = 3): Promise<WorkoutHistorySummary> {
    if (shouldUseDemoWorkout(userId)) {
      return {
        ...MOCK_WORKOUT_HISTORY,
        weekly_target: weeklyTarget,
        adherence_pct:
          weeklyTarget > 0
            ? Math.min(
                Math.round((MOCK_WORKOUT_HISTORY.completed_this_week / weeklyTarget) * 100),
                100,
              )
            : 0,
      };
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        session_exercises (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error fetching workout history:', error);
      return buildWorkoutHistorySummary([], weeklyTarget);
    }

    return buildWorkoutHistorySummary((data ?? []).map(mapWorkoutSessionRow), weeklyTarget);
  },

  async startSession(userId: string, plan: WorkoutPlan | null): Promise<WorkoutSession | null> {
    if (!plan) {
      return null;
    }

    const localSession = buildSessionFromPlan(plan);

    if (shouldUseDemoWorkout(userId) || !localSession) {
      return localSession ?? MOCK_TODAY_SESSION;
    }

    const { data: sessionRowRaw, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        plan_day_id: localSession.plan_day_id,
        day_name: localSession.day_name,
        status: 'in_progress',
      } as never)
      .select('*')
      .single();

    const sessionRow = sessionRowRaw as Database['public']['Tables']['workout_sessions']['Row'] | null;

    if (sessionError || !sessionRow) {
      console.error('Error creating workout session:', sessionError);
      return localSession;
    }

    const sessionExercises = localSession.session_exercises.map((exercise) => ({
      session_id: sessionRow.id,
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise_name,
      planned_sets: exercise.planned_sets,
      planned_reps: exercise.planned_reps,
      completed_sets: [],
      notes: exercise.notes,
      is_skipped: false,
    }));

    const { data: exerciseRows, error: exerciseError } = await supabase
      .from('session_exercises')
      .insert(sessionExercises as never)
      .select('*');

    if (exerciseError) {
      console.error('Error creating session exercises:', exerciseError);
    }

    return {
      ...mapWorkoutSessionRow(sessionRow),
      session_exercises: (exerciseRows ?? []).map(mapSessionExerciseRow),
    };
  },

  async saveSession(session: WorkoutSession, elapsedSeconds: number): Promise<WorkoutSession> {
    const completedSession: WorkoutSession = {
      ...session,
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
    };

    if (shouldUseDemoWorkout(session.user_id)) {
      return completedSession;
    }

    const { error: sessionError } = await supabase
      .from('workout_sessions')
      .update({
        status: completedSession.status,
        completed_at: completedSession.completed_at,
        duration_seconds: completedSession.duration_seconds,
      } as never)
      .eq('id', session.id);

    if (sessionError) {
      console.error('Error updating workout session:', sessionError);
      return completedSession;
    }

    for (const exercise of completedSession.session_exercises) {
      const { error } = await supabase
        .from('session_exercises')
        .update({
          completed_sets: exercise.completed_sets,
          is_skipped: exercise.is_skipped,
          notes: exercise.notes,
        } as never)
        .eq('id', exercise.id);

      if (error) {
        console.error('Error updating session exercise:', error);
      }
    }

    return completedSession;
  },
};
