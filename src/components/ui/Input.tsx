import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';
import { Radius, Spacing, Typography, useAppTheme } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label ? (
        <Text
          style={{
            color: colors.muted,
            fontSize: Typography.size.sm,
            fontWeight: Typography.weight.medium,
            marginBottom: Spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: error ? colors.red : colors.border,
            color: colors.text,
            paddingVertical: 14,
            paddingHorizontal: 16,
            fontSize: Typography.size.md,
          },
          style,
        ]}
        placeholderTextColor={colors.inputPlaceholder}
        {...props}
      />
      {error ? (
        <Text
          style={{
            color: colors.red,
            fontSize: Typography.size.sm,
            marginTop: Spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
