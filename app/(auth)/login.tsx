import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../../src/lib/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mockSignIn } = useAuthStore();

  const handleDevLogin = () => {
    mockSignIn();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Text style={styles.logo}>⚡</Text>
        <Text style={styles.appName}>FitAI</Text>
        <Text style={styles.tagline}>Your AI-powered fitness companion</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleDevLogin} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Get Started →</Text>
        </TouchableOpacity>
        <Text style={styles.devNote}>Dev mode: mock auth enabled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
    padding: Spacing.xxxl,
  },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  logo: { fontSize: 64 },
  appName: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -2,
  },
  tagline: { color: Colors.muted, fontSize: Typography.size.lg, textAlign: 'center' },
  bottom: { gap: Spacing.md },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.3,
  },
  devNote: {
    color: Colors.dim,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
});
