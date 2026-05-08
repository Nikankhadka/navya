import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography, useAppTheme } from '@/theme';

interface MacroRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  unit?: string;
}

export function MacroRing({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color,
  label,
  unit = '',
}: MacroRingProps) {
  const { colors } = useAppTheme();
  const pct = Math.min(value / Math.max(max, 1), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.ringOuter, { width: size, height: size }]}>
        <View
          style={[
            styles.ringBg,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: colors.border,
            },
          ]}
        />
        <View
          style={[
            styles.ringProgress,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: pct > 0.875 ? color : 'transparent',
              borderRightColor: pct > 0.625 ? color : 'transparent',
              borderBottomColor: pct > 0.375 ? color : 'transparent',
              borderLeftColor: pct > 0.125 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        <View style={styles.centerContent}>
          <Text style={[styles.centerValue, { color }]}>
            {Math.round(pct * 100)}
            <Text style={styles.centerPct}>%</Text>
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.sublabel, { color: colors.dim }]}>
        {value}
        {unit} / {max}
        {unit}
      </Text>
    </View>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  color,
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);

  return (
    <View>
      {showLabel && label ? (
        <View style={styles.barLabelRow}>
          <Text style={[styles.barLabel, { color: colors.muted }]}>{label}</Text>
          <Text style={[styles.barValue, { color: colors.text }]}>
            {value} / {max}
          </Text>
        </View>
      ) : null}
      <View style={[styles.barBg, { height, backgroundColor: colors.border }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${pct}%`,
              height,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  ringOuter: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 13,
    fontWeight: Typography.weight.bold,
  },
  centerPct: {
    fontSize: 10,
    fontWeight: Typography.weight.regular,
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  sublabel: {
    fontSize: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: Typography.size.sm,
    textTransform: 'capitalize',
  },
  barValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  barBg: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
});
