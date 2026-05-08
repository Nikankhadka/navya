import type { FoodNutrients, FoodPortion, FoodSearchResult } from '@/types/app';

function roundToTenth(value: number | null): number | null {
  if (value == null) {
    return null;
  }

  return Number(value.toFixed(1));
}

export function getDefaultFoodPortion(food: FoodSearchResult): FoodPortion {
  return (
    food.portions.find((portion) => portion.is_default) ??
    food.portions[0] ?? {
      id: `${food.id}:100g`,
      food_id: food.id,
      amount: 100,
      unit: 'g',
      modifier: null,
      gram_weight: 100,
      label: '100 g',
      is_default: true,
    }
  );
}

export function calculateFoodLogNutrients(
  food: FoodSearchResult,
  portion: FoodPortion,
  quantity: number,
): FoodNutrients & { serving_grams: number | null } {
  const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const servingGrams = portion.gram_weight ?? food.default_serving_grams ?? null;
  const totalGrams = servingGrams == null ? null : servingGrams * normalizedQuantity;

  if (totalGrams != null && food.calories_per_100g != null) {
    const ratio = totalGrams / 100;

    return {
      calories: Math.round(food.calories_per_100g * ratio),
      protein_g:
        food.protein_g_per_100g == null ? null : roundToTenth(food.protein_g_per_100g * ratio),
      carbs_g:
        food.carbs_g_per_100g == null ? null : roundToTenth(food.carbs_g_per_100g * ratio),
      fat_g:
        food.fat_g_per_100g == null ? null : roundToTenth(food.fat_g_per_100g * ratio),
      serving_grams: totalGrams,
    };
  }

  return {
    calories: Math.round(food.default_nutrients.calories * normalizedQuantity),
    protein_g:
      food.default_nutrients.protein_g == null
        ? null
        : roundToTenth(food.default_nutrients.protein_g * normalizedQuantity),
    carbs_g:
      food.default_nutrients.carbs_g == null
        ? null
        : roundToTenth(food.default_nutrients.carbs_g * normalizedQuantity),
    fat_g:
      food.default_nutrients.fat_g == null
        ? null
        : roundToTenth(food.default_nutrients.fat_g * normalizedQuantity),
    serving_grams: totalGrams,
  };
}
