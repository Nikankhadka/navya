import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Badge, Button, Card, Input, QuickActionChip } from '../../src/components/ui';
import { Colors, Radius, Shadow, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import {
  createSessionFromUrl,
  getAuthRedirectUrl,
  isDemoModeAvailable,
  isSupabaseConfigured,
  supabase,
} from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

const ENTRY_POINTS = ['Secure magic link', 'Demo mode', 'Google or Apple'];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);

  const helperChips = useMemo(
    () => ENTRY_POINTS.map((label) => <QuickActionChip key={label} label={label} tone="accent" />),
    [],
  );

  async function handleEmailAuth() {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your email address to receive a secure sign-in link.');
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

      setSentEmail(email);
      Alert.alert(
        'Check your inbox',
        'We sent a sign-in link to your email. Open it on this device to continue.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send sign-in link.';
      Alert.alert('Authentication error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
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

          if (error) {
            throw error;
          }
        } else {
          throw new Error('No identity token returned.');
        }
      } catch (error: unknown) {
        if ((error as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') {
          Alert.alert('Apple auth error', error instanceof Error ? error.message : 'Apple sign-in failed.');
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

      if (error) {
        throw error;
      }

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

          if (result.type === 'success') {
            await createSessionFromUrl(result.url);
          }
        }
      }
    } catch (error: unknown) {
      Alert.alert(
        `${provider} auth error`,
        error instanceof Error ? error.message : `Unable to continue with ${provider}.`,
      );
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBackdrop}>
          <View style={styles.heroOrbPrimary} />
          <View style={styles.heroOrbSecondary} />
          <Card variant="hero" style={styles.heroCard}>
            <View style={styles.heroCardGlow} />
            <Badge label="Navya MVP" color={Colors.accent} />
            <Text style={styles.title}>Start your{'\n'}training rhythm</Text>
            <Text style={styles.subtitle}>
              Move from login to today’s plan in one calm flow. Use a secure magic link or explore
              the full app in demo mode.
            </Text>
            <View style={styles.chipRow}>{helperChips}</View>
          </Card>
        </View>

        <Card style={styles.formCard}>
          {!isSupabaseConfigured ? (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>Local setup still needs Supabase</Text>
              <Text style={styles.infoBannerText}>
                Real auth stays disabled until `.env.local` contains a valid Supabase URL and anon
                key. Demo mode still lets you review the full MVP safely.
              </Text>
            </View>
          ) : null}

          {sentEmail ? (
            <View style={styles.sentCard}>
              <Text style={styles.sentEyebrow}>Magic link sent</Text>
              <Text style={styles.sentTitle}>{sentEmail}</Text>
              <Text style={styles.sentText}>
                Open the email on this device to continue into onboarding or your existing tabs.
              </Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="you@example.com"
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
            disabled={!isSupabaseConfigured}
            testID="login-send-magic-link"
          />

          {isDemoModeAvailable ? (
            <Button
              label="Explore Demo App"
              variant="secondary"
              fullWidth
              onPress={() => enterDemoMode()}
              style={styles.demoButton}
              testID="login-explore-demo"
            />
          ) : null}
        </Card>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>utility sign in</Text>
          <View style={styles.line} />
        </View>

        <Card style={styles.socialCard}>
          {Platform.OS === 'ios' ? (
            <Button
              label="Continue with Apple"
              variant="secondary"
              fullWidth
              onPress={() => handleOAuth('apple')}
              disabled={loading || !isSupabaseConfigured}
            />
          ) : null}
          <Button
            label="Continue with Google"
            variant="ghost"
            fullWidth
            onPress={() => handleOAuth('google')}
            disabled={loading || !isSupabaseConfigured}
            style={Platform.OS === 'ios' ? styles.googleButton : undefined}
            testID="login-google-auth"
          />
        </Card>
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
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  heroBackdrop: {
    marginBottom: Spacing.xxl,
  },
  heroOrbPrimary: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: withAlpha(Colors.accent, 0.12),
  },
  heroOrbSecondary: {
    position: 'absolute',
    bottom: 26,
    left: 8,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: withAlpha(Colors.blue, 0.12),
  },
  heroCard: {
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  heroCardGlow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: withAlpha(Colors.accent, 0.1),
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.display,
    lineHeight: 40,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    maxWidth: 320,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  formCard: {
    gap: Spacing.md,
  },
  infoBanner: {
    backgroundColor: Colors.orangeMuted,
    borderColor: withAlpha(Colors.orange, 0.42),
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoBannerTitle: {
    color: Colors.orange,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBannerText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  sentCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withAlpha(Colors.accent, 0.32),
    backgroundColor: withAlpha(Colors.accent, 0.08),
    padding: Spacing.md,
    gap: 4,
  },
  sentEyebrow: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sentTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  sentText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  demoButton: {
    marginTop: Spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  socialCard: {
    gap: Spacing.md,
  },
  googleButton: {
    marginTop: 0,
  },
});
