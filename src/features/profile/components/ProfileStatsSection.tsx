import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';

export interface ProfileStatsSectionProps {
  stats: { label: string; value: string; suffix: string }[];
  weightKg: number | null;
  heightCm: number | null;
}

export function ProfileStatsSection({ stats, weightKg, heightCm }: ProfileStatsSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSuffix}>{stat.suffix}</Text>
          </View>
        ))}
      </View>

      <Card style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {weightKg ?? '—'}
              <Text style={styles.metricUnit}> kg</Text>
            </Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {heightCm ?? '—'}
              <Text style={styles.metricUnit}> cm</Text>
            </Text>
            <Text style={styles.metricLabel}>Height</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>
              {weightKg && heightCm ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : '—'}
            </Text>
            <Text style={styles.metricLabel}>BMI</Text>
          </View>
        </View>
      </Card>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
      marginBottom: Spacing.xxl,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      letterSpacing: -0.5,
    },
    statLabel: { color: colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
    statSuffix: { color: colors.dim, fontSize: Typography.size.xs },

    metricsCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
    sectionTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md },
    metric: { alignItems: 'center' },
    metricVal: {
      color: colors.text,
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
    },
    metricUnit: { color: colors.muted, fontSize: Typography.size.sm },
    metricLabel: { color: colors.muted, fontSize: Typography.size.sm, marginTop: 2 },
    metricDivider: { width: 1, backgroundColor: colors.border },
  });
