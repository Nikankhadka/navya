import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Colors, Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import { ExerciseRow } from '@/features/workout/components';
import type { WorkoutSession } from '@/types/app';

export interface TimerDisplayProps {
  activeSession: WorkoutSession;
  progress: number;
  restActive: boolean;
  restRemaining: number;
  restDuration: number;
  restExerciseName: string | null;
  nextExerciseName: string | null;
  onCompleteSet: (exerciseId: string) => void;
  onSkipExercise: (exerciseId: string) => void;
  onPressExercise: (exerciseId: string) => void;
  onPauseRest: () => void;
  onResumeRest: () => void;
  onSkipRest: () => void;
  onExtendRest: () => void;
  isRestPaused: boolean;
}

export function TimerDisplay({
  activeSession,
  progress,
  restActive,
  restRemaining,
  restDuration,
  restExerciseName,
  nextExerciseName,
  onCompleteSet,
  onSkipExercise,
  onPressExercise,
  onPauseRest,
  onResumeRest,
  onSkipRest,
  onExtendRest,
  isRestPaused,
}: TimerDisplayProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const restProgress = restDuration > 0 ? restRemaining / restDuration : 0;
  const restDisplay = `${Math.floor(restRemaining / 60)}:${(restRemaining % 60)
    .toString()
    .padStart(2, '0')}`;

  const ringSize = 120;
  const strokeWidth = 6;

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

      {restActive ? (
        <Card style={styles.restCard}>
          <Text style={styles.restTitle}>{isRestPaused ? 'Rest Paused' : 'Rest'}</Text>
          {restExerciseName ? (
            <Text style={styles.restExerciseName}>{restExerciseName}</Text>
          ) : null}

          <View style={styles.ringContainer}>
            <View style={[styles.ringBg, { borderColor: colors.border }]}>
              <View
                style={[
                  styles.ringProgress,
                  {
                    borderColor: isRestPaused ? colors.muted : colors.orange,
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                  },
                ]}
              >
                <Text
                  style={[styles.restTime, { color: isRestPaused ? colors.muted : colors.text }]}
                >
                  {restDisplay}
                </Text>
              </View>
            </View>
            {/* SVG ring overlay using View-based approximation */}
            <View style={styles.ringOverlay} pointerEvents="none">
              <View
                style={[
                  styles.ringArc,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: isRestPaused ? colors.muted : colors.orange,
                    borderRightColor: isRestPaused ? colors.muted : colors.orange,
                    transform: [{ rotate: `${-90 + (1 - restProgress) * 360}deg` }],
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.ringDashedCircle,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: strokeWidth,
                  borderColor: colors.border,
                },
              ]}
            />
          </View>

          {nextExerciseName ? (
            <Text style={styles.nextExercise}>Next: {nextExerciseName}</Text>
          ) : null}

          <View style={styles.restControls}>
            {isRestPaused ? (
              <Pressable
                style={[styles.restCtrlBtn, { backgroundColor: colors.accent }]}
                onPress={onResumeRest}
              >
                <Text style={styles.restCtrlBtnText}>Resume</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.restCtrlBtn} onPress={onPauseRest}>
                <Text style={styles.restCtrlBtnMuted}>Pause</Text>
              </Pressable>
            )}
            <Pressable style={styles.restCtrlBtn} onPress={onSkipRest}>
              <Text style={styles.restCtrlBtnMuted}>Skip</Text>
            </Pressable>
            <Pressable style={styles.restCtrlBtn} onPress={onExtendRest}>
              <Text style={styles.restCtrlBtnMuted}>+30s</Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      <View style={styles.exerciseList}>
        {activeSession.session_exercises.map((exercise, i) => {
          const isDone = exercise.completed_sets.length >= exercise.planned_sets;
          const prevDone = activeSession.session_exercises
            .slice(0, i)
            .every((e) => e.completed_sets.length >= e.planned_sets || e.is_skipped);
          const isActive = !isDone && !exercise.is_skipped && prevDone;
          const isCurrentRest = restActive && restExerciseName === exercise.exercise_name;

          return (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              isActive={isActive}
              restActive={isCurrentRest}
              onPressExercise={() => onPressExercise(exercise.exercise_id)}
              onCompleteSet={() => onCompleteSet(exercise.exercise_id)}
              onSkip={() => onSkipExercise(exercise.exercise_id)}
            />
          );
        })}
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
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

    restCard: {
      marginBottom: Spacing.lg,
      padding: Spacing.xl,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: `${colors.orange}33`,
    },
    restTitle: {
      color: colors.orange,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      marginBottom: Spacing.xs,
    },
    restExerciseName: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      marginBottom: Spacing.lg,
    },
    ringContainer: {
      width: 120,
      height: 120,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: Spacing.lg,
    },
    ringBg: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    ringProgress: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    ringDashedCircle: {
      position: 'absolute' as const,
    },
    ringOverlay: {
      position: 'absolute' as const,
    },
    ringArc: {
      position: 'absolute' as const,
    },
    restTime: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    nextExercise: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginBottom: Spacing.lg,
    },
    restControls: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
    },
    restCtrlBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    restCtrlBtnText: {
      color: Colors.white,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    restCtrlBtnMuted: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },

    exerciseList: { gap: Spacing.sm },
  }) as const;
