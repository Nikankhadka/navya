import { Text, View } from 'react-native';
import { Button } from './Button';
import { Spacing, Typography, useAppTheme } from '@/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, action, onAction }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
      <Text style={{ fontSize: 36, marginBottom: Spacing.md }}>{emoji}</Text>
      <Text
        style={{
          color: colors.text,
          fontSize: Typography.size.xl,
          fontWeight: Typography.weight.bold,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: colors.muted,
            fontSize: Typography.size.md,
            marginTop: Spacing.sm,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {action && onAction ? <Button label={action} onPress={onAction} style={{ marginTop: 16 }} /> : null}
    </View>
  );
}
