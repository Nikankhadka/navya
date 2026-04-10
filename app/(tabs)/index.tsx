import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Card, Badge, SectionHeader } from '../../src/components/ui';
import { ProgressBar } from '../../src/components/ui/MacroRing';
import { MOCK_WEEKLY_STREAK } from '../../src/mocks/mockData';
import { getWeekDayLabels, sessionProgress } from '../../src/utils/helpers';
import { useTodaySession } from '../../src/hooks/useTodaySession';
import { useDailyNutrition } from '../../src/hooks/useDailyNutrition';
import { useCoachMessages } from '../../src/hooks/useCoachMessages';

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const doneExercises = todaySession?.session_exercises.filter(
    (ex) => ex.completed_sets.length >= ex.planned_sets
  ).length ?? 0;
  const totalExercises = todaySession?.session_exercises.length ?? 0;
  const workoutPct = todaySession ? sessionProgress(todaySession) : 0;
  const calorieRemaining = dailyNutrition
    ? dailyNutrition.calorie_goal - dailyNutrition.total_calories
    : 0;
  const coachPreview =
    coachMessages?.[0]?.text ?? 'Your coach will start guiding you once your activity data is available.';

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
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.userName}>{user?.full_name?.split(' ')[0] ?? 'Athlete'}</Text>
        </View>
        <View style={styles.streakChip}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakCount}>7</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </Animated.View>

      {/* ── Week view ────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.weekRow, { opacity: fadeAnim }]}>
        {MOCK_WEEKLY_STREAK.map((done, i) => (
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

      {/* ── Today's Workout ──────────────────────────────────────────────── */}
      <SectionHeader title="Today's Session" action="View Plan" onAction={() => router.push('/(tabs)/workout')} />

      <Card style={styles.workoutCard}>
        <View style={styles.workoutCardTop}>
          <View>
            <Text style={styles.workoutTitle}>{todaySession?.day_name ?? 'No session scheduled yet'}</Text>
            <Text style={styles.workoutMeta}>
              {todaySession ? `${totalExercises} exercises` : 'Create or sync a plan to see today’s session'}
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
            {todaySession ? (doneExercises > 0 ? 'Continue Workout →' : 'Start Workout →') : 'Open Workout →'}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* ── Calories ─────────────────────────────────────────────────────── */}
      <SectionHeader title="Nutrition Today" action="Log Food" onAction={() => router.push('/(tabs)/nutrition')} />

      <Card>
        <View style={styles.calRow}>
          <View style={styles.calMain}>
            <Text style={styles.calNumber}>{dailyNutrition?.total_calories ?? 0}</Text>
            <Text style={styles.calLabel}>
              of {dailyNutrition?.calorie_goal ?? 0} kcal
            </Text>
          </View>
          <View
            style={[
              styles.calRemaining,
              { backgroundColor: calorieRemaining > 0 ? Colors.greenMuted : Colors.redMuted },
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
            { label: 'Protein', value: dailyNutrition?.total_protein_g ?? 0, goal: dailyNutrition?.protein_goal_g ?? 140, color: Colors.accent, unit: 'g' },
            { label: 'Carbs', value: dailyNutrition?.total_carbs_g ?? 0, goal: 240, color: Colors.green, unit: 'g' },
            { label: 'Fat', value: dailyNutrition?.total_fat_g ?? 0, goal: 70, color: Colors.orange, unit: 'g' },
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
      </Card>

      {/* ── AI Coach Tip ─────────────────────────────────────────────────── */}
      <SectionHeader title="AI Coach" />

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/(tabs)/coach')}
      >
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
