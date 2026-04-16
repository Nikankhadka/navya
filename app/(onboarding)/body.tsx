import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input } from '../../src/components/ui';
import { OnboardingShell } from '../../src/components/ui/OnboardingShell';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import type { ExperienceLevel } from '../../src/types/app';

const EXPERIENCE_LEVELS: Array<{ id: ExperienceLevel; label: string; hint: string }> = [
  { id: 'beginner', label: 'New to fitness', hint: 'Just getting into training.' },
  { id: 'intermediate', label: 'Building consistency', hint: 'You have some rhythm already.' },
  { id: 'advanced', label: 'Experienced athlete', hint: 'You want stronger structure and detail.' },
];

export default function BodyScreen() {
  const router = useRouter();
  const { weight_kg, height_cm, experience_level, setField } = useOnboardingStore();

  const isComplete = !!weight_kg && !!height_cm && !!experience_level;

  return (
    <OnboardingShell
      currentStep={2}
      title="Your baseline"
      subtitle="These numbers help Navya shape effort, recovery, and progress expectations from day one."
      onBack={() => router.back()}
      footer={
        <Button
          label="Continue"
          fullWidth
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/goal')}
        />
      }
    >
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Weight</Text>
          <Input
            placeholder="0.0"
            keyboardType="numeric"
            value={weight_kg?.toString() || ''}
            onChangeText={(text) => setField('weight_kg', parseFloat(text) || null)}
          />
          <Text style={styles.metricHint}>kg</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Height</Text>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={height_cm?.toString() || ''}
            onChangeText={(text) => setField('height_cm', parseInt(text, 10) || null)}
          />
          <Text style={styles.metricHint}>cm</Text>
        </Card>
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Training experience</Text>
        <View style={styles.levelList}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                experience_level === level.id ? styles.levelCardActive : null,
              ]}
              onPress={() => setField('experience_level', level.id)}
              activeOpacity={0.84}
            >
              <View>
                <Text style={styles.levelTitle}>{level.label}</Text>
                <Text style={styles.levelHint}>{level.hint}</Text>
              </View>
              <Text style={styles.levelState}>{experience_level === level.id ? '●' : '○'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    gap: Spacing.xs,
  },
  metricLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricHint: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelList: {
    gap: Spacing.sm,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  levelCardActive: {
    borderColor: withAlpha(Colors.accent, 0.44),
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  levelTitle: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  levelHint: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  levelState: {
    color: Colors.accent,
    fontSize: Typography.size.lg,
  },
});
