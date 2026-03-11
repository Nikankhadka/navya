import { create } from 'zustand';
import type { WorkoutSession, SessionExercise, CompletedSet } from '../types/app';

interface WorkoutStore {
  activeSession: WorkoutSession | null;
  elapsedSeconds: number;
  timerActive: boolean;

  // Actions
  startSession: (session: WorkoutSession) => void;
  endSession: () => void;
  markExerciseDone: (exerciseId: string, set: CompletedSet) => void;
  skipExercise: (exerciseId: string) => void;
  tickTimer: () => void;
  setTimerActive: (active: boolean) => void;
  resetSession: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  activeSession: null,
  elapsedSeconds: 0,
  timerActive: false,

  startSession: (session) =>
    set({ activeSession: session, elapsedSeconds: 0, timerActive: true }),

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
    })),

  markExerciseDone: (exerciseId, completedSet) =>
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: {
          ...state.activeSession,
          session_exercises: state.activeSession.session_exercises.map(
            (ex): SessionExercise =>
              ex.exercise_id === exerciseId
                ? { ...ex, completed_sets: [...ex.completed_sets, completedSet] }
                : ex
          ),
        },
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
              ex.exercise_id === exerciseId ? { ...ex, is_skipped: true } : ex
          ),
        },
      };
    }),

  tickTimer: () =>
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  setTimerActive: (timerActive) => set({ timerActive }),

  resetSession: () =>
    set({ activeSession: null, elapsedSeconds: 0, timerActive: false }),
}));
