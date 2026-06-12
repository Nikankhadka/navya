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
  onLogSet: (set: CompletedSet) => void;
  onClose: () => void;
}

export function SetLoggingSheet({
  visible,
  exercise,
  defaultWeight,
  defaultReps,
  previousWeight,
  previousReps,
  onLogSet,
  onClose,
}: SetLoggingSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const [weight, setWeight] = useState(defaultWeight?.toString() ?? '');
  const [reps, setReps] = useState(defaultReps.toString());
  const [rpe, setRpe] = useState<number | null>(null);

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(0, current + delta);
    setWeight(next % 1 === 0 ? next.toString() : next.toFixed(1));
  };

  const handleLog = () => {
    if (!exercise || !reps) return;
    const setNumber = exercise.completed_sets.length + 1;
    onLogSet({
      set_number: setNumber,
      reps_completed: parseInt(reps, 10) || defaultReps,
      weight_kg: weight ? parseFloat(weight) : null,
      rpe,
      rest_seconds: null,
      completed_at: new Date().toISOString(),
    });
  };

  const rpeLabels = ['Easy', 'Moderate', 'Hard', 'Max'] as const;
  const rpeValues = [2, 5, 8, 10] as const;

  if (!visible || !exercise) return null;

  const setNumber = exercise.completed_sets.length + 1;

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
                Set {setNumber} of {exercise.planned_sets}
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
              <Text style={styles.fieldLabel}>RPE (optional)</Text>
              <View style={styles.rpeRow}>
                {rpeValues.map((value, i) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.rpeBtn,
                      rpe === value && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setRpe(rpe === value ? null : value)}
                  >
                    <Text
                      style={[
                        styles.rpeBtnText,
                        { color: rpe === value ? Colors.white : colors.textSecondary },
                      ]}
                    >
                      {value}
                    </Text>
                    <Text
                      style={[
                        styles.rpeLabel,
                        { color: rpe === value ? `${Colors.white}CC` : colors.dim },
                      ]}
                    >
                      {rpeLabels[i]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Log button */}
            <Pressable
              style={[styles.logBtn, { backgroundColor: colors.accent }]}
              onPress={handleLog}
            >
              <Text style={styles.logBtnText}>Log Set</Text>
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
    rpeRow: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
    },
    rpeBtn: {
      flex: 1,
      alignItems: 'center' as const,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      borderWidth: 1,
    },
    rpeBtnText: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    rpeLabel: {
      fontSize: 9,
      marginTop: 2,
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
