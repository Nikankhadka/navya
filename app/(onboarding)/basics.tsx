import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input } from '../../src/components/ui';
import { OnboardingShell } from '../../src/components/ui/OnboardingShell';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import type { UserProfile } from '../../src/types/app';

const FOCUS_OPTIONS: Array<{
  id: UserProfile['glow_focus'];
  label: string;
  description: string;
  emoji: string;
}> = [
  { id: 'Skin', label: 'Recovery', description: 'Feel fresher between sessions.', emoji: '🌙' },
  { id: 'Hair', label: 'Consistency', description: 'Keep the habit stable each week.', emoji: '🌿' },
  { id: 'Body', label: 'Performance', description: 'Push strength, energy, and output.', emoji: '⚡' },
  { id: 'Mind', label: 'Focus', description: 'Stay locked in and mentally clear.', emoji: '🧠' },
];

const COUNTRIES: Array<{ id: UserProfile['country']; label: string }> = [
  { id: 'AU', label: 'Australia' },
  { id: 'NP', label: 'Nepal' },
  { id: 'other', label: 'Other' },
];

const GENDERS: Array<{ id: UserProfile['gender']; label: string }> = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'non_binary', label: 'Non-binary' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const AGE_RANGES: UserProfile['age_range'][] = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function BasicsScreen() {
  const router = useRouter();
  const { full_name, glow_focus, country, age_range, gender, setField } = useOnboardingStore();

  const isComplete =
    (full_name?.trim()?.length ?? 0) > 0 && !!glow_focus && !!country && !!age_range && !!gender;

  return (
    <OnboardingShell
      currentStep={1}
      title="The basics"
      subtitle="Tell us who’s training, where you are, and which kind of momentum matters most right now."
      footer={
        <Button
          label="Continue"
          fullWidth
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/body')}
        />
      }
    >
      <Input
        label="Display Name"
        placeholder="How should we call you?"
        value={full_name}
        onChangeText={(text) => setField('full_name', text)}
      />

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Age range</Text>
        <View style={styles.chipWrap}>
          {AGE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.chip, age_range === range ? styles.chipActive : null]}
              onPress={() => setField('age_range', range)}
              activeOpacity={0.82}
            >
              <Text style={[styles.chipText, age_range === range ? styles.chipTextActive : null]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.chipWrap}>
          {GENDERS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.chip, gender === option.id ? styles.chipActive : null]}
              onPress={() => setField('gender', option.id)}
              activeOpacity={0.82}
            >
              <Text style={[styles.chipText, gender === option.id ? styles.chipTextActive : null]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Text style={styles.focusLabel}>Current focus</Text>
      <View style={styles.focusGrid}>
        {FOCUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.focusCard, glow_focus === option.id ? styles.focusCardActive : null]}
            onPress={() => setField('glow_focus', option.id)}
            activeOpacity={0.84}
          >
            <Text style={styles.focusEmoji}>{option.emoji}</Text>
            <Text style={styles.focusTitle}>{option.label}</Text>
            <Text style={styles.focusDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.countryRow}>
          {COUNTRIES.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.countryCard, country === option.id ? styles.countryCardActive : null]}
              onPress={() => setField('country', option.id)}
              activeOpacity={0.82}
            >
              <Text
                style={[
                  styles.countryCardText,
                  country === option.id ? styles.countryCardTextActive : null,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: withAlpha(Colors.accent, 0.44),
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  chipTextActive: {
    color: Colors.accent,
  },
  focusLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  focusGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  focusCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  focusCardActive: {
    borderColor: withAlpha(Colors.accent, 0.44),
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  focusEmoji: {
    fontSize: 22,
    marginBottom: Spacing.sm,
  },
  focusTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  focusDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  countryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  countryCardActive: {
    borderColor: withAlpha(Colors.orange, 0.42),
    backgroundColor: withAlpha(Colors.orange, 0.12),
  },
  countryCardText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  countryCardTextActive: {
    color: Colors.orange,
  },
});
