import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Radius, Spacing, Typography, useAppTheme, Colors } from '@/theme';
import type { GoalType } from '@/types/app';

const GOALS: { id: GoalType; label: string; icon: string; description: string }[] = [
  {
    id: 'lose_weight',
    label: 'Lose Weight',
    icon: 'chart.line.downtrend.xyaxis',
    description: 'Burn fat and get leaner',
  },
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    icon: 'dumbbell',
    description: 'Gain strength and mass',
  },
  {
    id: 'improve_endurance',
    label: 'Improve Endurance',
    icon: 'timer',
    description: 'Run longer, breathe better',
  },
  {
    id: 'general_fitness',
    label: 'General Fitness',
    icon: 'waveform.path.ecg',
    description: 'Stay healthy and active',
  },
  {
    id: 'maintain',
    label: 'Maintain',
    icon: 'checkmark.seal',
    description: 'Keep your current physique',
  },
];

export default function GoalScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { goal, setField } = useOnboardingStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

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
          What's your goal?
        </Text>
        <Text
          style={{
            color: colors.textSubtle,
            fontSize: Typography.size.lg,
            marginBottom: Spacing.xxxl,
          }}
        >
          This tailors your fitness plan and coaching guidance.
        </Text>

        {GOALS.map((item) => {
          const isSelected = goal === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setField('goal', item.id)}
              style={{
                width: '100%',
                padding: Spacing.xl,
                borderRadius: Radius.xl,
                marginBottom: Spacing.lg,
                borderWidth: 2,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isSelected ? colors.accentMuted : colors.card,
                borderColor: isSelected ? colors.accent : colors.border,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Radius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.lg,
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                }}
              >
                <Image
                  source={`sf:${item.icon}`}
                  style={{ width: 24, height: 24 }}
                  tintColor={Colors.white}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: Typography.size.lg,
                    fontWeight: Typography.weight.bold,
                    color: isSelected ? colors.text : colors.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    color: colors.textSubtle,
                    fontSize: Typography.size.sm,
                  }}
                >
                  {item.description}
                </Text>
              </View>
              {isSelected && (
                <Image
                  source="sf:checkmark.circle.fill"
                  style={{ width: 24, height: 24 }}
                  tintColor={colors.accent}
                />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/preferences')}
          style={{
            width: '100%',
            backgroundColor: colors.accent,
            paddingVertical: Spacing.lg,
            borderRadius: Radius.lg,
            marginBottom: 40,
            marginTop: Spacing.lg,
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
