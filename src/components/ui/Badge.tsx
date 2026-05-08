import { Text, View } from 'react-native';
import { Colors, Radius, Typography } from '@/theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = Colors.accent, size = 'md' }: BadgeProps) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        backgroundColor: `${color}22`,
        borderColor: `${color}44`,
      }}
    >
      <Text
        style={{
          color,
          fontSize: size === 'sm' ? 10 : 12,
          fontWeight: Typography.weight.semibold,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
