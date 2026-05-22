import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import { Button } from '@/components/ui';
import { Spacing, Typography, type ThemeColors } from '@/theme';

interface SocialLoginProps {
  colors: ThemeColors;
  loading: boolean;
  isSupabaseConfigured: boolean;
  isGoogleLoginAvailable: boolean;
  onAppleLogin: () => void;
  onGoogleLogin: () => void;
}

export function SocialLogin({
  colors,
  loading,
  isSupabaseConfigured,
  isGoogleLoginAvailable,
  onAppleLogin,
  onGoogleLogin,
}: SocialLoginProps) {
  const hasSocialLoginOptions = Platform.OS === 'ios' || isGoogleLoginAvailable;

  if (!hasSocialLoginOptions) return null;

  return (
    <>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.muted }]}>OR CONTINUE WITH</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.buttonsContainer}>
        {Platform.OS === 'ios' && (
          <Button
            label="Continue with Apple"
            variant="secondary"
            fullWidth
            onPress={onAppleLogin}
            disabled={loading || !isSupabaseConfigured}
          />
        )}
        {isGoogleLoginAvailable && (
          <Button
            label="Continue with Google"
            variant="secondary"
            fullWidth
            onPress={onGoogleLogin}
            disabled={loading || !isSupabaseConfigured}
            style={Platform.OS === 'ios' ? { marginTop: Spacing.md } : undefined}
            testID="login-google-auth"
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
  },
  buttonsContainer: {
    marginBottom: Spacing.xl,
  },
});
