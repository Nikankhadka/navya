import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, glow, onPress }: CardProps) {
  const cardStyle = [
    {
      backgroundColor: Colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
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
