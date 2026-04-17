import type { WorkoutHistoryEntry, WorkoutPlan, WorkoutSession } from '../types/app';
import type { Database } from '../types/supabase';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  MOCK_PLAN,
  MOCK_PROFILE,
  MOCK_TODAY_SESSION,
  MOCK_WORKOUT_HISTORY,
} from '../mocks/mockData';
import {
  mapSessionExerciseRow,
  mapWorkoutPlanRow,
  mapWorkoutSessionRow,
} from './supabaseMappers';

function buildSessionFromPlan(plan: WorkoutPlan): WorkoutSession | null {
  const planDay = plan.workout_plan_days[0];

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

function shouldUseDemoWorkout(userId: string): boolean {
  return userId === MOCK_PROFILE.id || !isSupabaseConfigured;
}

function cloneSession(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    session_exercises: session.session_exercises.map((exercise) => ({
      ...exercise,
      completed_sets: exercise.completed_sets.map((entry) => ({ ...entry })),
    })),
  };
}

function toHistoryEntry(session: WorkoutSession): WorkoutHistoryEntry {
  const completedExerciseCount = session.session_exercises.filter(
    (exercise) => exercise.is_skipped || exercise.completed_sets.length >= exercise.planned_sets,
  ).length;
  const skippedExerciseCount = session.session_exercises.filter((exercise) => exercise.is_skipped).length;
  const completedSetCount = session.session_exercises.reduce(
    (sum, exercise) => sum + exercise.completed_sets.length,
    0,
  );

  return {
    id: session.id,
    day_name: session.day_name,
    started_at: session.started_at,
    completed_at: session.completed_at ?? session.started_at,
    duration_seconds: session.duration_seconds,
    exercise_count: session.session_exercises.length,
    completed_exercise_count: completedExerciseCount,
    completed_set_count: completedSetCount,
    skipped_exercise_count: skippedExerciseCount,
  };
}

let demoTodaySession: WorkoutSession = cloneSession(MOCK_TODAY_SESSION);
let demoWorkoutHistory: WorkoutHistoryEntry[] = [...MOCK_WORKOUT_HISTORY].sort((left, right) =>
  right.completed_at.localeCompare(left.completed_at),
);

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
      return cloneSession(demoTodaySession);
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        session_exercises (*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }

    return data ? mapWorkoutSessionRow(data) : null;
  },

  async getWorkoutHistory(userId: string, limit = 5): Promise<WorkoutHistoryEntry[]> {
    if (shouldUseDemoWorkout(userId)) {
      return demoWorkoutHistory.slice(0, limit).map((entry) => ({ ...entry }));
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
      .limit(limit);

    if (error) {
      console.error('Error fetching workout history:', error);
      return [];
    }

    return (data ?? []).map((row) => toHistoryEntry(mapWorkoutSessionRow(row)));
  },

  async getCompletedSessionCount(userId: string, days = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString();

    if (shouldUseDemoWorkout(userId)) {
      return demoWorkoutHistory.filter((entry) => entry.completed_at >= cutoffIso).length;
    }

    const { count, error } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', cutoffIso);

    if (error) {
      console.error('Error counting workout sessions:', error);
      return 0;
    }

    return count ?? 0;
  },

  async startSession(userId: string, plan: WorkoutPlan | null): Promise<WorkoutSession | null> {
    if (!plan) {
      return null;
    }

    const localSession = buildSessionFromPlan(plan);

    if (shouldUseDemoWorkout(userId) || !localSession) {
      if (localSession) {
        demoTodaySession = cloneSession(localSession);
      }

      return localSession ? cloneSession(localSession) : cloneSession(demoTodaySession);
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
      demoTodaySession = cloneSession(completedSession);
      demoWorkoutHistory = [
        toHistoryEntry(completedSession),
        ...demoWorkoutHistory.filter((entry) => entry.id !== completedSession.id),
      ].sort((left, right) => right.completed_at.localeCompare(left.completed_at));

      return cloneSession(completedSession);
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
