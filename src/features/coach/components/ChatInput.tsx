import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, Radius, Typography, type ThemeColors } from '@/theme';

export interface ChatInputProps {
  /** Current text value of the input */
  value: string;
  /** Called when the text changes */
  onChangeText: (text: string) => void;
  /** Called when the user presses send (or submits the keyboard) */
  onSend: () => void;
  /** Whether the input and send button are interactive */
  disabled: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Max characters allowed */
  maxLength?: number;
  /** Bottom safe-area inset for padding */
  bottomInset: number;
  colors: ThemeColors;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled,
  placeholder = 'Ask your coach anything...',
  maxLength = 300,
  bottomInset,
  colors,
}: ChatInputProps) {
  const styles = createStyles(colors);

  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.inputBar, { paddingBottom: Math.max(bottomInset, Spacing.md) }]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={maxLength}
        returnKeyType="send"
        onSubmitEditing={onSend}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.sendBtn, hasText ? styles.sendBtnActive : styles.sendBtnInactive]}
        onPress={onSend}
        disabled={!hasText || disabled}
        activeOpacity={0.85}
      >
        <Text style={[styles.sendBtnText, { color: hasText ? Colors.white : colors.dim }]}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    inputBar: {
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: Typography.size.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: 12,
      maxHeight: 100,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: Radius.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexShrink: 0,
    },
    sendBtnActive: { backgroundColor: colors.accent },
    sendBtnInactive: { backgroundColor: colors.border },
    sendBtnText: {
      color: Colors.white,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
  }) as const;
