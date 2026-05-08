import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/theme';
import {
  createSessionFromUrl,
  getAuthRedirectUrl,
  getSupabaseProviderCallbackUrl,
} from '@/lib/auth/redirects';
import {
  isDemoModeAvailable,
  isGoogleLoginAvailable,
  isSupabaseConfigured,
  supabase,
} from '@/lib/supabase/client';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@/store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

function getOAuthErrorMessage(provider: 'google' | 'apple', error: unknown, redirectUrl: string): string {
  const fallbackMessage = `Unable to start ${provider} sign-in.`;
  const rawMessage = error instanceof Error ? error.message : fallbackMessage;

  if (provider === 'google' && /provider is not enabled/i.test(rawMessage)) {
    return [
      'Google sign-in is not enabled in your Supabase project yet.',
      'In Supabase Dashboard -> Authentication -> Providers -> Google, enable the provider and paste a Google OAuth Client ID and Client Secret.',
      `In Google Cloud Console, add this Authorized redirect URI to the Web OAuth client: ${getSupabaseProviderCallbackUrl()}`,
      `In Supabase Authentication -> URL Configuration, keep this app redirect allow-listed: ${redirectUrl}`,
    ].join('\n\n');
  }

  return rawMessage;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);
  const hasSocialLoginOptions = Platform.OS === 'ios' || isGoogleLoginAvailable;

  async function handleEmailAuth() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Check your inbox',
        'We sent a sign-in link to your email. Open it on this device to continue.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send sign-in link.';
      Alert.alert('Authentication Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    if (provider === 'google' && !isGoogleLoginAvailable) {
      Alert.alert('Google sign-in unavailable', 'Google sign-in is temporarily disabled.');
      return;
    }

    setLoading(true);

    if (provider === 'apple' && Platform.OS === 'ios') {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) throw error;
        } else {
          throw new Error('No identityToken.');
        }
      } catch (e: any) {
        if (e.code !== 'ERR_REQUEST_CANCELED') {
          Alert.alert('Apple Auth Error', e.message);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const redirectUrl = getAuthRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          
          if (result.type === 'success') {
            const sessionResult = await createSessionFromUrl(result.url);

            if (!sessionResult.success) {
              throw new Error(sessionResult.message);
            }
          }
        }
      }
    } catch (e: any) {
      Alert.alert(`${provider} Auth Error`, getOAuthErrorMessage(provider, e, getAuthRedirectUrl()));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Navya</Text>
          <Text style={styles.subtitle}>
            Sign in with a secure magic link to continue your training journey.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!isSupabaseConfigured && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>Supabase not configured</Text>
              <Text style={styles.infoBannerText}>
                Real auth is unavailable until `.env.local` contains a valid Supabase URL and anon key.
              </Text>
            </View>
          )}

          <Input 
            label="Email Address" 
            placeholder="your@email.com" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="login-email-input"
          />

          <Button 
            label="Send Magic Link" 
            fullWidth 
            loading={loading}
            onPress={handleEmailAuth}
            style={[{ marginTop: Spacing.sm }]}
            disabled={!isSupabaseConfigured}
            testID="login-send-magic-link"
          />

          {isDemoModeAvailable && (
            <Button
              label="Explore Demo App"
              variant="secondary"
              fullWidth
              onPress={() => enterDemoMode()}
              style={[{ marginTop: Spacing.md }]}
              testID="login-explore-demo"
            />
          )}
        </View>

        {hasSocialLoginOptions && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
              {Platform.OS === 'ios' && (
                <Button 
                  label="Continue with Apple" 
                  variant="secondary" 
                  fullWidth
                  onPress={() => handleOAuth('apple')}
                  disabled={loading || !isSupabaseConfigured}
                />
              )}
              {isGoogleLoginAvailable && (
                <Button 
                  label="Continue with Google" 
                  variant="secondary" 
                  fullWidth
                  onPress={() => handleOAuth('google')}
                  disabled={loading || !isSupabaseConfigured}
                  style={[Platform.OS === 'ios' ? { marginTop: Spacing.md } : undefined]}
                  testID="login-google-auth"
                />
              )}
            </View>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: Typography.weight.extrabold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.xxl,
  },
  infoBanner: {
    backgroundColor: Colors.orangeMuted,
    borderColor: Colors.orange,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBannerTitle: {
    color: Colors.orange,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  infoBannerText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.muted,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
  },
  socialContainer: {
    marginBottom: Spacing.xl,
  },
});
