import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../src/components/ui';
import { OnboardingShell } from '../../src/components/ui/OnboardingShell';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import type { ActivityLevel, DietPreference, EquipmentType } from '../../src/types/app';

const ACTIVITY_LEVELS: Array<{ id: ActivityLevel; label: string }> = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'lightly_active', label: 'Lightly active' },
  { id: 'moderately_active', label: 'Moderately active' },
  { id: 'very_active', label: 'Very active' },
];

const DIET_PREFS: Array<{ id: DietPreference; label: string }> = [
  { id: 'no_preference', label: 'No preference' },
  { id: 'high_protein', label: 'High protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'low_carb', label: 'Low carb' },
];

const EQUIPMENT: Array<{ id: EquipmentType; label: string }> = [
  { id: 'gym', label: 'Full gym' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance_bands', label: 'Bands' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'pull_up_bar', label: 'Pull-up bar' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { activity_level, diet_preference, equipment, workouts_per_week, setField } =
    useOnboardingStore();

  const toggleEquipment = (id: EquipmentType) => {
    const current = equipment || [];
    if (current.includes(id)) {
      setField('equipment', current.filter((entry) => entry !== id));
    } else {
      setField('equipment', [...current, id]);
    }
  };

  return (
    <OnboardingShell
      currentStep={4}
      title="Shape the week"
      subtitle="Choose how often you want to train and the context Navya should assume when recommending the plan."
      onBack={() => router.back()}
      footer={
        <Button label="Finish Setup" fullWidth onPress={() => router.push('/(onboarding)/complete')} />
      }
    >
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Workouts per week</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => setField('workouts_per_week', Math.max(1, (workouts_per_week || 3) - 1))}
            activeOpacity={0.82}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.stepperValueWrap}>
            <Text style={styles.stepperValue}>{workouts_per_week}</Text>
            <Text style={styles.stepperHint}>sessions</Text>
          </View>
          <TouchableOpacity
            style={[styles.stepperButton, styles.stepperButtonPrimary]}
            onPress={() => setField('workouts_per_week', Math.min(7, (workouts_per_week || 3) + 1))}
            activeOpacity={0.82}
          >
            <Text style={[styles.stepperButtonText, styles.stepperButtonTextPrimary]}>+</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Daily activity</Text>
        <View style={styles.optionList}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.optionCard, activity_level === level.id ? styles.optionCardActive : null]}
              onPress={() => setField('activity_level', level.id)}
              activeOpacity={0.82}
            >
              <Text style={styles.optionText}>{level.label}</Text>
              <Text style={styles.optionCheck}>{activity_level === level.id ? '●' : '○'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Nutrition style</Text>
        <View style={styles.chipWrap}>
          {DIET_PREFS.map((diet) => (
            <TouchableOpacity
              key={diet.id}
              style={[styles.chip, diet_preference === diet.id ? styles.chipActive : null]}
              onPress={() => setField('diet_preference', diet.id)}
              activeOpacity={0.82}
            >
              <Text style={[styles.chipText, diet_preference === diet.id ? styles.chipTextActive : null]}>
                {diet.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Available equipment</Text>
        <View style={styles.chipWrap}>
          {EQUIPMENT.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, equipment?.includes(item.id) ? styles.chipActive : null]}
              onPress={() => toggleEquipment(item.id)}
              activeOpacity={0.82}
            >
              <Text style={[styles.chipText, equipment?.includes(item.id) ? styles.chipTextActive : null]}>
                {item.label}
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  stepperButton: {
    width: 54,
    height: 54,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperButtonPrimary: {
    backgroundColor: withAlpha(Colors.orange, 0.14),
    borderColor: withAlpha(Colors.orange, 0.4),
  },
  stepperButtonText: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
  },
  stepperButtonTextPrimary: {
    color: Colors.orange,
  },
  stepperValueWrap: {
    flex: 1,
    alignItems: 'center',
  },
  stepperValue: {
    color: Colors.text,
    fontSize: 42,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  stepperHint: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  optionList: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionCardActive: {
    borderColor: withAlpha(Colors.accent, 0.44),
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  optionText: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  optionCheck: {
    color: Colors.accent,
    fontSize: Typography.size.lg,
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
});
