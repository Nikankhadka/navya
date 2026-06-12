import type { GoalType } from '@/types/app';

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

export function sessionProgress(session: {
  session_exercises: { completed_sets: unknown[]; planned_sets: number; is_skipped: boolean }[];
}): number {
  const total = session.session_exercises.length;
  if (total === 0) return 0;
  const done = session.session_exercises.filter(
    (ex) => ex.is_skipped || ex.completed_sets.length >= ex.planned_sets,
  ).length;
  return Math.round((done / total) * 100);
}

export function formatWeight(weightKg: number): string {
  return `${weightKg} kg`;
}
