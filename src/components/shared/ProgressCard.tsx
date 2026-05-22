import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import type { UserProfile, WeightProgressSummary, WorkoutHistorySummary } from '@/types/app';

interface ProgressCardProps {
  colors: ThemeColors;
  user: Partial<UserProfile> | null;
  weightProgress: WeightProgressSummary | null;
  workoutHistory: WorkoutHistorySummary | null;
  weeklyTarget: number;
}

export function ProgressCard({
  colors,
  user,
  weightProgress,
  workoutHistory,
  weeklyTarget,
}: ProgressCardProps) {
  const currentWeightKg = weightProgress?.current_weight_kg ?? user?.weight_kg ?? null;
  const weightDelta = weightProgress?.change_kg_14d ?? null;
  const adherencePct = workoutHistory?.adherence_pct ?? 0;
  const completedThisWeek = workoutHistory?.completed_this_week ?? 0;
  const lastWorkout = workoutHistory?.recent_sessions[0] ?? null;

  return (
    <Card style={styles.progressCard}>
      <View style={styles.progressGrid}>
        <View style={[styles.progressMetric, { borderColor: colors.border }]}>
          <Text style={[styles.progressMetricLabel, { color: colors.muted }]}>Current weight</Text>
          <Text style={[styles.progressMetricValue, { color: colors.text }]}>
            {currentWeightKg != null ? `${currentWeightKg.toFixed(1)}kg` : 'No check-ins yet'}
          </Text>
          <Text style={[styles.progressMetricSub, { color: colors.textSecondary }]}>
            {weightDelta == null
              ? 'Log a few check-ins to unlock your trend.'
              : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)}kg vs recent history`}
          </Text>
        </View>

        <View style={[styles.progressMetric, { borderColor: colors.border }]}>
          <Text style={[styles.progressMetricLabel, { color: colors.muted }]}>
            Weekly adherence
          </Text>
          <Text style={[styles.progressMetricValue, { color: colors.text }]}>{adherencePct}%</Text>
          <Text style={[styles.progressMetricSub, { color: colors.textSecondary }]}>
            {completedThisWeek}/{weeklyTarget} sessions completed this week
          </Text>
        </View>
      </View>

      <View style={[styles.progressFooter, { borderColor: colors.border }]}>
        <Text style={[styles.progressFooterLabel, { color: colors.muted }]}>
          Last completed workout
        </Text>
        <Text style={[styles.progressFooterValue, { color: colors.text }]}>
          {lastWorkout?.completed_at
            ? `${lastWorkout.day_name} · ${new Date(lastWorkout.completed_at).toLocaleDateString(
                'en-AU',
                {
                  day: 'numeric',
                  month: 'short',
                },
              )}`
            : 'Your recent sessions will appear here once you finish a workout.'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    marginBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  progressMetric: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: 4,
  },
  progressMetricLabel: {
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressMetricValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
  },
  progressMetricSub: {
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  progressFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: 4,
  },
  progressFooterLabel: {
    fontSize: Typography.size.xs,
  },
  progressFooterValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
