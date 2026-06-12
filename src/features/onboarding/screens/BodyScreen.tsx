import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Radius, Spacing, Typography, useAppTheme, Colors } from '@/theme';
import type { ExperienceLevel } from '@/types/app';

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'New to fitness' },
  { id: 'intermediate', label: 'Consistent for 6+ months' },
  { id: 'advanced', label: 'Years of training' },
];

export default function BodyScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { weight_kg, height_cm, experience_level, setField } = useOnboardingStore();
  const [weightFocused, setWeightFocused] = useState(false);
  const [heightFocused, setHeightFocused] = useState(false);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isComplete = !!weight_kg && !!height_cm && !!experience_level;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source="sf:chevron.left"
            style={{ width: 24, height: 24 }}
            tintColor={colors.muted}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.textStrong }]}>Metrics</Text>
        <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
          Your baseline for training, recovery, and progress.
        </Text>

        <View style={styles.biometricsRow}>
          <View style={styles.biometricField}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
            <TextInput
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: weightFocused ? colors.accent : colors.border,
                },
              ]}
              placeholder="0.0"
              placeholderTextColor={colors.dim}
              value={weight_kg?.toString() || ''}
              onChangeText={(text) => setField('weight_kg', parseFloat(text) || null)}
              onFocus={() => setWeightFocused(true)}
              onBlur={() => setWeightFocused(false)}
            />
          </View>
          <View style={styles.biometricField}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
            <TextInput
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: heightFocused ? colors.accent : colors.border,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.dim}
              value={height_cm?.toString() || ''}
              onChangeText={(text) => setField('height_cm', parseInt(text) || null)}
              onFocus={() => setHeightFocused(true)}
              onBlur={() => setHeightFocused(false)}
            />
          </View>
        </View>

        <View style={styles.experienceSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Experience Level
          </Text>
          {EXPERIENCE_LEVELS.map((level) => {
            const isSelected = experience_level === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => setField('experience_level', level.id)}
                style={[
                  styles.levelOption,
                  {
                    backgroundColor: isSelected ? colors.accentMuted : colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.levelText,
                    { color: isSelected ? colors.text : colors.textSecondary },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/goal')}
          style={[
            styles.continueButton,
            {
              backgroundColor: isComplete ? colors.accent : colors.surface,
              opacity: isComplete ? 1 : 0.5,
            },
          ]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.lg,
    marginBottom: Spacing.xxxl,
  },
  biometricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  biometricField: {
    width: '48%',
  },
  sectionLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  experienceSection: {
    marginBottom: 48,
  },
  levelOption: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  levelText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.medium,
  },
  continueButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: 40,
  },
  continueButtonText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
} as const;
