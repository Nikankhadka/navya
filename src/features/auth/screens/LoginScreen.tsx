import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, ThemeModeToggle } from '@/components/ui';
import { Radius, Shadow, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
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

type AuthMode = 'password-sign-in' | 'password-sign-up' | 'magic-link';

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmailConfirmationRequiredError(error: unknown): boolean {
  const rawMessage = error instanceof Error ? error.message : '';
  return /email not confirmed/i.test(rawMessage);
}

function getPasswordAuthErrorMessage(error: unknown, mode: AuthMode): string {
  const fallbackMessage =
    mode === 'password-sign-up' ? 'Unable to create your account.' : 'Unable to sign in with email and password.';
  const rawMessage = error instanceof Error ? error.message : fallbackMessage;

  if (isEmailConfirmationRequiredError(error)) {
    return 'This account still needs email confirmation in Supabase before password sign-in can be used.';
  }

  if (/invalid login credentials/i.test(rawMessage)) {
    return 'That email and password combination does not match an existing account.';
  }

  if (/user already registered/i.test(rawMessage)) {
    return 'An account with this email already exists. Switch to Sign In instead.';
  }

  if (/password should be at least/i.test(rawMessage)) {
    return 'Use a password with at least 6 characters.';
  }

  if (/signup is disabled/i.test(rawMessage)) {
    return 'Email/password sign-up is disabled in Supabase Authentication settings.';
  }

  return rawMessage;
}

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top, insets.bottom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('password-sign-in');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);
  const hasSocialLoginOptions = Platform.OS === 'ios' || isGoogleLoginAvailable;
  const isMagicLinkMode = authMode === 'magic-link';
  const isSignUpMode = authMode === 'password-sign-up';

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      WebBrowser.maybeCompleteAuthSession();
    }
  }, []);

  async function handleMagicLinkAuth() {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
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

  async function handleResendConfirmation() {
    const normalizedEmail = pendingConfirmationEmail ?? normalizeEmail(email);

    if (!normalizedEmail) {
      Alert.alert('Error', 'Enter your email address first so we know where to resend the confirmation email.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }

      setPendingConfirmationEmail(normalizedEmail);
      Alert.alert(
        'Confirmation email sent',
        `We sent a fresh confirmation email to ${normalizedEmail}. Confirm it before logging in with your password.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resend the confirmation email.';
      Alert.alert('Authentication Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordAuth() {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    if (authMode === 'password-sign-up') {
      if (password.length < 6) {
        Alert.alert('Error', 'Use a password with at least 6 characters.');
        return;
      }
    }

    try {
      setLoading(true);

      if (authMode === 'password-sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          setPendingConfirmationEmail(null);
          Alert.alert('Account created', 'Your account is ready and you are now signed in.');
          return;
        }

        setPendingConfirmationEmail(normalizedEmail);
        Alert.alert(
          'Account created',
          'Your account was created. If Supabase email confirmation is enabled, confirm the email before signing in with your password. You can resend the confirmation email from this screen.',
        );
        setAuthMode('password-sign-in');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      setPendingConfirmationEmail(null);
      Alert.alert('Signed in', 'You are now signed in.');
    } catch (error) {
      if (isEmailConfirmationRequiredError(error)) {
        setPendingConfirmationEmail(normalizedEmail);
      }

      Alert.alert('Authentication Error', getPasswordAuthErrorMessage(error, authMode));
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
      <ThemeModeToggle compact style={styles.themeToggle} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Navya</Text>
          <Text style={styles.subtitle}>
            {isMagicLinkMode
              ? 'Use a one-time email link to get back into your account.'
              : isSignUpMode
                ? 'Create your account with email and password.'
                : 'Sign in with your email and password.'}
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

          {pendingConfirmationEmail && !isMagicLinkMode && (
            <View style={styles.confirmationBanner}>
              <Text style={styles.confirmationBannerTitle}>Confirm your email before password login</Text>
              <Text style={styles.confirmationBannerText}>
                Password login for {pendingConfirmationEmail} will keep failing until the Supabase confirmation email
                is opened. If you did not receive it, resend it here.
              </Text>
              <Button
                label="Resend Confirmation Email"
                variant="secondary"
                fullWidth
                onPress={handleResendConfirmation}
                disabled={loading || !isSupabaseConfigured}
                style={[{ marginTop: Spacing.sm }]}
                testID="login-resend-confirmation"
              />
            </View>
          )}

          <Input 
            label="Email" 
            placeholder="you@example.com" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            testID="login-email-input"
          />

          {isMagicLinkMode ? (
            <>
              <Button 
                label="Send Email Link" 
                fullWidth 
                loading={loading}
                onPress={handleMagicLinkAuth}
                style={[{ marginTop: Spacing.sm }]}
                disabled={!isSupabaseConfigured}
                testID="login-send-magic-link"
              />
            </>
          ) : (
            <>
              <Input
                label="Password"
                placeholder={isSignUpMode ? 'Create a password' : 'Enter your password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                textContentType={isSignUpMode ? 'newPassword' : 'password'}
                testID="login-password-input"
              />

              <Button
                label={isSignUpMode ? 'Create Account' : 'Log In'}
                fullWidth
                loading={loading}
                onPress={handlePasswordAuth}
                style={[{ marginTop: Spacing.sm }]}
                disabled={!isSupabaseConfigured}
                testID={isSignUpMode ? 'login-create-account' : 'login-password-auth'}
              />
            </>
          )}

          <View style={styles.bottomActions}>
            {isMagicLinkMode ? (
              <>
                <Text style={styles.bottomActionsText}>Prefer a password?</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('password-sign-in')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Sign in</Text>
                </TouchableOpacity>
                <Text style={styles.bottomActionsText}>or</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('password-sign-up')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Sign up</Text>
                </TouchableOpacity>
              </>
            ) : isSignUpMode ? (
              <>
                <Text style={styles.bottomActionsText}>Have an account?</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('password-sign-in')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Sign in</Text>
                </TouchableOpacity>
                <Text style={styles.bottomActionsText}>or</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('magic-link')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Email link</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.bottomActionsText}>Need an account?</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('password-sign-up')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Sign up</Text>
                </TouchableOpacity>
                <Text style={styles.bottomActionsText}>or</Text>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setAuthMode('magic-link')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bottomActionsLink}>Email link</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

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
              <Text style={styles.dividerText}>OR CONTINUE WITH GOOGLE</Text>
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

      <TouchableOpacity
        accessibilityRole="button"
        disabled={loading}
        onPress={() => enterDemoMode()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.demoShortcut}
        testID="login-demo-shortcut"
      >
        <Text style={styles.demoShortcutText}>Demo mode</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors, topInset: number, bottomInset: number) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  themeToggle: {
    position: 'absolute',
    top: Math.max(topInset, Spacing.lg),
    right: Spacing.lg,
    zIndex: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 112,
    paddingBottom: Math.max(bottomInset, Spacing.xl) + 72,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: Typography.weight.extrabold,
    color: colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.xxl,
  },
  infoBanner: {
    backgroundColor: colors.orangeMuted,
    borderColor: colors.orange,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBannerTitle: {
    color: colors.orange,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  infoBannerText: {
    color: colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  confirmationBanner: {
    backgroundColor: colors.card,
    borderColor: colors.orange,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  confirmationBannerTitle: {
    color: colors.text,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  confirmationBannerText: {
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.muted,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
  },
  bottomActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: Spacing.xs,
    rowGap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  bottomActionsText: {
    color: colors.muted,
    fontSize: Typography.size.sm,
  },
  bottomActionsLink: {
    color: colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  socialContainer: {
    marginBottom: Spacing.xl,
  },
  demoShortcut: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: Math.max(bottomInset, Spacing.lg),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
    ...Shadow.sm,
  },
  demoShortcutText: {
    color: colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
});
