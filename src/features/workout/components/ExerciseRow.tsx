import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type { SessionExercise } from '@/features/workout/types';

interface ExerciseRowProps {
  exercise: SessionExercise;
  isActive: boolean;
  onPressExercise: () => void;
  onCompleteSet: () => void;
  onSkip: () => void;
  restActive: boolean;
}

export function ExerciseRow({
  exercise,
  isActive,
  onPressExercise,
  onCompleteSet,
  onSkip,
  restActive,
}: ExerciseRowProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const isDone = exercise.completed_sets.length >= exercise.planned_sets;
  const isSkipped = exercise.is_skipped;

  const completedSetSummary = exercise.completed_sets
    .map((s) => {
      const w = s.weight_kg ? `${s.weight_kg}kg` : '';
      const r = `${s.reps_completed}`;
      return w ? `${w} × ${r}` : r;
    })
    .join(', ');

  return (
    <View
      style={[
        styles.exerciseRow,
        isActive && !restActive && styles.exerciseRowActive,
        restActive && isActive && styles.exerciseRowResting,
        isDone && styles.exerciseRowDone,
        isSkipped && styles.exerciseRowSkipped,
      ]}
    >
      <TouchableOpacity
        style={styles.exerciseLeft}
        onPress={isDone || isSkipped ? undefined : onPressExercise}
        activeOpacity={isDone || isSkipped ? 1 : 0.7}
      >
        <View
          style={[
            styles.statusDot,
            isDone && { backgroundColor: colors.green },
            isActive && !isDone && !restActive && { backgroundColor: colors.accent },
            restActive && isActive && { backgroundColor: colors.orange },
          ]}
        >
          {isDone ? <Text style={styles.checkmark}>✓</Text> : null}
          {isActive && !isDone && !restActive ? <Text style={styles.activeDot}>●</Text> : null}
          {restActive && isActive ? <Text style={styles.restDot}>⏳</Text> : null}
        </View>

        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, (isDone || isSkipped) && styles.exerciseNameDone]}>
            {exercise.exercise_name}
          </Text>
          <Text style={styles.exerciseMeta}>
            {exercise.planned_sets} sets × {exercise.planned_reps}
          </Text>
          {completedSetSummary ? (
            <Text style={styles.completedSets} numberOfLines={1}>
              {completedSetSummary}
            </Text>
          ) : null}
          {isActive && !isDone && !restActive ? (
            <Text style={styles.setProgress}>
              {exercise.completed_sets.length}/{exercise.planned_sets} sets done — tap to log
            </Text>
          ) : null}
          {restActive && isActive ? <Text style={styles.restingLabel}>Resting...</Text> : null}
        </View>
      </TouchableOpacity>

      <View style={styles.exerciseRight}>
        {isActive && !isDone && !isSkipped && !restActive ? (
          <>
            <TouchableOpacity onPress={onCompleteSet} style={styles.quickLogBtn}>
              <Text style={styles.quickLogBtnText}>Quick Log</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {isSkipped ? (
          <View style={styles.skippedBadge}>
            <Text style={styles.skippedText}>Skipped</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseRowActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentMuted,
    },
    exerciseRowResting: {
      borderColor: `${colors.orange}66`,
      backgroundColor: colors.orangeMuted,
    },
    exerciseRowDone: {
      borderColor: `${colors.green}44`,
      backgroundColor: colors.greenMuted,
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
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    checkmark: {
      color: colors.textStrong,
      fontSize: 14,
      fontWeight: Typography.weight.bold,
    },
    activeDot: {
      color: Colors.white,
      fontSize: 10,
    },
    restDot: {
      fontSize: 12,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    exerciseNameDone: {
      textDecorationLine: 'line-through',
      color: colors.muted,
    },
    exerciseMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    completedSets: {
      color: colors.textSecondary,
      fontSize: Typography.size.xs,
      marginTop: 3,
    },
    setProgress: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      marginTop: 3,
      fontWeight: Typography.weight.semibold,
    },
    restingLabel: {
      color: colors.orange,
      fontSize: Typography.size.xs,
      marginTop: 3,
      fontWeight: Typography.weight.semibold,
    },
    exerciseRight: {
      flexDirection: 'column' as const,
      gap: Spacing.xs,
      marginLeft: Spacing.sm,
    },
    quickLogBtn: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: Radius.sm,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    quickLogBtnText: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    skipBtn: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center' as const,
    },
    skipBtnText: {
      color: colors.muted,
      fontSize: Typography.size.xs,
    },
    skippedBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.full,
      backgroundColor: `${colors.dim}33`,
    },
    skippedText: {
      color: colors.dim,
      fontSize: Typography.size.xs,
    },
  }) as const;
