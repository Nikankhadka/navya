import type { WorkoutHistorySummary, WorkoutPlan, WorkoutSession } from '@/types/app';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { MOCK_TODAY_SESSION, MOCK_WORKOUT_HISTORY } from '@/features/demo/mockData';
import { mapSessionExerciseRow, mapWorkoutSessionRow } from '@/lib/supabase/mappers';
import { fromDateKey, getTodayDateString } from '@/utils/date';
import { buildSessionFromPlan, getActivePlan, shouldUseDemoWorkout } from './workoutPlan.service';

const demoWorkoutHistory: WorkoutSession[] = [...MOCK_WORKOUT_HISTORY.recent_sessions];

/**
 * Compute the start of the current week (Monday) from an optional date key.
 */
function getWeekStart(dateKey?: string): Date {
  const now = dateKey ? fromDateKey(dateKey) : new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  now.setDate(now.getDate() + diff);
  now.setHours(0, 0, 0, 0);

  return now;
}

/**
 * Build a WorkoutHistorySummary from a list of completed sessions.
 */
function buildWorkoutHistorySummary(
  sessions: WorkoutSession[],
  weeklyTarget: number,
  dateKey?: string,
): WorkoutHistorySummary {
  const completedSessions = [...sessions]
    .filter((entry) => entry.status === 'completed' && entry.completed_at)
    .sort(
      (left, right) =>
        new Date(right.completed_at ?? right.started_at).getTime() -
        new Date(left.completed_at ?? left.started_at).getTime(),
    );
  const weekStart = getWeekStart(dateKey).getTime();
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
      weeklyTarget > 0 ? Math.min(Math.round((completedThisWeek / weeklyTarget) * 100), 100) : 0,
    last_completed_at: completedSessions[0]?.completed_at ?? null,
    total_completed_sessions: completedSessions.length,
    average_duration_seconds:
      durations.length > 0
        ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
        : null,
  };
}

/**
 * Fetch today's workout session for a user. Falls back to building a local
 * session from the active plan when no server session exists.
 */
export async function getTodaySession(
  userId: string,
  dateKey?: string,
): Promise<WorkoutSession | null> {
  const targetDate = dateKey ?? getTodayDateString();

  if (shouldUseDemoWorkout(userId)) {
    return MOCK_TODAY_SESSION;
  }

  const startDate = fromDateKey(targetDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
        *,
        session_exercises (*)
      `,
    )
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .lt('started_at', endDate.toISOString())
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

  const activePlan = await getActivePlan(userId);

  return activePlan ? buildSessionFromPlan(activePlan, targetDate) : null;
}

/**
 * Fetch the workout history summary for a user, including adherence stats.
 */
export async function getWorkoutHistory(
  userId: string,
  weeklyTarget = 3,
  dateKey?: string,
): Promise<WorkoutHistorySummary> {
  const targetDate = dateKey ?? getTodayDateString();

  if (shouldUseDemoWorkout(userId)) {
    const allSessions = [...demoWorkoutHistory, ...MOCK_WORKOUT_HISTORY.recent_sessions];
    const completedThisWeek = allSessions.filter((s) => s.status === 'completed').length;
    return {
      recent_sessions: allSessions.slice(0, 8),
      completed_this_week: completedThisWeek,
      weekly_target: weeklyTarget,
      adherence_pct:
        weeklyTarget > 0 ? Math.min(Math.round((completedThisWeek / weeklyTarget) * 100), 100) : 0,
      last_completed_at: allSessions[0]?.completed_at ?? null,
      total_completed_sessions: allSessions.length,
      average_duration_seconds:
        allSessions.length > 0
          ? Math.round(
              allSessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) /
                allSessions.length,
            )
          : null,
    };
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
        *,
        session_exercises (*)
      `,
    )
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching workout history:', error);
    return buildWorkoutHistorySummary([], weeklyTarget, targetDate);
  }

  return buildWorkoutHistorySummary(
    (data ?? []).map(mapWorkoutSessionRow),
    weeklyTarget,
    targetDate,
  );
}

/**
 * Start a new workout session from a plan. Persists to Supabase and returns
 * the full session with exercises.
 */
export async function startSession(
  userId: string,
  plan: WorkoutPlan | null,
): Promise<WorkoutSession | null> {
  if (!plan) {
    return null;
  }

  const localSession = buildSessionFromPlan(plan, getTodayDateString());

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

  const sessionRow = sessionRowRaw as
    | Database['public']['Tables']['workout_sessions']['Row']
    | null;

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
}

/**
 * Complete an in-progress session by marking it completed with elapsed time
 * and persisting exercise data.
 */
export async function saveSession(
  session: WorkoutSession,
  elapsedSeconds: number,
): Promise<WorkoutSession> {
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
}

/**
 * Save a post-hoc (already completed) workout session entered after the fact.
 * For demo mode, appends to the in-memory history so it shows in workout history.
 * For Supabase mode, inserts into workout_sessions and session_exercises tables.
 */
export async function savePostHocSession(session: WorkoutSession): Promise<WorkoutSession> {
  const completedSession: WorkoutSession = {
    ...session,
    status: 'completed',
    duration_seconds:
      session.duration_seconds ??
      session.session_exercises.reduce((total, ex) => total + ex.completed_sets.length * 120, 0),
  };

  if (shouldUseDemoWorkout(session.user_id)) {
    demoWorkoutHistory.unshift(completedSession);
    return completedSession;
  }

  // Persist to Supabase
  const { data: sessionRow, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: completedSession.user_id,
      plan_day_id: completedSession.plan_day_id,
      day_name: completedSession.day_name,
      status: 'completed',
      started_at: completedSession.started_at,
      completed_at: completedSession.completed_at,
      duration_seconds: completedSession.duration_seconds,
    } as never)
    .select('*')
    .single();

  if (sessionError || !sessionRow) {
    console.error('Error saving post-hoc session:', sessionError);
    return completedSession;
  }

  const sessionId = (sessionRow as Database['public']['Tables']['workout_sessions']['Row']).id;

  // Insert session exercises
  const sessionExercises = completedSession.session_exercises.map((ex) => ({
    session_id: sessionId,
    exercise_id: ex.exercise_id,
    exercise_name: ex.exercise_name,
    planned_sets: ex.planned_sets,
    planned_reps: ex.planned_reps,
    completed_sets: ex.completed_sets as never,
    notes: ex.notes,
    is_skipped: false,
  }));

  const { error: exError } = await supabase
    .from('session_exercises')
    .insert(sessionExercises as never);

  if (exError) {
    console.error('Error saving post-hoc session exercises:', exError);
  }

  return {
    ...completedSession,
    id: sessionId,
  };
}
