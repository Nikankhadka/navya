import { Text, TouchableOpacity, View } from 'react-native';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type { WorkoutPlanDay } from '@/features/workout/types';

interface PlanDayCardProps {
  day: WorkoutPlanDay;
  onPress: () => void;
  isToday?: boolean;
}

export function PlanDayCard({ day, onPress, isToday }: PlanDayCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const muscleGroups = [
    ...new Set(day.plan_exercises.flatMap((pe) => pe.exercise.muscle_groups)),
  ].slice(0, 3);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.planCard, isToday && styles.planCardToday]}
    >
      <View style={styles.planCardTop}>
        <View>
          <Text style={styles.planDayLabel}>{day.day_of_week.slice(0, 3).toUpperCase()}</Text>
          <Text style={styles.planDayName}>{day.day_name}</Text>
        </View>
        {isToday ? (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>TODAY</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.planCardMeta}>
        <Text style={styles.planMeta}>
          {day.plan_exercises.length} exercises · ~{day.estimated_minutes} min
        </Text>
      </View>

      <View style={styles.muscleTags}>
        {muscleGroups.map((muscleGroup) => (
          <View key={muscleGroup} style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>{muscleGroup.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    planCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.md,
    },
    planCardToday: {
      borderColor: colors.accent,
    },
    planCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    planDayLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    planDayName: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    todayBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.full,
      backgroundColor: `${colors.accent}22`,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
    },
    todayBadgeText: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
    },
    planCardMeta: {
      marginBottom: Spacing.md,
    },
    planMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    muscleTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    muscleTag: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
    },
    muscleTagText: {
      color: colors.dim,
      fontSize: Typography.size.xs,
      textTransform: 'capitalize',
    },
  }) as const;
