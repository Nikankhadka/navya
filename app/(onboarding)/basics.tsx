import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';

const GLOW_OPTIONS = [
  { id: 'Skin', icon: 'sparkles-outline', label: 'Skin Glow' },
  { id: 'Hair', icon: 'water-outline', label: 'Hair Health' },
  { id: 'Body', icon: 'fitness-outline', label: 'Body Fitness' },
  { id: 'Mind', icon: 'leaf-outline', label: 'Mental Zen' },
] as const;

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

export default function BasicsScreen() {
  const router = useRouter();
  const { full_name, glow_focus, country, age_range, gender, setField } = useOnboardingStore();

  const isComplete = (full_name?.trim()?.length ?? 0) > 0 && !!glow_focus && !!country && !!age_range && !!gender;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1 px-6 pt-10">
        <Text className="text-white text-3xl font-bold mb-2">The Basics</Text>
        <Text className="text-slate-400 text-lg mb-8">Tell us about your glow goals.</Text>

        {/* Full Name */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Display Name
          </Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-blue-500"
            placeholder="How should we call you?"
            placeholderTextColor="#64748b"
            value={full_name}
            onChangeText={(text) => setField('full_name', text)}
          />
        </View>

        {/* Age Range */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Age Range
          </Text>
          <View className="flex-row flex-wrap">
            {AGE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setField('age_range', range)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                  age_range === range 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-white text-sm font-medium">{range}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Gender
          </Text>
          <View className="flex-row justify-between">
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setField('gender', g.id)}
                className={`flex-1 p-3 rounded-xl mx-1 border ${
                  gender === g.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-white text-center text-sm font-medium">{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Glow Focus */}
...
        {/* Country */}
        <View className="mb-12">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Location
          </Text>
          <View className="flex-row justify-between">
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setField('country', c.id)}
                className={`flex-1 p-3 rounded-xl mx-1 border ${
                  country === c.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-white text-center font-medium">{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          disabled={!isComplete}
          onPress={() => router.push('/(onboarding)/body')}
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
