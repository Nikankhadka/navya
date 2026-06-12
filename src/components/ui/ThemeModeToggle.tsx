import { Image } from 'expo-image';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Radius, Spacing, Typography, useAppTheme, type ThemeName } from '@/theme';

interface ThemeModeToggleProps {
  compact?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testIDPrefix?: string;
}

const OPTIONS: {
  id: ThemeName;
  label: string;
  icon: string;
  activeIcon: string;
}[] = [
  {
    id: 'light',
    label: 'Light',
    icon: 'sun.max',
    activeIcon: 'sun.max.fill',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: 'moon',
    activeIcon: 'moon.fill',
  },
];

export function ThemeModeToggle({
  compact = false,
  disabled = false,
  style,
  testIDPrefix = 'theme-toggle',
}: ThemeModeToggleProps) {
  const { colors, resolvedTheme, setPreference } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        compact && styles.containerCompact,
        style,
      ]}
    >
      {OPTIONS.map((option) => {
        const selected = resolvedTheme === option.id;
        const iconSize = compact ? 16 : 18;

        return (
          <TouchableOpacity
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected }}
            activeOpacity={0.88}
            disabled={disabled}
            onPress={() => {
              void setPreference(option.id);
            }}
            style={[
              styles.option,
              compact ? styles.optionCompact : styles.optionRegular,
              {
                backgroundColor: selected ? colors.accentMuted : 'transparent',
                borderColor: selected ? `${colors.accent}66` : 'transparent',
              },
            ]}
            testID={`${testIDPrefix}-${option.id}`}
          >
            <Image
              source={`sf:${selected ? option.activeIcon : option.icon}`}
              style={{ width: iconSize, height: iconSize }}
              tintColor={selected ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                compact ? styles.labelCompact : styles.labelRegular,
                {
                  color: selected ? colors.accent : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    padding: 4,
    gap: 4,
  },
  containerCompact: {
    padding: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  optionRegular: {
    minWidth: 108,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  optionCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    gap: 6,
  },
  label: {
    fontWeight: Typography.weight.semibold,
  },
  labelRegular: {
    fontSize: Typography.size.sm,
  },
  labelCompact: {
    fontSize: 12,
  },
} as const;
