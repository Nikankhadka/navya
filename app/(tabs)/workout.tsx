import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { useWorkoutStore } from '../../src/stores/useWorkoutStore';
import { Card, EmptyState } from '../../src/components/ui';
import { ExerciseRow, PlanDayCard } from '../../src/components/workout';
import { formatDuration, sessionProgress } from '../../src/utils/helpers';
import { crossAlert } from '../../src/utils/crossAlert';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useActivePlan } from '../../src/hooks/useActivePlan';
import { useTodaySession } from '../../src/hooks/useTodaySession';

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: activePlan } = useActivePlan(userId);
  const { data: todaySessionData } = useTodaySession(userId);
  const { activeSession, elapsedSeconds, timerActive, startSession, endSession, skipExercise, markExerciseDone, tickTimer } = useWorkoutStore();
  const [tab, setTab] = useState<'today' | 'plan'>('today');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleStartSession = () => {
    if (todaySessionData) {
      startSession(todaySessionData);
    }
  };

  const handleCompleteSet = (exerciseId: string) => {
    if (!activeSession) return;
    const ex = activeSession.session_exercises.find(e => e.exercise_id === exerciseId);
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
      { text: 'Finish 🎉', onPress: () => endSession() },
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
        {tab === 'today' ? (
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
                        (sum, ex) => sum + ex.completed_sets.length, 0
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
                      .every(e => e.completed_sets.length >= e.planned_sets || e.is_skipped);
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
                    <Text style={styles.todayTitle}>{todaySessionData?.day_name ?? 'No session ready'}</Text>
                    <Text style={styles.todayMeta}>
                      {todaySessionData ? `${todaySessionData.session_exercises.length} exercises` : 'Connect your plan data to load today’s session'}
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

                      <TouchableOpacity style={styles.startBtn} onPress={handleStartSession} activeOpacity={0.85}>
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
                {activePlan ? `${activePlan.workout_plan_days.length} training days / week` : 'Create or sync a plan to see your week'}
              </Text>
            </Card>

            {activePlan ? (
              activePlan.workout_plan_days.map((day) => (
                <PlanDayCard
                  key={day.id}
                  day={day}
                  isToday={day.day_of_week === 'monday'}
                  onPress={() => {}}
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
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  timerText: {
    color: Colors.green,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginTop: 2,
  },
  finishBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  finishBtnText: {
    color: Colors.green,
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
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabText: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  tabTextActive: {
    color: '#fff',
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
  progressLabel: { color: Colors.muted, fontSize: Typography.size.sm },
  progressPct: { color: Colors.accent, fontWeight: Typography.weight.bold, fontSize: Typography.size.sm },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
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
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    marginBottom: Spacing.sm,
  },
  todayBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
  },
  todayTitle: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  todayMeta: { color: Colors.muted, fontSize: Typography.size.sm },
  exercisePreview: { gap: Spacing.sm, marginBottom: Spacing.lg },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dim,
  },
  previewName: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  previewMeta: { color: Colors.dim, fontSize: Typography.size.xs },
  moreExercises: { color: Colors.dim, fontSize: Typography.size.xs, marginLeft: 14 },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
    letterSpacing: 0.3,
  },

  // Complete
  completeCard: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.green + '44',
  },
  completeEmoji: { fontSize: 52 },
  completeTitle: {
    color: Colors.green,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    marginTop: Spacing.md,
  },
  completeSub: {
    color: Colors.muted,
    fontSize: Typography.size.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  completeStats: { flexDirection: 'row', gap: 48 },
  completeStat: { alignItems: 'center' },
  completeStatVal: {
    color: Colors.text,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
  },
  completeStatLabel: { color: Colors.muted, fontSize: Typography.size.sm },

  // Plan
  planHeaderCard: { marginBottom: Spacing.lg },
  planName: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  planMeta: { color: Colors.muted, fontSize: Typography.size.sm },
});
