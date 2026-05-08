import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { ActivityLevel, DietPreference, EquipmentType } from '@/types/app';

const ACTIVITY_LEVELS: { id: ActivityLevel, label: string }[] = [
  { id: 'sedentary', label: 'Sedentary (Office job, little exercise)' },
  { id: 'lightly_active', label: 'Lightly Active (1-2 days/week)' },
  { id: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
  { id: 'very_active', label: 'Very Active (6-7 days/week)' },
];

const DIET_PREFS: { id: DietPreference, label: string }[] = [
  { id: 'no_preference', label: 'No Preference' },
  { id: 'high_protein', label: 'High Protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'low_carb', label: 'Low Carb' },
];

const EQUIPMENT: { id: EquipmentType, label: string }[] = [
  { id: 'gym', label: 'Full Gym' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance_bands', label: 'Bands' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'pull_up_bar', label: 'Pull-up Bar' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { 
    activity_level, 
    diet_preference, 
    equipment, 
    workouts_per_week, 
    setField 
  } = useOnboardingStore();

  const toggleEquipment = (id: EquipmentType) => {
    const current = equipment || [];
    if (current.includes(id)) {
      setField('equipment', current.filter(e => e !== id));
    } else {
      setField('equipment', [...current, id]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1 px-6 pt-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">Final Touches</Text>
        <Text className="text-slate-400 text-lg mb-8">Refine your daily lifestyle.</Text>

        {/* Workouts per week */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Workouts per Week: {workouts_per_week}
          </Text>
          <View className="flex-row items-center justify-between bg-slate-800 p-2 rounded-xl border border-slate-700">
            <TouchableOpacity 
              onPress={() => setField('workouts_per_week', Math.max(1, (workouts_per_week || 3) - 1))}
              className="w-12 h-12 items-center justify-center bg-slate-700 rounded-lg"
            >
              <Ionicons name="remove" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">{workouts_per_week}</Text>
            <TouchableOpacity 
              onPress={() => setField('workouts_per_week', Math.min(7, (workouts_per_week || 3) + 1))}
              className="w-12 h-12 items-center justify-center bg-blue-600 rounded-lg"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Level */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Daily Activity
          </Text>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setField('activity_level', level.id)}
              className={`p-4 rounded-xl mb-3 border ${
                activity_level === level.id 
                  ? 'bg-blue-600/20 border-blue-500' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text className={`font-medium ${
                activity_level === level.id ? 'text-white' : 'text-slate-300'
              }`}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diet */}
        <View className="mb-8">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Dietary Preference
          </Text>
          <View className="flex-row flex-wrap">
            {DIET_PREFS.map((diet) => (
              <TouchableOpacity
                key={diet.id}
                onPress={() => setField('diet_preference', diet.id)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                  diet_preference === diet.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-white text-sm font-medium">{diet.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View className="mb-12">
          <Text className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Available Equipment
          </Text>
          <View className="flex-row flex-wrap">
            {EQUIPMENT.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleEquipment(item.id)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                  equipment?.includes(item.id) 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-white text-sm font-medium">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/complete')}
          className="w-full bg-blue-600 py-4 rounded-xl mb-10"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Done
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
