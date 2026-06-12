import React, { startTransition, useDeferredValue, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, SectionHeader } from '@/components/ui';
import { useFeatureFlags } from '@/features/coach/hooks/useFeatureFlags';
import { isNutritionLocalDatabaseSupported } from '@/features/nutrition/db/nutritionDatabase';
import {
  FoodSearchSheet,
  MacroSummaryHeader,
  ManualMealSheet,
  EMPTY_MANUAL_FORM,
  MealSection,
  WaterTracker,
} from '@/features/nutrition/components';
import type { ManualMealForm } from '@/features/nutrition/components';
import { useDailyNutrition } from '@/features/nutrition/hooks/useDailyNutrition';
import { useFoodSearch } from '@/features/nutrition/hooks/useFoodSearch';
import { useNutritionActions } from '@/features/nutrition/hooks/useNutritionActions';
import {
  calculateFoodLogNutrients,
  getDefaultFoodPortion,
} from '@/features/nutrition/utils/foodCalculations';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type {
  CreateFoodLogInput,
  FavoriteFood,
  FoodSearchResult,
  MealTime,
  RecentFood,
} from '@/types/app';
import { mealTimeLabel } from '@/utils/helpers';

type AddMode = 'search' | 'manual';

const MEAL_SECTION_ORDER: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function parseNumber(value: string): number | null {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function favoriteToMealInput(favorite: FavoriteFood, mealTime: MealTime): CreateFoodLogInput {
  return {
    meal_name: favorite.food_name,
    calories: favorite.calories,
    protein_g: favorite.protein_g,
    carbs_g: favorite.carbs_g,
    fat_g: favorite.fat_g,
    meal_time: mealTime,
    notes: null,
    source: favorite.source,
    source_food_id: favorite.source_food_id,
    custom_food_id: favorite.custom_food_id,
    quantity: 1,
    serving_label: favorite.default_serving_label,
    serving_grams: favorite.default_serving_grams,
    is_custom: favorite.source === 'manual',
  };
}

function recentToMealInput(food: RecentFood): CreateFoodLogInput {
  return {
    meal_name: food.meal_name,
    calories: food.calories,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fat_g: food.fat_g,
    meal_time: food.meal_time,
    notes: null,
    source: food.source,
    source_food_id: food.source_food_id,
    custom_food_id: food.custom_food_id,
    quantity: food.quantity,
    serving_label: food.serving_label,
    serving_grams: food.serving_grams,
    is_custom: food.is_custom,
  };
}

export default function NutritionScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id;
  const { data: featureFlags } = useFeatureFlags();
  const isFoodSearchEnabled =
    (featureFlags?.food_search_enabled ?? false) && isNutritionLocalDatabaseSupported();
  const { data: nutritionSummary } = useDailyNutrition(userId);
  const { addMeal, deleteMeal, saveCustomFood, toggleFavorite, addWater } =
    useNutritionActions(userId);
  const [showModal, setShowModal] = useState(false);
  const [activeMode, setActiveMode] = useState<AddMode>('manual');
  const [manualForm, setManualForm] = useState<ManualMealForm>(EMPTY_MANUAL_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [selectedPortionId, setSelectedPortionId] = useState<string | null>(null);
  const [searchQuantity, setSearchQuantity] = useState('1');
  const [searchMealTime, setSearchMealTime] = useState<MealTime>('snack');

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const searchResults = useFoodSearch(
    userId,
    deferredSearchQuery,
    showModal && activeMode === 'search' && isFoodSearchEnabled,
  );

  const meals = nutritionSummary?.meals ?? [];
  const favoriteFoods = nutritionSummary?.favorite_foods ?? [];
  const recentFoods = nutritionSummary?.recent_foods ?? [];
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

  const selectedPortion =
    selectedFood == null
      ? null
      : (selectedFood.portions.find((portion) => portion.id === selectedPortionId) ??
        getDefaultFoodPortion(selectedFood));
  const selectedQuantity = parseNumber(searchQuantity) ?? 1;
  const selectedPreview =
    selectedFood && selectedPortion
      ? calculateFoodLogNutrients(selectedFood, selectedPortion, selectedQuantity)
      : null;

  const mealsByTime = MEAL_SECTION_ORDER.map((mealTime) => ({
    mealTime,
    meals: meals.filter((meal) => meal.meal_time === mealTime),
  }));

  const openAddModal = () => {
    setShowModal(true);
    setActiveMode(isFoodSearchEnabled ? 'search' : 'manual');
  };

  const closeAddModal = () => {
    setShowModal(false);
    setSearchQuery('');
    setSelectedFood(null);
    setSelectedPortionId(null);
    setSearchQuantity('1');
    setSearchMealTime('snack');
    setManualForm(EMPTY_MANUAL_FORM);
  };

  const handleSaveManualMeal = async () => {
    if (!manualForm.meal_name.trim() || !manualForm.calories) {
      return;
    }

    const calories = parseNumber(manualForm.calories);

    if (calories == null) {
      return;
    }

    const servingGrams = parseNumber(manualForm.default_serving_grams);
    const customFood = manualForm.save_as_custom
      ? await saveCustomFood.mutateAsync({
          name: manualForm.meal_name.trim(),
          calories,
          protein_g: parseNumber(manualForm.protein_g),
          carbs_g: parseNumber(manualForm.carbs_g),
          fat_g: parseNumber(manualForm.fat_g),
          default_serving_label: manualForm.default_serving_label.trim() || '1 serving',
          default_serving_grams: servingGrams,
        })
      : null;

    await addMeal.mutateAsync({
      meal_name: manualForm.meal_name.trim(),
      calories,
      protein_g: parseNumber(manualForm.protein_g),
      carbs_g: parseNumber(manualForm.carbs_g),
      fat_g: parseNumber(manualForm.fat_g),
      meal_time: manualForm.meal_time,
      notes: null,
      source: 'manual',
      source_food_id: null,
      custom_food_id: customFood?.id ?? null,
      quantity: 1,
      serving_label: manualForm.save_as_custom ? manualForm.default_serving_label.trim() : null,
      serving_grams: manualForm.save_as_custom ? servingGrams : null,
      is_custom: Boolean(customFood),
    });

    closeAddModal();
  };

  const handleSelectFood = (food: FoodSearchResult) => {
    startTransition(() => {
      setSelectedFood(food);
      setSelectedPortionId(getDefaultFoodPortion(food).id);
      setSearchQuantity('1');
    });
  };

  const handleSaveSearchMeal = async () => {
    if (!selectedFood || !selectedPortion || !selectedPreview) {
      return;
    }

    await addMeal.mutateAsync({
      meal_name: selectedFood.name,
      calories: selectedPreview.calories,
      protein_g: selectedPreview.protein_g,
      carbs_g: selectedPreview.carbs_g,
      fat_g: selectedPreview.fat_g,
      meal_time: searchMealTime,
      notes: null,
      source: selectedFood.source,
      source_food_id: selectedFood.source_food_id,
      custom_food_id: selectedFood.custom_food_id,
      quantity: selectedQuantity,
      serving_label: selectedPortion.label,
      serving_grams: selectedPreview.serving_grams,
      is_custom: selectedFood.is_custom,
    });

    closeAddModal();
  };

  const handleToggleSelectedFavorite = async () => {
    if (!selectedFood) {
      return;
    }

    await toggleFavorite.mutateAsync({
      source: selectedFood.source,
      source_food_id: selectedFood.source_food_id,
      custom_food_id: selectedFood.custom_food_id,
      food_name: selectedFood.name,
      category: selectedFood.category,
      calories: selectedFood.default_nutrients.calories,
      protein_g: selectedFood.default_nutrients.protein_g,
      carbs_g: selectedFood.default_nutrients.carbs_g,
      fat_g: selectedFood.default_nutrients.fat_g,
      default_serving_label: selectedFood.default_serving_label,
      default_serving_grams: selectedFood.default_serving_grams,
    });

    if (selectedFood) {
      setSelectedFood({
        ...selectedFood,
        is_favorite: !selectedFood.is_favorite,
      });
    }
  };

  const handleLogRecentFood = async (food: RecentFood) => {
    await addMeal.mutateAsync(recentToMealInput(food));
  };

  const handleLogFavoriteFood = async (food: FavoriteFood) => {
    await addMeal.mutateAsync(favoriteToMealInput(food, 'snack'));
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
      source: 'manual',
      source_food_id: null,
      custom_food_id: null,
      quantity: 1,
      serving_label: null,
      serving_grams: null,
      is_custom: false,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
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
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <MacroSummaryHeader
            totalCal={totalCal}
            calorieGoal={calorieGoal}
            totalProtein={totalProtein}
            proteinGoal={proteinGoal}
            totalCarbs={totalCarbs}
            carbGoal={carbGoal}
            totalFat={totalFat}
            fatGoal={fatGoal}
          />

          <WaterTracker
            waterTotal={waterTotal}
            waterGoal={waterGoal}
            isAdding={addWater.isPending}
            onAddWater={(amountMl) => addWater.mutate(amountMl)}
          />

          <SectionHeader title="Favorites" />
          <View style={styles.quickRow}>
            {favoriteFoods.length === 0 ? (
              <Card style={styles.emptyQuickCard}>
                <Text style={styles.emptyQuickText}>
                  Star searched foods to keep your fastest go-to meals here.
                </Text>
              </Card>
            ) : (
              favoriteFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.quickChip}
                  activeOpacity={0.85}
                  onPress={() => handleLogFavoriteFood(food)}
                >
                  <Text style={styles.quickChipName} numberOfLines={1}>
                    {food.food_name}
                  </Text>
                  <Text style={styles.quickChipMeta}>
                    {food.calories} kcal • {food.default_serving_label ?? '1 serving'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <SectionHeader title="Quick Add" action="+ 200 kcal" onAction={handleQuickAddCalories} />
          <View style={styles.quickRow}>
            {recentFoods.length === 0 ? (
              <Card style={styles.emptyQuickCard}>
                <Text style={styles.emptyQuickText}>
                  Log a few foods and your repeat options will show up here.
                </Text>
              </Card>
            ) : (
              recentFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.quickChip}
                  activeOpacity={0.85}
                  onPress={() => handleLogRecentFood(food)}
                >
                  <Text style={styles.quickChipName} numberOfLines={1}>
                    {food.meal_name}
                  </Text>
                  <Text style={styles.quickChipMeta}>
                    {food.calories} kcal • {food.serving_label ?? mealTimeLabel(food.meal_time)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <SectionHeader title="Today's Diary" action="+ Add" onAction={openAddModal} />

          {mealsByTime.map((section) => (
            <MealSection
              key={section.mealTime}
              mealTime={section.mealTime}
              meals={section.meals}
              onDeleteMeal={(mealId) => deleteMeal.mutate(mealId)}
            />
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeAddModal}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Meal</Text>
              <TouchableOpacity onPress={closeAddModal}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modeTabs}>
              {isFoodSearchEnabled ? (
                <TouchableOpacity
                  style={[styles.modeTab, activeMode === 'search' && styles.modeTabActive]}
                  onPress={() => setActiveMode('search')}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      activeMode === 'search' && styles.modeTabTextActive,
                    ]}
                  >
                    Search
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={[styles.modeTab, activeMode === 'manual' && styles.modeTabActive]}
                onPress={() => setActiveMode('manual')}
              >
                <Text
                  style={[styles.modeTabText, activeMode === 'manual' && styles.modeTabTextActive]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {activeMode === 'search' && isFoodSearchEnabled ? (
                <FoodSearchSheet
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  searchResults={searchResults}
                  favoriteFoods={favoriteFoods}
                  recentFoods={recentFoods}
                  selectedFood={selectedFood}
                  onSelectFood={handleSelectFood}
                  selectedPortion={selectedPortion}
                  selectedPortionId={selectedPortionId}
                  onSelectPortion={setSelectedPortionId}
                  searchQuantity={searchQuantity}
                  onSearchQuantityChange={setSearchQuantity}
                  searchMealTime={searchMealTime}
                  onSearchMealTimeChange={setSearchMealTime}
                  selectedPreview={selectedPreview}
                  onToggleFavorite={handleToggleSelectedFavorite}
                  onSaveMeal={handleSaveSearchMeal}
                  onLogFavoriteFood={handleLogFavoriteFood}
                  onLogRecentFood={handleLogRecentFood}
                  isSaving={addMeal.isPending}
                />
              ) : (
                <ManualMealSheet
                  manualForm={manualForm}
                  onFormChange={setManualForm}
                  isSaving={addMeal.isPending || saveCustomFood.isPending}
                  isFoodSearchEnabled={isFoodSearchEnabled}
                  onSave={handleSaveManualMeal}
                />
              )}
              <View style={{ height: 60 }} />
            </ScrollView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  makeStyles({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
    },
    screenTitle: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    dateLabel: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    addBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.lg,
      backgroundColor: colors.accent,
    },
    addBtnText: {
      color: Colors.white,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    scroll: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: 40 },
    quickRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.xxl,
    },
    emptyQuickCard: {
      flex: 1,
    },
    emptyQuickText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    quickChip: {
      flex: 1,
      borderRadius: Radius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.md,
      gap: 4,
    },
    quickChipName: {
      color: colors.text,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
    },
    quickChipMeta: {
      color: colors.muted,
      fontSize: Typography.size.xs,
    },
    modal: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    modalTitle: {
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    modalClose: {
      color: colors.accent,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
    },
    modeTabs: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    modeTab: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    modeTabActive: {
      borderColor: colors.accent,
      backgroundColor: `${colors.accent}18`,
    },
    modeTabText: {
      color: colors.muted,
      fontWeight: Typography.weight.bold,
    },
    modeTabTextActive: {
      color: colors.accent,
    },
    modalScroll: {
      flex: 1,
    },
  });

/** Preserves literal types for React Native style objects, replacing StyleSheet.create. */
function makeStyles<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T {
  return styles;
}
