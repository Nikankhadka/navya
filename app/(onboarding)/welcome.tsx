import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, QuickActionChip } from '../../src/components/ui';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <Card variant="hero" style={styles.heroCard}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>N</Text>
          </View>
          <Badge label="5-minute setup" color={Colors.accent} />
          <Text style={styles.title}>Build your{'\n'}forest path</Text>
          <Text style={styles.subtitle}>
            We’ll shape your training, nutrition, and progress rhythm around the way you actually
            want to move.
          </Text>

          <View style={styles.promiseRow}>
            <QuickActionChip label="Workout-ready" tone="accent" />
            <QuickActionChip label="Nutrition-first" tone="neutral" />
            <QuickActionChip label="Demo-safe" tone="water" />
          </View>
        </Card>

        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>What comes next</Text>
          <Text style={styles.detailText}>
            A short sequence to capture your baseline, main goal, and plan preferences. Every step
            exists to make your first dashboard immediately useful.
          </Text>

          <Button
            label="Get Started"
            fullWidth
            onPress={() => router.push('/(onboarding)/basics')}
            testID="onboarding-get-started"
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  glowOne: {
    position: 'absolute',
    top: 110,
    right: 20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: withAlpha(Colors.accent, 0.1),
  },
  glowTwo: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withAlpha(Colors.orange, 0.1),
  },
  heroCard: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  brandMark: {
    width: 70,
    height: 70,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(Colors.accent, 0.14),
    borderWidth: 1,
    borderColor: withAlpha(Colors.accent, 0.22),
  },
  brandMarkText: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.display,
    lineHeight: 40,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
  },
  promiseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  detailCard: {
    gap: Spacing.md,
  },
  detailTitle: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
  },
});
