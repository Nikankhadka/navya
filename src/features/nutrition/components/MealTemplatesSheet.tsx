import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Spacing, Radius, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type { MealTemplate, TemplateFoodEntry } from '@/types/app';

interface MealTemplatesSheetProps {
  templates: MealTemplate[];
  isLoading: boolean;
  onLogTemplate: (template: MealTemplate) => void;
  mealTimeFilter?: string | null;
}

interface TemplateFoodSummaryProps {
  foods: TemplateFoodEntry[];
  colors: ThemeColors;
}

function TemplateFoodSummary({ foods, colors }: TemplateFoodSummaryProps) {
  const totalCal = foods.reduce((sum, f) => sum + f.calories, 0);
  const foodNames = foods
    .slice(0, 3)
    .map((f) => f.meal_name.split('(')[0].trim())
    .join(', ');

  return (
    <View style={styles.foodSummary}>
      <Text style={[styles.foodNames, { color: colors.muted }]} numberOfLines={1}>
        {foodNames}
        {foods.length > 3 ? ` +${foods.length - 3} more` : ''}
      </Text>
      <Text style={[styles.foodCals, { color: colors.accent }]}>~{totalCal} kcal</Text>
    </View>
  );
}

export function MealTemplatesSheet({
  templates,
  isLoading,
  onLogTemplate,
  mealTimeFilter,
}: MealTemplatesSheetProps) {
  const { colors } = useAppTheme();

  const filtered = mealTimeFilter
    ? templates.filter((t) => t.meal_time === mealTimeFilter)
    : templates;

  const systemTemplates = filtered.filter((t) => t.is_system);
  const userTemplates = filtered.filter((t) => !t.is_system);

  const handleLog = useCallback(
    (template: MealTemplate) => {
      onLogTemplate(template);
    },
    [onLogTemplate],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={colors.muted} />
      </View>
    );
  }

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          No meal templates yet.{'\n'}Log a meal and save it as a template for quick reuse.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* System presets */}
      {systemTemplates.length > 0 && (
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.dim }]}>Quick Templates</Text>
          {systemTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateRow, { borderColor: colors.border }]}
              onPress={() => handleLog(template)}
              activeOpacity={0.7}
            >
              <View style={styles.templateInfo}>
                <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                <TemplateFoodSummary foods={template.foods} colors={colors} />
              </View>
              <View style={[styles.logBtn, { backgroundColor: `${colors.accent}18` }]}>
                <Text style={[styles.logBtnText, { color: colors.accent }]}>Log</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* User-created templates */}
      {userTemplates.length > 0 && (
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.dim }]}>My Templates</Text>
          {userTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateRow, { borderColor: colors.border }]}
              onPress={() => handleLog(template)}
              activeOpacity={0.7}
            >
              <View style={styles.templateInfo}>
                <Text style={[styles.templateName, { color: colors.text }]}>
                  {template.name}
                  {template.is_favorite ? ' ★' : ''}
                </Text>
                <TemplateFoodSummary foods={template.foods} colors={colors} />
              </View>
              <View style={[styles.logBtn, { backgroundColor: `${colors.accent}18` }]}>
                <Text style={[styles.logBtnText, { color: colors.accent }]}>Log</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    paddingTop: Spacing.sm,
  },
  group: {
    marginBottom: Spacing.md,
  },
  groupTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  templateRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  foodSummary: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  },
  foodNames: {
    fontSize: Typography.size.xs,
    flex: 1,
  },
  foodCals: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  logBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  logBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  loadingWrap: {
    paddingVertical: Spacing.xl,
    alignItems: 'center' as const,
  },
  emptyWrap: {
    paddingVertical: Spacing.xl,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.size.sm,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
};
