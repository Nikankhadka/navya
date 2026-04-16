import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/ui';
import { Colors, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores/useOnboardingStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { profileService } from '../../src/services/profileService';

export default function CompleteScreen() {
  const router = useRouter();
  const { buildPayload, reset } = useOnboardingStore();
  const { session, setProfile } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function saveOnboarding() {
      if (!session?.user.id) {
        setStatus('error');
        setError('Your session is missing. Please restart onboarding.');
        return;
      }

      try {
        const payload = buildPayload();
        await profileService.upsertProfile(session.user.id, {
          ...payload,
          onboarding_complete: true,
        });

        setProfile({ ...payload, onboarding_complete: true });
        setStatus('success');
        reset();

        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1600);
      } catch (err) {
        console.error('Failed to save onboarding:', err);
        setStatus('error');
        setError('Something went wrong while saving your profile. Please try again.');
      }
    }

    saveOnboarding();
  }, [buildPayload, reset, router, session?.user.id, setProfile]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <Card variant="hero" style={styles.card}>
          {status === 'loading' ? (
            <>
              <Badge label="Saving setup" color={Colors.accent} />
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.title}>Preparing your first dashboard</Text>
              <Text style={styles.subtitle}>
                Saving your baseline so Home, Workout, Nutrition, Coach, and Profile all start in
                sync.
              </Text>
            </>
          ) : null}

          {status === 'success' ? (
            <>
              <Badge label="Ready to train" color={Colors.orange} />
              <Text style={styles.successEmoji}>🌿</Text>
              <Text style={styles.title}>You’re all set</Text>
              <Text style={styles.subtitle}>
                Redirecting you into the app now with your setup and first-day context in place.
              </Text>
            </>
          ) : null}

          {status === 'error' ? (
            <>
              <Badge label="Couldn’t save" color={Colors.red} />
              <Text style={styles.successEmoji}>⚠️</Text>
              <Text style={styles.title}>Let’s try that again</Text>
              <Text style={styles.subtitle}>{error}</Text>
              <Button
                label="Start Over"
                fullWidth
                variant="secondary"
                onPress={() => router.replace('/(onboarding)/welcome')}
              />
            </>
          ) : null}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  glowOne: {
    position: 'absolute',
    top: 160,
    right: 18,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: withAlpha(Colors.accent, 0.1),
  },
  glowTwo: {
    position: 'absolute',
    bottom: 160,
    left: 18,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: withAlpha(Colors.orange, 0.1),
  },
  card: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxxl,
  },
  successEmoji: {
    fontSize: 42,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    textAlign: 'center',
  },
});
