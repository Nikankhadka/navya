import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type { GoalType } from '@/types/app';

type EditProfileForm = {
  full_name: string;
  weight_kg: string;
  height_cm: string;
  goal: GoalType;
  workouts_per_week: string;
};

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  form: EditProfileForm;
  onFormChange: React.Dispatch<React.SetStateAction<EditProfileForm>>;
  isSaving: boolean;
  isDemoSession: boolean;
}

const GOAL_OPTIONS: { id: GoalType; label: string }[] = [
  { id: 'build_muscle', label: 'Build Muscle' },
  { id: 'lose_weight', label: 'Lose Weight' },
  { id: 'maintain', label: 'Maintain' },
  { id: 'improve_endurance', label: 'Endurance' },
  { id: 'general_fitness', label: 'General Fitness' },
];

export function EditProfileModal({
  visible,
  onClose,
  onSave,
  form,
  onFormChange,
  isSaving,
  isDemoSession,
}: EditProfileModalProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(value) => onFormChange((current) => ({ ...current, full_name: value }))}
            placeholder="Your name"
            placeholderTextColor={colors.inputPlaceholder}
            testID="profile-full-name-input"
          />

          <Text style={styles.fieldLabel}>Goal</Text>
          <View style={styles.goalGrid}>
            {GOAL_OPTIONS.map((option) => {
              const selected = form.goal === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.goalChip, selected && styles.goalChipActive]}
                  onPress={() => onFormChange((current) => ({ ...current, goal: option.id }))}
                >
                  <Text style={[styles.goalChipText, selected && styles.goalChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={form.weight_kg}
                onChangeText={(value) =>
                  onFormChange((current) => ({ ...current, weight_kg: value }))
                }
                placeholder="78"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.fieldLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={form.height_cm}
                onChangeText={(value) =>
                  onFormChange((current) => ({ ...current, height_cm: value }))
                }
                placeholder="178"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Workouts Per Week</Text>
          <TextInput
            style={styles.input}
            value={form.workouts_per_week}
            onChangeText={(value) =>
              onFormChange((current) => ({ ...current, workouts_per_week: value }))
            }
            placeholder="3"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={onSave}
            disabled={isSaving || !form.full_name.trim()}
            testID="profile-save-button"
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? 'Saving...' : isDemoSession ? 'Save Demo Profile' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalScreen: {
      flex: 1,
      backgroundColor: colors.background,
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
      marginBottom: Spacing.xl,
    },
    modalTitle: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    modalClose: {
      color: colors.accent,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: Radius.lg,
      color: colors.text,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontSize: Typography.size.md,
    },
    inputRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    inputCol: {
      flex: 1,
    },
    goalGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    goalChip: {
      backgroundColor: colors.card,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    goalChipActive: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    goalChipText: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    goalChipTextActive: {
      color: colors.accent,
    },
    saveBtn: {
      marginTop: Spacing.xxl,
      backgroundColor: colors.accent,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      color: Colors.white,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
  });
