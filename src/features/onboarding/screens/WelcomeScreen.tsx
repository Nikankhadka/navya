import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-20 h-20 bg-blue-500 rounded-2xl rotate-12 mb-8 items-center justify-center shadow-lg shadow-blue-500/50">
            <Text className="text-4xl text-white font-bold -rotate-12">N</Text>
          </View>
          
          <Text className="text-white text-4xl font-bold text-center mb-4">
            Welcome to Navya
          </Text>
          
          <Text className="text-slate-400 text-lg text-center mb-12 px-4 leading-6">
            Your AI fitness companion. Let's build your personalized training and nutrition foundation.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/basics')}
            className="w-full bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-600/30"
            activeOpacity={0.8}
            testID="onboarding-get-started"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
