import React from 'react';
import { View, Text } from 'react-native';
import { Input, Button } from '@/components/ui';
import { Spacing, Typography, type ThemeColors } from '@/theme';

interface AuthFormProps {
  colors: ThemeColors;
  email: string;
  emailSent: boolean;
  emailError?: string;
  loading: boolean;
  isSupabaseConfigured: boolean;
  onEmailChange: (text: string) => void;
  onSubmit: () => void;
}

export function AuthForm({
  colors,
  email,
  emailSent,
  emailError,
  loading,
  isSupabaseConfigured,
  onEmailChange,
  onSubmit,
}: AuthFormProps) {
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

      <Button
        label={emailSent ? 'Link Sent' : 'Send Email Link'}
        fullWidth
        loading={loading}
        onPress={onSubmit}
        style={styles.submitButton}
        disabled={!isSupabaseConfigured || emailSent}
        testID="login-send-magic-link"
      />
    </View>
  );
}

const styles = {
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
  submitButton: {
    marginTop: Spacing.lg,
  },
} as const;
