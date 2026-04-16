import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Badge, Card } from '../../src/components/ui';
import { Colors, Spacing, Typography, withAlpha } from '../../src/constants/theme';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <Card variant="hero" style={styles.card}>
        <Badge label="Secure sign-in" color={Colors.accent} />
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.title}>Completing sign-in</Text>
        <Text style={styles.subtitle}>
          Navya is finishing your secure login and checking whether you should continue into
          onboarding or return straight to your day.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  glowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 140,
    right: 24,
    backgroundColor: withAlpha(Colors.accent, 0.1),
  },
  glowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: 180,
    left: 30,
    backgroundColor: withAlpha(Colors.blue, 0.1),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxxl,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    textAlign: 'center',
  },
});
