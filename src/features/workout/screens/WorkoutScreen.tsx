import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Card, EmptyState } from '@/components/ui';
import { ExerciseRow, PlanDayCard } from '@/features/workout/components';
import { formatDuration, sessionProgress } from '@/utils/helpers';
import { crossAlert } from '@/utils/crossAlert';
import { useAuthStore } from '@/store/useAuthStore';
import { useActivePlan } from '@/features/workout/hooks/useActivePlan';
import { useTodaySession } from '@/features/workout/hooks/useTodaySession';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { useWorkoutActions } from '@/features/workout/hooks/useWorkoutActions';
import type { WorkoutPlanDay } from '@/types/app';
import { isVisualTestScenario } from '@/utils/visualTest';
import { MOCK_PLAN } from '@/features/demo/mockData';

export default function WorkoutScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: activePlan } = useActivePlan(userId);
  const { data: todaySessionData } = useTodaySession(userId);
  const weeklyTarget = user?.workouts_per_week ?? 3;
  const { data: workoutHistory } = useWorkoutHistory(userId, weeklyTarget);
  const { startSession: startSessionMutation, saveSession } = useWorkoutActions(userId);
  const {
    activeSession,
    elapsedSeconds,
    timerActive,
    startSession,
    endSession,
    skipExercise,
    markExerciseDone,
    tickTimer,
  } = useWorkoutStore();
  const [tab, setTab] = useState<'today' | 'plan'>('today');
  const [selectedPlanDay, setSelectedPlanDay] = useState<WorkoutPlanDay | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const todayDayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const visualPlanDay = isVisualTestScenario('workout-plan-modal')
    ? (activePlan?.workout_plan_days[0] ?? MOCK_PLAN.workout_plan_days[0] ?? null)
    : null;
  const activeTab = visualPlanDay ? 'plan' : tab;
  const planDayDetail = visualPlanDay ?? selectedPlanDay;

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => tickTimer(), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, tickTimer]);

  const handleStartSession = async () => {
    const session = await startSessionMutation.mutateAsync(activePlan ?? null);

    if (session) {
      startSession(session);
    }
  };

  const handleCompleteSet = (exerciseId: string) => {
    if (!activeSession) return;
    const ex = activeSession.session_exercises.find((e) => e.exercise_id === exerciseId);
    if (!ex) return;
    markExerciseDone(exerciseId, {
      set_number: ex.completed_sets.length + 1,
      reps_completed: parseInt(ex.planned_reps.split('-')[0] ?? '8'),
      weight_kg: null,
      completed_at: new Date().toISOString(),
    });
  };

  const handleFinishWorkout = () => {
    crossAlert('Finish Workout?', 'Great job! Mark this session as complete.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Finish 🎉',
        onPress: async () => {
          endSession();
          const updatedSession = useWorkoutStore.getState().activeSession;
          if (updatedSession) {
            await saveSession.mutateAsync({
              session: updatedSession,
              elapsedSeconds: useWorkoutStore.getState().elapsedSeconds,
            });
          }
        },
      },
    ]);
  };

  const progress = activeSession ? sessionProgress(activeSession) : 0;
  const isComplete = activeSession?.status === 'completed';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Workout</Text>
          {activeSession && !isComplete && (
            <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
          )}
        </View>
        {activeSession && !isComplete && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishWorkout}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['today', 'plan'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'today' ? "Today's Session" : 'Full Plan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'today' ? (
          <>
            {isComplete ? (
              /* ── Complete state ──────────────────────────────────── */
              <View style={styles.completeCard}>
                <Text style={styles.completeEmoji}>🎉</Text>
                <Text style={styles.completeTitle}>Session Complete!</Text>
                <Text style={styles.completeSub}>
                  You crushed it in {formatDuration(elapsedSeconds)}
                </Text>
                <View style={styles.completeStats}>
                  <View style={styles.completeStat}>
                    <Text style={styles.completeStatVal}>
                      {activeSession?.session_exercises.length}
                    </Text>
                    <Text style={styles.completeStatLabel}>Exercises</Text>
                  </View>
                  <View style={styles.completeStat}>
                    <Text style={styles.completeStatVal}>
                      {activeSession?.session_exercises.reduce(
                        (sum, ex) => sum + ex.completed_sets.length,
                        0,
                      )}
                    </Text>
                    <Text style={styles.completeStatLabel}>Sets</Text>
                  </View>
                </View>
              </View>
            ) : activeSession ? (
              /* ── Active session ──────────────────────────────────── */
              <>
                <Card style={styles.progressCard}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPct}>{progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                </Card>

                <View style={styles.exerciseList}>
                  {activeSession.session_exercises.map((exercise, i) => {
                    const isDone = exercise.completed_sets.length >= exercise.planned_sets;
                    const prevDone = activeSession.session_exercises
                      .slice(0, i)
                      .every((e) => e.completed_sets.length >= e.planned_sets || e.is_skipped);
                    const isActive = !isDone && !exercise.is_skipped && prevDone;

                    return (
                      <ExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        isActive={isActive}
                        onComplete={() => handleCompleteSet(exercise.exercise_id)}
                        onSkip={() => skipExercise(exercise.exercise_id)}
                      />
                    );
                  })}
                </View>
              </>
            ) : (
              /* ── Not started ─────────────────────────────────────── */
              <>
                <Card style={styles.todayCard}>
                  <View style={styles.todayCardTop}>
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                    <Text style={styles.todayTitle}>
                      {todaySessionData?.day_name ?? 'No session ready'}
                    </Text>
                    <Text style={styles.todayMeta}>
                      {todaySessionData
                        ? `${todaySessionData.session_exercises.length} exercises`
                        : 'Connect your plan data to load today’s session'}
                    </Text>
                  </View>

                  {todaySessionData ? (
                    <>
                      <View style={styles.exercisePreview}>
                        {todaySessionData.session_exercises.slice(0, 3).map((ex, i) => (
                          <View key={i} style={styles.previewRow}>
                            <View style={styles.previewDot} />
                            <Text style={styles.previewName}>{ex.exercise_name}</Text>
                            <Text style={styles.previewMeta}>
                              {ex.planned_sets}×{ex.planned_reps}
                            </Text>
                          </View>
                        ))}
                        {todaySessionData.session_exercises.length > 3 && (
                          <Text style={styles.moreExercises}>
                            +{todaySessionData.session_exercises.length - 3} more
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={handleStartSession}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.startBtnText}>Start Session →</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <EmptyState
                      emoji="🏋️"
                      title="No session ready"
                      subtitle="A live session will appear here after your workout plan and session data are connected."
                    />
                  )}
                </Card>
              </>
            )}
          </>
        ) : (
          /* ── Plan tab ──────────────────────────────────────────── */
          <>
            <Card style={styles.planHeaderCard}>
              <Text style={styles.planName}>{activePlan?.name ?? 'No active workout plan'}</Text>
              <Text style={styles.planMeta}>
                {activePlan
                  ? `${activePlan.workout_plan_days.length} training days / week`
                  : 'Create or sync a plan to see your week'}
              </Text>
            </Card>

            {activePlan ? (
              activePlan.workout_plan_days.map((day) => (
                <PlanDayCard
                  key={day.id}
                  day={day}
                  isToday={day.day_of_week.toLowerCase() === todayDayOfWeek}
                  onPress={() => setSelectedPlanDay(day)}
                />
              ))
            ) : (
              <EmptyState
                emoji="📋"
                title="No workout plan yet"
                subtitle="Your structured weekly plan will appear here once it is generated or synced."
              />
            )}
          </>
        )}
        <Card style={styles.historySummaryCard}>
          <View style={styles.historySummaryHeader}>
            <View>
              <Text style={styles.historySummaryTitle}>Recent Training History</Text>
              <Text style={styles.historySummarySub}>
                {workoutHistory?.completed_this_week ?? 0}/
                {workoutHistory?.weekly_target ?? weeklyTarget} sessions completed this week
              </Text>
            </View>
            <View style={styles.historySummaryBadge}>
              <Text style={styles.historySummaryBadgeValue}>
                {workoutHistory?.adherence_pct ?? 0}%
              </Text>
              <Text style={styles.historySummaryBadgeLabel}>adherence</Text>
            </View>
          </View>

          {workoutHistory?.recent_sessions.length ? (
            <View style={styles.historyList}>
              {workoutHistory.recent_sessions.slice(0, 3).map((session) => (
                <View key={session.id} style={styles.historyRow}>
                  <View style={styles.historyRowText}>
                    <Text style={styles.historyDay}>{session.day_name}</Text>
                    <Text style={styles.historyMeta}>
                      {session.completed_at
                        ? new Date(session.completed_at).toLocaleDateString('en-AU', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Completed session'}
                    </Text>
                  </View>
                  <View style={styles.historyRowStats}>
                    <Text style={styles.historyStatPrimary}>
                      {session.session_exercises.reduce(
                        (sum, exercise) => sum + exercise.completed_sets.length,
                        0,
                      )}{' '}
                      sets
                    </Text>
                    <Text style={styles.historyStatSecondary}>
                      {session.duration_seconds != null
                        ? formatDuration(session.duration_seconds)
                        : 'Tracked'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.historyEmptyText}>
              Completed sessions will appear here once you finish your first workout.
            </Text>
          )}
        </Card>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={Boolean(planDayDetail)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPlanDay(null)}
      >
        <View style={styles.modalScreen}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={[
              styles.modalContent,
              { paddingTop: insets.top + Spacing.lg, paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalDayLabel}>
                  {planDayDetail?.day_of_week.slice(0, 3).toUpperCase()}
                </Text>
                <Text style={styles.modalTitle}>{planDayDetail?.day_name}</Text>
                <Text style={styles.modalSubtitle}>
                  {planDayDetail
                    ? `${planDayDetail.plan_exercises.length} exercises · ~${planDayDetail.estimated_minutes} min`
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedPlanDay(null)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            {planDayDetail && (
              <>
                <Card style={styles.modalSummaryCard}>
                  <Text style={styles.summaryTitle}>Focus Areas</Text>
                  <View style={styles.summaryTags}>
                    {[
                      ...new Set(
                        planDayDetail.plan_exercises.flatMap(
                          (exercise) => exercise.exercise.muscle_groups,
                        ),
                      ),
                    ].map((group) => (
                      <View key={group} style={styles.summaryTag}>
                        <Text style={styles.summaryTagText}>{group.replace('_', ' ')}</Text>
                      </View>
                    ))}
                  </View>
                </Card>

                <Text style={styles.planSectionTitle}>Exercises</Text>
                <View style={styles.modalExerciseList}>
                  {planDayDetail.plan_exercises
                    .sort((left, right) => left.order_index - right.order_index)
                    .map((exercise, index) => (
                      <View key={exercise.id} style={styles.planExerciseCard}>
                        <View style={styles.planExerciseTop}>
                          <View style={styles.exerciseOrderBadge}>
                            <Text style={styles.exerciseOrderText}>{index + 1}</Text>
                          </View>
                          <View style={styles.planExerciseText}>
                            <Text style={styles.planExerciseName}>{exercise.exercise.name}</Text>
                            <Text style={styles.planExerciseMeta}>
                              {exercise.sets} sets × {exercise.reps} · rest {exercise.rest_seconds}s
                            </Text>
                          </View>
                        </View>

                        <View style={styles.exerciseInfoRow}>
                          <Text style={styles.exerciseInfoLabel}>Difficulty</Text>
                          <Text style={styles.exerciseInfoValue}>
                            {exercise.exercise.difficulty}
                          </Text>
                        </View>

                        <View style={styles.exerciseInfoRow}>
                          <Text style={styles.exerciseInfoLabel}>Equipment</Text>
                          <Text style={styles.exerciseInfoValue}>
                            {exercise.exercise.equipment_required.length > 0
                              ? exercise.exercise.equipment_required.join(', ')
                              : 'None'}
                          </Text>
                        </View>

                        {exercise.notes && (
                          <View style={styles.exerciseNotesBox}>
                            <Text style={styles.exerciseNotesLabel}>Coach note</Text>
                            <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
                          </View>
                        )}

                        {exercise.exercise.instructions ? (
                          <Text style={styles.exerciseInstructions}>
                            {exercise.exercise.instructions}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
      paddingTop: Spacing.md,
    },
    screenTitle: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    timerText: {
      color: colors.green,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      marginTop: 2,
    },
    finishBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.green,
    },
    finishBtnText: {
      color: colors.green,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    tab: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    tabText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },
    tabTextActive: {
      color: Colors.white,
      fontWeight: Typography.weight.bold,
    },
    scroll: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: 40 },

    // Progress
    progressCard: { marginBottom: Spacing.lg, padding: Spacing.lg },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    progressLabel: { color: colors.muted, fontSize: Typography.size.sm },
    progressPct: {
      color: colors.accent,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 4,
    },

    exerciseList: { gap: Spacing.sm },

    // Today card
    todayCard: { marginBottom: Spacing.lg },
    todayCardTop: { marginBottom: Spacing.lg },
    todayBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
      marginBottom: Spacing.sm,
    },
    todayBadgeText: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: Typography.weight.bold,
      letterSpacing: 1,
    },
    todayTitle: {
      color: colors.text,
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      marginBottom: 4,
    },
    todayMeta: { color: colors.muted, fontSize: Typography.size.sm },
    exercisePreview: { gap: Spacing.sm, marginBottom: Spacing.lg },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    previewDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.dim,
    },
    previewName: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      flex: 1,
    },
    previewMeta: { color: colors.dim, fontSize: Typography.size.xs },
    moreExercises: { color: colors.dim, fontSize: Typography.size.xs, marginLeft: 14 },
    startBtn: {
      backgroundColor: colors.accent,
      borderRadius: Radius.lg,
      paddingVertical: 14,
      alignItems: 'center',
    },
    startBtnText: {
      color: Colors.white,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.md,
      letterSpacing: 0.3,
    },
    modalScreen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      paddingHorizontal: Spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    modalHeaderText: {
      flex: 1,
    },
    modalDayLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    modalTitle: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    modalCloseBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalCloseText: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    modalSummaryCard: {
      marginBottom: Spacing.xl,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      marginBottom: Spacing.md,
    },
    summaryTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    summaryTag: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
    },
    summaryTagText: {
      color: colors.accent,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      textTransform: 'capitalize',
    },
    planSectionTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      marginBottom: Spacing.md,
    },
    modalExerciseList: {
      gap: Spacing.md,
    },
    planExerciseCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.lg,
    },
    planExerciseTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    exerciseOrderBadge: {
      width: 28,
      height: 28,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    exerciseOrderText: {
      color: Colors.white,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
    },
    planExerciseText: {
      flex: 1,
    },
    planExerciseName: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
    planExerciseMeta: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    exerciseInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
      marginTop: Spacing.sm,
    },
    exerciseInfoLabel: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    exerciseInfoValue: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      textTransform: 'capitalize',
      flex: 1,
      textAlign: 'right',
    },
    exerciseNotesBox: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseNotesLabel: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      letterSpacing: 1,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    exerciseNotesText: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    exerciseInstructions: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      lineHeight: 20,
      marginTop: Spacing.md,
    },

    // Complete
    completeCard: {
      alignItems: 'center',
      paddingVertical: 48,
      backgroundColor: colors.card,
      borderRadius: Radius.xxl,
      borderWidth: 1,
      borderColor: `${colors.green}44`,
    },
    completeEmoji: { fontSize: 52 },
    completeTitle: {
      color: colors.green,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      marginTop: Spacing.md,
    },
    completeSub: {
      color: colors.muted,
      fontSize: Typography.size.md,
      marginTop: Spacing.xs,
      marginBottom: Spacing.xxl,
    },
    completeStats: { flexDirection: 'row', gap: 48 },
    completeStat: { alignItems: 'center' },
    completeStatVal: {
      color: colors.text,
      fontSize: Typography.size.xxxl,
      fontWeight: Typography.weight.extrabold,
    },
    completeStatLabel: { color: colors.muted, fontSize: Typography.size.sm },

    // Plan
    planHeaderCard: { marginBottom: Spacing.lg },
    planName: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      marginBottom: 4,
    },
    planMeta: { color: colors.muted, fontSize: Typography.size.sm },
    historySummaryCard: {
      marginTop: Spacing.lg,
      gap: Spacing.lg,
    },
    historySummaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
      alignItems: 'flex-start',
    },
    historySummaryTitle: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
    historySummarySub: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    historySummaryBadge: {
      backgroundColor: colors.accentMuted,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${colors.accent}55`,
    },
    historySummaryBadgeValue: {
      color: colors.accent,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    historySummaryBadgeLabel: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    historyList: {
      gap: Spacing.sm,
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.sm,
    },
    historyRowText: {
      flex: 1,
    },
    historyDay: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    historyMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    historyRowStats: {
      alignItems: 'flex-end',
      gap: 2,
    },
    historyStatPrimary: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
    },
    historyStatSecondary: {
      color: colors.dim,
      fontSize: Typography.size.xs,
    },
    historyEmptyText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
  });
