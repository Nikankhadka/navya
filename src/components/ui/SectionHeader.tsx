import type { ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: Colors.text,
          fontSize: Typography.size.xl,
          fontWeight: Typography.weight.bold,
        }}
      >
        {title}
      </Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text
            style={{
              color: Colors.accent,
              fontSize: Typography.size.sm,
              fontWeight: Typography.weight.semibold,
            }}
          >
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
