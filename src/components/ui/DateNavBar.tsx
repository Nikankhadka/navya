import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { formatDayLabel, addDays, isToday, isFuture } from '@/utils/date';

interface DateNavBarProps {
  selectedDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onResetToday: () => void;
  colors: ThemeColors;
}

export function DateNavBar({
  selectedDate,
  onPrevDay,
  onNextDay,
  onResetToday,
  colors,
}: DateNavBarProps) {
  const router = useRouter();
  const isCurrentToday = isToday(selectedDate);
  const isNextDayFuture = isFuture(addDays(selectedDate, 1));

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevDay} style={styles.navButton}>
        <Text style={[styles.navArrow, { color: colors.text }]}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/daily-diary')}
        style={styles.dateButton}
      >
        <Text style={[styles.dateLabel, { color: colors.text }]}>
          {formatDayLabel(selectedDate)}
        </Text>
        <Text style={[styles.calendarIcon, { color: colors.accent }]}>📅</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNextDay}
        disabled={isNextDayFuture}
        style={[styles.navButton, isNextDayFuture && styles.navButtonDisabled]}
      >
        <Text style={[styles.navArrow, { color: isNextDayFuture ? colors.dim : colors.text }]}>
          ›
        </Text>
      </TouchableOpacity>

      {!isCurrentToday && (
        <TouchableOpacity onPress={onResetToday} style={styles.todayChip}>
          <Text style={[styles.todayChipText, { color: colors.accent }]}>Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navArrow: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    lineHeight: 32,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  dateLabel: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  calendarIcon: {
    fontSize: Typography.size.md,
  },
  todayChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.3)',
  },
  todayChipText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
});
