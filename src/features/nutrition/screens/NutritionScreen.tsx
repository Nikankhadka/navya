import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { Card, SectionHeader } from '@/components/ui';
import { MacroRing, ProgressBar } from '@/components/shared/MacroRing';
import { formatTime, formatWaterAmount, mealTimeLabel } from '@/utils/helpers';
import type { FoodLog, RecentMealTemplate } from '@/types/app';
import { useAuthStore } from '@/store/useAuthStore';
import { useDailyNutrition } from '@/features/nutrition';
import { useNutritionActions } from '@/features/nutrition';

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
  { label: '+250ml', amountMl: 250 },
  { label: '+500ml', amountMl: 500 },
  { label: '+750ml', amountMl: 750 },
];

const MEAL_SECTION_ORDER: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

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

  const mealsByTime = MEAL_SECTION_ORDER.map((mealTime) => ({
    mealTime,
    meals: meals.filter((meal) => meal.meal_time === mealTime),
  }));

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
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
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.macroCard}>
            <View style={styles.ringRow}>
              <MacroRing
                value={totalCal}
                max={calorieGoal}
                size={85}
                color={Colors.orange}
                label="Calories"
                unit=" kcal"
              />
              <MacroRing
                value={totalProtein}
                max={proteinGoal}
                size={85}
                color={Colors.accent}
                label="Protein"
                unit="g"
              />
              <MacroRing
                value={totalCarbs}
                max={carbGoal}
                size={85}
                color={Colors.green}
                label="Carbs"
                unit="g"
              />
              <MacroRing
                value={totalFat}
                max={fatGoal}
                size={85}
                color={Colors.blue}
                label="Fat"
                unit="g"
              />
            </View>

            <View
              style={[
                styles.remainingBanner,
                {
                  backgroundColor:
                    remaining >= 0 ? Colors.greenMuted : Colors.redMuted,
                },
              ]}
            >
              <Text
                style={[
                  styles.remainingText,
                  { color: remaining >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {remaining >= 0 ? '+' : ''}
                {remaining} kcal remaining today
              </Text>
            </View>
          </Card>

          <SectionHeader title="Hydration" />
          <Card style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <View>
                <Text style={styles.waterValue}>{formatWaterAmount(waterTotal)}</Text>
                <Text style={styles.waterMeta}>
                  of {formatWaterAmount(waterGoal)} target
                </Text>
              </View>
              <View style={styles.waterBadge}>
                <Text style={styles.waterBadgeText}>Daily habit</Text>
              </View>
            </View>
            <ProgressBar
              value={waterTotal}
              max={waterGoal}
              color={Colors.blue}
              height={6}
              showLabel={false}
            />
            <View style={styles.waterActions}>
              {QUICK_ADD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={styles.waterAction}
                  activeOpacity={0.85}
                  disabled={addWater.isPending}
                  onPress={() => addWater.mutate(option.amountMl)}
                >
                  <Text style={styles.waterActionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <SectionHeader
            title="Quick Add"
            action="+ 200 kcal"
            onAction={handleQuickAddCalories}
          />
          <View style={styles.recentMealsRow}>
            {recentMeals.length === 0 ? (
              <Card style={styles.emptyRecentCard}>
                <Text style={styles.emptyRecentText}>
                  Log a few meals and your fastest repeat options will appear here.
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

          <SectionHeader
            title="Today's Diary"
            action="+ Add"
            onAction={() => setShowModal(true)}
          />

          {mealsByTime.map((section) => (
            <View key={section.mealTime} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <Text style={styles.mealSectionTitle}>
                  {mealTimeLabel(section.mealTime)}
                </Text>
                <Text style={styles.mealSectionMeta}>
                  {section.meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                </Text>
              </View>

              {section.meals.length === 0 ? (
                <View style={styles.emptyMealSection}>
                  <Text style={styles.emptyMealSectionText}>
                    Nothing logged yet
                  </Text>
                </View>
              ) : (
                <View style={styles.mealList}>
                  {section.meals.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.mealRow}
                      activeOpacity={0.85}
                      onLongPress={() => deleteMeal.mutate(meal.id)}
                    >
                      <View style={styles.mealLeft}>
                        <Text style={styles.mealName}>{meal.meal_name}</Text>
                        <Text style={styles.mealTimestamp}>
                          {formatTime(meal.logged_at)}
                        </Text>
                      </View>
                      <View style={styles.mealRight}>
                        <Text style={styles.mealCal}>{meal.calories}</Text>
                        <Text style={styles.mealCalLabel}>kcal</Text>
                        <Text style={styles.mealMacroLine}>
                          {meal.protein_g ?? 0}P • {meal.carbs_g ?? 0}C • {meal.fat_g ?? 0}F
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Meal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Meal Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chicken Rice Bowl"
                placeholderTextColor={Colors.dim}
                value={form.meal_name}
                onChangeText={(v: string) => setForm((f) => ({ ...f, meal_name: v }))}
                testID="nutrition-meal-name-input"
              />

              <Text style={styles.fieldLabel}>Calories *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 450"
                placeholderTextColor={Colors.dim}
                keyboardType="numeric"
                value={form.calories}
                onChangeText={(v: string) => setForm((f) => ({ ...f, calories: v }))}
              />

              <View style={styles.macroInputRow}>
                <View style={styles.macroInput}>
                  <Text style={styles.fieldLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.dim}
                    keyboardType="numeric"
                    value={form.protein_g}
                    onChangeText={(v: string) => setForm((f) => ({ ...f, protein_g: v }))}
                  />
                </View>
                <View style={styles.macroInput}>
                  <Text style={styles.fieldLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.dim}
                    keyboardType="numeric"
                    value={form.carbs_g}
                    onChangeText={(v: string) => setForm((f) => ({ ...f, carbs_g: v }))}
                  />
                </View>
                <View style={styles.macroInput}>
                  <Text style={styles.fieldLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.dim}
                    keyboardType="numeric"
                    value={form.fat_g}
                    onChangeText={(v: string) => setForm((f) => ({ ...f, fat_g: v }))}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Meal Time</Text>
              <View style={styles.mealTimeRow}>
                {MEAL_SECTION_ORDER.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.mealTimePill,
                      form.meal_time === t && styles.mealTimePillActive,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, meal_time: t }))}
                  >
                    <Text
                      style={[
                        styles.mealTimePillText,
                        form.meal_time === t && styles.mealTimePillTextActive,
                      ]}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.logBtn,
                  (!form.meal_name || !form.calories) && styles.logBtnDisabled,
                ]}
                onPress={handleAddMeal}
                disabled={!form.meal_name || !form.calories}
                activeOpacity={0.85}
                testID="nutrition-save-meal"
              >
                <Text style={styles.logBtnText}>Save Meal</Text>
              </TouchableOpacity>

              <View style={{ height: 60 }} />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  dateLabel: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  macroCard: { marginBottom: Spacing.xxl },
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  remainingBanner: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  remainingText: {
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  waterCard: {
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  waterValue: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
  },
  waterMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  waterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.blue + '22',
    borderWidth: 1,
    borderColor: Colors.blue + '44',
  },
  waterBadgeText: {
    color: Colors.blue,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.xs,
  },
  waterActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  waterAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waterActionText: {
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
  },
  recentMealsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  emptyRecentCard: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyRecentText: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  recentMealChip: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  recentMealName: {
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.sm,
    marginBottom: 6,
  },
  recentMealMeta: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
  },
  mealSection: {
    marginBottom: Spacing.lg,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mealSectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  mealSectionMeta: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  emptyMealSection: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  emptyMealSectionText: {
    color: Colors.dim,
    fontSize: Typography.size.sm,
  },
  mealList: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealLeft: { flex: 1, gap: 2 },
  mealName: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  mealTimestamp: { color: Colors.dim, fontSize: Typography.size.xs },
  mealRight: { alignItems: 'flex-end', gap: 4 },
  mealCal: {
    color: Colors.orange,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  mealCalLabel: { color: Colors.muted, fontSize: Typography.size.xs },
  mealMacroLine: { color: Colors.accent, fontSize: Typography.size.xs },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  modalClose: { color: Colors.muted, fontSize: Typography.size.xl, padding: 4 },
  modalScroll: { padding: Spacing.xl },
  fieldLabel: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: Typography.size.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
  },
  macroInputRow: { flexDirection: 'row', gap: Spacing.sm },
  macroInput: { flex: 1 },
  mealTimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  mealTimePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  mealTimePillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  mealTimePillText: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  mealTimePillTextActive: {
    color: '#fff',
  },
  logBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.accent,
    paddingVertical: 15,
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  logBtnDisabled: {
    opacity: 0.45,
  },
  logBtnText: {
    color: '#fff',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
});
