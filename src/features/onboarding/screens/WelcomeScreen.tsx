import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/useAuthStore';
import { Radius, Shadow, Spacing, Typography, useAppTheme, Colors } from '@/theme';

export default function WelcomeScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const { colors } = useAppTheme();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

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
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: colors.accent,
              borderRadius: Radius.xl,
              transform: [{ rotate: '12deg' }],
              marginBottom: Spacing.xxxl,
              alignItems: 'center',
              justifyContent: 'center',
              ...Shadow.lg,
            }}
          >
            <Text
              style={{
                fontSize: Typography.size.display,
                color: Colors.white,
                fontWeight: Typography.weight.bold,
                transform: [{ rotate: '-12deg' }],
              }}
            >
              N
            </Text>
          </View>

          <Text
            style={{
              color: colors.textStrong,
              fontSize: Typography.size.display,
              fontWeight: Typography.weight.bold,
              textAlign: 'center',
              marginBottom: Spacing.lg,
            }}
          >
            Welcome to Navya
          </Text>

          <Text
            style={{
              color: colors.textSubtle,
              fontSize: Typography.size.lg,
              textAlign: 'center',
              marginBottom: Spacing.xxxl,
              paddingHorizontal: Spacing.lg,
              lineHeight: 24,
            }}
          >
            Your AI fitness companion. Let's build your personalized training and nutrition
            foundation.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/basics')}
            style={{
              width: '100%',
              backgroundColor: colors.accent,
              paddingVertical: Spacing.lg,
              borderRadius: Radius.lg,
              ...Shadow.md,
            }}
            activeOpacity={0.8}
            testID="onboarding-get-started"
          >
            <Text
              style={{
                color: Colors.white,
                textAlign: 'center',
                fontSize: Typography.size.lg,
                fontWeight: Typography.weight.semibold,
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
