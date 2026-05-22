import React, { startTransition, useDeferredValue, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MacroRing, ProgressBar } from '@/components/shared/MacroRing';
import { Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { useFeatureFlags } from '@/features/coach/hooks/useFeatureFlags';
import { isNutritionLocalDatabaseSupported } from '@/features/nutrition/db/nutritionDatabase';
import { useDailyNutrition } from '@/features/nutrition/hooks/useDailyNutrition';
import { useFoodSearch } from '@/features/nutrition/hooks/useFoodSearch';
import { useNutritionActions } from '@/features/nutrition/hooks/useNutritionActions';
import {
  calculateFoodLogNutrients,
  getDefaultFoodPortion,
} from '@/features/nutrition/utils/foodCalculations';
import { useAuthStore } from '@/store/useAuthStore';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import type {
  CreateFoodLogInput,
  FavoriteFood,
  FoodSearchResult,
  MealTime,
  RecentFood,
} from '@/types/app';
import { formatTime, formatWaterAmount, mealTimeLabel } from '@/utils/helpers';

type AddMode = 'search' | 'manual';

interface ManualMealForm {
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

const EMPTY_MANUAL_FORM: ManualMealForm = {
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

const QUICK_ADD_OPTIONS = [
  { label: '+250ml', amountMl: 250 },
  { label: '+500ml', amountMl: 500 },
  { label: '+750ml', amountMl: 750 },
];

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
  const remaining = calorieGoal - totalCal;

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
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.85}>
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
                color={colors.orange}
                label="Calories"
                unit=" kcal"
              />
              <MacroRing
                value={totalProtein}
                max={proteinGoal}
                size={85}
                color={colors.accent}
                label="Protein"
                unit="g"
              />
              <MacroRing
                value={totalCarbs}
                max={carbGoal}
                size={85}
                color={colors.green}
                label="Carbs"
                unit="g"
              />
              <MacroRing
                value={totalFat}
                max={fatGoal}
                size={85}
                color={colors.blue}
                label="Fat"
                unit="g"
              />
            </View>

            <View
              style={[
                styles.remainingBanner,
                { backgroundColor: remaining >= 0 ? colors.greenMuted : colors.redMuted },
              ]}
            >
              <Text
                style={[
                  styles.remainingText,
                  { color: remaining >= 0 ? colors.green : colors.red },
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
                <Text style={styles.waterMeta}>of {formatWaterAmount(waterGoal)} target</Text>
              </View>
              <View style={styles.waterBadge}>
                <Text style={styles.waterBadgeText}>Daily habit</Text>
              </View>
            </View>
            <ProgressBar
              value={waterTotal}
              max={waterGoal}
              color={colors.blue}
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
            <View key={section.mealTime} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <Text style={styles.mealSectionTitle}>{mealTimeLabel(section.mealTime)}</Text>
                <Text style={styles.mealSectionMeta}>
                  {section.meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                </Text>
              </View>

              {section.meals.length === 0 ? (
                <View style={styles.emptyMealSection}>
                  <Text style={styles.emptyMealSectionText}>Nothing logged yet</Text>
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
                          {meal.serving_label ? ` • ${meal.quantity} x ${meal.serving_label}` : ''}
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
                <View style={styles.modalSection}>
                  <Text style={styles.fieldLabel}>Search USDA foods</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Search foods, fruits, meals..."
                    placeholderTextColor={colors.inputPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />

                  {favoriteFoods.length > 0 ? (
                    <>
                      <Text style={styles.fieldLabel}>Favorites</Text>
                      <View style={styles.inlineChips}>
                        {favoriteFoods.slice(0, 6).map((food) => (
                          <TouchableOpacity
                            key={food.id}
                            style={styles.inlineChip}
                            onPress={() => handleLogFavoriteFood(food)}
                          >
                            <Text style={styles.inlineChipText}>{food.food_name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : null}

                  {recentFoods.length > 0 ? (
                    <>
                      <Text style={styles.fieldLabel}>Recent</Text>
                      <View style={styles.inlineChips}>
                        {recentFoods.slice(0, 6).map((food) => (
                          <TouchableOpacity
                            key={food.id}
                            style={styles.inlineChip}
                            onPress={() => handleLogRecentFood(food)}
                          >
                            <Text style={styles.inlineChipText}>{food.meal_name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : null}

                  <Text style={styles.fieldLabel}>Results</Text>
                  {searchResults.isFetching ? (
                    <Card style={styles.searchHintCard}>
                      <Text style={styles.searchHintText}>
                        Searching your offline food catalog…
                      </Text>
                    </Card>
                  ) : searchQuery.trim().length === 0 ? (
                    <Card style={styles.searchHintCard}>
                      <Text style={styles.searchHintText}>
                        Start typing to search the bundled USDA food database.
                      </Text>
                    </Card>
                  ) : searchResults.data?.length ? (
                    <View style={styles.searchResultsList}>
                      {searchResults.data.map((food) => (
                        <TouchableOpacity
                          key={food.id}
                          style={[
                            styles.searchResultRow,
                            selectedFood?.id === food.id && styles.searchResultRowActive,
                          ]}
                          onPress={() => handleSelectFood(food)}
                        >
                          <View style={styles.searchResultLeft}>
                            <Text style={styles.searchResultName}>{food.name}</Text>
                            <Text style={styles.searchResultMeta}>
                              {food.category ?? 'Food'} •{' '}
                              {food.is_custom
                                ? 'Custom'
                                : food.source === 'usda_foundation'
                                  ? 'Foundation'
                                  : 'SR Legacy'}
                            </Text>
                          </View>
                          <Text style={styles.searchResultCal}>
                            {food.default_nutrients.calories} kcal
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <EmptyState
                      emoji="🥗"
                      title="No foods found"
                      subtitle="Try a broader name or switch to Manual to log something custom."
                    />
                  )}

                  {selectedFood && selectedPortion && selectedPreview ? (
                    <Card style={styles.selectedFoodCard}>
                      <View style={styles.selectedFoodHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.selectedFoodTitle}>{selectedFood.name}</Text>
                          <Text style={styles.selectedFoodSubtitle}>
                            {selectedFood.category ?? 'Food'} •{' '}
                            {selectedFood.source === 'usda_foundation'
                              ? 'Foundation'
                              : selectedFood.source === 'usda_sr_legacy'
                                ? 'SR Legacy'
                                : 'Custom'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.favoriteToggle}
                          onPress={handleToggleSelectedFavorite}
                        >
                          <Text style={styles.favoriteToggleText}>
                            {selectedFood.is_favorite ? '★ Saved' : '☆ Save'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.fieldLabel}>Serving</Text>
                      <View style={styles.inlineChips}>
                        {selectedFood.portions.map((portion) => (
                          <TouchableOpacity
                            key={portion.id}
                            style={[
                              styles.inlineChip,
                              selectedPortion.id === portion.id && styles.inlineChipActive,
                            ]}
                            onPress={() => setSelectedPortionId(portion.id)}
                          >
                            <Text
                              style={[
                                styles.inlineChipText,
                                selectedPortion.id === portion.id && styles.inlineChipTextActive,
                              ]}
                            >
                              {portion.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={styles.fieldLabel}>Quantity</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="1"
                        placeholderTextColor={colors.inputPlaceholder}
                        keyboardType="decimal-pad"
                        value={searchQuantity}
                        onChangeText={setSearchQuantity}
                      />

                      <Text style={styles.fieldLabel}>Meal Time</Text>
                      <View style={styles.mealTimeRow}>
                        {MEAL_SECTION_ORDER.map((mealTime) => (
                          <TouchableOpacity
                            key={mealTime}
                            style={[
                              styles.mealTimePill,
                              searchMealTime === mealTime && styles.mealTimePillActive,
                            ]}
                            onPress={() => setSearchMealTime(mealTime)}
                          >
                            <Text
                              style={[
                                styles.mealTimePillText,
                                searchMealTime === mealTime && styles.mealTimePillTextActive,
                              ]}
                            >
                              {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={styles.previewRow}>
                        <View style={styles.previewMetric}>
                          <Text style={styles.previewValue}>{selectedPreview.calories}</Text>
                          <Text style={styles.previewLabel}>kcal</Text>
                        </View>
                        <View style={styles.previewMetric}>
                          <Text style={styles.previewValue}>{selectedPreview.protein_g ?? 0}</Text>
                          <Text style={styles.previewLabel}>protein</Text>
                        </View>
                        <View style={styles.previewMetric}>
                          <Text style={styles.previewValue}>{selectedPreview.carbs_g ?? 0}</Text>
                          <Text style={styles.previewLabel}>carbs</Text>
                        </View>
                        <View style={styles.previewMetric}>
                          <Text style={styles.previewValue}>{selectedPreview.fat_g ?? 0}</Text>
                          <Text style={styles.previewLabel}>fat</Text>
                        </View>
                      </View>

                      <Button
                        label="Save Food"
                        fullWidth
                        loading={addMeal.isPending}
                        onPress={handleSaveSearchMeal}
                      />
                    </Card>
                  ) : null}
                </View>
              ) : (
                <View style={styles.modalSection}>
                  {!isFoodSearchEnabled ? (
                    <Card style={styles.searchHintCard}>
                      <Text style={styles.searchHintText}>
                        Food search is currently feature-flagged off, so manual logging stays
                        available as the fallback path.
                      </Text>
                    </Card>
                  ) : null}

                  <Text style={styles.fieldLabel}>Meal Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Chicken Rice Bowl"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={manualForm.meal_name}
                    onChangeText={(value) =>
                      setManualForm((current) => ({ ...current, meal_name: value }))
                    }
                  />

                  <Text style={styles.fieldLabel}>Calories *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 450"
                    placeholderTextColor={colors.inputPlaceholder}
                    keyboardType="numeric"
                    value={manualForm.calories}
                    onChangeText={(value) =>
                      setManualForm((current) => ({ ...current, calories: value }))
                    }
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
                        onChangeText={(value) =>
                          setManualForm((current) => ({ ...current, protein_g: value }))
                        }
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
                        onChangeText={(value) =>
                          setManualForm((current) => ({ ...current, carbs_g: value }))
                        }
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
                        onChangeText={(value) =>
                          setManualForm((current) => ({ ...current, fat_g: value }))
                        }
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
                        onPress={() =>
                          setManualForm((current) => ({ ...current, meal_time: mealTime }))
                        }
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
                      setManualForm((current) => ({
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
                          setManualForm((current) => ({
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
                          setManualForm((current) => ({
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
                    loading={addMeal.isPending || saveCustomFood.isPending}
                    disabled={!manualForm.meal_name || !manualForm.calories}
                    onPress={handleSaveManualMeal}
                  />
                </View>
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
  StyleSheet.create({
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
      color: colors.textStrong,
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
      color: colors.text,
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.extrabold,
    },
    waterMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    waterBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      backgroundColor: `${colors.blue}22`,
      borderWidth: 1,
      borderColor: `${colors.blue}44`,
    },
    waterBadgeText: {
      color: colors.blue,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
    },
    waterActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    waterAction: {
      flex: 1,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    waterActionText: {
      color: colors.text,
      fontWeight: Typography.weight.semibold,
    },
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
    mealSection: {
      marginBottom: Spacing.xl,
    },
    mealSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    mealSectionTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    mealSectionMeta: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    emptyMealSection: {
      paddingVertical: Spacing.lg,
      alignItems: 'center',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    emptyMealSectionText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
    },
    mealList: {
      gap: Spacing.sm,
    },
    mealRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mealLeft: {
      flex: 1,
      marginRight: Spacing.md,
    },
    mealName: {
      color: colors.text,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.md,
    },
    mealTimestamp: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
    },
    mealRight: {
      alignItems: 'flex-end',
      minWidth: 86,
    },
    mealCal: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    mealCalLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: -2,
    },
    mealMacroLine: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
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
    modalSection: {
      paddingHorizontal: Spacing.xl,
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
    searchHintCard: {
      marginTop: Spacing.sm,
    },
    searchHintText: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      lineHeight: 20,
    },
    searchResultsList: {
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    searchResultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    searchResultRowActive: {
      borderColor: colors.accent,
      backgroundColor: `${colors.accent}10`,
    },
    searchResultLeft: {
      flex: 1,
    },
    searchResultName: {
      color: colors.text,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    searchResultMeta: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
    },
    searchResultCal: {
      color: colors.text,
      fontWeight: Typography.weight.bold,
      fontSize: Typography.size.sm,
    },
    selectedFoodCard: {
      marginTop: Spacing.xl,
      gap: Spacing.sm,
    },
    selectedFoodHeader: {
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'flex-start',
    },
    selectedFoodTitle: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    selectedFoodSubtitle: {
      color: colors.muted,
      fontSize: Typography.size.sm,
      marginTop: 4,
    },
    favoriteToggle: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: `${colors.orange}18`,
      borderWidth: 1,
      borderColor: `${colors.orange}45`,
    },
    favoriteToggleText: {
      color: colors.orange,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
    },
    inlineChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    inlineChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inlineChipActive: {
      backgroundColor: `${colors.accent}18`,
      borderColor: colors.accent,
    },
    inlineChipText: {
      color: colors.text,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    inlineChipTextActive: {
      color: colors.accent,
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
    previewRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginVertical: Spacing.md,
    },
    previewMetric: {
      flex: 1,
      alignItems: 'center',
      borderRadius: Radius.md,
      backgroundColor: colors.background,
      paddingVertical: Spacing.md,
    },
    previewValue: {
      color: colors.text,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.extrabold,
    },
    previewLabel: {
      color: colors.muted,
      fontSize: Typography.size.xs,
      marginTop: 4,
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
