import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'New to fitness' },
  { id: 'intermediate', label: 'Consistent for 6+ months' },
  { id: 'advanced', label: 'Years of training' },
] as const;

export default function BodyScreen() {
  const router = useRouter();
  const { weight_kg, height_cm, experience_level, setField } = useOnboardingStore();

  const isComplete = !!weight_kg && !!height_cm && !!experience_level;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1 px-6 pt-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">Metrics</Text>
        <Text className="text-slate-400 text-lg mb-8">The health foundation for your glow.</Text>

        {/* Biometrics */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[48%]">
            <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Weight (kg)
            </Text>
            <TextInput
              keyboardType="numeric"
              className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-blue-500"
              placeholder="0.0"
              placeholderTextColor="#64748b"
              value={weight_kg?.toString() || ''}
              onChangeText={(text) => setField('weight_kg', parseFloat(text) || null)}
            />
          </View>
          <View className="w-[48%]">
            <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider" >
              Height (cm)
            </Text>
            <TextInput
              keyboardType="numeric"
              className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-blue-500"
              placeholder="0"
              placeholderTextColor="#64748b"
              value={height_cm?.toString() || ''}
              onChangeText={(text) => setField('height_cm', parseInt(text) || null)}
            />
          </View>
        </View>

        {/* Experience Level */}
        <View className="mb-12">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Experience Level
          </Text>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setField('experience_level', level.id)}
              className={`w-full p-4 rounded-xl mb-4 border ${
                experience_level === level.id 
                  ? 'bg-blue-600/20 border-blue-500' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text className={`text-lg font-medium ${
                experience_level === level.id ? 'text-white' : 'text-slate-300'
              }`}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/goal')}
          className={`w-full py-4 rounded-xl mb-10 ${
            isComplete ? 'bg-blue-600' : 'bg-slate-700 opacity-50'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
