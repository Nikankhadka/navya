import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';

interface WeeklyCoachSummaryCardProps {
  colors: ThemeColors;
  summary: string;
}

export function WeeklyCoachSummaryCard({ colors, summary }: WeeklyCoachSummaryCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => router.push('/(tabs)/coach')}>
      <View
        style={[
          styles.card,
          { borderColor: `${colors.accent}33`, backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={[styles.title, { color: colors.text }]}>Weekly Coach Summary</Text>
          <View style={[styles.badge, { backgroundColor: colors.accentMuted }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>NEW</Text>
          </View>
        </View>
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={5}>
          {summary}
        </Text>
        <Text style={[styles.cta, { color: colors.accent }]}>View full summary →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  cta: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
} as const;
