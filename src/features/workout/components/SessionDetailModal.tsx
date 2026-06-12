import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, Typography, useAppTheme } from '@/theme';
import type { WorkoutSession } from '@/types/app';
import { formatDuration, formatWeight } from '@/utils/helpers';

interface SessionDetailModalProps {
  visible: boolean;
  session: WorkoutSession | null;
  onClose: () => void;
}

export function SessionDetailModal({ visible, session, onClose }: SessionDetailModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!session) return null;

  const totalVolume = session.session_exercises.reduce((sum, exercise) => {
    const exerciseVolume = (exercise.completed_sets ?? []).reduce(
      (setSum, set) => setSum + (set.weight_kg ?? 0) * set.reps_completed,
      0,
    );
    return sum + exerciseVolume;
  }, 0);

  const completedExercises = session.session_exercises.filter(
    (ex) => !ex.is_skipped && (ex.completed_sets ?? []).length > 0,
  ).length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: colors.accent }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Session Details</Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Session summary card */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sessionName, { color: colors.text }]}>{session.day_name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {formatDuration(session.duration_seconds ?? 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.green }]}>
                  {completedExercises}/{session.session_exercises.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.orange }]}>
                  {totalVolume > 0 ? `${Math.round(totalVolume)}` : '—'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Vol (kg)</Text>
              </View>
            </View>
            {session.completed_at ? (
              <Text style={[styles.dateText, { color: colors.dim }]}>
                Completed:{' '}
                {new Date(session.completed_at).toLocaleDateString('en-AU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            ) : null}
          </View>

          {/* Exercise list */}
          {session.session_exercises.map((exercise, index) => {
            const sets = exercise.completed_sets ?? [];
            const isSkipped = exercise.is_skipped;
            const anySetsDone = sets.length > 0;

            return (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSkipped ? colors.border : colors.border,
                  },
                ]}
              >
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNameRow}>
                    <Text
                      style={[
                        styles.exerciseIndex,
                        { color: isSkipped ? colors.dim : colors.accent },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.exerciseName,
                          {
                            color: isSkipped ? colors.dim : colors.text,
                            textDecorationLine: isSkipped ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {exercise.exercise_name}
                      </Text>
                      <Text style={[styles.exercisePlan, { color: colors.muted }]}>
                        Target: {exercise.planned_sets} × {exercise.planned_reps}
                      </Text>
                    </View>
                  </View>
                  {isSkipped ? (
                    <View style={[styles.skippedBadge, { backgroundColor: `${colors.orange}30` }]}>
                      <Text style={[styles.skippedText, { color: colors.orange }]}>Skipped</Text>
                    </View>
                  ) : null}
                </View>

                {/* Sets table */}
                {anySetsDone ? (
                  <View style={[styles.setsTable, { borderColor: colors.border }]}>
                    {/* Header row */}
                    <View style={styles.setsHeader}>
                      <Text style={[styles.setHeaderCell, { color: colors.dim }]}>Set</Text>
                      <Text style={[styles.setHeaderCell, { color: colors.dim }]}>Weight</Text>
                      <Text style={[styles.setHeaderCell, { color: colors.dim }]}>Reps</Text>
                      <Text style={[styles.setHeaderCell, { color: colors.dim }]}>RPE</Text>
                    </View>
                    {/* Data rows */}
                    {sets.map((set) => (
                      <View key={set.set_number} style={styles.setRow}>
                        <Text style={[styles.setCell, { color: colors.text }]}>
                          {set.set_number}
                        </Text>
                        <Text style={[styles.setCell, { color: colors.text }]}>
                          {set.weight_kg != null ? formatWeight(set.weight_kg) : '—'}
                        </Text>
                        <Text style={[styles.setCell, { color: colors.text }]}>
                          {set.reps_completed}
                        </Text>
                        <Text style={[styles.setCell, { color: colors.text }]}>
                          {set.rpe != null ? set.rpe : '—'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptySetsWrap}>
                    <Text style={[styles.emptySetsText, { color: colors.dim }]}>
                      {isSkipped ? 'Exercise skipped' : 'No sets logged'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = {
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 60,
  },
  closeBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  summaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sessionName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  dateText: {
    fontSize: Typography.size.xs,
  },
  exerciseCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  exerciseNameRow: {
    flexDirection: 'row' as const,
    gap: Spacing.md,
    flex: 1,
    alignItems: 'flex-start' as const,
  },
  exerciseIndex: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    width: 24,
    textAlign: 'center' as const,
  },
  exerciseName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  exercisePlan: {
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  skippedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  skippedText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  setsTable: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  setsHeader: {
    flexDirection: 'row' as const,
    marginBottom: Spacing.xs,
  },
  setHeaderCell: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textAlign: 'center' as const,
  },
  setRow: {
    flexDirection: 'row' as const,
    paddingVertical: 4,
  },
  setCell: {
    flex: 1,
    fontSize: Typography.size.sm,
    textAlign: 'center' as const,
  },
  emptySetsWrap: {
    paddingVertical: Spacing.md,
    alignItems: 'center' as const,
  },
  emptySetsText: {
    fontSize: Typography.size.sm,
    fontStyle: 'italic' as const,
  },
};
