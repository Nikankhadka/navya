import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { GoalType } from '../../src/types/app';

const GOALS: { id: GoalType, label: string, icon: string, description: string }[] = [
  { 
    id: 'lose_weight', 
    label: 'Lose Weight', 
    icon: 'trending-down-outline', 
    description: 'Burn fat and get leaner' 
  },
  { 
    id: 'build_muscle', 
    label: 'Build Muscle', 
    icon: 'barbell-outline', 
    description: 'Gain strength and mass' 
  },
  { 
    id: 'improve_endurance', 
    label: 'Improve Endurance', 
    icon: 'timer-outline', 
    description: 'Run longer, breathe better' 
  },
  { 
    id: 'general_fitness', 
    label: 'General Fitness', 
    icon: 'pulse-outline', 
    description: 'Stay healthy and active' 
  },
  { 
    id: 'maintain', 
    label: 'Maintain', 
    icon: 'checkmark-done-outline', 
    description: 'Keep your current physique' 
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setField } = useOnboardingStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1 px-6 pt-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">What's your goal?</Text>
        <Text className="text-slate-400 text-lg mb-8">This tailors your fitness plan and coaching guidance.</Text>

        {GOALS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setField('goal', item.id)}
            className={`w-full p-5 rounded-2xl mb-4 border-2 flex-row items-center ${
              goal === item.id 
                ? 'bg-blue-600/20 border-blue-500' 
                : 'bg-slate-800 border-slate-700'
            }`}
            activeOpacity={0.7}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
              goal === item.id ? 'bg-blue-500' : 'bg-slate-700'
            }`}>
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color="white" 
              />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-bold ${
                goal === item.id ? 'text-white' : 'text-slate-200'
              }`}>
                {item.label}
              </Text>
              <Text className="text-slate-400 text-sm">{item.description}</Text>
            </View>
            {goal === item.id && (
              <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/preferences')}
          className="w-full bg-blue-600 py-4 rounded-xl mb-10 mt-4"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
