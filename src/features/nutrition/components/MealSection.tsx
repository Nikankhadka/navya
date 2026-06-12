import React from 'react';
import { Text, TouchableOpacity, View, type TextStyle, type ViewStyle } from 'react-native';
import type { FoodLog, MealTime } from '@/types/app';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { formatTime, mealTimeLabel } from '@/utils/helpers';

export interface MealSectionProps {
  mealTime: MealTime;
  meals: FoodLog[];
  onDeleteMeal: (mealId: string) => void;
}

export function MealSection({ mealTime, meals, onDeleteMeal }: MealSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const totalCal = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <View style={styles.mealSection}>
      <View style={styles.mealSectionHeader}>
        <Text style={styles.mealSectionTitle}>{mealTimeLabel(mealTime)}</Text>
        <Text style={styles.mealSectionMeta}>{totalCal} kcal</Text>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyMealSection}>
          <Text style={styles.emptyMealSectionText}>Nothing logged yet</Text>
        </View>
      ) : (
        <View style={styles.mealList}>
          {meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealRow}
              activeOpacity={0.85}
              onLongPress={() => onDeleteMeal(meal.id)}
            >
              <View style={styles.mealLeft}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
                <Text style={styles.mealTimestamp}>
                  {formatTime(meal.logged_at)}
                  {meal.serving_label ? ` • ${meal.quantity} x ${meal.serving_label}` : ''}
                </Text>
              </View>
              <View style={styles.mealRight}>
                <Text style={styles.mealCal}>{meal.calories}</Text>
                <Text style={styles.mealCalLabel}>kcal</Text>
                <Text style={styles.mealMacroLine}>
                  {meal.protein_g ?? 0}P • {meal.carbs_g ?? 0}C • {meal.fat_g ?? 0}F
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  makeStyles({
    mealSection: {
      marginBottom: Spacing.xl,
    },
    mealSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    mealSectionTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    mealSectionMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    emptyMealSection: {
      paddingVertical: Spacing.lg,
      alignItems: 'center',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    emptyMealSectionText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    mealList: {
      gap: Spacing.sm,
    },
    mealRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mealLeft: {
      flex: 1,
      marginRight: Spacing.md,
    },
    mealName: {
      color: colors.text,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.md,
    },
    mealTimestamp: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
    },
    mealRight: {
      alignItems: 'flex-end',
      minWidth: 86,
    },
    mealCal: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    mealCalLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: -2,
    },
    mealMacroLine: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
    },
  });

/** Preserves literal types for React Native style objects, replacing StyleSheet.create. */
function makeStyles<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T {
  return styles;
}
