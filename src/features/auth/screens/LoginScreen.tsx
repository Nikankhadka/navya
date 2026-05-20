import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Input,
  ThemeModeToggle,
  Alert as TamaguiAlert,
} from "@/components/ui";
import {
  Radius,
  Shadow,
  Spacing,
  Typography,
  useAppTheme,
  type ThemeColors,
} from "@/theme";
import {
  createSessionFromUrl,
  getAuthRedirectUrl,
  getSupabaseProviderCallbackUrl,
} from "@/lib/auth/redirects";
import {
  isDemoModeAvailable,
  isGoogleLoginAvailable,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase/client";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "@/store/useAuthStore";

function getOAuthErrorMessage(
  provider: "google" | "apple",
  error: unknown,
  redirectUrl: string,
): string {
  const fallbackMessage = `Unable to start ${provider} sign-in.`;
  const rawMessage = error instanceof Error ? error.message : fallbackMessage;

  if (provider === "google" && /provider is not enabled/i.test(rawMessage)) {
    return [
      "Google sign-in is not enabled in your Supabase project yet.",
      "In Supabase Dashboard -> Authentication -> Providers -> Google, enable the provider and paste a Google OAuth Client ID and Client Secret.",
      `In Google Cloud Console, add this Authorized redirect URI to the Web OAuth client: ${getSupabaseProviderCallbackUrl()}`,
      `In Supabase Authentication -> URL Configuration, keep this app redirect allow-listed: ${redirectUrl}`,
    ].join("\n\n");
  }

  return rawMessage;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top, insets.bottom);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  } | null>(null);
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);
  const hasSocialLoginOptions = Platform.OS === "ios" || isGoogleLoginAvailable;

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      WebBrowser.maybeCompleteAuthSession();
    }
  }, []);

  async function handleMagicLinkAuth() {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setAlert({
        open: true,
        title: "Error",
        message: "Please enter your email address.",
        variant: "destructive",
      });
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

      setEmailSent(true);
      setAlert({
        open: true,
        title: "Check your inbox",
        message:
          "Check mail and click to continue.",
        variant: "default",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send sign-in link.";
      setAlert({
        open: true,
        title: "Authentication Error",
        message: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (provider === "google" && !isGoogleLoginAvailable) {
      setAlert({
        open: true,
        title: "Google sign-in unavailable",
        message: "Google sign-in is temporarily disabled.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (provider === "apple" && Platform.OS === "ios") {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: credential.identityToken,
          });

          if (error) throw error;
        } else {
          throw new Error("No identityToken.");
        }
      } catch (e: any) {
        if (e.code !== "ERR_REQUEST_CANCELED") {
          setAlert({
            open: true,
            title: "Apple Auth Error",
            message: e.message,
            variant: "destructive",
          });
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
        if (Platform.OS === "web") {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl,
          );

          if (result.type === "success") {
            const sessionResult = await createSessionFromUrl(result.url);

            if (!sessionResult.success) {
              throw new Error(sessionResult.message);
            }
          }
        }
      }
    } catch (e: any) {
      setAlert({
        open: true,
        title: `${provider} Auth Error`,
        message: getOAuthErrorMessage(provider, e, getAuthRedirectUrl()),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ThemeModeToggle compact style={styles.themeToggle} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Navya</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a one-time sign-in link. No
            password needed.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!isSupabaseConfigured && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>
                Supabase not configured
              </Text>
              <Text style={styles.infoBannerText}>
                Real auth is unavailable until `.env.local` contains a valid
                Supabase URL and anon key.
              </Text>
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

          <Button
            label="Send Email Link"
            fullWidth
            loading={loading}
            onPress={handleMagicLinkAuth}
            style={[{ marginTop: Spacing.sm }]}
            disabled={!isSupabaseConfigured || emailSent}
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
              {Platform.OS === "ios" && (
                <Button
                  label="Continue with Apple"
                  variant="secondary"
                  fullWidth
                  onPress={() => handleOAuth("apple")}
                  disabled={loading || !isSupabaseConfigured}
                />
              )}
              {isGoogleLoginAvailable && (
                <Button
                  label="Continue with Google"
                  variant="secondary"
                  fullWidth
                  onPress={() => handleOAuth("google")}
                  disabled={loading || !isSupabaseConfigured}
                  style={[
                    Platform.OS === "ios"
                      ? { marginTop: Spacing.md }
                      : undefined,
                  ]}
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

      {alert && (
        <TamaguiAlert
          open={alert.open}
          onOpenChange={(open) => setAlert(open ? alert : null)}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  colors: ThemeColors,
  topInset: number,
  bottomInset: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    themeToggle: {
      position: "absolute",
      top: Math.max(topInset, Spacing.lg),
      right: Spacing.lg,
      zIndex: 20,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: 112,
      paddingBottom: Math.max(bottomInset, Spacing.xl) + 72,
      justifyContent: "center",
    },
    header: {
      marginBottom: 48,
      alignItems: "center",
    },
    title: {
      fontSize: 42,
      fontWeight: Typography.weight.extrabold,
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: "center",
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: Typography.size.md,
      color: colors.textSecondary,
      textAlign: "center",
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
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
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
    socialContainer: {
      marginBottom: Spacing.xl,
    },
    demoShortcut: {
      position: "absolute",
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