import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import { formatDuration } from '@/utils/helpers';
import type { WorkoutHistorySummary } from '@/types/app';

export interface WorkoutStatsProps {
  workoutHistory: WorkoutHistorySummary | undefined;
  weeklyTarget: number;
  onSessionPress?: (sessionId: string) => void;
}

export function WorkoutStats({ workoutHistory, weeklyTarget, onSessionPress }: WorkoutStatsProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Card style={styles.historySummaryCard}>
      <View style={styles.historySummaryHeader}>
        <View>
          <Text style={styles.historySummaryTitle}>Recent Training History</Text>
          <Text style={styles.historySummarySub}>
            {workoutHistory?.completed_this_week ?? 0}/
            {workoutHistory?.weekly_target ?? weeklyTarget} sessions completed this week
          </Text>
        </View>
        <View style={styles.historySummaryBadge}>
          <Text style={styles.historySummaryBadgeValue}>{workoutHistory?.adherence_pct ?? 0}%</Text>
          <Text style={styles.historySummaryBadgeLabel}>adherence</Text>
        </View>
      </View>

      {workoutHistory?.recent_sessions.length ? (
        <View style={styles.historyList}>
          {workoutHistory.recent_sessions.slice(0, 3).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.historyRow}
              onPress={() => onSessionPress?.(session.id)}
              activeOpacity={0.7}
            >
              <View style={styles.historyRowText}>
                <Text style={styles.historyDay}>{session.day_name}</Text>
                <Text style={styles.historyMeta}>
                  {session.completed_at
                    ? new Date(session.completed_at).toLocaleDateString('en-AU', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Completed session'}
                </Text>
              </View>
              <View style={styles.historyRowStats}>
                <Text style={styles.historyStatPrimary}>
                  {session.session_exercises.reduce(
                    (sum, exercise) => sum + exercise.completed_sets.length,
                    0,
                  )}{' '}
                  sets
                </Text>
                <Text style={styles.historyStatSecondary}>
                  {session.duration_seconds != null
                    ? formatDuration(session.duration_seconds)
                    : 'Tracked'}
                </Text>
                <Text style={[styles.tapHint, { color: colors.accent }]}>Tap for details</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.historyEmptyText}>
          Completed sessions will appear here once you finish your first workout.
        </Text>
      )}
    </Card>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    historySummaryCard: {
      marginTop: Spacing.lg,
      gap: Spacing.lg,
    },
    historySummaryHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      gap: Spacing.md,
      alignItems: 'flex-start' as const,
    },
    historySummaryTitle: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
    historySummarySub: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    historySummaryBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
    },
    historySummaryBadgeValue: {
      color: colors.accent,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    historySummaryBadgeLabel: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    historyList: {
      gap: Spacing.sm,
    },
    historyRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.sm,
    },
    historyRowText: {
      flex: 1,
    },
    historyDay: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    historyMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    historyRowStats: {
      alignItems: 'flex-end' as const,
      gap: 2,
    },
    historyStatPrimary: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
    },
    historyStatSecondary: {
      color: colors.dim,
      fontSize: Typography.size.xs,
    },
    tapHint: {
      fontSize: 9,
      fontWeight: Typography.weight.semibold,
    },
    historyEmptyText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
  }) as const;
