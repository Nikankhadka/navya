import type { GoalType, ActivityLevel, DayOfWeek } from '@/types/app';

// ─── Time ─────────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(isoString).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export function calcCalorieGoal(
  weightKg: number,
  goal: GoalType,
  activityLevel: ActivityLevel
): number {
  const activityMultiplier: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  const bmr = weightKg * 22; // simplified
  const tdee = Math.round(bmr * activityMultiplier[activityLevel]);
  if (goal === 'build_muscle') return tdee + 300;
  if (goal === 'lose_weight') return tdee - 400;
  return tdee;
}

export function calcProteinGoal(weightKg: number, goal: GoalType): number {
  const multiplier = goal === 'build_muscle' ? 2.0 : goal === 'lose_weight' ? 1.8 : 1.6;
  return Math.round(weightKg * multiplier);
}

export function macroPercent(consumed: number, goal: number): number {
  return Math.min(Math.round((consumed / goal) * 100), 100);
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function goalLabel(goal: GoalType): string {
  const map: Record<GoalType, string> = {
    build_muscle: 'Build Muscle',
    lose_weight: 'Lose Weight',
    maintain: 'Maintain',
    improve_endurance: 'Endurance',
    general_fitness: 'General Fitness',
  };
  return map[goal];
}

export function dayLabel(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function dayShort(day: DayOfWeek): string {
  return day.slice(0, 3).toUpperCase();
}

export function mealTimeLabel(mealTime: string): string {
  const map: Record<string, string> = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snack',
  };
  return map[mealTime] ?? mealTime;
}

export function formatWaterAmount(amountMl: number): string {
  if (amountMl >= 1000) {
    return `${(amountMl / 1000).toFixed(1)}L`;
  }

  return `${amountMl}ml`;
}

// ─── Workout ──────────────────────────────────────────────────────────────────

export function sessionProgress(session: { session_exercises: Array<{ completed_sets: unknown[]; planned_sets: number; is_skipped: boolean }> }): number {
  const total = session.session_exercises.length;
  if (total === 0) return 0;
  const done = session.session_exercises.filter(
    (ex) => ex.is_skipped || ex.completed_sets.length >= ex.planned_sets
  ).length;
  return Math.round((done / total) * 100);
}

export function getWeekDayLabels(): string[] {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}
