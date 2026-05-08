import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/theme';

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / Math.max(max, 1), 1);
  const strokeDashoffset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.container}>
      {/* SVG-like ring using absolute positioned views */}
      <View style={[styles.ringOuter, { width: size, height: size }]}>
        {/* Background ring */}
        <View
          style={[
            styles.ringBg,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: Colors.border,
            },
          ]}
        />
        {/* Progress arc - using border trick for approximation */}
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
        {/* Center text */}
        <View style={styles.centerContent}>
          <Text style={[styles.centerValue, { color }]}>
            {Math.round(pct * 100)}
            <Text style={styles.centerPct}>%</Text>
          </Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel}>
        {value}
        {unit} / {max}
        {unit}
      </Text>
    </View>
  );
}

// ─── Linear progress bar ──────────────────────────────────────────────────────

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
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);

  return (
    <View>
      {showLabel && label && (
        <View style={styles.barLabelRow}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={styles.barValue}>
            {value} / {max}
          </Text>
        </View>
      )}
      <View style={[styles.barBg, { height }]}>
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
    color: Colors.muted,
    fontWeight: Typography.weight.medium,
  },
  sublabel: {
    fontSize: 10,
    color: Colors.dim,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: Typography.size.sm,
    color: Colors.muted,
    textTransform: 'capitalize',
  },
  barValue: {
    fontSize: Typography.size.sm,
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  barBg: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
});
