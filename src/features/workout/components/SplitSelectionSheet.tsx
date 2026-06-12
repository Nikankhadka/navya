import React, { useState } from 'react';
import { Modal, Pressable, Text, View, ScrollView } from 'react-native';
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
  Typography,
  useAppTheme,
  type ThemeColors,
} from '@/theme';
import { SPLIT_TEMPLATES, type SplitTemplate } from '@/features/workout/data/splitTemplates';

export interface SplitSelectionSheetProps {
  visible: boolean;
  onSelect: (template: SplitTemplate) => void;
  onClose: () => void;
}

export function SplitSelectionSheet({ visible, onSelect, onClose }: SplitSelectionSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (template: SplitTemplate) => {
    setSelectedId(template.id);
    onSelect(template);
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'beginner') return colors.green;
    if (difficulty === 'intermediate') return colors.orange;
    return colors.red;
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Split</Text>
              <Text style={styles.subtitle}>
                Select a training program that matches your goals and schedule
              </Text>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {SPLIT_TEMPLATES.map((template) => {
                const isSelected = selectedId === template.id;
                return (
                  <Pressable
                    key={template.id}
                    style={[
                      styles.templateCard,
                      {
                        backgroundColor: isSelected ? colors.accentMuted : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleSelect(template)}
                  >
                    <View style={styles.templateHeader}>
                      <View style={styles.templateIconRow}>
                        <Text style={styles.templateIcon}>{template.icon}</Text>
                        <View>
                          <Text style={styles.templateName}>{template.name}</Text>
                          <Text style={styles.templateDesc}>{template.description}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.templateStats}>
                      <View style={styles.statChip}>
                        <Text style={styles.statLabel}>{template.daysPerWeek} days/wk</Text>
                      </View>
                      <View
                        style={[
                          styles.statChip,
                          { backgroundColor: `${getDifficultyColor(template.difficulty)}22` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statLabel,
                            { color: getDifficultyColor(template.difficulty) },
                          ]}
                        >
                          {template.difficulty}
                        </Text>
                      </View>
                      <View style={styles.statChip}>
                        <Text style={styles.statLabel}>
                          {template.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercises
                        </Text>
                      </View>
                    </View>

                    <View style={styles.daysPreview}>
                      {template.days.map((day) => (
                        <View key={day.dayName} style={styles.dayRow}>
                          <Text style={styles.dayName}>{day.dayName}</Text>
                          <Text style={styles.dayFocus}>{day.focusAreas.join(', ')}</Text>
                        </View>
                      ))}
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  ({
    backdrop: { flex: 1 },
    backdropPressable: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end' as const,
    },
    sheet: {
      height: '85%',
      borderTopLeftRadius: Radius.xxl,
      borderTopRightRadius: Radius.xxl,
      ...Shadow.md,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center' as const,
      marginTop: Spacing.md,
    },
    header: {
      padding: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    title: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: Spacing.xl,
      paddingTop: 0,
      gap: Spacing.md,
      paddingBottom: Spacing.xxxl,
    },
    templateCard: {
      borderRadius: Radius.xl,
      borderWidth: 1,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    templateHeader: {
      gap: Spacing.sm,
    },
    templateIconRow: {
      flexDirection: 'row' as const,
      gap: Spacing.md,
      alignItems: 'center' as const,
    },
    templateIcon: {
      fontSize: 32,
    },
    templateName: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    templateDesc: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
      lineHeight: 18,
    },
    templateStats: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      flexWrap: 'wrap' as const,
    },
    statChip: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: Typography.weight.semibold,
      textTransform: 'capitalize' as const,
    },
    daysPreview: {
      gap: Spacing.xs,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dayRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    dayName: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    dayFocus: {
      color: colors.dim,
      fontSize: Typography.size.xs,
      maxWidth: '60%' as const,
      textAlign: 'right' as const,
    },
    selectedBadge: {
      position: 'absolute' as const,
      top: Spacing.md,
      right: Spacing.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    selectedBadgeText: {
      color: Colors.white,
      fontSize: 10,
      fontWeight: Typography.weight.bold,
    },
  }) as const;
