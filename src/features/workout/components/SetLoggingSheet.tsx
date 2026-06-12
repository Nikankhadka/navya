import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
  Typography,
  useAppTheme,
  type ThemeColors,
} from '@/theme';
import type { SessionExercise, CompletedSet } from '@/features/workout/types';

export interface SetLoggingSheetProps {
  visible: boolean;
  exercise: SessionExercise | null;
  restSeconds: number;
  defaultWeight: number | null;
  defaultReps: number;
  previousWeight: number | null;
  previousReps: number | null;
  editingSetIndex: number | null;
  onLogSet: (set: CompletedSet) => void;
  onEditSet: (setIndex: number, set: CompletedSet) => void;
  onClose: () => void;
}

export function SetLoggingSheet({
  visible,
  exercise,
  defaultWeight,
  defaultReps,
  previousWeight,
  previousReps,
  editingSetIndex,
  onLogSet,
  onEditSet,
  onClose,
}: SetLoggingSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const editingSet =
    editingSetIndex !== null ? (exercise?.completed_sets[editingSetIndex] ?? null) : null;

  const [weight, setWeight] = useState(
    editingSet?.weight_kg?.toString() ?? defaultWeight?.toString() ?? '',
  );
  const [reps, setReps] = useState(
    editingSet?.reps_completed?.toString() ?? defaultReps.toString(),
  );
  const [rpe, setRpe] = useState<number | null>(editingSet?.rpe ?? null);

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(0, current + delta);
    setWeight(next % 1 === 0 ? next.toString() : next.toFixed(1));
  };

  const handleLog = () => {
    if (!exercise || !reps) return;
    const setNumber =
      editingSetIndex !== null
        ? exercise.completed_sets[editingSetIndex].set_number
        : exercise.completed_sets.length + 1;
    const set: CompletedSet = {
      set_number: setNumber,
      reps_completed: parseInt(reps, 10) || defaultReps,
      weight_kg: weight ? parseFloat(weight) : null,
      rpe,
      rest_seconds: editingSet?.rest_seconds ?? null,
      completed_at: editingSet?.completed_at ?? new Date().toISOString(),
    };

    if (editingSetIndex !== null) {
      onEditSet(editingSetIndex, set);
    } else {
      onLogSet(set);
    }
  };

  const rpeLabels: Record<number, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Easy',
    4: 'Moderate',
    5: 'Moderate',
    6: 'Moderate',
    7: 'Hard',
    8: 'Hard',
    9: 'Very Hard',
    10: 'Max',
  };

  const getRpeSegmentColor = (value: number, selected: boolean) => {
    if (selected) return colors.accent;
    if (value <= 3) return `${colors.green}44`;
    if (value <= 6) return `${colors.orange}55`;
    if (value <= 9) return `${colors.orange}88`;
    return `${colors.red}88`;
  };

  if (!visible || !exercise) return null;

  const setNumber =
    editingSetIndex !== null
      ? exercise.completed_sets[editingSetIndex].set_number
      : exercise.completed_sets.length + 1;
  const isEditing = editingSetIndex !== null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {isEditing
                  ? `Edit Set ${setNumber}`
                  : `Set ${setNumber} of ${exercise.planned_sets}`}
              </Text>
              <Text style={[styles.exerciseName, { color: colors.accent }]}>
                {exercise.exercise_name}
              </Text>
            </View>

            {/* Weight */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <View style={styles.weightRow}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder={previousWeight ? `${previousWeight}kg` : 'e.g. 60'}
                  placeholderTextColor={colors.dim}
                  selectTextOnFocus
                />
                <Pressable style={styles.adjustBtn} onPress={() => adjustWeight(-2.5)}>
                  <Text style={styles.adjustBtnText}>−2.5</Text>
                </Pressable>
                <Pressable style={styles.adjustBtn} onPress={() => adjustWeight(2.5)}>
                  <Text style={styles.adjustBtnText}>+2.5</Text>
                </Pressable>
                <Pressable style={styles.adjustBtn} onPress={() => adjustWeight(5)}>
                  <Text style={styles.adjustBtnText}>+5</Text>
                </Pressable>
              </View>
              {previousWeight !== null && previousWeight > 0 && (
                <Text style={styles.hintText}>Last time: {previousWeight}kg</Text>
              )}
            </View>

            {/* Reps */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Reps</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWide,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder={previousReps ? `${previousReps}` : `${defaultReps}`}
                placeholderTextColor={colors.dim}
                selectTextOnFocus
              />
              {previousReps !== null && previousReps > 0 && (
                <Text style={styles.hintText}>Last time: {previousReps} reps</Text>
              )}
            </View>

            {/* RPE */}
            <View style={styles.fieldGroup}>
              <View style={styles.rpeHeader}>
                <Text style={styles.fieldLabel}>RPE (optional)</Text>
                {rpe !== null && (
                  <Text style={styles.rpeValue}>
                    {rpe} — {rpeLabels[rpe]}
                  </Text>
                )}
              </View>
              <View style={styles.rpeSliderRow}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.rpeSegment,
                      {
                        backgroundColor: getRpeSegmentColor(value, rpe === value),
                        borderColor: rpe === value ? colors.accent : colors.border,
                        borderWidth: rpe === value ? 2 : 1,
                      },
                    ]}
                    onPress={() => setRpe(rpe === value ? null : value)}
                  >
                    <Text
                      style={[
                        styles.rpeSegmentText,
                        { color: rpe === value ? Colors.white : colors.dim },
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.rpeLabelsRow}>
                <Text style={styles.rpeRangeLabel}>Easy</Text>
                <Text style={styles.rpeRangeLabel}>Moderate</Text>
                <Text style={styles.rpeRangeLabel}>Hard</Text>
                <Text style={styles.rpeRangeLabel}>Max</Text>
              </View>
            </View>

            {/* Log button */}
            <Pressable
              style={[styles.logBtn, { backgroundColor: colors.accent }]}
              onPress={handleLog}
            >
              <Text style={styles.logBtnText}>{isEditing ? 'Save Set' : 'Log Set'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    backdrop: { flex: 1 },
    backdropPressable: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end' as const,
    },
    sheet: {
      borderTopLeftRadius: Radius.xxl,
      borderTopRightRadius: Radius.xxl,
      padding: Spacing.xl,
      paddingBottom: Spacing.xxxl,
      ...Shadow.md,
    },
    sheetHeader: {
      marginBottom: Spacing.xl,
      alignItems: 'center' as const,
    },
    sheetTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    exerciseName: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
      marginTop: Spacing.xs,
    },
    fieldGroup: {
      marginBottom: Spacing.lg,
    },
    fieldLabel: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
      marginBottom: Spacing.xs,
    },
    weightRow: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      alignItems: 'center' as const,
    },
    input: {
      flex: 1,
      height: 44,
      borderRadius: Radius.md,
      borderWidth: 1,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    inputWide: {
      width: '100%' as const,
    },
    adjustBtn: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 10,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    adjustBtnText: {
      color: colors.textSecondary,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    hintText: {
      color: colors.dim,
      fontSize: Typography.size.xs,
      marginTop: Spacing.xs,
    },
    rpeHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.xs,
    },
    rpeValue: {
      color: colors.accent,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    rpeSliderRow: {
      flexDirection: 'row' as const,
      gap: 2,
      marginBottom: Spacing.xs,
    },
    rpeSegment: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: 36,
      borderRadius: Radius.sm,
      borderWidth: 1,
    },
    rpeSegmentText: {
      fontSize: 11,
      fontWeight: Typography.weight.bold,
    },
    rpeLabelsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 2,
    },
    rpeRangeLabel: {
      color: colors.dim,
      fontSize: 9,
    },
    logBtn: {
      borderRadius: Radius.lg,
      paddingVertical: 14,
      alignItems: 'center' as const,
      marginTop: Spacing.md,
    },
    logBtnText: {
      color: Colors.white,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
  }) as const;
