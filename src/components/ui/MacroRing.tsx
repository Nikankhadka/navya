import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../constants/theme';

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
  size = 84,
  strokeWidth = 8,
  color,
  label,
  unit = '',
}: MacroRingProps) {
  const pct = Math.max(0, Math.min(value / Math.max(max, 1), 1));

  return (
    <View style={styles.container}>
      <View style={[styles.ringShell, { width: size, height: size, borderRadius: size / 2 }]}>
        <View
          style={[
            styles.ringTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />
        <View
          style={[
            styles.ringArc,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: withAlpha(color, 0.28),
              borderTopColor: color,
              borderRightColor: pct >= 0.25 ? color : withAlpha(color, 0.18),
              borderBottomColor: pct >= 0.5 ? color : withAlpha(color, 0.12),
              borderLeftColor: pct >= 0.75 ? color : withAlpha(color, 0.08),
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
        <View style={styles.centerCore}>
          <Text style={styles.centerLabel}>{label}</Text>
          <Text style={[styles.centerValue, { color }]}>
            {Math.round(value)}
            {unit.trim() ? ` ${unit.trim()}` : ''}
          </Text>
          <Text style={styles.centerHint}>{Math.round(pct * 100)}% target</Text>
        </View>
      </View>
      <Text style={styles.sublabel}>
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
  const totalSegments = 20;
  const pct = Math.max(0, Math.min((value / Math.max(max, 1)) * 100, 100));
  const filledSegments = Math.max(0, Math.min(totalSegments, Math.round((pct / 100) * totalSegments)));

  return (
    <View>
      {showLabel && label ? (
        <View style={styles.barLabelRow}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={styles.barValue}>
            {value} / {max}
          </Text>
        </View>
      ) : null}

      <View style={styles.segmentRow}>
        {Array.from({ length: totalSegments }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                height,
                backgroundColor:
                  index < filledSegments ? color : withAlpha(Colors.borderLight, 0.55),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  ringShell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(Colors.cardHover, 0.9),
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  ringTrack: {
    position: 'absolute',
    borderColor: Colors.border,
  },
  ringArc: {
    position: 'absolute',
  },
  centerCore: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(Colors.bg, 0.86),
    borderWidth: 1,
    borderColor: withAlpha(Colors.borderLight, 0.64),
    paddingHorizontal: Spacing.xs,
  },
  centerLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  centerValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  centerHint: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  sublabel: {
    fontSize: Typography.size.xs,
    color: Colors.dim,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  segmentRow: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  segment: {
    flex: 1,
    borderRadius: Radius.full,
  },
});
