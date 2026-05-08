import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/theme';
import type { SessionExercise } from '@/features/workout/types';

interface ExerciseRowProps {
  exercise: SessionExercise;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ExerciseRow({ exercise, isActive, onComplete, onSkip }: ExerciseRowProps) {
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
        <TouchableOpacity
          onPress={isDone ? undefined : onComplete}
          style={[
            styles.statusDot,
            isDone && { backgroundColor: Colors.green },
            isActive && !isDone && { backgroundColor: Colors.accent },
          ]}
        >
          {isDone ? <Text style={styles.checkmark}>✓</Text> : null}
          {isActive && !isDone ? <Text style={styles.activeDot}>●</Text> : null}
        </TouchableOpacity>

        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, (isDone || isSkipped) && styles.exerciseNameDone]}>
            {exercise.exercise_name}
          </Text>
          <Text style={styles.exerciseMeta}>
            {exercise.planned_sets} sets × {exercise.planned_reps}
          </Text>
          {isActive && !isDone ? (
            <Text style={styles.setProgress}>
              {exercise.completed_sets.length}/{exercise.planned_sets} sets done
            </Text>
          ) : null}
        </View>
      </View>

      {isActive && !isDone && !isSkipped ? (
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      ) : null}

      {isSkipped ? (
        <View style={styles.skippedBadge}>
          <Text style={styles.skippedText}>Skipped</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.black,
    fontSize: 14,
    fontWeight: Typography.weight.bold,
  },
  activeDot: {
    color: Colors.white,
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
});
