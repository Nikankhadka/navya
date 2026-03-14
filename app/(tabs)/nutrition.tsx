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
import { Colors, Spacing, Radius, Typography } from '../../src/lib/theme';
import { Card, Button, SectionHeader } from '../../src/components/ui';
import { MacroRing } from '../../src/components/ui/MacroRing';
import { MOCK_DAILY_NUTRITION } from '../../src/lib/mockData';
import { formatTime, mealTimeLabel } from '../../src/utils/helpers';
import type { FoodLog } from '../../src/types/app';

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

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [meals, setMeals] = useState<FoodLog[]>(MOCK_DAILY_NUTRITION.meals);
  const [totalCal, setTotalCal] = useState(MOCK_DAILY_NUTRITION.total_calories);
  const [totalProtein, setTotalProtein] = useState(MOCK_DAILY_NUTRITION.total_protein_g);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewMealForm>(EMPTY_FORM);

  const handleAddMeal = () => {
    if (!form.meal_name.trim() || !form.calories) return;
    const newMeal: FoodLog = {
      id: `meal-${Date.now()}`,
      user_id: 'mock-user-1',
      meal_name: form.meal_name,
      calories: Number(form.calories),
      protein_g: form.protein_g ? Number(form.protein_g) : null,
      carbs_g: form.carbs_g ? Number(form.carbs_g) : null,
      fat_g: form.fat_g ? Number(form.fat_g) : null,
      meal_time: form.meal_time,
      logged_at: new Date().toISOString(),
      notes: null,
    };
    setMeals((prev) => [newMeal, ...prev]);
    setTotalCal((c) => c + Number(form.calories));
    setTotalProtein((p) => p + (form.protein_g ? Number(form.protein_g) : 0));
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const calorieGoal = MOCK_DAILY_NUTRITION.calorie_goal;
  const proteinGoal = MOCK_DAILY_NUTRITION.protein_goal_g;
  const carbGoal = 240;
  const fatGoal = 70;
  const remaining = calorieGoal - totalCal;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
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
          {/* Macro rings */}
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
                value={MOCK_DAILY_NUTRITION.total_carbs_g}
                max={carbGoal}
                size={85}
                color={Colors.green}
                label="Carbs"
                unit="g"
              />
              <MacroRing
                value={MOCK_DAILY_NUTRITION.total_fat_g}
                max={fatGoal}
                size={85}
                color={Colors.blue}
                label="Fat"
                unit="g"
              />
            </View>

            {/* Remaining */}
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
                {remaining >= 0 ? '+' : ''}{remaining} kcal remaining today
              </Text>
            </View>
          </Card>

          {/* Meals */}
          <SectionHeader
            title="Today's Meals"
            action="+ Add"
            onAction={() => setShowModal(true)}
          />

          {meals.length === 0 ? (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No meals logged yet</Text>
            </View>
          ) : (
            <View style={styles.mealList}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealRow}>
                  <View style={styles.mealLeft}>
                    <Text style={styles.mealTimeLabel}>
                      {mealTimeLabel(meal.meal_time)}
                    </Text>
                    <Text style={styles.mealName}>{meal.meal_name}</Text>
                    <Text style={styles.mealTimestamp}>
                      {formatTime(meal.logged_at)}
                    </Text>
                  </View>
                  <View style={styles.mealRight}>
                    <Text style={styles.mealCal}>{meal.calories}</Text>
                    <Text style={styles.mealCalLabel}>kcal</Text>
                    {meal.protein_g != null && (
                      <Text style={styles.mealProtein}>{meal.protein_g}g protein</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Meal Modal */}
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
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealTime[]).map((t) => (
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
              >
                <Text style={styles.logBtnText}>Log Meal</Text>
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

  emptyMeals: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: Colors.muted, fontSize: Typography.size.md },

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
  mealTimeLabel: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  mealName: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  mealTimestamp: { color: Colors.dim, fontSize: Typography.size.xs },
  mealRight: { alignItems: 'flex-end' },
  mealCal: {
    color: Colors.orange,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  mealCalLabel: { color: Colors.muted, fontSize: Typography.size.xs },
  mealProtein: { color: Colors.accent, fontSize: Typography.size.xs, marginTop: 2 },

  // Modal
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
  mealTimePillText: { color: Colors.muted, fontSize: Typography.size.sm },
  mealTimePillTextActive: { color: '#fff', fontWeight: Typography.weight.bold },
  logBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logBtnDisabled: { opacity: 0.4 },
  logBtnText: {
    color: '#fff',
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
});
