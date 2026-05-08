import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { Radius, Shadow, Spacing, useAppTheme } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, glow, onPress }: CardProps) {
  const { colors } = useAppTheme();

  const cardStyle = [
    {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    glow ? Shadow.md : null,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
