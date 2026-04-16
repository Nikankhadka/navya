import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../constants/theme';

interface OnboardingShellProps {
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingShell({
  currentStep,
  totalSteps = 5,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.82}>
              <Ionicons name="arrow-back" size={18} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backSpacer} />
          )}

          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>
        </View>

        <View style={styles.trackRow}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.trackSegment,
                index < currentStep ? styles.trackSegmentActive : null,
                index === currentStep - 1 ? styles.trackSegmentCurrent : null,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {children}
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backSpacer: {
    width: 42,
    height: 42,
  },
  progressBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: withAlpha(Colors.accent, 0.12),
    borderWidth: 1,
    borderColor: withAlpha(Colors.accent, 0.22),
  },
  progressBadgeText: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trackRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  trackSegment: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: withAlpha(Colors.borderLight, 0.55),
  },
  trackSegmentActive: {
    backgroundColor: withAlpha(Colors.accent, 0.58),
  },
  trackSegmentCurrent: {
    backgroundColor: Colors.accent,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
});
