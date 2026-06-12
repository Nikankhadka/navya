import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Radius, Spacing, Typography, useAppTheme, Colors } from '@/theme';

const COUNTRIES = [
  { id: 'AU', label: '🇦🇺 Australia' },
  { id: 'NP', label: '🇳🇵 Nepal' },
  { id: 'other', label: '🌎 Other' },
] as const;

const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'non_binary', label: 'Non-binary' },
] as const;

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;

type AgeRange = (typeof AGE_RANGES)[number];
type GenderId = (typeof GENDERS)[number]['id'];
type CountryId = (typeof COUNTRIES)[number]['id'];

export default function BasicsScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { full_name, glow_focus, country, age_range, gender, setField } = useOnboardingStore();
  const [nameFocused, setNameFocused] = useState(false);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isComplete =
    (full_name?.trim()?.length ?? 0) > 0 && !!glow_focus && !!country && !!age_range && !!gender;

  const sectionLabelStyle = {
    color: colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  };

  const sectionContainerStyle = {
    marginBottom: Spacing.xxxl,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: 40,
          paddingBottom: Spacing.xxxl,
        }}
      >
        <Text
          style={{
            color: colors.textStrong,
            fontSize: Typography.size.xxxl,
            fontWeight: Typography.weight.bold,
            marginBottom: Spacing.sm,
          }}
        >
          The Basics
        </Text>
        <Text
          style={{
            color: colors.textSubtle,
            fontSize: Typography.size.lg,
            marginBottom: Spacing.xxxl,
          }}
        >
          Tell us about your training profile.
        </Text>

        {/* Full Name */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Display Name</Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              color: colors.text,
              padding: Spacing.lg,
              borderRadius: Radius.lg,
              borderWidth: 1,
              borderColor: nameFocused ? colors.accent : colors.border,
            }}
            placeholder="How should we call you?"
            placeholderTextColor={colors.dim}
            value={full_name}
            onChangeText={(text) => setField('full_name', text)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        {/* Age Range */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Age Range</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {AGE_RANGES.map((range) => {
              const isSelected = age_range === range;
              return (
                <TouchableOpacity
                  key={range}
                  onPress={() => setField('age_range', range as AgeRange)}
                  style={{
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                    marginRight: Spacing.sm,
                    marginBottom: Spacing.sm,
                    borderWidth: 1,
                    backgroundColor: isSelected ? colors.accent : colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: Typography.size.sm,
                      fontWeight: Typography.weight.medium,
                    }}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Gender */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Gender</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {GENDERS.map((g) => {
              const isSelected = gender === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setField('gender', g.id as GenderId)}
                  style={{
                    flex: 1,
                    padding: Spacing.md,
                    borderRadius: Radius.lg,
                    marginHorizontal: Spacing.xs,
                    borderWidth: 1,
                    backgroundColor: isSelected ? colors.accent : colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      textAlign: 'center',
                      fontSize: Typography.size.sm,
                      fontWeight: Typography.weight.medium,
                    }}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priority Focus */}

        {/* Country */}
        <View style={{ marginBottom: 48 }}>
          <Text style={sectionLabelStyle}>Location</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {COUNTRIES.map((c) => {
              const isSelected = country === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setField('country', c.id as CountryId)}
                  style={{
                    flex: 1,
                    padding: Spacing.md,
                    borderRadius: Radius.lg,
                    marginHorizontal: Spacing.xs,
                    borderWidth: 1,
                    backgroundColor: isSelected ? colors.accent : colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      textAlign: 'center',
                      fontWeight: Typography.weight.medium,
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/body')}
          style={{
            width: '100%',
            paddingVertical: Spacing.lg,
            borderRadius: Radius.lg,
            marginBottom: 40,
            backgroundColor: isComplete ? colors.accent : colors.surface,
            opacity: isComplete ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              color: Colors.white,
              textAlign: 'center',
              fontSize: Typography.size.lg,
              fontWeight: Typography.weight.semibold,
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
