import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { profileService } from '../../src/services/profileService';
import { Ionicons } from '@expo/vector-icons';

export default function CompleteScreen() {
  const router = useRouter();
  const { buildPayload, reset } = useOnboardingStore();
  const { session, setProfile } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function saveOnboarding() {
      if (!session?.user.id) return;
      
      try {
        const payload = buildPayload();
        await profileService.upsertProfile(session.user.id, {
          ...payload,
          onboarding_complete: true,
        });
        
        // Update local auth store so layout redirects to tabs
        setProfile({ ...payload, onboarding_complete: true });
        
        setStatus('success');
        reset();
        
        // Brief delay for visual confirmation
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      } catch (err) {
        console.error('Failed to save onboarding:', err);
        setStatus('error');
        setError('Something went wrong while building your plan. Please try again.');
      }
    }

    saveOnboarding();
  }, []);

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 px-6 justify-center items-center">
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-white text-2xl font-bold mt-8 text-center">
                Saving your fitness profile...
              </Text>
              <Text className="text-slate-400 text-center mt-4 px-8">
                Preparing your onboarding data so your dashboard is ready to use.
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-8">
                <Ionicons name="checkmark" size={40} color="white" />
              </View>
              <Text className="text-white text-3xl font-bold text-center">
                You're all set!
              </Text>
              <Text className="text-slate-400 text-center mt-4">
                Redirecting you to your dashboard...
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <View className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mb-8">
                <Ionicons name="alert" size={40} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold text-center">
                Oops!
              </Text>
              <Text className="text-red-400 text-center mt-4 px-8">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(onboarding)/welcome')}
                className="mt-8 bg-slate-800 px-8 py-3 rounded-xl border border-slate-700"
              >
                <Text className="text-white font-semibold">Start Over</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
