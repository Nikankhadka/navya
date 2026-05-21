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
  Spacing,
  Typography,
  useAppTheme,
  type ThemeColors,
} from "@/theme";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth/redirects";
import { logger } from "@/lib/logger";
import { withMinimumLoading } from "@/lib/auth/loading";
import { forgotPasswordSchema, getFirstErrorMessage } from "@/lib/validation";
import type { AuthError } from "@supabase/supabase-js";

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = createStyles(colors, insets.top, insets.bottom);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  } | null>(null);

  function validateEmail(): boolean {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setEmailError(getFirstErrorMessage(result, "email") ?? "Invalid email");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleResetRequest() {
    if (!validateEmail()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      const { error } = await withMinimumLoading(
        () =>
          supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: getAuthRedirectUrl(),
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
        message: "We sent a password reset link to your email. Tap it to set a new password.",
        variant: "default",
      });
    } catch (error) {
      const authError = error as AuthError;
      let message = "Unable to send reset link. Please try again.";

      if (authError instanceof Error) {
        message = authError.message;
      }

      logger.error("Password reset request failed", authError);
      setAlert({
        open: true,
        title: "Request failed",
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {emailSent
              ? "Check your email for the reset link."
              : "Enter your email and we'll send you a link to reset your password."}
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

          {!emailSent && (
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
              testID="forgot-email-input"
            />
          )}

          <Button
            label={emailSent ? "Resend Link" : "Send Reset Link"}
            fullWidth
            loading={loading}
            onPress={handleResetRequest}
            style={[{ marginTop: Spacing.md }]}
            disabled={!isSupabaseConfigured}
            testID="forgot-submit"
          />

          <View style={styles.backRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.backLink}>Back to login</Text>
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
    backRow: {
      alignItems: "center",
      marginTop: Spacing.lg,
    },
    backLink: {
      color: colors.accent,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      textDecorationLine: "underline",
    },
  });
