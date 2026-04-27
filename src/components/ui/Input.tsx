import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label ? (
        <Text
          style={{
            color: Colors.muted,
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
            backgroundColor: Colors.card,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: error ? Colors.red : Colors.border,
            color: Colors.text,
            paddingVertical: 14,
            paddingHorizontal: 16,
            fontSize: Typography.size.md,
          },
          style,
        ]}
        placeholderTextColor={Colors.dim}
        {...props}
      />
      {error ? (
        <Text
          style={{
            color: Colors.red,
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
