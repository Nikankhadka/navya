import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Input, Button } from '@/components/ui';
import { Radius, Spacing, Typography, type ThemeColors } from '@/theme';

type AuthMode = 'link' | 'password';

interface AuthFormProps {
  colors: ThemeColors;
  mode: AuthMode;
  email: string;
  password: string;
  showPassword: boolean;
  emailSent: boolean;
  emailError?: string;
  passwordError?: string;
  loading: boolean;
  isSupabaseConfigured: boolean;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function AuthForm({
  colors,
  mode,
  email,
  password,
  showPassword,
  emailSent,
  emailError,
  passwordError,
  loading,
  isSupabaseConfigured,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onSignUp,
}: AuthFormProps) {
  const isLinkMode = mode === 'link';

  return (
    <View style={styles.container}>
      {!isSupabaseConfigured && (
        <View
          style={[
            styles.warningBox,
            { borderColor: colors.orange, backgroundColor: colors.orangeMuted },
          ]}
        >
          <Text style={[styles.warningTitle, { color: colors.orange }]}>
            Supabase not configured
          </Text>
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Real auth is unavailable until `.env.local` contains a valid Supabase URL and anon key.
          </Text>
        </View>
      )}

      <View style={[styles.modeToggle, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => onModeChange('link')}
          style={[
            styles.modeButton,
            { backgroundColor: isLinkMode ? colors.accentMuted : 'transparent' },
          ]}
        >
          <Text
            style={[styles.modeText, { color: isLinkMode ? colors.accent : colors.textSubtle }]}
          >
            Email Link
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onModeChange('password')}
          style={[
            styles.modeButton,
            { backgroundColor: !isLinkMode ? colors.accentMuted : 'transparent' },
          ]}
        >
          <Text
            style={[styles.modeText, { color: !isLinkMode ? colors.accent : colors.textSubtle }]}
          >
            Password
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={onEmailChange}
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
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            error={passwordError}
            testID="login-password-input"
          />
          <TouchableOpacity onPress={onTogglePassword} style={styles.togglePassword}>
            <Text style={[styles.togglePasswordText, { color: colors.accent }]}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLinkMode && (
        <TouchableOpacity
          onPress={onForgotPassword}
          style={styles.forgotPassword}
          disabled={loading}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      )}

      <Button
        label={isLinkMode ? (emailSent ? 'Link Sent' : 'Send Email Link') : 'Log In'}
        fullWidth
        loading={loading}
        onPress={onSubmit}
        style={styles.submitButton}
        disabled={!isSupabaseConfigured || (isLinkMode && emailSent)}
        testID={isLinkMode ? 'login-send-magic-link' : 'login-submit'}
      />

      <View style={styles.signUpRow}>
        <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onSignUp} disabled={loading}>
          <Text style={[styles.signUpLink, { color: colors.accent }]}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  warningText: {
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: 2,
    borderWidth: 1,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  modeText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  togglePassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  togglePasswordText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signUpText: {
    fontSize: Typography.size.sm,
  },
  signUpLink: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textDecorationLine: 'underline',
  },
});
