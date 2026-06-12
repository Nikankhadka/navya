import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { Button, Card, EmptyState } from '@/components/ui';
import type {
  FavoriteFood,
  FoodNutrients,
  FoodPortion,
  FoodSearchResult,
  MealTime,
  RecentFood,
} from '@/types/app';
import { Radius, Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';

const MEAL_SECTION_ORDER: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface FoodSearchSheetProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: UseQueryResult<FoodSearchResult[]>;
  favoriteFoods: FavoriteFood[];
  recentFoods: RecentFood[];
  selectedFood: FoodSearchResult | null;
  onSelectFood: (food: FoodSearchResult) => void;
  selectedPortion: FoodPortion | null;
  selectedPortionId: string | null;
  onSelectPortion: (portionId: string) => void;
  searchQuantity: string;
  onSearchQuantityChange: (value: string) => void;
  searchMealTime: MealTime;
  onSearchMealTimeChange: (mealTime: MealTime) => void;
  selectedPreview: (FoodNutrients & { serving_grams: number | null }) | null;
  onToggleFavorite: () => void;
  onSaveMeal: () => void;
  onLogFavoriteFood: (food: FavoriteFood) => void;
  onLogRecentFood: (food: RecentFood) => void;
  isSaving: boolean;
}

export function FoodSearchSheet({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  favoriteFoods,
  recentFoods,
  selectedFood,
  onSelectFood,
  selectedPortion,
  // selectedPortionId omitted from destructuring—parent uses it; child compares via selectedPortion.id
  onSelectPortion,
  searchQuantity,
  onSearchQuantityChange,
  searchMealTime,
  onSearchMealTimeChange,
  selectedPreview,
  onToggleFavorite,
  onSaveMeal,
  onLogFavoriteFood,
  onLogRecentFood,
  isSaving,
}: FoodSearchSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.modalSection}>
      <Text style={styles.fieldLabel}>Search USDA foods</Text>
      <TextInput
        style={styles.input}
        placeholder="Search foods, fruits, meals..."
        placeholderTextColor={colors.inputPlaceholder}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
      />

      {favoriteFoods.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>Favorites</Text>
          <View style={styles.inlineChips}>
            {favoriteFoods.slice(0, 6).map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.inlineChip}
                onPress={() => onLogFavoriteFood(food)}
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
                onPress={() => onLogRecentFood(food)}
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
          <Text style={styles.searchHintText}>Searching your offline food catalog…</Text>
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
              onPress={() => onSelectFood(food)}
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
              <Text style={styles.searchResultCal}>{food.default_nutrients.calories} kcal</Text>
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
            <TouchableOpacity style={styles.favoriteToggle} onPress={onToggleFavorite}>
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
                onPress={() => onSelectPortion(portion.id)}
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
            onChangeText={onSearchQuantityChange}
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
                onPress={() => onSearchMealTimeChange(mealTime)}
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

          <Button label="Save Food" fullWidth loading={isSaving} onPress={onSaveMeal} />
        </Card>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
  });
