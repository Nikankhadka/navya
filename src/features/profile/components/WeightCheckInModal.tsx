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

export interface WeightCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onLog: () => void;
  weight: string;
  onWeightChange: React.Dispatch<React.SetStateAction<string>>;
  isPending: boolean;
}

export function WeightCheckInModal({
  visible,
  onClose,
  onLog,
  weight,
  onWeightChange,
  isPending,
}: WeightCheckInModalProps) {
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
            <Text style={styles.modalTitle}>Log Weight Check-in</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={onWeightChange}
            placeholder="79.4"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="numeric"
          />

          <Text style={styles.progressModalHint}>
            This saves a timestamped check-in and updates your current profile weight.
          </Text>

          <TouchableOpacity
            style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
            onPress={onLog}
            disabled={isPending || !weight.trim()}
          >
            <Text style={styles.saveBtnText}>{isPending ? 'Saving...' : 'Save Check-in'}</Text>
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
    progressModalHint: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
      marginTop: Spacing.md,
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
