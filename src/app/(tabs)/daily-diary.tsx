import React, { useCallback, useMemo, useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Calendar } from '@/components/ui/Calendar';
import { useDateStore } from '@/store/useDateStore';
import { getTodayDateString, isFuture } from '@/utils/date';
import { useAuthStore } from '@/store/useAuthStore';
import { useHabitStreak } from '@/features/home/hooks/useHabitStreak';

function addMonths(dateKey: string, months: number): string {
  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const newDate = new Date(year, month - 1 + months, 1);
  const newYear = newDate.getFullYear();
  const newMonth = newDate.getMonth() + 1;

  return `${newYear}-${String(newMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DailyDiaryScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { selectedDate, setSelectedDate, resetToToday } = useDateStore();
  const [calendarMonth, setCalendarMonth] = useState(selectedDate);

  const { data: habitStreak } = useHabitStreak(user?.id);

  const activityDates = useMemo(() => {
    const keys: string[] = [];

    for (let offset = -60; offset <= 0; offset++) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const key = date.toISOString().slice(0, 10);
      if (!isFuture(key)) {
        keys.push(key);
      }
    }

    return new Set(keys);
  }, [habitStreak]);

  const handleSelectDate = useCallback(
    (dateKey: string) => {
      setSelectedDate(dateKey);
      router.back();
    },
    [setSelectedDate, router],
  );

  const handlePrevMonth = useCallback(() => {
    setCalendarMonth((prev) => addMonths(prev, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const next = addMonths(prev, 1);
      return isFuture(next) ? prev : next;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCalendarMonth(getTodayDateString());
    resetToToday();
    router.back();
  }, [resetToToday, router]);

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <RNText style={[styles.headerTitle, { color: colors.text }]}>Daily Diary</RNText>
          </View>
        </View>
      </View>

      <Calendar
        selectedDate={calendarMonth}
        onSelectDate={handleSelectDate}
        activityDates={activityDates}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        colors={colors}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.xl, paddingBottom: 40 },
    header: { marginBottom: Spacing.xl },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    dot: { width: 8, height: 8, borderRadius: 4 },
    headerTitle: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
  });
