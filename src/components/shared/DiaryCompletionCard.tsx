import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/theme';
import { Card } from '@/components/ui';

export interface DiaryCompletionCategory {
  /** Unique key for the category */
  key: string;
  /** Display label */
  label: string;
  /** Whether this category is completed today */
  completed: boolean;
  /** Emoji icon for this category */
  emoji: string;
  /** Optional subtitle (e.g., "1,432 / 2,000 kcal") */
  subtitle?: string;
  /** Callback when user taps this category */
  onPress?: () => void;
}

interface DiaryCompletionCardProps {
  colors: ThemeColors;
  categories: DiaryCompletionCategory[];
}

export function DiaryCompletionCard({ colors, categories }: DiaryCompletionCardProps) {
  const completedCount = categories.filter((c) => c.completed).length;
  const totalCount = categories.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isComplete = completedCount === totalCount;

  return (
    <Card>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Daily Diary</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isComplete ? 'All done for today! 🎉' : `${completedCount} of ${totalCount} complete`}
          </Text>
        </View>
        <View style={styles.progressRing}>
          <View
            style={[styles.ringOuter, { borderColor: isComplete ? colors.green : colors.border }]}
          >
            <Text style={[styles.ringText, { color: isComplete ? colors.green : colors.text }]}>
              {progressPct}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesRow}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryItem,
              {
                backgroundColor: category.completed ? `${colors.green}14` : colors.card,
                borderColor: category.completed ? colors.green : colors.border,
              },
            ]}
            onPress={category.onPress}
            activeOpacity={0.7}
            disabled={!category.onPress}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                { color: category.completed ? colors.green : colors.muted },
              ]}
            >
              {category.label}
            </Text>
            <View
              style={[
                styles.categoryCheck,
                {
                  backgroundColor: category.completed ? colors.green : 'transparent',
                  borderColor: category.completed ? colors.green : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryCheckText,
                  {
                    color: category.completed ? '#FFFFFF' : colors.dim,
                  },
                ]}
              >
                {category.completed ? '✓' : '○'}
              </Text>
            </View>
            {category.subtitle ? (
              <Text style={[styles.categorySubtitle, { color: colors.dim }]}>
                {category.subtitle}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = {
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  progressRing: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ringOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ringText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
  },
  categoriesRow: {
    flexDirection: 'row' as const,
    gap: Spacing.sm,
  },
  categoryItem: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center' as const,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center' as const,
  },
  categoryCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  categoryCheckText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
  categorySubtitle: {
    fontSize: 9,
    textAlign: 'center' as const,
  },
};
