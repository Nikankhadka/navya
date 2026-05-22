import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { SectionHeader, DateNavBar } from '@/components/ui';
import { TodaySessionCard, NutritionCard, ProgressCard, CoachCard } from '@/components/shared';
import { addDays, getTodayDateString, getWeekDayLabels, isToday } from '@/utils/date';
import { useTodaySession } from '@/features/workout/hooks/useTodaySession';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { useDailyNutrition } from '@/features/nutrition/hooks/useDailyNutrition';
import { useCoachMessages } from '@/features/coach/hooks/useCoachMessages';
import { isCoachEnabled } from '@/config/env';
import { useHabitStreak } from '@/features/home/hooks/useHabitStreak';
import { useWeightProgress } from '@/features/profile/hooks/useWeightProgress';
import { useDateStore } from '@/store/useDateStore';

const WEEK_LABELS = getWeekDayLabels();

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { selectedDate, setSelectedDate, resetToToday } = useDateStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: todaySession } = useTodaySession(userId, selectedDate);
  const { data: dailyNutrition } = useDailyNutrition(userId, selectedDate);
  const { data: coachMessages } = useCoachMessages(isCoachEnabled ? userId : undefined);
  const { data: habitStreak } = useHabitStreak(userId, selectedDate);
  const { data: weightProgress } = useWeightProgress(userId);
  const weeklyTarget = user?.workouts_per_week ?? 3;
  const { data: workoutHistory } = useWorkoutHistory(userId, weeklyTarget, selectedDate);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const streakDays = habitStreak?.current_streak_days ?? 0;
  const weeklyActivity = habitStreak?.weekly_activity ?? Array.from({ length: 7 }, () => false);
  const coachPreview =
    coachMessages?.[0]?.text ??
    'Your coach will start guiding you once your activity data is available.';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isToday(nextDate) && !isFutureDate(nextDate)) {
      setSelectedDate(nextDate);
    }
  };

  const isFutureDate = (dateKey: string) => dateKey > getTodayDateString();

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.userName}>{user?.full_name?.split(' ')[0] ?? 'Athlete'}</Text>
        </View>
        <View style={[styles.streakChip, { borderColor: colors.border }]}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={[styles.streakCount, { color: colors.orange }]}>{streakDays}</Text>
          <Text style={[styles.streakLabel, { color: colors.muted }]}>
            {streakDays === 1 ? 'day streak' : 'day streak'}
          </Text>
        </View>
      </Animated.View>

      <DateNavBar
        selectedDate={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onResetToday={resetToToday}
        colors={colors}
      />

      <Animated.View style={[styles.weekRow, { opacity: fadeAnim }]}>
        {weeklyActivity.map((done, i) => (
          <View key={i} style={styles.weekDay}>
            <View
              style={[
                styles.weekDot,
                done
                  ? [styles.weekDotDone, { borderColor: colors.green }]
                  : [styles.weekDotEmpty, { borderColor: colors.border }],
              ]}
            >
              {done && <Text style={[styles.weekCheck, { color: colors.green }]}>✓</Text>}
            </View>
            <Text style={[styles.weekLabel, { color: colors.dim }]}>{WEEK_LABELS[i]}</Text>
          </View>
        ))}
      </Animated.View>

      <SectionHeader
        title="Today's Session"
        action="View Plan"
        onAction={() => router.push('/(tabs)/workout')}
      />
      <TodaySessionCard colors={colors} session={todaySession ?? null} />

      <SectionHeader
        title="Nutrition Today"
        action="Log Food"
        onAction={() => router.push('/(tabs)/nutrition')}
      />
      <NutritionCard colors={colors} dailyNutrition={dailyNutrition ?? null} />

      <SectionHeader
        title="Progress & Adherence"
        action="View Profile"
        onAction={() => router.push('/(tabs)/profile')}
      />
      <ProgressCard
        colors={colors}
        user={user}
        weightProgress={weightProgress ?? null}
        workoutHistory={workoutHistory ?? null}
        weeklyTarget={weeklyTarget}
      />

      {isCoachEnabled && (
        <>
          <SectionHeader title="AI Coach" />
          <CoachCard colors={colors} coachPreview={coachPreview} />
        </>
      )}

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.xl, paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xl,
    },
    greeting: { color: colors.muted, fontSize: Typography.size.sm },
    userName: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      letterSpacing: -0.5,
      marginTop: 2,
    },
    streakChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: Radius.lg,
      paddingHorizontal: 14,
      paddingVertical: Spacing.sm,
      borderWidth: 1,
    },
    streakFire: { fontSize: 18 },
    streakCount: { fontWeight: Typography.weight.extrabold, fontSize: Typography.size.lg },
    streakLabel: { fontSize: Typography.size.xs },
    weekRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xxl },
    weekDay: { flex: 1, alignItems: 'center', gap: 4 },
    weekDot: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: Radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    weekDotDone: { backgroundColor: 'transparent' },
    weekDotEmpty: { backgroundColor: 'transparent' },
    weekCheck: { fontSize: 12 },
    weekLabel: { fontSize: 10 },
  });
