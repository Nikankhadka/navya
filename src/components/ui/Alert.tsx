import { Modal, Pressable, Text, View } from 'react-native';
import { Radius, Shadow, Spacing, Typography, useAppTheme } from '@/theme';

interface AlertProps {
  title: string;
  message?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'default' | 'destructive';
  action?: {
    label: string;
    onPress: () => void;
  };
  cancel?: {
    label: string;
    onPress: () => void;
  };
}

export function Alert({
  title,
  message,
  open,
  onOpenChange,
  variant = 'default',
  action,
  cancel,
}: AlertProps) {
  const { colors } = useAppTheme();

  if (!open) return null;

  const accentColor = variant === 'destructive' ? colors.red : colors.accent;

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable style={backdropStyle} onPress={() => onOpenChange(false)}>
        <Pressable
          style={[
            cardStyle,
            {
              backgroundColor: colors.card,
              borderColor: variant === 'destructive' ? colors.redMuted : colors.border,
            },
          ]}
          onPress={() => {}}
        >
          <Text style={[titleStyle, { color: colors.text }]}>{title}</Text>

          {message ? (
            <Text style={[messageStyle, { color: colors.textSecondary }]}>{message}</Text>
          ) : null}

          <View style={buttonRowStyle}>
            {cancel ? (
              <Pressable
                style={[
                  buttonStyle,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => {
                  cancel.onPress();
                  onOpenChange(false);
                }}
              >
                <Text style={[buttonTextStyle, { color: colors.textSecondary }]}>
                  {cancel.label}
                </Text>
              </Pressable>
            ) : null}

            {action ? (
              <Pressable
                style={[buttonStyle, { backgroundColor: accentColor }]}
                onPress={() => {
                  action.onPress();
                  onOpenChange(false);
                }}
              >
                <Text style={[buttonTextStyle, { color: '#FFFFFF' }]}>{action.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const backdropStyle = {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  padding: Spacing.xl,
};

const cardStyle = {
  width: '100%' as const,
  maxWidth: 340,
  borderRadius: Radius.xl,
  padding: Spacing.xxl,
  borderWidth: 1,
  ...Shadow.md,
};

const titleStyle = {
  fontSize: Typography.size.lg,
  fontWeight: Typography.weight.bold,
  marginBottom: Spacing.sm,
};

const messageStyle = {
  fontSize: Typography.size.md,
  lineHeight: 22,
  marginBottom: Spacing.xl,
};

const buttonRowStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'flex-end' as const,
  gap: Spacing.sm,
};

const buttonStyle = {
  paddingVertical: 10,
  paddingHorizontal: Spacing.lg,
  borderRadius: Radius.sm,
  borderWidth: 1,
  borderColor: 'transparent',
};

const buttonTextStyle = {
  fontSize: Typography.size.sm,
  fontWeight: Typography.weight.semibold,
};
