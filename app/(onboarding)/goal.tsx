import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../src/components/ui';
import { OnboardingShell } from '../../src/components/ui/OnboardingShell';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import type { GoalType } from '../../src/types/app';

const GOALS: Array<{ id: GoalType; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down-outline', description: 'Build momentum around a lighter, leaner routine.' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'barbell-outline', description: 'Bias the week toward strength and growth.' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: 'timer-outline', description: 'Improve output, repeatability, and stamina.' },
  { id: 'general_fitness', label: 'General Fitness', icon: 'leaf-outline', description: 'Stay capable, healthy, and active across the week.' },
  { id: 'maintain', label: 'Maintain', icon: 'checkmark-done-outline', description: 'Keep your current shape with steady structure.' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setField } = useOnboardingStore();

  return (
    <OnboardingShell
      currentStep={3}
      title="Choose your main goal"
      subtitle="This becomes the anchor for plan tone, progress cues, and how the product talks to you."
      onBack={() => router.back()}
      footer={
        <Button
          label="Continue"
          fullWidth
          disabled={!goal}
          onPress={() => router.push('/(onboarding)/preferences')}
        />
      }
    >
      <View style={styles.goalList}>
        {GOALS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.goalCard,
              goal === item.id ? styles.goalCardActive : null,
              index % 2 === 1 ? styles.goalCardOffset : null,
            ]}
            onPress={() => setField('goal', item.id)}
            activeOpacity={0.84}
          >
            <View style={styles.goalIconWrap}>
              <Ionicons
                name={item.icon}
                size={22}
                color={goal === item.id ? Colors.canopyBlack : Colors.text}
              />
            </View>
            <View style={styles.goalText}>
              <Text style={styles.goalTitle}>{item.label}</Text>
              <Text style={styles.goalDescription}>{item.description}</Text>
            </View>
            <Text style={styles.goalCheck}>{goal === item.id ? '✓' : '○'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.noteCard}>
        <Text style={styles.noteEyebrow}>One primary outcome</Text>
        <Text style={styles.noteText}>
          You can still train holistically, but choosing one dominant goal keeps the first version
          of the product clear and useful.
        </Text>
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  goalList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  goalCardOffset: {
    marginLeft: Spacing.md,
  },
  goalCardActive: {
    borderColor: withAlpha(Colors.orange, 0.42),
    backgroundColor: withAlpha(Colors.orange, 0.12),
  },
  goalIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.barkBrownSoft,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  goalDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  goalCheck: {
    color: Colors.orange,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  noteCard: {
    gap: Spacing.xs,
  },
  noteEyebrow: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
});
