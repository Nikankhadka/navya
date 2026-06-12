import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import { ExerciseRow } from '@/features/workout/components';
import type { WorkoutSession } from '@/types/app';

export interface TimerDisplayProps {
  activeSession: WorkoutSession;
  progress: number;
  onCompleteSet: (exerciseId: string) => void;
  onSkipExercise: (exerciseId: string) => void;
}

export function TimerDisplay({
  activeSession,
  progress,
  onCompleteSet,
  onSkipExercise,
}: TimerDisplayProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <>
      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </Card>

      <View style={styles.exerciseList}>
        {activeSession.session_exercises.map((exercise, i) => {
          const isDone = exercise.completed_sets.length >= exercise.planned_sets;
          const prevDone = activeSession.session_exercises
            .slice(0, i)
            .every((e) => e.completed_sets.length >= e.planned_sets || e.is_skipped);
          const isActive = !isDone && !exercise.is_skipped && prevDone;

          return (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              isActive={isActive}
              onComplete={() => onCompleteSet(exercise.exercise_id)}
              onSkip={() => onSkipExercise(exercise.exercise_id)}
            />
          );
        })}
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    progressCard: { marginBottom: Spacing.lg, padding: Spacing.lg },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    progressLabel: { color: colors.muted, fontSize: Typography.size.sm },
    progressPct: {
      color: colors.accent,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 4,
    },
    exerciseList: { gap: Spacing.sm },
  });
