import React from 'react';
import { View, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import type { WeightProgressSummary } from '@/types/app';

interface WeightTrendCardProps {
  colors: ThemeColors;
  weightProgress: WeightProgressSummary | null;
  goalWeight?: number | null;
}

export function WeightTrendCard({ colors, weightProgress, goalWeight }: WeightTrendCardProps) {
  const logs = weightProgress?.recent_logs ?? [];
  const currentWeight = weightProgress?.current_weight_kg ?? null;
  const change = weightProgress?.change_kg_14d ?? null;

  if (logs.length === 0) {
    return (
      <Card>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyEmoji]}>⚖️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No weight data yet</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Log your first weigh-in from Profile to see your trend.
          </Text>
        </View>
      </Card>
    );
  }

  // Sort logs chronologically (oldest first) for trend display
  const sortedLogs = [...logs]
    .filter((log) => log.weight_kg > 0)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

  // Take last 8 entries for display
  const displayLogs = sortedLogs.slice(-8);

  // Find min/max for bar scaling
  const weights = displayLogs.map((l) => l.weight_kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1;

  // Summary stats
  const startWeight = displayLogs[0]?.weight_kg;
  const latestWeight = displayLogs[displayLogs.length - 1]?.weight_kg;
  const totalChange =
    startWeight != null && latestWeight != null
      ? Number((latestWeight - startWeight).toFixed(1))
      : null;

  return (
    <Card>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Weight Trend</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Last {displayLogs.length} check-ins
          </Text>
        </View>
        {currentWeight != null && (
          <View style={styles.currentWeight}>
            <Text style={[styles.weightValue, { color: colors.text }]}>{currentWeight}</Text>
            <Text style={[styles.weightUnit, { color: colors.muted }]}>kg</Text>
          </View>
        )}
      </View>

      {/* Change indicators */}
      <View style={styles.changeRow}>
        {totalChange != null && (
          <View
            style={[
              styles.changeChip,
              {
                backgroundColor: totalChange < 0 ? `${colors.green}18` : `${colors.orange}18`,
                borderColor: totalChange < 0 ? colors.green : colors.orange,
              },
            ]}
          >
            <Text
              style={[styles.changeText, { color: totalChange < 0 ? colors.green : colors.orange }]}
            >
              {totalChange > 0 ? '+' : ''}
              {totalChange} kg
            </Text>
            <Text style={[styles.changeLabel, { color: colors.muted }]}>change</Text>
          </View>
        )}
        {change != null && (
          <View style={styles.changeChip}>
            <Text style={[styles.changeText, { color: colors.dim }]}>
              {change != null && change > 0 ? '+' : ''}
              {change} kg
            </Text>
            <Text style={[styles.changeLabel, { color: colors.muted }]}>14d</Text>
          </View>
        )}
        {goalWeight != null && currentWeight != null && (
          <View
            style={[
              styles.changeChip,
              { backgroundColor: `${colors.blue}18`, borderColor: colors.blue },
            ]}
          >
            <Text style={[styles.changeText, { color: colors.blue }]}>
              {Number((currentWeight - goalWeight).toFixed(1)) > 0 ? '+' : ''}
              {Number((currentWeight - goalWeight).toFixed(1))} kg
            </Text>
            <Text style={[styles.changeLabel, { color: colors.muted }]}>to goal</Text>
          </View>
        )}
      </View>

      {/* Bar chart */}
      <View style={styles.chartWrap}>
        <View style={[styles.chartBars, { height: 120 }]}>
          {displayLogs.map((log, i) => {
            const heightPct = ((log.weight_kg - minWeight) / weightRange) * 100;
            return (
              <View key={log.id ?? i} style={styles.barCol}>
                <View
                  style={[
                    styles.barValueWrap,
                    { height: `${Math.max(heightPct, 8)}%` as unknown as number },
                  ]}
                >
                  <View
                    style={[
                      styles.barValue,
                      {
                        height: '100%',
                        backgroundColor:
                          i === displayLogs.length - 1 ? colors.accent : `${colors.accent}55`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barWeight, { color: colors.dim }]}>{log.weight_kg}</Text>
                <Text style={[styles.barDate, { color: colors.dim }]}>
                  {new Date(log.logged_at).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
}

const styles = {
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  currentWeight: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 4,
  },
  weightValue: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  weightUnit: {
    fontSize: Typography.size.sm,
  },
  changeRow: {
    flexDirection: 'row' as const,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  changeChip: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center' as const,
  },
  changeText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  changeLabel: {
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  chartWrap: {
    marginTop: Spacing.sm,
  },
  chartBars: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: Spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  barValueWrap: {
    width: '100%' as const,
    justifyContent: 'flex-end' as const,
  },
  barValue: {
    borderRadius: Radius.sm,
    width: '100%' as const,
  },
  barWeight: {
    fontSize: 9,
    fontWeight: Typography.weight.bold,
  },
  barDate: {
    fontSize: 8,
  },
  emptyWrap: {
    alignItems: 'center' as const,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  emptyText: {
    fontSize: Typography.size.sm,
    textAlign: 'center' as const,
  },
};
