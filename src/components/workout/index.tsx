import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import type { SessionExercise, WorkoutPlanDay } from '../../types/app';

// ─── Exercise Row (in session) ────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: SessionExercise;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ExerciseRow({
  exercise,
  isActive,
  onComplete,
  onSkip,
}: ExerciseRowProps) {
  const isDone = exercise.completed_sets.length >= exercise.planned_sets;
  const isSkipped = exercise.is_skipped;

  return (
    <View
      style={[
        styles.exerciseRow,
        isActive && styles.exerciseRowActive,
        isDone && styles.exerciseRowDone,
        isSkipped && styles.exerciseRowSkipped,
      ]}
    >
      <View style={styles.exerciseLeft}>
        {/* Status indicator */}
        <TouchableOpacity
          onPress={isDone ? undefined : onComplete}
          style={[
            styles.statusDot,
            isDone && { backgroundColor: Colors.green },
            isActive && !isDone && { backgroundColor: Colors.accent },
          ]}
        >
          {isDone && <Text style={styles.checkmark}>✓</Text>}
          {isActive && !isDone && <Text style={styles.activeDot}>●</Text>}
        </TouchableOpacity>

        <View style={styles.exerciseInfo}>
          <Text
            style={[
              styles.exerciseName,
              (isDone || isSkipped) && styles.exerciseNameDone,
            ]}
          >
            {exercise.exercise_name}
          </Text>
          <Text style={styles.exerciseMeta}>
            {exercise.planned_sets} sets × {exercise.planned_reps}
          </Text>
          {isActive && !isDone && (
            <Text style={styles.setProgress}>
              {exercise.completed_sets.length}/{exercise.planned_sets} sets done
            </Text>
          )}
        </View>
      </View>

      {isActive && !isDone && !isSkipped && (
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      )}

      {isSkipped && (
        <View style={styles.skippedBadge}>
          <Text style={styles.skippedText}>Skipped</Text>
        </View>
      )}
    </View>
  );
}

// ─── Plan Day Card ────────────────────────────────────────────────────────────

interface PlanDayCardProps {
  day: WorkoutPlanDay;
  onPress: () => void;
  isToday?: boolean;
}

export function PlanDayCard({ day, onPress, isToday }: PlanDayCardProps) {
  const muscleGroups = [
    ...new Set(day.plan_exercises.flatMap((pe) => pe.exercise.muscle_groups)),
  ].slice(0, 3);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.planCard, isToday && styles.planCardToday]}
    >
      <View style={styles.planCardTop}>
        <View>
          <Text style={styles.planDayLabel}>{day.day_of_week.slice(0, 3).toUpperCase()}</Text>
          <Text style={styles.planDayName}>{day.day_name}</Text>
        </View>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>TODAY</Text>
          </View>
        )}
      </View>

      <View style={styles.planCardMeta}>
        <Text style={styles.planMeta}>
          {day.plan_exercises.length} exercises · ~{day.estimated_minutes} min
        </Text>
      </View>

      <View style={styles.muscleTags}>
        {muscleGroups.map((mg) => (
          <View key={mg} style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>{mg.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ExerciseRow
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseRowActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  exerciseRowDone: {
    borderColor: Colors.green + '44',
    backgroundColor: Colors.greenMuted,
    opacity: 0.8,
  },
  exerciseRowSkipped: {
    opacity: 0.5,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
  activeDot: {
    color: '#fff',
    fontSize: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  exerciseNameDone: {
    textDecorationLine: 'line-through',
    color: Colors.muted,
  },
  exerciseMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  setProgress: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    marginTop: 3,
    fontWeight: Typography.weight.semibold,
  },
  skipBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipBtnText: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  skippedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.dim + '33',
  },
  skippedText: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
  },

  // PlanDayCard
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  planCardToday: {
    borderColor: Colors.accent,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  planDayLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  planDayName: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  todayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent + '22',
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  todayBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
  },
  planCardMeta: {
    marginBottom: Spacing.md,
  },
  planMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  muscleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  muscleTagText: {
    color: Colors.dim,
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
