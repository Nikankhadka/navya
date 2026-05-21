import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { getAuthRedirectUrl } from "@/lib/auth/redirects";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { withMinimumLoading } from "@/lib/auth/loading";
import { signUpSchema, getFirstErrorMessage } from "@/lib/validation";
import type { AuthError } from "@supabase/supabase-js";

export default function SignupScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = createStyles(colors, insets.top, insets.bottom);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  } | null>(null);

  function validateForm(): boolean {
    const result = signUpSchema.safeParse({ email, password, confirmPassword });

    if (!result.success) {
      setEmailError(undefined);
      setPasswordError(undefined);
      setConfirmPasswordError(undefined);

      const emailMsg = getFirstErrorMessage(result, "email");
      const passwordMsg = getFirstErrorMessage(result, "password");
      const confirmMsg = getFirstErrorMessage(result, "confirmPassword");

      if (emailMsg) setEmailError(emailMsg);
      if (passwordMsg) setPasswordError(passwordMsg);
      if (confirmMsg) setConfirmPasswordError(confirmMsg);
      return false;
    }

    setEmailError(undefined);
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    return true;
  }

  async function handleSignup() {
    if (!validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      const { error } = await withMinimumLoading(
        () =>
          supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: getAuthRedirectUrl(),
            },
          }),
        500,
      );

      if (error) {
        throw error;
      }

      setAlert({
        open: true,
        title: "Check your inbox",
        message: "We sent a confirmation link to your email. Please verify your email before signing in.",
        variant: "default",
      });
    } catch (error) {
      const authError = error as AuthError;
      let message = "Unable to create account. Please try again.";

      if (authError.message.includes("User already registered")) {
        message = "An account with this email already exists. Please sign in instead.";
      } else if (authError.message.includes("Password")) {
        message = authError.message;
      } else if (authError instanceof Error) {
        message = authError.message;
      }

      logger.error("Signup failed", authError);
      setAlert({
        open: true,
        title: "Signup failed",
        message,
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to get started with Navya.
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
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(undefined);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={emailError}
            testID="signup-email-input"
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(undefined);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            error={passwordError}
            testID="signup-password-input"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError(undefined);
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="password"
            error={confirmPasswordError}
            testID="signup-confirm-password-input"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.showPasswordButton}
          >
            <Text style={styles.showPasswordText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>

          <Button
            label="Create Account"
            fullWidth
            loading={loading}
            onPress={handleSignup}
            style={[{ marginTop: Spacing.md }]}
            disabled={!isSupabaseConfigured}
            testID="signup-submit"
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {alert && (
        <TamaguiAlert
          open={alert.open}
          onOpenChange={(open) => {
            if (!open) setAlert(null);
          }}
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
  _bottomInset: number,
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
      paddingBottom: Spacing.xxl,
      justifyContent: "center",
    },
    header: {
      marginBottom: 48,
      alignItems: "center",
    },
    title: {
      fontSize: 36,
      fontWeight: Typography.weight.extrabold,
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: "center",
      letterSpacing: 0.5,
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
    showPasswordButton: {
      alignSelf: "flex-end",
      marginTop: -Spacing.xs,
      marginBottom: Spacing.md,
    },
    showPasswordText: {
      color: colors.accent,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: Spacing.lg,
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
    },
    loginLink: {
      color: colors.accent,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      textDecorationLine: "underline",
    },
  });
