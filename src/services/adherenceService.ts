import type { ProfileAdherenceSummary } from '../types/app';
import { habitService } from './habitService';
import { profileService } from './profileService';
import { workoutService } from './workoutService';

export const adherenceService = {
  async getProfileAdherenceSummary(userId: string): Promise<ProfileAdherenceSummary> {
    const [workoutsCompleted30d, habitStreak, weightHistory, profile] = await Promise.all([
      workoutService.getCompletedSessionCount(userId, 30),
      habitService.getHabitStreak(userId),
      profileService.getWeightHistory(userId),
      profileService.getProfile(userId),
    ]);

    return {
      workouts_completed_30d: workoutsCompleted30d,
      active_days_this_week: habitStreak.completed_days_this_week,
      current_streak_days: habitStreak.current_streak_days,
      latest_weight_kg: weightHistory[0]?.weight_kg ?? profile?.weight_kg ?? null,
    };
  },
};
