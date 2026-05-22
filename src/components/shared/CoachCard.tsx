import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';

interface CoachCardProps {
  colors: ThemeColors;
  coachPreview: string;
}

export function CoachCard({ colors, coachPreview }: CoachCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => router.push('/(tabs)/coach')}>
      <View style={[styles.card, { borderColor: `${colors.accent}44` }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.badge, { color: colors.accent }]}>Daily Insight</Text>
          <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
            {coachPreview}
          </Text>
          <Text style={[styles.cta, { color: colors.accent }]}>Chat with coach →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  badge: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  text: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  cta: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
