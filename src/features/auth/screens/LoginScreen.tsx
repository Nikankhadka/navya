import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
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
import { logger } from "@/lib/logger";
import { withMinimumLoading } from "@/lib/auth/loading";
import { emailSchema, signInPasswordSchema, getFirstErrorMessage } from "@/lib/validation";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthError } from "@supabase/supabase-js";

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

type AuthMode = "link" | "password";

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
    action?: { label: string; onPress: () => void };
    cancel?: { label: string; onPress: () => void };
  } | null>(null);

  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);
  const hasSocialLoginOptions = Platform.OS === "ios" || isGoogleLoginAvailable;

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      WebBrowser.maybeCompleteAuthSession();
    }
  }, []);

  function validateEmail(): boolean {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(getFirstErrorMessage(result, "email") ?? "Invalid email");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  function validatePassword(): boolean {
    const result = signInPasswordSchema.safeParse({ email, password });
    if (!result.success) {
      const msg = getFirstErrorMessage(result, "password");
      if (msg) {
        setPasswordError(msg);
      }
      return false;
    }
    setPasswordError(undefined);
    return true;
  }

  async function handleMagicLinkAuth() {
    if (!validateEmail()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      const { error } = await withMinimumLoading(
        () =>
          supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: {
              emailRedirectTo: getAuthRedirectUrl(),
              shouldCreateUser: true,
            },
          }),
        500,
      );

      if (error) {
        throw error;
      }

      setEmailSent(true);
      setAlert({
        open: true,
        title: "Check your inbox",
        message: "We sent you a sign-in link. Tap it to continue.",
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

  async function handlePasswordAuth() {
    if (!validateEmail()) return;
    if (!validatePassword()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      const { error } = await withMinimumLoading(
        () =>
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          }),
        500,
      );

      if (error) {
        throw error;
      }

      setAlert({
        open: true,
        title: "Welcome back",
        message: "You are signed in.",
        variant: "default",
      });
    } catch (error) {
      const authError = error as AuthError;
      let message = "Unable to sign in. Please check your credentials.";
      let needsResend = false;

      if (authError.message.includes("Invalid login credentials")) {
        message = "Incorrect email or password. Please try again.";
      } else if (authError.message.includes("Email not confirmed")) {
        message = "Please verify your email before signing in.";
        needsResend = true;
      } else if (authError instanceof Error) {
        message = authError.message;
      }

      setAlert({
        open: true,
        title: "Sign-in failed",
        message,
        variant: "destructive",
        action: needsResend
          ? {
              label: "Resend Verification",
              onPress: async () => {
                setAlert(null);
                const normalizedEmail = email.trim().toLowerCase();
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: "signup",
                    email: normalizedEmail,
                  });
                  if (resendError) throw resendError;
                  setAlert({
                    open: true,
                    title: "Verification email sent",
                    message: "Check your inbox for the new confirmation link.",
                    variant: "default",
                  });
                } catch (resendErr) {
                  setAlert({
                    open: true,
                    title: "Failed to resend",
                    message: resendErr instanceof Error ? resendErr.message : "Could not send verification email.",
                    variant: "destructive",
                  });
                }
              },
            }
          : undefined,
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
      } catch (e) {
        const authError = e as { code?: string; message?: string };
        if (authError.code !== "ERR_REQUEST_CANCELED") {
          setAlert({
            open: true,
            title: "Apple Auth Error",
            message: authError.message ?? "Unable to sign in with Apple.",
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
    } catch (e) {
      const error = e as Error;
      setAlert({
        open: true,
        title: `${provider} Auth Error`,
        message: getOAuthErrorMessage(provider, error, getAuthRedirectUrl()),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePrimaryAction() {
    if (mode === "link") {
      handleMagicLinkAuth();
    } else {
      handlePasswordAuth();
    }
  }

  const isLinkMode = mode === "link";
  const modeToggleBg = isLinkMode ? colors.accentMuted : "transparent";
  const modePasswordBg = isLinkMode ? "transparent" : colors.accentMuted;
  const modeToggleColor = isLinkMode ? colors.accent : colors.textSubtle;
  const modePasswordColor = isLinkMode ? colors.textSubtle : colors.accent;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ThemeModeToggle compact style={{
        position: "absolute",
        top: Math.max(insets.top, Spacing.lg),
        right: Spacing.lg,
        zIndex: 20,
      }} />
      <ScrollView contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: 112,
        paddingBottom: Math.max(insets.bottom, Spacing.xl) + 72,
        justifyContent: "center",
      }}>
        <View style={{ marginBottom: 48, alignItems: "center" }}>
          <Text style={{
            fontSize: 42,
            fontWeight: Typography.weight.extrabold,
            color: colors.text,
            marginBottom: Spacing.sm,
            textAlign: "center",
            letterSpacing: 1,
          }}>Navya</Text>
          <Text style={{
            fontSize: Typography.size.md,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            paddingHorizontal: Spacing.lg,
          }}>
            {isLinkMode
              ? "Enter your email and we'll send you a one-time sign-in link. No password needed."
              : "Sign in with your email and password."}
          </Text>
        </View>

        <View style={{ marginBottom: Spacing.xxl }}>
          {!isSupabaseConfigured && (
            <View style={{
              backgroundColor: colors.orangeMuted,
              borderColor: colors.orange,
              borderWidth: 1,
              borderRadius: 16,
              padding: Spacing.md,
              marginBottom: Spacing.lg,
            }}>
              <Text style={{
                color: colors.orange,
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.bold,
                marginBottom: 4,
              }}>Supabase not configured</Text>
              <Text style={{
                color: colors.textSecondary,
                fontSize: Typography.size.sm,
                lineHeight: 20,
              }}>
                Real auth is unavailable until `.env.local` contains a valid
                Supabase URL and anon key.
              </Text>
            </View>
          )}

          <View style={{
            flexDirection: "row",
            marginBottom: Spacing.md,
            backgroundColor: colors.card,
            borderRadius: Radius.lg,
            padding: 2,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              onPress={() => {
                setMode("link");
                setEmailSent(false);
                setPassword("");
                setPasswordError(undefined);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: Radius.md,
                backgroundColor: modeToggleBg,
              }}
            >
              <Text style={{
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.medium,
                color: modeToggleColor,
              }}>Email Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMode("password");
                setEmailSent(false);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: Radius.md,
                backgroundColor: modePasswordBg,
              }}
            >
              <Text style={{
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.medium,
                color: modePasswordColor,
              }}>Password</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(undefined);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={emailError}
            testID="login-email-input"
          />

          {!isLinkMode && (
            <View>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(undefined);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                error={passwordError}
                testID="login-password-input"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ alignSelf: "flex-end", marginTop: -Spacing.xs, marginBottom: Spacing.md }}
              >
                <Text style={{
                  color: colors.accent,
                  fontSize: Typography.size.sm,
                  fontWeight: Typography.weight.medium,
                }}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLinkMode && (
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              style={{ alignSelf: "flex-end", marginTop: -Spacing.xs, marginBottom: Spacing.md }}
              disabled={loading}
            >
              <Text style={{
                color: colors.accent,
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.medium,
                textDecorationLine: "underline",
              }}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <Button
            label={isLinkMode ? (emailSent ? "Link Sent" : "Send Email Link") : "Log In"}
            fullWidth
            loading={loading}
            onPress={handlePrimaryAction}
            style={{ marginTop: Spacing.sm }}
            disabled={!isSupabaseConfigured || (isLinkMode && emailSent)}
            testID={isLinkMode ? "login-send-magic-link" : "login-submit"}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.lg }}>
            <Text style={{ color: colors.textSecondary, fontSize: Typography.size.sm }}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              disabled={loading}
            >
              <Text style={{
                color: colors.accent,
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.semibold,
                textDecorationLine: "underline",
              }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {hasSocialLoginOptions && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.xxl }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{
                color: colors.muted,
                paddingHorizontal: Spacing.md,
                fontSize: Typography.size.xs,
                fontWeight: Typography.weight.bold,
                letterSpacing: 1.5,
              }}>OR CONTINUE WITH</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <View style={{ marginBottom: Spacing.xl }}>
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
                  style={Platform.OS === "ios" ? { marginTop: Spacing.md } : undefined}
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
        style={{
          position: "absolute",
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
        <Text style={{
          color: colors.accent,
          fontSize: Typography.size.sm,
          fontWeight: Typography.weight.semibold,
        }}>Demo mode</Text>
      </TouchableOpacity>

      {alert && (
        <TamaguiAlert
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
