import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProgressBar } from '@/components/shared/MacroRing';
import { Card, SectionHeader } from '@/components/ui';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { formatWaterAmount } from '@/utils/helpers';

const QUICK_ADD_OPTIONS = [
  { label: '+250ml', amountMl: 250 },
  { label: '+500ml', amountMl: 500 },
  { label: '+750ml', amountMl: 750 },
];

export interface WaterTrackerProps {
  waterTotal: number;
  waterGoal: number;
  isAdding: boolean;
  onAddWater: (amountMl: number) => void;
}

export function WaterTracker({ waterTotal, waterGoal, isAdding, onAddWater }: WaterTrackerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <>
      <SectionHeader title="Hydration" />
      <Card style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View>
            <Text style={styles.waterValue}>{formatWaterAmount(waterTotal)}</Text>
            <Text style={styles.waterMeta}>of {formatWaterAmount(waterGoal)} target</Text>
          </View>
          <View style={styles.waterBadge}>
            <Text style={styles.waterBadgeText}>Daily habit</Text>
          </View>
        </View>
        <ProgressBar
          value={waterTotal}
          max={waterGoal}
          color={colors.blue}
          height={6}
          showLabel={false}
        />
        <View style={styles.waterActions}>
          {QUICK_ADD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={styles.waterAction}
              activeOpacity={0.85}
              disabled={isAdding}
              onPress={() => onAddWater(option.amountMl)}
            >
              <Text style={styles.waterActionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    waterCard: {
      marginBottom: Spacing.xxl,
      gap: Spacing.md,
    },
    waterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    waterValue: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    waterMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    waterBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      backgroundColor: `${colors.blue}22`,
      borderWidth: 1,
      borderColor: `${colors.blue}44`,
    },
    waterBadgeText: {
      color: colors.blue,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
    },
    waterActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    waterAction: {
      flex: 1,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    waterActionText: {
      color: colors.text,
      fontWeight: Typography.weight.semibold,
    },
  });
