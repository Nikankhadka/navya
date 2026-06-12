import React from 'react';
import { View, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import { ProgressBar } from './MacroRing';
import { formatWaterAmount } from '@/utils/helpers';
import type { DailyNutritionSummary } from '@/types/app';

interface NutritionCardProps {
  colors: ThemeColors;
  dailyNutrition: DailyNutritionSummary | null;
}

export function NutritionCard({ colors, dailyNutrition }: NutritionCardProps) {
  const calorieRemaining = dailyNutrition
    ? dailyNutrition.calorie_goal - dailyNutrition.total_calories
    : 0;
  const waterProgress = dailyNutrition
    ? Math.min(
        Math.round((dailyNutrition.water_total_ml / dailyNutrition.water_goal_ml) * 100),
        100,
      )
    : 0;

  const macros = [
    {
      label: 'Protein',
      value: dailyNutrition?.total_protein_g ?? 0,
      goal: dailyNutrition?.protein_goal_g ?? 140,
      color: colors.accent,
      unit: 'g',
    },
    {
      label: 'Carbs',
      value: dailyNutrition?.total_carbs_g ?? 0,
      goal: 240,
      color: colors.green,
      unit: 'g',
    },
    {
      label: 'Fat',
      value: dailyNutrition?.total_fat_g ?? 0,
      goal: 70,
      color: colors.orange,
      unit: 'g',
    },
  ] as const;

  return (
    <Card>
      <View style={styles.calRow}>
        <View style={styles.calMain}>
          <Text style={[styles.calNumber, { color: colors.text }]}>
            {dailyNutrition?.total_calories ?? 0}
          </Text>
          <Text style={[styles.calLabel, { color: colors.muted }]}>
            of {dailyNutrition?.calorie_goal ?? 0} kcal
          </Text>
        </View>
        <View
          style={[
            styles.calRemaining,
            {
              backgroundColor: calorieRemaining > 0 ? colors.greenMuted : colors.redMuted,
            },
          ]}
        >
          <Text
            style={[
              styles.calRemainingText,
              { color: calorieRemaining > 0 ? colors.green : colors.red },
            ]}
          >
            {calorieRemaining > 0 ? '+' : ''}
            {calorieRemaining} kcal
          </Text>
          <Text style={[styles.calRemainingLabel, { color: colors.muted }]}>
            {calorieRemaining > 0 ? 'remaining' : 'over goal'}
          </Text>
        </View>
      </View>

      <View style={styles.macrosGrid}>
        {macros.map((macro) => (
          <View key={macro.label} style={styles.macroItem}>
            <ProgressBar
              value={macro.value}
              max={macro.goal}
              color={macro.color}
              height={5}
              showLabel
              label={macro.label}
            />
            <Text style={[styles.macroValue, { color: macro.color }]}>
              {macro.value}
              {macro.unit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.waterRow}>
        <View>
          <Text style={[styles.waterLabel, { color: colors.muted }]}>Hydration</Text>
          <Text style={[styles.waterValue, { color: colors.text }]}>
            {formatWaterAmount(dailyNutrition?.water_total_ml ?? 0)} /{' '}
            {formatWaterAmount(dailyNutrition?.water_goal_ml ?? 2500)}
          </Text>
        </View>
        <View style={styles.waterProgressWrap}>
          <ProgressBar
            value={waterProgress}
            max={100}
            color={colors.blue}
            height={6}
            showLabel={false}
          />
          <Text style={[styles.waterProgressText, { color: colors.dim }]}>
            {waterProgress}% of goal
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = {
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calMain: {},
  calNumber: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -1,
  },
  calLabel: {
    fontSize: Typography.size.sm,
  },
  calRemaining: {
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  calRemainingText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  calRemainingLabel: {
    fontSize: Typography.size.xs,
    marginTop: 1,
  },
  macrosGrid: {
    gap: Spacing.md,
  },
  macroItem: {
    gap: 4,
  },
  macroValue: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'right',
  },
  waterRow: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  waterLabel: {
    fontSize: Typography.size.xs,
    marginBottom: 4,
  },
  waterValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  waterProgressWrap: {
    flex: 1,
    gap: 6,
  },
  waterProgressText: {
    fontSize: Typography.size.xs,
    textAlign: 'right',
  },
} as const;
