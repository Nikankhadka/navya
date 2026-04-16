import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
  Typography,
  withAlpha,
} from '../../constants/theme';

export { WebWrapper } from './WebWrapper';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'hero' | 'glass';
}

export function Card({
  children,
  style,
  glow,
  onPress,
  variant = 'default',
}: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'hero' ? styles.cardHero : null,
    variant === 'glass' ? styles.cardGlass : null,
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

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = Colors.accent, size = 'md' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: withAlpha(color, 0.12),
          borderColor: withAlpha(color, 0.24),
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color, fontSize: size === 'sm' ? Typography.size.xs : Typography.size.sm },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
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
  const bgMap = {
    primary: Colors.orange,
    secondary: Colors.card,
    ghost: 'transparent',
    danger: Colors.red,
  };

  const textColorMap = {
    primary: Colors.canopyBlack,
    secondary: Colors.text,
    ghost: Colors.accent,
    danger: Colors.parchment,
  };

  const paddingMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 42 },
    md: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 52 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 },
  };

  const fontSizeMap = {
    sm: Typography.size.sm,
    md: Typography.size.md,
    lg: Typography.size.lg,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === 'primary' && !disabled ? Shadow.lg : null,
        {
          backgroundColor: bgMap[variant],
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          borderWidth: variant === 'secondary' || variant === 'ghost' ? 1 : 0,
          borderColor: variant === 'secondary' ? Colors.borderLight : Colors.accent,
          ...paddingMap[size],
        },
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
          <Text
            style={[
              styles.buttonText,
              { color: textColorMap[variant], fontSize: fontSizeMap[size] },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputErrorState : null, style]}
        placeholderTextColor={Colors.dim}
        {...props}
      />
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, action, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyEmojiWrap}>
        <Text style={styles.emptyEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {action && onAction ? <Button label={action} onPress={onAction} style={styles.emptyAction} /> : null}
    </View>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export function MetricTile({
  label,
  value,
  hint,
  accentColor = Colors.accent,
  style,
}: MetricTileProps) {
  return (
    <View style={[styles.metricTile, style]}>
      <View style={[styles.metricGlow, { backgroundColor: withAlpha(accentColor, 0.16) }]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

interface QuickActionChipProps {
  label: string;
  onPress?: () => void;
  tone?: 'neutral' | 'accent' | 'water';
  style?: ViewStyle;
}

export function QuickActionChip({
  label,
  onPress,
  tone = 'neutral',
  style,
}: QuickActionChipProps) {
  const toneColor =
    tone === 'accent' ? Colors.accent : tone === 'water' ? Colors.blue : Colors.borderLight;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.quickChip,
        {
          borderColor: withAlpha(toneColor, tone === 'neutral' ? 0.5 : 0.34),
          backgroundColor: withAlpha(toneColor, tone === 'neutral' ? 0.08 : 0.12),
        },
        style,
      ]}
    >
      <Text style={[styles.quickChipText, tone !== 'neutral' ? { color: toneColor } : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SheetHandle() {
  return <View style={styles.sheetHandle} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardHero: {
    backgroundColor: Colors.wetSoil,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  cardGlass: {
    backgroundColor: withAlpha(Colors.forestGlass, 0.48),
    borderColor: withAlpha(Colors.stoneFog, 0.16),
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  button: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.4,
  },
  inputWrap: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    fontSize: Typography.size.md,
  },
  inputErrorState: {
    borderColor: Colors.red,
  },
  inputError: {
    color: Colors.red,
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  sectionAction: {
    color: Colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmojiWrap: {
    width: 76,
    height: 76,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    backgroundColor: withAlpha(Colors.accent, 0.12),
    borderWidth: 1,
    borderColor: withAlpha(Colors.accent, 0.18),
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.muted,
    fontSize: Typography.size.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: Spacing.lg,
  },
  metricTile: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  metricGlow: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  metricLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  metricHint: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  quickChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  quickChipText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
});
