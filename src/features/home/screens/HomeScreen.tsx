import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, Badge, SectionHeader } from '@/components/ui';
import { ProgressBar } from '@/components/shared/MacroRing';
import { formatWaterAmount, getWeekDayLabels, sessionProgress } from '@/utils/helpers';
import { useTodaySession } from '@/features/workout/hooks/useTodaySession';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { useDailyNutrition } from '@/features/nutrition/hooks/useDailyNutrition';
import { useCoachMessages } from '@/features/coach/hooks/useCoachMessages';
import { useHabitStreak } from '@/features/home/hooks/useHabitStreak';
import { useWeightProgress } from '@/features/profile/hooks/useWeightProgress';

const WEEK_LABELS = getWeekDayLabels();

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { data: todaySession } = useTodaySession(userId);
  const { data: dailyNutrition } = useDailyNutrition(userId);
  const { data: coachMessages } = useCoachMessages(userId);
  const { data: habitStreak } = useHabitStreak(userId);
  const { data: weightProgress } = useWeightProgress(userId);
  const weeklyTarget = user?.workouts_per_week ?? 3;
  const { data: workoutHistory } = useWorkoutHistory(userId, weeklyTarget);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const doneExercises = todaySession?.session_exercises.filter(
    (ex) => ex.completed_sets.length >= ex.planned_sets,
  ).length ?? 0;
  const totalExercises = todaySession?.session_exercises.length ?? 0;
  const workoutPct = todaySession ? sessionProgress(todaySession) : 0;
  const calorieRemaining = dailyNutrition
    ? dailyNutrition.calorie_goal - dailyNutrition.total_calories
    : 0;
  const waterProgress = dailyNutrition
    ? Math.min(
        Math.round((dailyNutrition.water_total_ml / dailyNutrition.water_goal_ml) * 100),
        100,
      )
    : 0;
  const coachPreview =
    coachMessages?.[0]?.text ??
    'Your coach will start guiding you once your activity data is available.';
  const streakDays = habitStreak?.current_streak_days ?? 0;
  const weeklyActivity =
    habitStreak?.weekly_activity ?? Array.from({ length: 7 }, () => false);
  const weightDelta = weightProgress?.change_kg_14d ?? null;
  const completedThisWeek = workoutHistory?.completed_this_week ?? 0;
  const adherencePct = workoutHistory?.adherence_pct ?? 0;
  const lastWorkout = workoutHistory?.recent_sessions[0] ?? null;
  const currentWeightKg = weightProgress?.current_weight_kg ?? user?.weight_kg ?? null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
        <View style={styles.streakChip}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakCount}>{streakDays}</Text>
          <Text style={styles.streakLabel}>
            {streakDays === 1 ? 'day streak' : 'day streak'}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.weekRow, { opacity: fadeAnim }]}>
        {weeklyActivity.map((done, i) => (
          <View key={i} style={styles.weekDay}>
            <View
              style={[
                styles.weekDot,
                done ? styles.weekDotDone : styles.weekDotEmpty,
              ]}
            >
              {done && <Text style={styles.weekCheck}>✓</Text>}
            </View>
            <Text style={styles.weekLabel}>{WEEK_LABELS[i]}</Text>
          </View>
        ))}
      </Animated.View>

      <SectionHeader
        title="Today's Session"
        action="View Plan"
        onAction={() => router.push('/(tabs)/workout')}
      />

      <Card style={styles.workoutCard}>
        <View style={styles.workoutCardTop}>
          <View>
            <Text style={styles.workoutTitle}>
              {todaySession?.day_name ?? 'No session scheduled yet'}
            </Text>
            <Text style={styles.workoutMeta}>
              {todaySession
                ? `${totalExercises} exercises`
                : 'Create or sync a plan to see today’s session'}
            </Text>
          </View>
          <Badge
            label={`${doneExercises}/${totalExercises} done`}
            color={doneExercises > 0 ? Colors.green : Colors.muted}
          />
        </View>

        <ProgressBar
          value={workoutPct}
          max={100}
          color={Colors.accent}
          height={6}
          showLabel={false}
        />
        <Text style={styles.progressLabel}>{workoutPct}% complete</Text>

        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/workout')}
        >
          <Text style={styles.startBtnText}>
            {todaySession
              ? doneExercises > 0
                ? 'Continue Workout →'
                : 'Start Workout →'
              : 'Open Workout →'}
          </Text>
        </TouchableOpacity>
      </Card>

      <SectionHeader
        title="Nutrition Today"
        action="Log Food"
        onAction={() => router.push('/(tabs)/nutrition')}
      />

      <Card>
        <View style={styles.calRow}>
          <View style={styles.calMain}>
            <Text style={styles.calNumber}>{dailyNutrition?.total_calories ?? 0}</Text>
            <Text style={styles.calLabel}>of {dailyNutrition?.calorie_goal ?? 0} kcal</Text>
          </View>
          <View
            style={[
              styles.calRemaining,
              {
                backgroundColor:
                  calorieRemaining > 0 ? Colors.greenMuted : Colors.redMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.calRemainingText,
                { color: calorieRemaining > 0 ? Colors.green : Colors.red },
              ]}
            >
              {calorieRemaining > 0 ? '+' : ''}
              {calorieRemaining} kcal
            </Text>
            <Text style={styles.calRemainingLabel}>
              {calorieRemaining > 0 ? 'remaining' : 'over goal'}
            </Text>
          </View>
        </View>

        <View style={styles.macrosGrid}>
          {([
            {
              label: 'Protein',
              value: dailyNutrition?.total_protein_g ?? 0,
              goal: dailyNutrition?.protein_goal_g ?? 140,
              color: Colors.accent,
              unit: 'g',
            },
            {
              label: 'Carbs',
              value: dailyNutrition?.total_carbs_g ?? 0,
              goal: 240,
              color: Colors.green,
              unit: 'g',
            },
            {
              label: 'Fat',
              value: dailyNutrition?.total_fat_g ?? 0,
              goal: 70,
              color: Colors.orange,
              unit: 'g',
            },
          ] as const).map((macro) => (
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
            <Text style={styles.waterLabel}>Hydration</Text>
            <Text style={styles.waterValue}>
              {formatWaterAmount(dailyNutrition?.water_total_ml ?? 0)} /{' '}
              {formatWaterAmount(dailyNutrition?.water_goal_ml ?? 2500)}
            </Text>
          </View>
          <View style={styles.waterProgressWrap}>
            <ProgressBar
              value={waterProgress}
              max={100}
              color={Colors.blue}
              height={6}
              showLabel={false}
            />
            <Text style={styles.waterProgressText}>{waterProgress}% of goal</Text>
          </View>
        </View>
      </Card>

      <SectionHeader
        title="Progress & Adherence"
        action="View Profile"
        onAction={() => router.push('/(tabs)/profile')}
      />

      <Card style={styles.progressCard}>
        <View style={styles.progressGrid}>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricLabel}>Current weight</Text>
            <Text style={styles.progressMetricValue}>
              {currentWeightKg != null
                ? `${currentWeightKg.toFixed(1)}kg`
                : 'No check-ins yet'}
            </Text>
            <Text style={styles.progressMetricSub}>
              {weightDelta == null
                ? 'Log a few check-ins to unlock your trend.'
                : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)}kg vs recent history`}
            </Text>
          </View>

          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricLabel}>Weekly adherence</Text>
            <Text style={styles.progressMetricValue}>{adherencePct}%</Text>
            <Text style={styles.progressMetricSub}>
              {completedThisWeek}/{weeklyTarget} sessions completed this week
            </Text>
          </View>
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressFooterLabel}>Last completed workout</Text>
          <Text style={styles.progressFooterValue}>
            {lastWorkout?.completed_at
              ? `${lastWorkout.day_name} · ${new Date(lastWorkout.completed_at).toLocaleDateString(
                  'en-AU',
                  { day: 'numeric', month: 'short' },
                )}`
              : 'Your recent sessions will appear here once you finish a workout.'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="AI Coach" />

      <TouchableOpacity activeOpacity={0.88} onPress={() => router.push('/(tabs)/coach')}>
        <View style={styles.coachCard}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachAvatarEmoji}>🤖</Text>
          </View>
          <View style={styles.coachContent}>
            <Text style={styles.coachBadge}>Daily Insight</Text>
            <Text style={styles.coachText} numberOfLines={3}>
              {coachPreview}
            </Text>
            <Text style={styles.coachCta}>Chat with coach →</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  userName: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakFire: { fontSize: 18 },
  streakCount: {
    color: Colors.orange,
    fontWeight: Typography.weight.extrabold,
    fontSize: Typography.size.lg,
  },
  streakLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekDot: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  weekDotDone: {
    backgroundColor: Colors.greenMuted,
    borderColor: Colors.green,
  },
  weekDotEmpty: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  weekCheck: { fontSize: 12, color: Colors.green },
  weekLabel: {
    fontSize: 10,
    color: Colors.dim,
  },
  workoutCard: {
    marginBottom: Spacing.xxl,
  },
  workoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  workoutTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: 3,
  },
  workoutMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  progressLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
    letterSpacing: 0.3,
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calMain: {},
  calNumber: {
    color: Colors.text,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -1,
  },
  calLabel: {
    color: Colors.muted,
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
    color: Colors.muted,
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
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  waterLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    marginBottom: 4,
  },
  waterValue: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  waterProgressWrap: {
    flex: 1,
    gap: 6,
  },
  waterProgressText: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    textAlign: 'right',
  },
  progressCard: {
    marginBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  progressMetric: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  progressMetricLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressMetricValue: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
  },
  progressMetricSub: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  progressFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  progressFooterLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
  },
  progressFooterValue: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  coachCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coachAvatarEmoji: { fontSize: 22 },
  coachContent: { flex: 1 },
  coachBadge: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  coachText: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  coachCta: {
    color: Colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
