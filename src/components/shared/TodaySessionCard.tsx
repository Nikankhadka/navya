import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { Badge } from '@/components/ui';
import { ProgressBar } from './MacroRing';
import { sessionProgress } from '@/utils/helpers';
import type { WorkoutSession } from '@/types/app';

interface TodaySessionCardProps {
  colors: ThemeColors;
  session: WorkoutSession | null;
}

export function TodaySessionCard({ colors, session }: TodaySessionCardProps) {
  const router = useRouter();

  const doneExercises =
    session?.session_exercises.filter((ex) => ex.completed_sets.length >= ex.planned_sets).length ??
    0;
  const totalExercises = session?.session_exercises.length ?? 0;
  const workoutPct = session ? sessionProgress(session) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {session?.day_name ?? 'No session scheduled yet'}
          </Text>
          <Text style={[styles.meta, { color: colors.muted }]}>
            {session
              ? `${totalExercises} exercises`
              : "Create or sync a plan to see today's session"}
          </Text>
        </View>
        <Badge
          label={`${doneExercises}/${totalExercises} done`}
          color={doneExercises > 0 ? colors.green : colors.muted}
        />
      </View>

      <ProgressBar
        value={workoutPct}
        max={100}
        color={colors.accent}
        height={6}
        showLabel={false}
      />
      <Text style={[styles.progressLabel, { color: colors.muted }]}>{workoutPct}% complete</Text>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/workout')}
      >
        <Text style={[styles.startBtnText, { color: colors.textStrong }]}>
          {session
            ? doneExercises > 0
              ? 'Continue Workout →'
              : 'Start Workout →'
            : 'Open Workout →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: 3,
  },
  meta: {
    fontSize: Typography.size.sm,
  },
  progressLabel: {
    fontSize: Typography.size.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  startBtn: {
    borderRadius: Radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  startBtnText: {
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
    letterSpacing: 0.3,
  },
});
