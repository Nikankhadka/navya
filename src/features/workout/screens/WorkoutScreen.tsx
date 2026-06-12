import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Card, EmptyState } from '@/components/ui';
import {
  PlanDayCard,
  PlanDayModal,
  TimerDisplay,
  SessionCompleteCard,
  WorkoutStats,
  SetLoggingSheet,
  SessionDetailModal,
  PostHocLoggingSheet,
} from '@/features/workout/components';
import { formatDuration, sessionProgress } from '@/utils/helpers';
import { crossAlert } from '@/utils/crossAlert';
import { useAuthStore } from '@/store/useAuthStore';
import { useActivePlan } from '@/features/workout/hooks/useActivePlan';
import { useTodaySession } from '@/features/workout/hooks/useTodaySession';
import { useWorkoutHistory } from '@/features/workout/hooks/useWorkoutHistory';
import { useWorkoutActions } from '@/features/workout/hooks/useWorkoutActions';
import { workoutService } from '@/features/workout/api/workout.service';
import type { WorkoutPlanDay, SessionExercise, CompletedSet } from '@/types/app';
import { isVisualTestScenario } from '@/utils/visualTest';
import { MOCK_PLAN } from '@/features/demo/mockData';

export default function WorkoutScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
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
    restActive,
    restDuration,
    restPausedRemaining,
    restExerciseName,
    nextExerciseName,
    startSession,
    endSession,
    skipExercise,
    logSet,
    editSet,
    tickTimer,
    pauseRest,
    resumeRest,
    skipRest,
    extendRest,
    syncRestTimer,
    restRemaining,
    startRestPolling,
    stopRestPolling,
  } = useWorkoutStore();

  const [tab, setTab] = useState<'today' | 'plan'>('today');
  const [selectedPlanDay, setSelectedPlanDay] = useState<WorkoutPlanDay | null>(null);
  const [sheetExercise, setSheetExercise] = useState<SessionExercise | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [showPostHoc, setShowPostHoc] = useState(false);
  const selectedSession = selectedSessionId
    ? (workoutHistory?.recent_sessions?.find((s) => s.id === selectedSessionId) ?? null)
    : null;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');
  const todayDayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const visualPlanDay = isVisualTestScenario('workout-plan-modal')
    ? (activePlan?.workout_plan_days[0] ?? MOCK_PLAN.workout_plan_days[0] ?? null)
    : null;
  const activeTab = visualPlanDay ? 'plan' : tab;
  const planDayDetail = visualPlanDay ?? selectedPlanDay;

  // Session elapsed timer
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

  // Rest timer polling via global store interval (survives tab switches)
  useEffect(() => {
    if (restActive) {
      startRestPolling();
    } else {
      stopRestPolling();
    }
    return () => {
      stopRestPolling();
    };
  }, [restActive, startRestPolling, stopRestPolling]);

  // AppState listener — sync rest timer on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        syncRestTimer();
      }
      if (nextState.match(/inactive|background/)) {
        if (useWorkoutStore.getState().restActive) {
          pauseRest();
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [syncRestTimer, pauseRest]);

  const handleStartSession = async () => {
    const session = await startSessionMutation.mutateAsync(activePlan ?? null);
    if (session) {
      startSession(session);
    }
  };

  const handlePressExercise = (exerciseId: string) => {
    if (!activeSession) return;
    const exercise = activeSession.session_exercises.find((e) => e.exercise_id === exerciseId);
    if (!exercise || exercise.is_skipped) return;
    const isDone = exercise.completed_sets.length >= exercise.planned_sets;
    if (isDone) return;
    setEditingSetIndex(null);
    setSheetExercise(exercise);
  };

  const handlePressCompletedSet = (exerciseId: string, setIndex: number) => {
    if (!activeSession) return;
    const exercise = activeSession.session_exercises.find((e) => e.exercise_id === exerciseId);
    if (!exercise) return;
    setEditingSetIndex(setIndex);
    setSheetExercise(exercise);
  };

  const handleEditSet = (setIndex: number, set: CompletedSet) => {
    if (!sheetExercise) return;
    editSet(sheetExercise.exercise_id, setIndex, set);
    setSheetExercise(null);
    setEditingSetIndex(null);
  };

  const handlePostHocSave = async (data: {
    id: string;
    user_id: string;
    plan_day_id: string | null;
    day_name: string;
    startDate: string;
    exercises: {
      exerciseName: string;
      plannedSets: number;
      completedSets: { weight_kg: number | null; reps_completed: number; rpe: number | null }[];
    }[];
  }) => {
    const sessionExercises: SessionExercise[] = data.exercises.map((ex, idx) => ({
      id: `${data.id}-ex-${idx}`,
      session_id: data.id,
      exercise_id: `ex-${ex.exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
      exercise_name: ex.exerciseName,
      planned_sets: ex.plannedSets,
      planned_reps: `${ex.plannedSets}`,
      completed_sets: ex.completedSets.map((s, setIdx) => ({
        set_number: setIdx + 1,
        reps_completed: s.reps_completed,
        weight_kg: s.weight_kg,
        rpe: s.rpe,
        rest_seconds: null,
        completed_at: data.startDate,
      })),
      notes: null,
      is_skipped: false,
    }));

    workoutService.savePostHocSession({
      id: data.id,
      user_id: data.user_id,
      plan_day_id: data.plan_day_id,
      day_name: data.day_name,
      status: 'completed',
      started_at: data.startDate,
      completed_at: data.startDate,
      duration_seconds: null,
      session_exercises: sessionExercises,
    });

    await queryClient.invalidateQueries({ queryKey: ['workout-history', userId] });
    setShowPostHoc(false);
  };

  const handleQuickLogSet = useCallback(
    (exerciseId: string) => {
      if (!activeSession) return;
      const ex = activeSession.session_exercises.find((e) => e.exercise_id === exerciseId);
      if (!ex) return;
      const planEx = activePlan?.workout_plan_days
        .flatMap((d) => d.plan_exercises)
        .find((pe) => pe.exercise_id === exerciseId);
      const restSeconds = planEx?.rest_seconds ?? 90;
      logSet(
        exerciseId,
        {
          set_number: ex.completed_sets.length + 1,
          reps_completed: parseInt(ex.planned_reps.split('-')[0] ?? '8', 10),
          weight_kg: null,
          rpe: null,
          rest_seconds: null,
          completed_at: new Date().toISOString(),
        },
        restSeconds,
      );
    },
    [activeSession, activePlan, logSet],
  );

  const handleLogSet = (set: CompletedSet) => {
    if (!sheetExercise) return;
    const planEx = activePlan?.workout_plan_days
      .flatMap((d) => d.plan_exercises)
      .find((pe) => pe.exercise_id === sheetExercise.exercise_id);
    const restSeconds = planEx?.rest_seconds ?? 90;
    logSet(sheetExercise.exercise_id, set, restSeconds);
    setSheetExercise(null);
    setEditingSetIndex(null);
  };

  const handleFinishWorkout = () => {
    crossAlert('Finish Workout?', 'Great job! Mark this session as complete.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Finish',
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

  // Get previous session's weight/reps for current sheet exercise
  const prevWeight =
    sheetExercise && workoutHistory
      ? (workoutHistory.recent_sessions
          .filter((s) => s.status === 'completed')
          .flatMap((s) => s.session_exercises)
          .filter((e) => e.exercise_id === sheetExercise.exercise_id)
          .flatMap((e) => e.completed_sets)
          .slice(-1)
          .map((s) => s.weight_kg)[0] ?? null)
      : null;

  const prevReps =
    sheetExercise && workoutHistory
      ? (workoutHistory.recent_sessions
          .filter((s) => s.status === 'completed')
          .flatMap((s) => s.session_exercises)
          .filter((e) => e.exercise_id === sheetExercise.exercise_id)
          .flatMap((e) => e.completed_sets)
          .slice(-1)
          .map((s) => s.reps_completed)[0] ?? null)
      : null;

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
            {isComplete && activeSession ? (
              <SessionCompleteCard activeSession={activeSession} elapsedSeconds={elapsedSeconds} />
            ) : activeSession ? (
              <TimerDisplay
                activeSession={activeSession}
                progress={progress}
                restActive={restActive}
                restRemaining={restRemaining}
                restDuration={restDuration}
                restExerciseName={restExerciseName}
                nextExerciseName={nextExerciseName}
                isRestPaused={restActive && restPausedRemaining !== null}
                onCompleteSet={handleQuickLogSet}
                onSkipExercise={skipExercise}
                onPressExercise={handlePressExercise}
                onPressCompletedSet={handlePressCompletedSet}
                onPauseRest={pauseRest}
                onResumeRest={resumeRest}
                onSkipRest={skipRest}
                onExtendRest={() => extendRest(30)}
              />
            ) : (
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
                        : "Connect your plan data to load today's session"}
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
                        <Text style={styles.startBtnText}>Start Session</Text>
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

        <WorkoutStats
          workoutHistory={workoutHistory}
          weeklyTarget={weeklyTarget}
          onSessionPress={setSelectedSessionId}
        />

        <TouchableOpacity
          style={styles.postHocBtn}
          onPress={() => setShowPostHoc(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.postHocBtnText}>Log Past Workout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SessionDetailModal
        visible={selectedSessionId !== null}
        session={selectedSession}
        onClose={() => setSelectedSessionId(null)}
      />

      <PlanDayModal
        visible={Boolean(planDayDetail)}
        planDayDetail={planDayDetail}
        onClose={() => setSelectedPlanDay(null)}
      />

      <SetLoggingSheet
        visible={sheetExercise !== null}
        exercise={sheetExercise}
        restSeconds={
          sheetExercise
            ? (activePlan?.workout_plan_days
                .flatMap((d) => d.plan_exercises)
                .find((pe) => pe.exercise_id === sheetExercise.exercise_id)?.rest_seconds ?? 90)
            : 90
        }
        defaultWeight={null}
        defaultReps={
          sheetExercise ? parseInt(sheetExercise.planned_reps.split('-')[0] ?? '8', 10) : 8
        }
        previousWeight={prevWeight}
        previousReps={prevReps}
        editingSetIndex={editingSetIndex}
        onLogSet={handleLogSet}
        onEditSet={handleEditSet}
        onClose={() => {
          setSheetExercise(null);
          setEditingSetIndex(null);
        }}
      />

      <PostHocLoggingSheet
        visible={showPostHoc}
        activePlan={activePlan ?? null}
        userId={userId ?? ''}
        onSave={handlePostHocSave}
        onClose={() => setShowPostHoc(false)}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
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
      flexDirection: 'row' as const,
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

    todayCard: { marginBottom: Spacing.lg },
    todayCardTop: { marginBottom: Spacing.lg },
    todayBadge: {
      alignSelf: 'flex-start' as const,
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
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
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
      alignItems: 'center' as const,
    },
    startBtnText: {
      color: Colors.white,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.md,
      letterSpacing: 0.3,
    },

    planHeaderCard: { marginBottom: Spacing.lg },
    planName: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      marginBottom: 4,
    },
    planMeta: { color: colors.muted, fontSize: Typography.size.sm },
    postHocBtn: {
      marginTop: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center' as const,
      borderStyle: 'dashed' as const,
    },
    postHocBtnText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },
  }) as const;
