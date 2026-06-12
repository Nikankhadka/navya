import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MacroRing } from '@/components/shared/MacroRing';
import { Card } from '@/components/ui';
import { Radius, Spacing, Typography, useAppTheme } from '@/theme';

export interface MacroSummaryHeaderProps {
  totalCal: number;
  calorieGoal: number;
  totalProtein: number;
  proteinGoal: number;
  totalCarbs: number;
  carbGoal: number;
  totalFat: number;
  fatGoal: number;
}

export function MacroSummaryHeader({
  totalCal,
  calorieGoal,
  totalProtein,
  proteinGoal,
  totalCarbs,
  carbGoal,
  totalFat,
  fatGoal,
}: MacroSummaryHeaderProps) {
  const { colors } = useAppTheme();
  const remaining = calorieGoal - totalCal;

  return (
    <Card style={macroStyles.macroCard}>
      <View style={macroStyles.ringRow}>
        <MacroRing
          value={totalCal}
          max={calorieGoal}
          size={85}
          color={colors.orange}
          label="Calories"
          unit=" kcal"
        />
        <MacroRing
          value={totalProtein}
          max={proteinGoal}
          size={85}
          color={colors.accent}
          label="Protein"
          unit="g"
        />
        <MacroRing
          value={totalCarbs}
          max={carbGoal}
          size={85}
          color={colors.green}
          label="Carbs"
          unit="g"
        />
        <MacroRing
          value={totalFat}
          max={fatGoal}
          size={85}
          color={colors.blue}
          label="Fat"
          unit="g"
        />
      </View>

      <View
        style={[
          macroStyles.remainingBanner,
          { backgroundColor: remaining >= 0 ? colors.greenMuted : colors.redMuted },
        ]}
      >
        <Text
          style={[macroStyles.remainingText, { color: remaining >= 0 ? colors.green : colors.red }]}
        >
          {remaining >= 0 ? '+' : ''}
          {remaining} kcal remaining today
        </Text>
      </View>
    </Card>
  );
}

const macroStyles = StyleSheet.create({
  macroCard: { marginBottom: Spacing.xxl },
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  remainingBanner: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  remainingText: {
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
});
