import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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
  getLineHeightScale,
  getTypeScale,
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
  const elevated = glow || variant === 'hero';
  const cardStyle = [
    styles.card,
    variant === 'hero' ? styles.cardHero : null,
    variant === 'glass' ? styles.cardGlass : null,
    elevated ? Shadow.md : null,
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: withAlpha(color, 0.14),
          borderColor: withAlpha(color, 0.14),
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color, fontSize: size === 'sm' ? typeScale.xs : typeScale.sm },
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const bgMap = {
    primary: 'transparent',
    secondary: Colors.surfaceContainerLowest,
    ghost: 'transparent',
    danger: withAlpha(Colors.red, 0.18),
  };

  const textColorMap = {
    primary: Colors.onPrimary,
    secondary: Colors.onSurface,
    ghost: Colors.primary,
    danger: Colors.red,
  };

  const paddingMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 42 },
    md: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 52 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 },
  };

  const fontSizeMap = {
    sm: typeScale.sm,
    md: typeScale.md,
    lg: typeScale.lg,
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
          borderWidth: variant === 'secondary' || variant === 'ghost' || variant === 'danger' ? 1 : 0,
          borderColor:
            variant === 'secondary'
              ? withAlpha(Colors.outlineVariant, 0.18)
              : variant === 'ghost'
                ? withAlpha(Colors.primary, 0.18)
                : withAlpha(Colors.red, 0.18),
          ...paddingMap[size],
        },
        style as ViewStyle,
      ]}
      {...props}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={Colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        />
      ) : null}
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

export function Input({ label, error, style, onBlur, onFocus, ...props }: InputProps) {
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const lineHeights = getLineHeightScale(width);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputWrap}>
      {label ? (
        <Text style={[styles.inputLabel, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputErrorState : null,
          {
            backgroundColor: isFocused ? Colors.surfaceBright : Colors.surfaceContainerLowest,
            borderColor: isFocused ? withAlpha(Colors.primary, 0.6) : withAlpha(Colors.outlineVariant, 0.16),
            fontSize: typeScale.md,
            lineHeight: lineHeights.md,
          },
          style,
        ]}
        placeholderTextColor={Colors.dim}
        selectionColor={Colors.primary}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...props}
      />
      {error ? (
        <Text style={[styles.inputError, { fontSize: typeScale.xs, lineHeight: lineHeights.xs }]}>
          {error}
        </Text>
      ) : null}
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const lineHeights = getLineHeightScale(width);

  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={[styles.sectionTitle, { fontSize: typeScale.lg, lineHeight: lineHeights.lg }]}>
        {title}
      </Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
            {action}
          </Text>
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const lineHeights = getLineHeightScale(width);

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyEmojiWrap}>
        <Text style={styles.emptyEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.emptyTitle, { fontSize: typeScale.lg, lineHeight: lineHeights.lg }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.emptySubtitle, { fontSize: typeScale.md, lineHeight: lineHeights.md }]}>
          {subtitle}
        </Text>
      ) : null}
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const lineHeights = getLineHeightScale(width);

  return (
    <View style={[styles.metricTile, style]}>
      <View style={[styles.metricGlow, { backgroundColor: withAlpha(accentColor, 0.16) }]} />
      <Text style={[styles.metricLabel, { fontSize: typeScale.xs, lineHeight: lineHeights.xs }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { fontSize: typeScale.xxl, lineHeight: lineHeights.xxl }]}>
        {value}
      </Text>
      {hint ? (
        <Text style={[styles.metricHint, { fontSize: typeScale.sm, lineHeight: lineHeights.sm }]}>
          {hint}
        </Text>
      ) : null}
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
  const { width } = useWindowDimensions();
  const typeScale = getTypeScale(width);
  const toneColor =
    tone === 'accent' ? Colors.primary : tone === 'water' ? Colors.secondary : Colors.onSurfaceVariant;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.quickChip,
        {
          borderColor: withAlpha(toneColor, tone === 'neutral' ? 0.12 : 0.18),
          backgroundColor:
            tone === 'water'
              ? withAlpha(Colors.secondaryContainer, 0.28)
              : withAlpha(toneColor, tone === 'neutral' ? 0.08 : 0.12),
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.quickChipText,
          { fontSize: typeScale.sm },
          tone !== 'neutral' ? { color: toneColor } : null,
        ]}
      >
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
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.16),
    ...Shadow.sm,
  },
  cardHero: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: withAlpha(Colors.outlineVariant, 0.12),
    overflow: 'hidden',
  },
  cardGlass: {
    backgroundColor: withAlpha(Colors.surfaceVariant, 0.6),
    borderColor: withAlpha(Colors.secondary, 0.12),
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
    overflow: 'hidden',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
    color: Colors.onSecondaryContainer,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
  },
  inputFocused: {
    ...Shadow.sm,
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
    color: Colors.onSurface,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  sectionAction: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: withAlpha(Colors.outlineVariant, 0.14),
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
    backgroundColor: withAlpha(Colors.primary, 0.12),
    borderWidth: 1,
    borderColor: withAlpha(Colors.primary, 0.12),
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptyAction: {
    marginTop: Spacing.lg,
  },
  metricTile: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withAlpha(Colors.outlineVariant, 0.14),
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
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: Colors.onSurface,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  metricHint: {
    color: Colors.onSurfaceVariant,
  },
  quickChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  quickChipText: {
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weight.semibold,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: withAlpha(Colors.secondary, 0.42),
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
});
