import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeModeToggle, Alert } from '@/components/ui';
import { Radius, Shadow, Spacing, Typography, useAppTheme } from '@/theme';
import { getAuthRedirectUrl } from '@/lib/auth/redirects';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { withMinimumLoading } from '@/lib/auth/loading';
import { emailSchema, getFirstErrorMessage } from '@/lib/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthForm } from '@/features/auth/components';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'default' | 'destructive';
    action?: { label: string; onPress: () => void };
    cancel?: { label: string; onPress: () => void };
  } | null>(null);

  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);

  function validateEmail(): boolean {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(getFirstErrorMessage(result, 'email') ?? 'Invalid email');
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleMagicLinkAuth() {
    if (!validateEmail()) return;
    const normalizedEmail = email.trim().toLowerCase();
    const redirectUrl = getAuthRedirectUrl();
    logger.info('Sending magic link', { email: normalizedEmail, redirectUrl });

    try {
      setLoading(true);
      const { error } = await withMinimumLoading(
        () =>
          supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: { emailRedirectTo: redirectUrl, shouldCreateUser: true },
          }),
        500,
      );
      if (error) {
        logger.error('Magic link send failed', error);
        throw error;
      }
      logger.info('Magic link sent successfully', { email: normalizedEmail });
      setEmailSent(true);
      setAlert({
        open: true,
        title: 'Check your inbox',
        message: 'We sent you a sign-in link. Tap it to continue.',
        variant: 'default',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send sign-in link.';
      logger.error('Magic link error', error);
      setAlert({ open: true, title: 'Authentication Error', message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ThemeModeToggle
        compact
        style={{
          position: 'absolute',
          top: Math.max(insets.top, Spacing.lg),
          right: Spacing.lg,
          zIndex: 20,
        }}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.xl,
          paddingTop: 112,
          paddingBottom: Math.max(insets.bottom, Spacing.xl) + 72,
          justifyContent: 'center',
        }}
      >
        <View style={{ marginBottom: 48, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 42,
              fontWeight: Typography.weight.extrabold,
              color: colors.text,
              marginBottom: Spacing.sm,
              textAlign: 'center',
              letterSpacing: 1,
            }}
          >
            Navya
          </Text>
          <Text
            style={{
              fontSize: Typography.size.md,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
              paddingHorizontal: Spacing.lg,
            }}
          >
            Enter your email and we'll send you a one-time sign-in link. No password needed.
          </Text>
        </View>

        <AuthForm
          colors={colors}
          email={email}
          emailSent={emailSent}
          emailError={emailError}
          loading={loading}
          isSupabaseConfigured={isSupabaseConfigured}
          onEmailChange={(text: string) => {
            setEmail(text);
            setEmailError(undefined);
          }}
          onSubmit={handleMagicLinkAuth}
        />
      </ScrollView>

      <TouchableOpacity
        accessibilityRole="button"
        disabled={loading}
        onPress={() => enterDemoMode()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          position: 'absolute',
          left: Spacing.lg,
          bottom: Math.max(insets.bottom, Spacing.lg),
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: Radius.full,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          zIndex: 10,
          ...Shadow.sm,
        }}
        testID="login-demo-shortcut"
      >
        <Text
          style={{
            color: colors.accent,
            fontSize: Typography.size.sm,
            fontWeight: Typography.weight.semibold,
          }}
        >
          Demo mode
        </Text>
      </TouchableOpacity>

      {alert && (
        <Alert
          open={alert.open}
          onOpenChange={(open) => {
            if (!open) setAlert(null);
          }}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
          action={alert.action}
        />
      )}
    </KeyboardAvoidingView>
  );
}
