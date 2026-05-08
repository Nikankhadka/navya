import { Text, View } from 'react-native';
import { Radius, Typography, useAppTheme } from '@/theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'md' }: BadgeProps) {
  const { colors } = useAppTheme();
  const badgeColor = color ?? colors.accent;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        backgroundColor: `${badgeColor}22`,
        borderColor: `${badgeColor}44`,
      }}
    >
      <Text
        style={{
          color: badgeColor,
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
