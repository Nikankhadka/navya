import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
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
import type { WorkoutPlan } from '@/types/app';

export interface PostHocLoggingSheetProps {
  visible: boolean;
  activePlan: WorkoutPlan | null;
  userId: string;
  onSave: (session: {
    id: string;
    user_id: string;
    plan_day_id: string | null;
    day_name: string;
    startDate: string;
    exercises: PostHocExercise[];
  }) => void;
  onClose: () => void;
}

export interface PostHocExercise {
  exerciseName: string;
  plannedSets: number;
  completedSets: {
    weight_kg: number | null;
    reps_completed: number;
    rpe: number | null;
  }[];
}

interface PostHocExerciseState {
  name: string;
  sets_planned: string;
  sets: { weight: string; reps: string; rpe: string }[];
  expanded: boolean;
}

export function PostHocLoggingSheet({
  visible,
  activePlan,
  userId,
  onSave,
  onClose,
}: PostHocLoggingSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const now = new Date();
  const [day, setDay] = useState(String(now.getDate()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [isFreeform, setIsFreeform] = useState(false);
  const [exercises, setExercises] = useState<PostHocExerciseState[]>([
    { name: '', sets_planned: '3', sets: [{ weight: '', reps: '8', rpe: '' }], expanded: true },
  ]);

  const getDateISO = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    return new Date(y, m, d).toISOString();
  };

  const addSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: [...ex.sets, { weight: '', reps: '8', rpe: '' }] } : ex,
      ),
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) } : ex,
      ),
    );
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { name: '', sets_planned: '3', sets: [{ weight: '', reps: '8', rpe: '' }], expanded: true },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'rpe',
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, [field]: value } : s)),
            }
          : ex,
      ),
    );
  };

  const handleSave = () => {
    const parsedExercises: PostHocExercise[] = exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        exerciseName: ex.name.trim(),
        plannedSets: parseInt(ex.sets_planned, 10) || ex.sets.length,
        completedSets: ex.sets
          .filter((s) => s.reps)
          .map((s) => ({
            weight_kg: s.weight ? parseFloat(s.weight) : null,
            reps_completed: parseInt(s.reps, 10) || 0,
            rpe: s.rpe ? parseInt(s.rpe, 10) : null,
          })),
      }));

    if (parsedExercises.length === 0) return;

    const planDay =
      !isFreeform && selectedDayIndex !== null && activePlan
        ? activePlan.workout_plan_days[selectedDayIndex]
        : null;

    onSave({
      id: `posthoc-${Date.now()}`,
      user_id: userId,
      plan_day_id: planDay?.id ?? null,
      day_name: planDay?.day_name ?? `Freeform — ${day}/${month}/${year}`,
      startDate: getDateISO(),
      exercises: parsedExercises,
    });
  };

  const selectedDayName =
    !isFreeform && selectedDayIndex !== null && activePlan
      ? activePlan.workout_plan_days[selectedDayIndex]?.day_name
      : 'Freeform';

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>Log Past Workout</Text>
              <Text style={styles.subtitle}>{selectedDayName}</Text>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Date inputs */}
              <Text style={styles.sectionLabel}>Date</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                  value={day}
                  onChangeText={setDay}
                  keyboardType="number-pad"
                  placeholder="DD"
                  placeholderTextColor={colors.dim}
                  maxLength={2}
                />
                <Text style={styles.dateSep}>/</Text>
                <TextInput
                  style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="number-pad"
                  placeholder="MM"
                  placeholderTextColor={colors.dim}
                  maxLength={2}
                />
                <Text style={styles.dateSep}>/</Text>
                <TextInput
                  style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  placeholder="YYYY"
                  placeholderTextColor={colors.dim}
                  maxLength={4}
                />
              </View>

              {/* Plan day selector */}
              {activePlan ? (
                <>
                  <Text style={styles.sectionLabel}>Plan Day</Text>
                  <View style={styles.planDaysRow}>
                    <Pressable
                      style={[
                        styles.planDayChip,
                        isFreeform && {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        },
                        !isFreeform && { borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setIsFreeform(true);
                        setSelectedDayIndex(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.planDayChipText,
                          { color: isFreeform ? Colors.white : colors.textSecondary },
                        ]}
                      >
                        Freeform
                      </Text>
                    </Pressable>
                    {activePlan.workout_plan_days.map((planDay, idx) => (
                      <Pressable
                        key={planDay.id}
                        style={[
                          styles.planDayChip,
                          !isFreeform &&
                            selectedDayIndex === idx && {
                              backgroundColor: colors.accent,
                              borderColor: colors.accent,
                            },
                          { borderColor: colors.border },
                        ]}
                        onPress={() => {
                          setIsFreeform(false);
                          setSelectedDayIndex(idx);
                        }}
                      >
                        <Text
                          style={[
                            styles.planDayChipText,
                            {
                              color:
                                !isFreeform && selectedDayIndex === idx
                                  ? Colors.white
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {planDay.day_name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {/* Exercises */}
              <Text style={styles.sectionLabel}>Exercises</Text>
              {exercises.map((ex, exIndex) => (
                <View
                  key={exIndex}
                  style={[
                    styles.exerciseBlock,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.exerciseHeader}>
                    <TextInput
                      style={[
                        styles.exerciseNameInput,
                        { color: colors.text, borderColor: colors.border },
                      ]}
                      value={ex.name}
                      onChangeText={(v) =>
                        setExercises((prev) =>
                          prev.map((e, i) => (i === exIndex ? { ...e, name: v } : e)),
                        )
                      }
                      placeholder="Exercise name"
                      placeholderTextColor={colors.dim}
                    />
                    {exercises.length > 1 && (
                      <Pressable style={styles.removeBtn} onPress={() => removeExercise(exIndex)}>
                        <Text style={styles.removeBtnText}>×</Text>
                      </Pressable>
                    )}
                  </View>

                  {ex.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
                      <TextInput
                        style={[
                          styles.setInputSmall,
                          { color: colors.text, borderColor: colors.border },
                        ]}
                        value={set.weight}
                        onChangeText={(v) => updateSet(exIndex, setIndex, 'weight', v)}
                        keyboardType="decimal-pad"
                        placeholder="kg"
                        placeholderTextColor={colors.dim}
                      />
                      <TextInput
                        style={[
                          styles.setInputSmall,
                          { color: colors.text, borderColor: colors.border },
                        ]}
                        value={set.reps}
                        onChangeText={(v) => updateSet(exIndex, setIndex, 'reps', v)}
                        keyboardType="number-pad"
                        placeholder="reps"
                        placeholderTextColor={colors.dim}
                      />
                      <TextInput
                        style={[
                          styles.setInputSmall,
                          { color: colors.text, borderColor: colors.border },
                        ]}
                        value={set.rpe}
                        onChangeText={(v) => updateSet(exIndex, setIndex, 'rpe', v)}
                        keyboardType="number-pad"
                        placeholder="RPE"
                        placeholderTextColor={colors.dim}
                        maxLength={2}
                      />
                      {ex.sets.length > 1 && (
                        <Pressable
                          style={styles.removeBtn}
                          onPress={() => removeSet(exIndex, setIndex)}
                        >
                          <Text style={styles.removeBtnText}>−</Text>
                        </Pressable>
                      )}
                    </View>
                  ))}

                  <Pressable
                    style={[styles.addSetBtn, { borderColor: colors.border }]}
                    onPress={() => addSet(exIndex)}
                  >
                    <Text style={[styles.addSetBtnText, { color: colors.accent }]}>+ Add Set</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                style={[styles.addExBtn, { borderColor: colors.border }]}
                onPress={addExercise}
              >
                <Text style={[styles.addExBtnText, { color: colors.accent }]}>+ Add Exercise</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save Workout</Text>
              </Pressable>
            </ScrollView>
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
      height: '90%',
      borderTopLeftRadius: Radius.xxl,
      borderTopRightRadius: Radius.xxl,
      ...Shadow.md,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center' as const,
      marginTop: Spacing.md,
    },
    header: {
      padding: Spacing.xl,
      paddingBottom: Spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: Spacing.xl,
      paddingTop: 0,
      gap: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
    sectionLabel: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },
    dateRow: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      alignItems: 'center' as const,
    },
    dateInput: {
      flex: 1,
      height: 44,
      borderRadius: Radius.md,
      borderWidth: 1,
      textAlign: 'center' as const,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    dateSep: {
      color: colors.dim,
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
    },
    planDaysRow: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      flexWrap: 'wrap' as const,
    },
    planDayChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    planDayChipText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    exerciseBlock: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    exerciseHeader: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      alignItems: 'center' as const,
    },
    exerciseNameInput: {
      flex: 1,
      height: 40,
      borderRadius: Radius.md,
      borderWidth: 1,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    setRow: {
      flexDirection: 'row' as const,
      gap: Spacing.xs,
      alignItems: 'center' as const,
    },
    setLabel: {
      color: colors.dim,
      fontSize: Typography.size.xs,
      width: 32,
    },
    setInputSmall: {
      flex: 1,
      height: 36,
      borderRadius: Radius.sm,
      borderWidth: 1,
      textAlign: 'center' as const,
      fontSize: Typography.size.sm,
    },
    addSetBtn: {
      borderWidth: 1,
      borderRadius: Radius.sm,
      paddingVertical: Spacing.sm,
      alignItems: 'center' as const,
      borderStyle: 'dashed' as const,
    },
    addSetBtnText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    addExBtn: {
      borderWidth: 1,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.md,
      alignItems: 'center' as const,
      borderStyle: 'dashed' as const,
    },
    addExBtnText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    removeBtn: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    removeBtnText: {
      color: colors.dim,
      fontSize: 18,
      fontWeight: Typography.weight.bold,
    },
    saveBtn: {
      borderRadius: Radius.lg,
      paddingVertical: 14,
      alignItems: 'center' as const,
      marginTop: Spacing.md,
    },
    saveBtnText: {
      color: Colors.white,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
  }) as const;
