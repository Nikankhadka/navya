import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { formatDuration } from '@/utils/helpers';
import type { WorkoutSession } from '@/types/app';

export interface SessionCompleteCardProps {
  activeSession: WorkoutSession;
  elapsedSeconds: number;
}

export function SessionCompleteCard({ activeSession, elapsedSeconds }: SessionCompleteCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.completeCard}>
      <Text style={styles.completeEmoji}>🎉</Text>
      <Text style={styles.completeTitle}>Session Complete!</Text>
      <Text style={styles.completeSub}>You crushed it in {formatDuration(elapsedSeconds)}</Text>
      <View style={styles.completeStats}>
        <View style={styles.completeStat}>
          <Text style={styles.completeStatVal}>{activeSession.session_exercises.length}</Text>
          <Text style={styles.completeStatLabel}>Exercises</Text>
        </View>
        <View style={styles.completeStat}>
          <Text style={styles.completeStatVal}>
            {activeSession.session_exercises.reduce((sum, ex) => sum + ex.completed_sets.length, 0)}
          </Text>
          <Text style={styles.completeStatLabel}>Sets</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    completeCard: {
      alignItems: 'center',
      paddingVertical: 48,
      backgroundColor: colors.card,
      borderRadius: Radius.xxl,
      borderWidth: 1,
      borderColor: `${colors.green}44`,
    },
    completeEmoji: { fontSize: 52 },
    completeTitle: {
      color: colors.green,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      marginTop: Spacing.md,
    },
    completeSub: {
      color: colors.muted,
      fontSize: Typography.size.md,
      marginTop: Spacing.xs,
      marginBottom: Spacing.xxl,
    },
    completeStats: { flexDirection: 'row', gap: 48 },
    completeStat: { alignItems: 'center' },
    completeStatVal: {
      color: colors.text,
      fontSize: Typography.size.xxxl,
      fontWeight: Typography.weight.extrabold,
    },
    completeStatLabel: { color: colors.muted, fontSize: Typography.size.sm },
  });
