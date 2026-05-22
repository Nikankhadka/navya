import type { ReactNode } from 'react';
import type { TouchableOpacityProps, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Radius, Shadow, Typography, useAppTheme } from '@/theme';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();

  const backgroundColor = {
    primary: colors.accent,
    secondary: colors.card,
    ghost: 'transparent',
    danger: colors.red,
  }[variant];

  const textColor = {
    primary: colors.textStrong,
    secondary: colors.text,
    ghost: colors.accent,
    danger: colors.textStrong,
  }[variant];

  const padding = {
    sm: { paddingVertical: 8, paddingHorizontal: 14 },
    md: { paddingVertical: 13, paddingHorizontal: 20 },
    lg: { paddingVertical: 16, paddingHorizontal: 28 },
  }[size];

  const fontSize = { sm: 13, md: 15, lg: 16 }[size];

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: Radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          borderWidth: variant === 'secondary' ? 1 : variant === 'ghost' ? 1 : 0,
          borderColor: variant === 'secondary' ? colors.border : colors.accent,
          ...padding,
        },
        variant === 'primary' && !disabled ? Shadow.md : null,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
          <Text
            style={{
              color: textColor,
              fontSize,
              fontWeight: Typography.weight.bold,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
