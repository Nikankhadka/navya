import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Image } from 'expo-image';
import { Radius, Spacing, Typography, useAppTheme, Colors } from '@/theme';
import type { ActivityLevel, DietPreference, EquipmentType } from '@/types/app';

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Sedentary (Office job, little exercise)' },
  { id: 'lightly_active', label: 'Lightly Active (1-2 days/week)' },
  { id: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
  { id: 'very_active', label: 'Very Active (6-7 days/week)' },
];

const DIET_PREFS: { id: DietPreference; label: string }[] = [
  { id: 'no_preference', label: 'No Preference' },
  { id: 'high_protein', label: 'High Protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'low_carb', label: 'Low Carb' },
];

const EQUIPMENT: { id: EquipmentType; label: string }[] = [
  { id: 'gym', label: 'Full Gym' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance_bands', label: 'Bands' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'pull_up_bar', label: 'Pull-up Bar' },
];

export default function PreferencesScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { activity_level, diet_preference, equipment, workouts_per_week, setField } =
    useOnboardingStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const toggleEquipment = (id: EquipmentType) => {
    const current = equipment || [];
    if (current.includes(id)) {
      setField(
        'equipment',
        current.filter((e) => e !== id),
      );
    } else {
      setField('equipment', [...current, id]);
    }
  };

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

  const currentWorkouts = workouts_per_week || 3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: 40,
          paddingBottom: Spacing.xxxl,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: Spacing.xxxl }}>
          <Image
            source="sf:chevron.left"
            style={{ width: 24, height: 24 }}
            tintColor={colors.muted}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.textStrong,
            fontSize: Typography.size.xxxl,
            fontWeight: Typography.weight.bold,
            marginBottom: Spacing.sm,
          }}
        >
          Final Touches
        </Text>
        <Text
          style={{
            color: colors.textSubtle,
            fontSize: Typography.size.lg,
            marginBottom: Spacing.xxxl,
          }}
        >
          Refine your daily lifestyle.
        </Text>

        {/* Workouts per week */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Workouts per Week: {currentWorkouts}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.card,
              padding: Spacing.sm,
              borderRadius: Radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setField('workouts_per_week', Math.max(1, currentWorkouts - 1))}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderRadius: Radius.md,
              }}
            >
              <Image source="sf:minus" style={{ width: 24, height: 24 }} tintColor={Colors.white} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text,
                fontSize: Typography.size.xxl,
                fontWeight: Typography.weight.bold,
              }}
            >
              {currentWorkouts}
            </Text>
            <TouchableOpacity
              onPress={() => setField('workouts_per_week', Math.min(7, currentWorkouts + 1))}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.accent,
                borderRadius: Radius.md,
              }}
            >
              <Image source="sf:plus" style={{ width: 24, height: 24 }} tintColor={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Level */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Daily Activity</Text>
          {ACTIVITY_LEVELS.map((level) => {
            const isSelected = activity_level === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => setField('activity_level', level.id)}
                style={{
                  padding: Spacing.lg,
                  borderRadius: Radius.lg,
                  marginBottom: Spacing.md,
                  borderWidth: 1,
                  backgroundColor: isSelected ? colors.accentMuted : colors.card,
                  borderColor: isSelected ? colors.accent : colors.border,
                }}
              >
                <Text
                  style={{
                    fontWeight: Typography.weight.medium,
                    color: isSelected ? colors.text : colors.textSecondary,
                  }}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Diet */}
        <View style={sectionContainerStyle}>
          <Text style={sectionLabelStyle}>Dietary Preference</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {DIET_PREFS.map((diet) => {
              const isSelected = diet_preference === diet.id;
              return (
                <TouchableOpacity
                  key={diet.id}
                  onPress={() => setField('diet_preference', diet.id)}
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
                    {diet.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Equipment */}
        <View style={{ marginBottom: 48 }}>
          <Text style={sectionLabelStyle}>Available Equipment</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {EQUIPMENT.map((item) => {
              const isSelected = equipment?.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleEquipment(item.id)}
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
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/complete')}
          style={{
            width: '100%',
            backgroundColor: colors.accent,
            paddingVertical: Spacing.lg,
            borderRadius: Radius.lg,
            marginBottom: 40,
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
            Done
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
