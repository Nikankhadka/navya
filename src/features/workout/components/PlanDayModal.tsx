import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';
import type { WorkoutPlanDay } from '@/types/app';

export interface PlanDayModalProps {
  visible: boolean;
  planDayDetail: WorkoutPlanDay | null;
  onClose: () => void;
}

export function PlanDayModal({ visible, planDayDetail, onClose }: PlanDayModalProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
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
                        <Text style={styles.exerciseInfoValue}>{exercise.exercise.difficulty}</Text>
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
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
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
  }) as const;
