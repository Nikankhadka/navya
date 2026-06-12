import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { profileService } from '@/features/profile/api/profile.service';
import { Image } from 'expo-image';
import { Colors, Radius, Spacing, Typography, useAppTheme } from '@/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
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
          router.replace('/(tabs)/(home)');
        }, 2000);
      } catch (err) {
        console.error('Failed to save onboarding:', err);
        setStatus('error');
        setError('Something went wrong while building your plan. Please try again.');
      }
    }

    saveOnboarding();
  }, []);

  const iconContainerStyle = {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.xxxl,
  };

  return (
    <LinearGradient colors={Colors.gradientDark} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: Spacing.xl,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text
                style={{
                  color: colors.textStrong,
                  fontSize: Typography.size.xxl,
                  fontWeight: Typography.weight.bold,
                  marginTop: Spacing.xxl,
                  textAlign: 'center',
                }}
              >
                Saving your fitness profile...
              </Text>
              <Text
                style={{
                  color: colors.textSubtle,
                  textAlign: 'center',
                  marginTop: Spacing.lg,
                  paddingHorizontal: Spacing.xxxl,
                }}
              >
                Preparing your onboarding data so your dashboard is ready to use.
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View style={{ ...iconContainerStyle, backgroundColor: colors.green }}>
                <Image
                  source="sf:checkmark"
                  style={{ width: 40, height: 40 }}
                  tintColor={Colors.white}
                />
              </View>
              <Text
                style={{
                  color: colors.textStrong,
                  fontSize: Typography.size.xxxl,
                  fontWeight: Typography.weight.bold,
                  textAlign: 'center',
                }}
              >
                You're all set!
              </Text>
              <Text
                style={{
                  color: colors.textSubtle,
                  textAlign: 'center',
                  marginTop: Spacing.lg,
                }}
              >
                Redirecting you to your dashboard...
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <View style={{ ...iconContainerStyle, backgroundColor: colors.red }}>
                <Image
                  source="sf:exclamationmark.triangle"
                  style={{ width: 40, height: 40 }}
                  tintColor={Colors.white}
                />
              </View>
              <Text
                style={{
                  color: colors.textStrong,
                  fontSize: Typography.size.xxl,
                  fontWeight: Typography.weight.bold,
                  textAlign: 'center',
                }}
              >
                Oops!
              </Text>
              <Text
                style={{
                  color: colors.red,
                  textAlign: 'center',
                  marginTop: Spacing.lg,
                  paddingHorizontal: Spacing.xxxl,
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(onboarding)/welcome')}
                style={{
                  marginTop: Spacing.xxl,
                  backgroundColor: colors.card,
                  paddingHorizontal: Spacing.xxl,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: Typography.weight.semibold,
                  }}
                >
                  Start Over
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
