import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Input,
  QuickActionChip,
  SectionHeader,
  SheetHandle,
} from '../../src/components/ui';
import { MacroRing, ProgressBar } from '../../src/components/ui/MacroRing';
import { Colors, Radius, Spacing, Typography, withAlpha } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useDailyNutrition } from '../../src/hooks/useDailyNutrition';
import { useNutritionActions } from '../../src/hooks/useNutritionActions';
import { formatTime, formatWaterAmount, mealTimeLabel } from '../../src/utils/helpers';
import { crossAlert } from '../../src/utils/crossAlert';
import type { FoodLog, RecentMealTemplate } from '../../src/types/app';

type MealTime = FoodLog['meal_time'];

interface NewMealForm {
  meal_name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  meal_time: MealTime;
}

const EMPTY_FORM: NewMealForm = {
  meal_name: '',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
  meal_time: 'snack',
};

const QUICK_ADD_OPTIONS = [
  { label: '+250 ml', amountMl: 250 },
  { label: '+500 ml', amountMl: 500 },
  { label: '+750 ml', amountMl: 750 },
];

const MEAL_SECTION_ORDER: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_CHOICES: Array<{ id: MealTime; label: string }> = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { data: nutritionSummary } = useDailyNutrition(user?.id);
  const { addMeal, deleteMeal, addWater } = useNutritionActions(user?.id);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewMealForm>(EMPTY_FORM);

  const meals = nutritionSummary?.meals ?? [];
  const totalCal = nutritionSummary?.total_calories ?? 0;
  const totalProtein = nutritionSummary?.total_protein_g ?? 0;
  const totalCarbs = nutritionSummary?.total_carbs_g ?? 0;
  const totalFat = nutritionSummary?.total_fat_g ?? 0;
  const calorieGoal = nutritionSummary?.calorie_goal ?? 2200;
  const proteinGoal = nutritionSummary?.protein_goal_g ?? 140;
  const carbGoal = 240;
  const fatGoal = 70;
  const waterTotal = nutritionSummary?.water_total_ml ?? 0;
  const waterGoal = nutritionSummary?.water_goal_ml ?? 2500;
  const recentMeals = nutritionSummary?.recent_meals ?? [];
  const remaining = calorieGoal - totalCal;

  const mealsByTime = useMemo(
    () =>
      MEAL_SECTION_ORDER.map((mealTime) => ({
        mealTime,
        meals: meals.filter((meal) => meal.meal_time === mealTime),
      })),
    [meals],
  );

  const handleAddMeal = async () => {
    if (!form.meal_name.trim() || !form.calories) {
      return;
    }

    await addMeal.mutateAsync({
      meal_name: form.meal_name.trim(),
      calories: Number(form.calories),
      protein_g: form.protein_g ? Number(form.protein_g) : null,
      carbs_g: form.carbs_g ? Number(form.carbs_g) : null,
      fat_g: form.fat_g ? Number(form.fat_g) : null,
      meal_time: form.meal_time,
      notes: null,
    });

    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const handleLogRecentMeal = async (meal: RecentMealTemplate) => {
    await addMeal.mutateAsync({
      meal_name: meal.meal_name,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      meal_time: meal.meal_time,
      notes: null,
    });
  };

  const handleQuickAddCalories = async () => {
    await addMeal.mutateAsync({
      meal_name: 'Quick Add Calories',
      calories: 200,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      meal_time: 'snack',
      notes: 'Quick add',
    });
  };

  const handleDeleteMeal = (meal: FoodLog) => {
    crossAlert('Remove this meal?', `${meal.meal_name} will be removed from today’s diary.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMeal.mutate(meal.id);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboard}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Nutrition</Text>
            <Text style={styles.dateLabel}>
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <Button label="Log Meal" size="sm" onPress={() => setShowModal(true)} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: 128 + Math.max(insets.bottom, 0) }]}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="hero" style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Today’s diary</Text>
            <View style={styles.ringRow}>
              <MacroRing value={totalCal} max={calorieGoal} color={Colors.orange} label="Calories" unit=" kcal" />
              <MacroRing value={totalProtein} max={proteinGoal} color={Colors.accent} label="Protein" unit="g" />
              <MacroRing value={totalCarbs} max={carbGoal} color={Colors.green} label="Carbs" unit="g" />
              <MacroRing value={totalFat} max={fatGoal} color={Colors.blue} label="Fat" unit="g" />
            </View>
            <View
              style={[
                styles.remainingBanner,
                { backgroundColor: remaining >= 0 ? Colors.greenMuted : Colors.redMuted },
              ]}
            >
              <Text
                style={[
                  styles.remainingText,
                  { color: remaining >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {remaining >= 0 ? '+' : ''}
                {remaining} kcal {remaining >= 0 ? 'remaining' : 'over goal'}
              </Text>
            </View>
          </Card>

          <SectionHeader title="Hydration" action="Quick add" />
          <Card style={styles.waterCard}>
            <View style={styles.waterTopRow}>
              <View>
                <Text style={styles.waterValue}>{formatWaterAmount(waterTotal)}</Text>
                <Text style={styles.waterMeta}>of {formatWaterAmount(waterGoal)} target</Text>
              </View>
              <QuickActionChip label="River Blue" tone="water" />
            </View>
            <ProgressBar value={waterTotal} max={waterGoal} color={Colors.blue} height={8} />
            <View style={styles.waterActions}>
              {QUICK_ADD_OPTIONS.map((option) => (
                <QuickActionChip
                  key={option.label}
                  label={option.label}
                  tone="water"
                  onPress={() => addWater.mutate(option.amountMl)}
                />
              ))}
            </View>
          </Card>

          <SectionHeader title="Quick Add" action="+ 200 kcal" onAction={handleQuickAddCalories} />
          <View style={styles.recentMealsRow}>
            {recentMeals.length === 0 ? (
              <Card style={styles.emptyRecentCard}>
                <Text style={styles.emptyRecentText}>
                  Repeat meals will appear here after you log a few entries.
                </Text>
              </Card>
            ) : (
              recentMeals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.recentMealChip}
                  activeOpacity={0.85}
                  onPress={() => handleLogRecentMeal(meal)}
                >
                  <Text style={styles.recentMealName} numberOfLines={1}>
                    {meal.meal_name}
                  </Text>
                  <Text style={styles.recentMealMeta}>
                    {meal.calories} kcal • {mealTimeLabel(meal.meal_time).replace(/^[^\s]+\s/, '')}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <SectionHeader title="Today’s Diary" action="+ Add" onAction={() => setShowModal(true)} />

          {mealsByTime.map((section) => (
            <View key={section.mealTime} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <Text style={styles.mealSectionTitle}>{mealTimeLabel(section.mealTime)}</Text>
                <Text style={styles.mealSectionMeta}>
                  {section.meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                </Text>
              </View>

              {section.meals.length === 0 ? (
                <Card style={styles.emptyMealSection}>
                  <Text style={styles.emptyMealSectionText}>Nothing logged yet.</Text>
                </Card>
              ) : (
                <View style={styles.mealList}>
                  {section.meals.map((meal) => (
                    <Card key={meal.id} style={styles.mealRow}>
                      <View style={styles.mealRowTop}>
                        <View style={styles.mealLeft}>
                          <Text style={styles.mealName}>{meal.meal_name}</Text>
                          <Text style={styles.mealTimestamp}>{formatTime(meal.logged_at)}</Text>
                        </View>
                        <View style={styles.mealRight}>
                          <Text style={styles.mealCal}>{meal.calories}</Text>
                          <Text style={styles.mealCalLabel}>kcal</Text>
                        </View>
                      </View>
                      <View style={styles.mealFooter}>
                        <Text style={styles.mealMacroLine}>
                          {meal.protein_g ?? 0}P • {meal.carbs_g ?? 0}C • {meal.fat_g ?? 0}F
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteMeal(meal)}
                          activeOpacity={0.82}
                          style={styles.deleteAction}
                        >
                          <Text style={styles.deleteActionText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modal}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[
                styles.modalContent,
                { paddingBottom: Math.max(insets.bottom, 24) + 32 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <SheetHandle />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Log a meal</Text>
                  <Text style={styles.modalSubtitle}>
                    Fast capture for the daily diary. Keep it simple and move on.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Meal Name"
                placeholder="Chicken rice bowl"
                value={form.meal_name}
                onChangeText={(value) => setForm((current) => ({ ...current, meal_name: value }))}
                testID="nutrition-meal-name-input"
              />

              <View style={styles.mealChoiceWrap}>
                {MEAL_CHOICES.map((choice) => (
                  <TouchableOpacity
                    key={choice.id}
                    style={[
                      styles.mealChoice,
                      form.meal_time === choice.id ? styles.mealChoiceActive : null,
                    ]}
                    onPress={() => setForm((current) => ({ ...current, meal_time: choice.id }))}
                    activeOpacity={0.82}
                  >
                    <Text
                      style={[
                        styles.mealChoiceText,
                        form.meal_time === choice.id ? styles.mealChoiceTextActive : null,
                      ]}
                    >
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Calories"
                placeholder="450"
                keyboardType="numeric"
                value={form.calories}
                onChangeText={(value) => setForm((current) => ({ ...current, calories: value }))}
                testID="nutrition-meal-calories-input"
              />

              <View style={styles.macroInputRow}>
                <View style={styles.compactField}>
                  <Input
                    label="Protein"
                    placeholder="30"
                    keyboardType="numeric"
                    value={form.protein_g}
                    onChangeText={(value) => setForm((current) => ({ ...current, protein_g: value }))}
                  />
                </View>
                <View style={styles.compactField}>
                  <Input
                    label="Carbs"
                    placeholder="45"
                    keyboardType="numeric"
                    value={form.carbs_g}
                    onChangeText={(value) => setForm((current) => ({ ...current, carbs_g: value }))}
                  />
                </View>
                <View style={styles.compactField}>
                  <Input
                    label="Fat"
                    placeholder="15"
                    keyboardType="numeric"
                    value={form.fat_g}
                    onChangeText={(value) => setForm((current) => ({ ...current, fat_g: value }))}
                  />
                </View>
              </View>

              <Button
                label={addMeal.isPending ? 'Saving...' : 'Save Meal'}
                fullWidth
                onPress={handleAddMeal}
                disabled={addMeal.isPending}
                testID="nutrition-save-meal"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  dateLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  heroCard: {
    marginBottom: Spacing.xxl,
  },
  heroEyebrow: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  ringRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  remainingBanner: {
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  remainingText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  waterCard: {
    marginBottom: Spacing.xxl,
  },
  waterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  waterValue: {
    color: Colors.text,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  waterMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  waterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  recentMealsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  emptyRecentCard: {
    flex: 1,
    paddingVertical: Spacing.lg,
  },
  emptyRecentText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  recentMealChip: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  recentMealName: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  recentMealMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
  },
  mealSection: {
    marginBottom: Spacing.xxl,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealSectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  mealSectionMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  emptyMealSection: {
    paddingVertical: Spacing.lg,
  },
  emptyMealSectionText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  mealList: {
    gap: Spacing.md,
  },
  mealRow: {
    padding: Spacing.lg,
  },
  mealRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  mealLeft: {
    flex: 1,
  },
  mealName: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  mealTimestamp: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCal: {
    color: Colors.orange,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    fontFamily: Typography.fontDisplay,
  },
  mealCalLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mealFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withAlpha(Colors.borderLight, 0.4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealMacroLine: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  deleteAction: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withAlpha(Colors.red, 0.36),
    backgroundColor: withAlpha(Colors.red, 0.1),
  },
  deleteActionText: {
    color: Colors.red,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.fontDisplay,
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 260,
  },
  modalClose: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  modalCloseText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  mealChoiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  mealChoice: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  mealChoiceActive: {
    borderColor: withAlpha(Colors.orange, 0.42),
    backgroundColor: withAlpha(Colors.orange, 0.12),
  },
  mealChoiceText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  mealChoiceTextActive: {
    color: Colors.orange,
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  compactField: {
    flex: 1,
  },
});
