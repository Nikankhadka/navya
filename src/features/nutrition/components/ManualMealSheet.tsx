import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Button, Card } from '@/components/ui';
import type { MealTime } from '@/types/app';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';

const MEAL_SECTION_ORDER: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface ManualMealForm {
  meal_name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  meal_time: MealTime;
  save_as_custom: boolean;
  default_serving_label: string;
  default_serving_grams: string;
}

export const EMPTY_MANUAL_FORM: ManualMealForm = {
  meal_name: '',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
  meal_time: 'snack',
  save_as_custom: false,
  default_serving_label: '1 serving',
  default_serving_grams: '',
};

export interface ManualMealSheetProps {
  manualForm: ManualMealForm;
  onFormChange: React.Dispatch<React.SetStateAction<ManualMealForm>>;
  isSaving: boolean;
  isFoodSearchEnabled: boolean;
  onSave: () => void;
}

export function ManualMealSheet({
  manualForm,
  onFormChange,
  isSaving,
  isFoodSearchEnabled,
  onSave,
}: ManualMealSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.modalSection}>
      {!isFoodSearchEnabled ? (
        <Card style={styles.searchHintCard}>
          <Text style={styles.searchHintText}>
            Food search is currently feature-flagged off, so manual logging stays available as the
            fallback path.
          </Text>
        </Card>
      ) : null}

      <Text style={styles.fieldLabel}>Meal Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Chicken Rice Bowl"
        placeholderTextColor={colors.inputPlaceholder}
        value={manualForm.meal_name}
        onChangeText={(value) => onFormChange((current) => ({ ...current, meal_name: value }))}
      />

      <Text style={styles.fieldLabel}>Calories *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 450"
        placeholderTextColor={colors.inputPlaceholder}
        keyboardType="numeric"
        value={manualForm.calories}
        onChangeText={(value) => onFormChange((current) => ({ ...current, calories: value }))}
      />

      <View style={styles.macroInputRow}>
        <View style={styles.macroInput}>
          <Text style={styles.fieldLabel}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="numeric"
            value={manualForm.protein_g}
            onChangeText={(value) => onFormChange((current) => ({ ...current, protein_g: value }))}
          />
        </View>
        <View style={styles.macroInput}>
          <Text style={styles.fieldLabel}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="numeric"
            value={manualForm.carbs_g}
            onChangeText={(value) => onFormChange((current) => ({ ...current, carbs_g: value }))}
          />
        </View>
        <View style={styles.macroInput}>
          <Text style={styles.fieldLabel}>Fat (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="numeric"
            value={manualForm.fat_g}
            onChangeText={(value) => onFormChange((current) => ({ ...current, fat_g: value }))}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Meal Time</Text>
      <View style={styles.mealTimeRow}>
        {MEAL_SECTION_ORDER.map((mealTime) => (
          <TouchableOpacity
            key={mealTime}
            style={[
              styles.mealTimePill,
              manualForm.meal_time === mealTime && styles.mealTimePillActive,
            ]}
            onPress={() => onFormChange((current) => ({ ...current, meal_time: mealTime }))}
          >
            <Text
              style={[
                styles.mealTimePillText,
                manualForm.meal_time === mealTime && styles.mealTimePillTextActive,
              ]}
            >
              {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.saveCustomToggle,
          manualForm.save_as_custom && styles.saveCustomToggleActive,
        ]}
        activeOpacity={0.85}
        onPress={() =>
          onFormChange((current) => ({
            ...current,
            save_as_custom: !current.save_as_custom,
          }))
        }
      >
        <Text
          style={[
            styles.saveCustomToggleText,
            manualForm.save_as_custom && styles.saveCustomToggleTextActive,
          ]}
        >
          {manualForm.save_as_custom
            ? '✓ Save as reusable custom food'
            : 'Save as reusable custom food'}
        </Text>
      </TouchableOpacity>

      {manualForm.save_as_custom ? (
        <>
          <Text style={styles.fieldLabel}>Default Serving Label</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1 serving"
            placeholderTextColor={colors.inputPlaceholder}
            value={manualForm.default_serving_label}
            onChangeText={(value) =>
              onFormChange((current) => ({
                ...current,
                default_serving_label: value,
              }))
            }
          />

          <Text style={styles.fieldLabel}>Default Serving Grams</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="decimal-pad"
            value={manualForm.default_serving_grams}
            onChangeText={(value) =>
              onFormChange((current) => ({
                ...current,
                default_serving_grams: value,
              }))
            }
          />
        </>
      ) : null}

      <Button
        label="Save Meal"
        fullWidth
        loading={isSaving}
        disabled={!manualForm.meal_name || !manualForm.calories}
        onPress={onSave}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  makeStyles({
    modalSection: {
      paddingHorizontal: Spacing.xl,
    },
    searchHintCard: {
      marginTop: Spacing.sm,
    },
    searchHintText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    fieldLabel: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
      marginBottom: Spacing.xs,
      marginTop: Spacing.md,
    },
    input: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      color: colors.text,
      fontSize: Typography.size.md,
    },
    macroInputRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    macroInput: {
      flex: 1,
    },
    mealTimeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
      marginBottom: Spacing.md,
    },
    mealTimePill: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    mealTimePillActive: {
      backgroundColor: `${colors.accent}18`,
      borderColor: colors.accent,
    },
    mealTimePillText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
    },
    mealTimePillTextActive: {
      color: colors.accent,
    },
    saveCustomToggle: {
      marginTop: Spacing.sm,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: Spacing.md,
    },
    saveCustomToggleActive: {
      borderColor: colors.accent,
      backgroundColor: `${colors.accent}14`,
    },
    saveCustomToggleText: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
    saveCustomToggleTextActive: {
      color: colors.accent,
    },
  });

/** Preserves literal types for React Native style objects, replacing StyleSheet.create. */
function makeStyles<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T {
  return styles;
}
