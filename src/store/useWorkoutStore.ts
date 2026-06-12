import { create } from 'zustand';
import type { WorkoutSession, SessionExercise, CompletedSet } from '@/types/app';

interface WorkoutStore {
  activeSession: WorkoutSession | null;
  elapsedSeconds: number;
  timerActive: boolean;

  // Rest timer
  restEndTimestamp: number | null;
  restDuration: number;
  restActive: boolean;
  restPausedRemaining: number | null;
  restExerciseName: string | null;
  nextExerciseName: string | null;

  // Actions
  startSession: (session: WorkoutSession) => void;
  endSession: () => void;
  logSet: (exerciseId: string, set: CompletedSet, restSeconds: number) => void;
  skipExercise: (exerciseId: string) => void;
  tickTimer: () => void;
  setTimerActive: (active: boolean) => void;
  resetSession: () => void;

  // Rest timer actions
  pauseRest: () => void;
  resumeRest: () => void;
  skipRest: () => void;
  extendRest: (seconds: number) => void;
  syncRestTimer: () => void;

  // Helpers
  computeRestRemaining: () => number;
  computeNextExerciseName: (exerciseId: string) => string | null;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeSession: null,
  elapsedSeconds: 0,
  timerActive: false,

  restEndTimestamp: null,
  restDuration: 0,
  restActive: false,
  restPausedRemaining: null,
  restExerciseName: null,
  nextExerciseName: null,

  startSession: (session) => set({ activeSession: session, elapsedSeconds: 0, timerActive: true }),

  endSession: () =>
    set((state) => ({
      activeSession: state.activeSession
        ? {
            ...state.activeSession,
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_seconds: state.elapsedSeconds,
          }
        : null,
      timerActive: false,
      restActive: false,
      restEndTimestamp: null,
      restPausedRemaining: null,
    })),

  logSet: (exerciseId, completedSet, restSeconds) =>
    set((state) => {
      if (!state.activeSession) return state;

      const restEndTimestamp = Date.now() + restSeconds * 1000;
      const nextName = get().computeNextExerciseName(exerciseId);

      return {
        activeSession: {
          ...state.activeSession,
          session_exercises: state.activeSession.session_exercises.map(
            (ex): SessionExercise =>
              ex.exercise_id === exerciseId
                ? { ...ex, completed_sets: [...ex.completed_sets, completedSet] }
                : ex,
          ),
        },
        restEndTimestamp,
        restDuration: restSeconds,
        restActive: true,
        restPausedRemaining: null,
        restExerciseName:
          state.activeSession.session_exercises.find((e) => e.exercise_id === exerciseId)
            ?.exercise_name ?? null,
        nextExerciseName: nextName,
      };
    }),

  skipExercise: (exerciseId) =>
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: {
          ...state.activeSession,
          session_exercises: state.activeSession.session_exercises.map(
            (ex): SessionExercise =>
              ex.exercise_id === exerciseId ? { ...ex, is_skipped: true } : ex,
          ),
        },
      };
    }),

  tickTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  setTimerActive: (timerActive) => set({ timerActive }),

  resetSession: () =>
    set({
      activeSession: null,
      elapsedSeconds: 0,
      timerActive: false,
      restEndTimestamp: null,
      restDuration: 0,
      restActive: false,
      restPausedRemaining: null,
      restExerciseName: null,
      nextExerciseName: null,
    }),

  pauseRest: () =>
    set((state) => {
      if (!state.restActive || !state.restEndTimestamp) return state;
      const remaining = Math.max(0, Math.ceil((state.restEndTimestamp - Date.now()) / 1000));
      return {
        restPausedRemaining: remaining,
        restEndTimestamp: null,
      };
    }),

  resumeRest: () =>
    set((state) => {
      if (state.restPausedRemaining === null) return state;
      return {
        restEndTimestamp: Date.now() + state.restPausedRemaining * 1000,
        restPausedRemaining: null,
      };
    }),

  skipRest: () =>
    set({
      restActive: false,
      restEndTimestamp: null,
      restPausedRemaining: null,
      restExerciseName: null,
      nextExerciseName: null,
    }),

  extendRest: (seconds) =>
    set((state) => {
      if (!state.restActive) return state;
      const base = state.restEndTimestamp ?? Date.now();
      return { restEndTimestamp: base + seconds * 1000 };
    }),

  syncRestTimer: () =>
    set((state) => {
      if (!state.restActive || !state.restEndTimestamp) return state;
      const remaining = Math.max(0, Math.ceil((state.restEndTimestamp - Date.now()) / 1000));
      if (remaining <= 0) {
        return {
          restActive: false,
          restEndTimestamp: null,
          restExerciseName: null,
          nextExerciseName: null,
        };
      }
      return state;
    }),

  computeRestRemaining: () => {
    const state = get();
    if (!state.restActive) return 0;
    if (state.restEndTimestamp) {
      return Math.max(0, Math.ceil((state.restEndTimestamp - Date.now()) / 1000));
    }
    return state.restPausedRemaining ?? 0;
  },

  computeNextExerciseName: (currentExerciseId: string) => {
    const state = get();
    if (!state.activeSession) return null;
    const exercises = state.activeSession.session_exercises;
    const currentIdx = exercises.findIndex((e) => e.exercise_id === currentExerciseId);
    if (currentIdx === -1) return null;

    for (let i = currentIdx + 1; i < exercises.length; i++) {
      const ex = exercises[i];
      const isDone = ex.completed_sets.length >= ex.planned_sets || ex.is_skipped;
      if (!isDone) return ex.exercise_name;
    }
    return null;
  },
}));
