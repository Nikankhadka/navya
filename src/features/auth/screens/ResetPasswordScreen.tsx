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
import { logger } from "@/lib/logger";
import { resetPasswordSchema, getFirstErrorMessage } from "@/lib/validation";
import type { AuthError } from "@supabase/supabase-js";

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = createStyles(colors, insets.top, insets.bottom);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAlert({
          open: true,
          title: "Invalid link",
          message: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
      }
    });
  }, []);

  function validateForm(): boolean {
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      setPasswordError(undefined);
      setConfirmPasswordError(undefined);

      const passwordMsg = getFirstErrorMessage(result, "password");
      const confirmMsg = getFirstErrorMessage(result, "confirmPassword");

      if (passwordMsg) setPasswordError(passwordMsg);
      if (confirmMsg) setConfirmPasswordError(confirmMsg);
      return false;
    }

    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    return true;
  }

  async function handleResetPassword() {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setAlert({
        open: true,
        title: "Password updated",
        message: "Your password has been reset successfully. You can now sign in.",
        variant: "default",
      });
    } catch (error) {
      const authError = error as AuthError;
      let message = "Unable to reset password. Please try again.";

      if (authError instanceof Error) {
        message = authError.message;
      }

      logger.error("Password reset failed", authError);
      setAlert({
        open: true,
        title: "Reset failed",
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
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below.
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
            label="New Password"
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
            testID="reset-password-input"
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
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError(undefined);
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="password"
            error={confirmPasswordError}
            testID="reset-confirm-password-input"
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
            label="Reset Password"
            fullWidth
            loading={loading}
            onPress={handleResetPassword}
            style={[{ marginTop: Spacing.md }]}
            disabled={!isSupabaseConfigured}
            testID="reset-submit"
          />
        </View>
      </ScrollView>

      {alert && (
        <TamaguiAlert
          open={alert.open}
          onOpenChange={(open) => {
            if (!open && alert.variant === "default") {
              router.replace("/(auth)/login");
            }
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
  });
