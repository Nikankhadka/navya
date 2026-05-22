import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography, useAppTheme, Colors } from '@/theme';
import type { GoalType } from '@/types/app';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const GOALS: { id: GoalType; label: string; icon: IoniconName; description: string }[] = [
  {
    id: 'lose_weight',
    label: 'Lose Weight',
    icon: 'trending-down',
    description: 'Burn fat and get leaner',
  },
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    icon: 'barbell',
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
    icon: 'pulse',
    description: 'Stay healthy and active',
  },
  {
    id: 'maintain',
    label: 'Maintain',
    icon: 'checkmark-done',
    description: 'Keep your current physique',
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { goal, setField } = useOnboardingStore();

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
          <Ionicons name="arrow-back" size={24} color={colors.muted} />
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
                <Ionicons name={item.icon} size={24} color={Colors.white} />
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
              {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
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
