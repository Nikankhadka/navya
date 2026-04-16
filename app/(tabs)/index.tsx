import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { Card, Badge, SectionHeader } from '../../src/components/ui';
import { ProgressBar } from '../../src/components/ui/MacroRing';
import { formatWaterAmount, getWeekDayLabels, sessionProgress } from '../../src/utils/helpers';
import { useTodaySession } from '../../src/hooks/useTodaySession';
import { useDailyNutrition } from '../../src/hooks/useDailyNutrition';
import { useCoachMessages } from '../../src/hooks/useCoachMessages';
import { useHabitStreak } from '../../src/hooks/useHabitStreak';
import { useWeightHistory } from '../../src/hooks/useWeightHistory';
import { useWeightActions } from '../../src/hooks/useWeightActions';

const WEEK_LABELS = getWeekDayLabels();

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setProfile } = useAuthStore();
  const userId = user?.id;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState(user?.weight_kg ? String(user.weight_kg) : '');
  const [weightNotes, setWeightNotes] = useState('');
  const { data: todaySession } = useTodaySession(userId);
  const { data: dailyNutrition } = useDailyNutrition(userId);
  const { data: coachMessages } = useCoachMessages(userId);
  const { data: habitStreak } = useHabitStreak(userId);
  const { data: weightHistory } = useWeightHistory(userId);
  const { addWeightLog } = useWeightActions(userId);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (user?.weight_kg != null) {
      setWeightInput(String(user.weight_kg));
    }
  }, [user?.weight_kg]);

  const doneExercises = todaySession?.session_exercises.filter(
    (ex) => ex.completed_sets.length >= ex.planned_sets
  ).length ?? 0;
  const totalExercises = todaySession?.session_exercises.length ?? 0;
  const workoutPct = todaySession ? sessionProgress(todaySession) : 0;
  const calorieRemaining = dailyNutrition
    ? dailyNutrition.calorie_goal - dailyNutrition.total_calories
    : 0;
  const waterProgress = dailyNutrition
    ? Math.min(Math.round((dailyNutrition.water_total_ml / dailyNutrition.water_goal_ml) * 100), 100)
    : 0;
  const coachPreview =
    coachMessages?.[0]?.text ?? 'Your coach will start guiding you once your activity data is available.';
  const streakDays = habitStreak?.current_streak_days ?? 0;
  const weeklyActivity = habitStreak?.weekly_activity ?? Array.from({ length: 7 }, () => false);
  const latestWeight = weightHistory?.[0]?.weight_kg ?? user?.weight_kg ?? null;
  const previousWeight = weightHistory?.[1]?.weight_kg ?? null;
  const weightDelta =
    latestWeight != null && previousWeight != null
      ? Number((latestWeight - previousWeight).toFixed(1))
      : null;
  const lastCheckInLabel = weightHistory?.[0]
    ? new Date(weightHistory[0].logged_at).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
      })
    : 'No check-in yet';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogWeight = async () => {
    const parsedWeight = Number(weightInput);

    if (!userId || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return;
    }

    await addWeightLog.mutateAsync({
      weight_kg: parsedWeight,
      notes: weightNotes.trim() ? weightNotes.trim() : null,
    });

    setProfile({ weight_kg: parsedWeight });
    setWeightNotes('');
    setShowWeightModal(false);
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
          <Text style={styles.streakCount}>{streakDays}</Text>
          <Text style={styles.streakLabel}>
            {streakDays === 1 ? 'day streak' : 'day streak'}
          </Text>
        </View>
      </Animated.View>

      {/* ── Week view ────────────────────────────────────────────────────── */}
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

        <View style={styles.waterRow}>
          <View>
            <Text style={styles.waterLabel}>Hydration</Text>
            <Text style={styles.waterValue}>
              {formatWaterAmount(dailyNutrition?.water_total_ml ?? 0)} / {formatWaterAmount(dailyNutrition?.water_goal_ml ?? 2500)}
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

      <SectionHeader title="Progress Check-In" action="Log Weight" onAction={() => setShowWeightModal(true)} />

      <Card style={styles.progressCard}>
        <View style={styles.progressTopRow}>
          <View>
            <Text style={styles.progressValue}>
              {latestWeight != null ? `${latestWeight.toFixed(1)} kg` : 'No data'}
            </Text>
            <Text style={styles.progressMeta}>Last check-in {lastCheckInLabel}</Text>
          </View>
          <View
            style={[
              styles.progressDeltaChip,
              weightDelta != null && weightDelta <= 0 ? styles.progressDeltaChipPositive : null,
            ]}
          >
            <Text
              style={[
                styles.progressDeltaText,
                weightDelta != null && weightDelta <= 0 ? styles.progressDeltaTextPositive : null,
              ]}
            >
              {weightDelta == null ? 'New' : `${weightDelta > 0 ? '+' : ''}${weightDelta} kg`}
            </Text>
          </View>
        </View>

        <View style={styles.progressHistoryRow}>
          {(weightHistory ?? []).slice(0, 4).map((entry) => (
            <View key={entry.id} style={styles.progressHistoryItem}>
              <Text style={styles.progressHistoryValue}>{entry.weight_kg.toFixed(1)}</Text>
              <Text style={styles.progressHistoryDate}>
                {new Date(entry.logged_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.checkInBtn}
          activeOpacity={0.85}
          onPress={() => setShowWeightModal(true)}
        >
          <Text style={styles.checkInBtnText}>Log Weight Check-In</Text>
        </TouchableOpacity>
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

      <View style={{ height: 132 }} />

      <Modal
        visible={showWeightModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weight Check-In</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelper}>
              Keep one lightweight check-in per week so the diary loop shows real body progress.
            </Text>

            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="78.0"
              placeholderTextColor={Colors.dim}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Note</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={weightNotes}
              onChangeText={setWeightNotes}
              placeholder="Optional note about the week"
              placeholderTextColor={Colors.dim}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, addWeightLog.isPending && styles.saveBtnDisabled]}
              activeOpacity={0.85}
              disabled={addWeightLog.isPending || !weightInput.trim()}
              onPress={handleLogWeight}
            >
              <Text style={styles.saveBtnText}>
                {addWeightLog.isPending ? 'Saving...' : 'Save Check-In'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 132,
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
    color: Colors.canopyBlack,
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
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressValue: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
  },
  progressMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  progressDeltaChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.orange + '22',
    borderColor: Colors.orange + '44',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  progressDeltaChipPositive: {
    backgroundColor: Colors.greenMuted,
    borderColor: Colors.green + '44',
  },
  progressDeltaText: {
    color: Colors.orange,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  progressDeltaTextPositive: {
    color: Colors.green,
  },
  progressHistoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressHistoryItem: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  progressHistoryValue: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  progressHistoryDate: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  checkInBtn: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent + '33',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  checkInBtnText: {
    color: Colors.accent,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
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
  modalScreen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  modalClose: {
    color: Colors.accent,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  modalHelper: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.md,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.canopyBlack,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
});
