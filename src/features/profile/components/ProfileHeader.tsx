import React from 'react';
import { View, Text } from 'react-native';
import { Spacing, Typography, useAppTheme } from '@/theme';
import { Badge } from '@/components/ui';
import { goalLabel } from '@/utils/helpers';
import type { GoalType } from '@/types/app';

export interface ProfileHeaderProps {
  fullName: string | null | undefined;
  email: string | undefined;
  goal: GoalType | undefined;
  experienceLevel: string | undefined;
  isDemoSession: boolean;
}

export function ProfileHeader({
  fullName,
  email,
  goal,
  experienceLevel,
  isDemoSession,
}: ProfileHeaderProps) {
  const { colors } = useAppTheme();
  const styles = {
    hero: {
      alignItems: 'center',
      paddingTop: Spacing.xxl,
      paddingBottom: Spacing.xxl,
      paddingHorizontal: Spacing.xl,
    },
    avatarContainer: {
      width: 84,
      height: 84,
      borderRadius: 24,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      borderWidth: 2,
      borderColor: `${colors.accent}55`,
    },
    avatarEmoji: { fontSize: 40 },
    fullName: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    email: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginBottom: Spacing.md,
    },
    badgeRow: { flexDirection: 'row', gap: Spacing.sm },
  } as const;

  return (
    <View style={styles.hero}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarEmoji}>🧑‍💪</Text>
      </View>
      <Text style={styles.fullName}>{fullName ?? 'Navya User'}</Text>
      <Text style={styles.email}>{email}</Text>
      <View style={styles.badgeRow}>
        {isDemoSession && <Badge label="Demo Session" color={colors.orange} />}
        {goal && <Badge label={goalLabel(goal)} color={colors.accent} />}
        {experienceLevel && <Badge label={experienceLevel} color={colors.green} />}
      </View>
    </View>
  );
}
