/**
 * Re-export barrel for backward compatibility.
 * All plan-related operations live in workoutPlan.service.ts.
 * All session-related operations live in workoutSession.service.ts.
 * This file assembles the original `workoutService` object so existing
 * consumers (hooks, barrel exports) continue to work unchanged.
 */
import { getActivePlan, createDefaultPlan } from './workoutPlan.service';
import {
  getTodaySession,
  getWorkoutHistory,
  startSession,
  saveSession,
} from './workoutSession.service';

export const workoutService = {
  getActivePlan,
  createDefaultPlan,
  getTodaySession,
  getWorkoutHistory,
  startSession,
  saveSession,
};
