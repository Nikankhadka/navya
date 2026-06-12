import { fromDateKey } from '@/utils/date';
import { MOCK_DAILY_NUTRITION, MOCK_PROFILE } from '@/features/demo/mockData';
import type { SQLiteDatabase } from '@/features/nutrition/db/nutritionDatabase';
import type {
  CustomFood,
  DailyNutritionSummary,
  FavoriteFood,
  FoodLog,
  FoodPortion,
  FoodSearchResult,
  NutritionSyncRecord,
  RecentFood,
  WaterLog,
} from '@/types/app';

// ---------------------------------------------------------------------------
// Local-row types (SQLite column shapes)
// ---------------------------------------------------------------------------

export type LocalFoodLogRow = {
  id: string;
  user_id: string;
  meal_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_time: FoodLog['meal_time'];
  logged_at: string;
  notes: string | null;
  source: FoodLog['source'];
  source_food_id: string | null;
  custom_food_id: string | null;
  quantity: number;
  serving_label: string | null;
  serving_grams: number | null;
  is_custom: number;
  updated_at: string;
  deleted_at: string | null;
  sync_status: FoodLog['sync_status'];
};

export type LocalCustomFoodRow = {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  default_serving_label: string;
  default_serving_grams: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: CustomFood['sync_status'];
};

export type LocalFavoriteFoodRow = {
  id: string;
  user_id: string;
  source: FavoriteFood['source'];
  source_food_id: string | null;
  custom_food_id: string | null;
  food_name: string;
  category: string | null;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  default_serving_label: string | null;
  default_serving_grams: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: FavoriteFood['sync_status'];
};

export type CatalogFoodRow = {
  id: string;
  source: FoodLog['source'];
  source_food_id: string;
  name: string;
  category: string | null;
  data_version: string;
  calories_per_100g: number | null;
  protein_g_per_100g: number | null;
  carbs_g_per_100g: number | null;
  fat_g_per_100g: number | null;
  default_serving_label: string | null;
  default_serving_grams: number | null;
  source_rank: number;
};

export type CatalogPortionRow = {
  id: string;
  food_id: string;
  amount: number;
  unit: string | null;
  modifier: string | null;
  gram_weight: number | null;
  label: string;
  is_default: number;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_WATER_GOAL_ML = 2500;
export const DEFAULT_CALORIE_GOAL = 2200;
export const DEFAULT_PROTEIN_GOAL = 140;
export const DEFAULT_USDA_DATA_VERSION = 'usda_fdc_2026_04_mvp';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function nowIso(): string {
  return new Date().toISOString();
}

export function shouldUseDemoNutrition(userId: string): boolean {
  return userId === MOCK_PROFILE.id;
}

export function isDateIso(isoString: string, dateKey: string): boolean {
  return isoString.startsWith(dateKey);
}

export function nullIfBlank(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function foodIdentityKey(
  source: string,
  sourceFoodId: string | null,
  customFoodId: string | null,
): string {
  return [source, sourceFoodId ?? '', customFoodId ?? ''].join(':');
}

// ---------------------------------------------------------------------------
// Row → entity mappers
// ---------------------------------------------------------------------------

export function toFoodLog(row: LocalFoodLogRow): FoodLog {
  return {
    id: row.id,
    user_id: row.user_id,
    meal_name: row.meal_name,
    calories: row.calories,
    protein_g: row.protein_g,
    carbs_g: row.carbs_g,
    fat_g: row.fat_g,
    meal_time: row.meal_time,
    logged_at: row.logged_at,
    notes: row.notes,
    source: row.source,
    source_food_id: row.source_food_id,
    custom_food_id: row.custom_food_id,
    quantity: row.quantity,
    serving_label: row.serving_label,
    serving_grams: row.serving_grams,
    is_custom: Boolean(row.is_custom),
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    sync_status: row.sync_status,
  };
}

export function toCustomFood(row: LocalCustomFoodRow): CustomFood {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    calories: row.calories,
    protein_g: row.protein_g,
    carbs_g: row.carbs_g,
    fat_g: row.fat_g,
    default_serving_label: row.default_serving_label,
    default_serving_grams: row.default_serving_grams,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    sync_status: row.sync_status,
  };
}

export function toFavoriteFood(row: LocalFavoriteFoodRow): FavoriteFood {
  return {
    id: row.id,
    user_id: row.user_id,
    source: row.source,
    source_food_id: row.source_food_id,
    custom_food_id: row.custom_food_id,
    food_name: row.food_name,
    category: row.category,
    calories: row.calories,
    protein_g: row.protein_g,
    carbs_g: row.carbs_g,
    fat_g: row.fat_g,
    default_serving_label: row.default_serving_label,
    default_serving_grams: row.default_serving_grams,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    sync_status: row.sync_status,
  };
}

export function toRecentFood(log: FoodLog): RecentFood {
  return {
    id: `${log.source}:${log.source_food_id ?? log.custom_food_id ?? log.meal_name.toLowerCase()}`,
    meal_name: log.meal_name,
    calories: log.calories,
    protein_g: log.protein_g,
    carbs_g: log.carbs_g,
    fat_g: log.fat_g,
    meal_time: log.meal_time,
    source: log.source,
    source_food_id: log.source_food_id,
    custom_food_id: log.custom_food_id,
    quantity: log.quantity,
    serving_label: log.serving_label,
    serving_grams: log.serving_grams,
    is_custom: log.is_custom,
    last_logged_at: log.logged_at,
  };
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export function buildRecentFoods(meals: FoodLog[]): RecentFood[] {
  const seen = new Set<string>();
  const recents: RecentFood[] = [];

  for (const meal of meals) {
    const key = foodIdentityKey(meal.source, meal.source_food_id, meal.custom_food_id);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    recents.push(toRecentFood(meal));

    if (recents.length >= 6) {
      break;
    }
  }

  return recents;
}

export function buildDailySummary(
  meals: FoodLog[],
  waterLogs: WaterLog[],
  favorites: FavoriteFood[],
  dateKey: string,
): DailyNutritionSummary {
  const todaysMeals = meals.filter(
    (meal) => isDateIso(meal.logged_at, dateKey) && !meal.deleted_at,
  );
  const todaysWaterLogs = waterLogs.filter((entry) => isDateIso(entry.logged_at, dateKey));

  return {
    date: fromDateKey(dateKey).toISOString(),
    total_calories: todaysMeals.reduce((sum, meal) => sum + meal.calories, 0),
    total_protein_g: todaysMeals.reduce((sum, meal) => sum + (meal.protein_g ?? 0), 0),
    total_carbs_g: todaysMeals.reduce((sum, meal) => sum + (meal.carbs_g ?? 0), 0),
    total_fat_g: todaysMeals.reduce((sum, meal) => sum + (meal.fat_g ?? 0), 0),
    calorie_goal: MOCK_DAILY_NUTRITION.calorie_goal ?? DEFAULT_CALORIE_GOAL,
    protein_goal_g: MOCK_DAILY_NUTRITION.protein_goal_g ?? DEFAULT_PROTEIN_GOAL,
    water_total_ml: todaysWaterLogs.reduce((sum, entry) => sum + entry.amount_ml, 0),
    water_goal_ml: DEFAULT_WATER_GOAL_ML,
    meals: todaysMeals,
    recent_foods: buildRecentFoods(meals),
    favorite_foods: favorites.filter((favorite) => !favorite.deleted_at),
    water_logs: todaysWaterLogs,
  };
}

export function buildFtsQuery(input: string): string {
  const tokens = input
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/["*]/g, ''))
    .filter(Boolean);

  if (tokens.length === 0) {
    return '';
  }

  return tokens.map((token) => `${token}*`).join(' AND ');
}

// ---------------------------------------------------------------------------
// Local-db helpers
// ---------------------------------------------------------------------------

export async function enqueueSyncRecord(
  db: SQLiteDatabase,
  record: Omit<NutritionSyncRecord, 'id'>,
): Promise<void> {
  const queueId = `${record.entity_type}:${record.entity_id}`;

  await db.runAsync(
    `INSERT INTO nutrition_sync_queue (
      id, entity_type, entity_id, operation, updated_at, payload_json, last_error
    ) VALUES (?, ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(entity_type, entity_id) DO UPDATE SET
      operation = excluded.operation,
      updated_at = excluded.updated_at,
      payload_json = excluded.payload_json,
      last_error = NULL`,
    queueId,
    record.entity_type,
    record.entity_id,
    record.operation,
    record.updated_at,
    record.payload_json,
  );
}

export async function getLocalMealsAsync(db: SQLiteDatabase, userId: string): Promise<FoodLog[]> {
  const rows = await db.getAllAsync<LocalFoodLogRow>(
    `SELECT * FROM food_logs_local
      WHERE user_id = ?
      ORDER BY logged_at DESC, updated_at DESC`,
    userId,
  );

  return rows.map(toFoodLog).filter((row) => !row.deleted_at);
}

export async function getLocalFoodActivityKeysAsync(
  db: SQLiteDatabase,
  userId: string,
): Promise<string[]> {
  const rows = await db.getAllAsync<Pick<LocalFoodLogRow, 'logged_at' | 'deleted_at'>>(
    `SELECT logged_at, deleted_at
      FROM food_logs_local
      WHERE user_id = ?
      ORDER BY logged_at DESC
      LIMIT 60`,
    userId,
  );

  return rows.filter((row) => !row.deleted_at).map((row) => row.logged_at.slice(0, 10));
}

export async function getLocalFavoritesAsync(
  db: SQLiteDatabase,
  userId: string,
): Promise<FavoriteFood[]> {
  const rows = await db.getAllAsync<LocalFavoriteFoodRow>(
    `SELECT * FROM favorite_foods_local
      WHERE user_id = ?
      ORDER BY updated_at DESC`,
    userId,
  );

  return rows.map(toFavoriteFood).filter((favorite) => !favorite.deleted_at);
}

export async function getFavoriteKeysAsync(
  db: SQLiteDatabase,
  userId: string,
): Promise<Set<string>> {
  const favorites = await getLocalFavoritesAsync(db, userId);
  return new Set(
    favorites.map((favorite) =>
      foodIdentityKey(favorite.source, favorite.source_food_id, favorite.custom_food_id),
    ),
  );
}

export async function getFoodPortionsAsync(
  db: SQLiteDatabase,
  foodId: string,
): Promise<FoodPortion[]> {
  const rows = await db.getAllAsync<CatalogPortionRow>(
    `SELECT * FROM catalog_portions
      WHERE food_id = ?
      ORDER BY is_default DESC, gram_weight DESC, label ASC`,
    foodId,
  );

  return rows.map((row) => ({
    id: row.id,
    food_id: row.food_id,
    amount: row.amount,
    unit: row.unit,
    modifier: row.modifier,
    gram_weight: row.gram_weight,
    label: row.label,
    is_default: Boolean(row.is_default),
  }));
}

export async function buildCatalogSearchResultAsync(
  db: SQLiteDatabase,
  row: CatalogFoodRow,
  favoriteKeys: Set<string>,
): Promise<FoodSearchResult> {
  const portions = await getFoodPortionsAsync(db, row.id);

  return {
    id: row.id,
    source: row.source,
    source_food_id: row.source_food_id,
    custom_food_id: null,
    name: row.name,
    category: row.category,
    data_version: row.data_version,
    calories_per_100g: row.calories_per_100g,
    protein_g_per_100g: row.protein_g_per_100g,
    carbs_g_per_100g: row.carbs_g_per_100g,
    fat_g_per_100g: row.fat_g_per_100g,
    default_serving_label: row.default_serving_label,
    default_serving_grams: row.default_serving_grams,
    default_nutrients: {
      calories: Math.round(
        (row.calories_per_100g ?? 0) * ((row.default_serving_grams ?? 100) / 100),
      ),
      protein_g:
        row.protein_g_per_100g == null
          ? null
          : Number(
              ((row.protein_g_per_100g * (row.default_serving_grams ?? 100)) / 100).toFixed(1),
            ),
      carbs_g:
        row.carbs_g_per_100g == null
          ? null
          : Number(((row.carbs_g_per_100g * (row.default_serving_grams ?? 100)) / 100).toFixed(1)),
      fat_g:
        row.fat_g_per_100g == null
          ? null
          : Number(((row.fat_g_per_100g * (row.default_serving_grams ?? 100)) / 100).toFixed(1)),
    },
    portions:
      portions.length > 0
        ? portions
        : [
            {
              id: `${row.id}:100g`,
              food_id: row.id,
              amount: 100,
              unit: 'g',
              modifier: null,
              gram_weight: 100,
              label: '100 g',
              is_default: true,
            },
          ],
    is_custom: false,
    is_favorite: favoriteKeys.has(foodIdentityKey(row.source, row.source_food_id, null)),
  };
}

export function buildCustomFoodSearchResult(
  customFood: CustomFood,
  favoriteKeys: Set<string>,
): FoodSearchResult {
  const defaultServingLabel = customFood.default_serving_label;
  const defaultServingGrams = customFood.default_serving_grams;
  const perHundredMultiplier =
    defaultServingGrams && defaultServingGrams > 0 ? 100 / defaultServingGrams : null;

  return {
    id: `manual:${customFood.id}`,
    source: 'manual',
    source_food_id: null,
    custom_food_id: customFood.id,
    name: customFood.name,
    category: 'Custom food',
    data_version: DEFAULT_USDA_DATA_VERSION,
    calories_per_100g: perHundredMultiplier
      ? Math.round(customFood.calories * perHundredMultiplier)
      : null,
    protein_g_per_100g:
      perHundredMultiplier && customFood.protein_g != null
        ? Number((customFood.protein_g * perHundredMultiplier).toFixed(1))
        : null,
    carbs_g_per_100g:
      perHundredMultiplier && customFood.carbs_g != null
        ? Number((customFood.carbs_g * perHundredMultiplier).toFixed(1))
        : null,
    fat_g_per_100g:
      perHundredMultiplier && customFood.fat_g != null
        ? Number((customFood.fat_g * perHundredMultiplier).toFixed(1))
        : null,
    default_serving_label: defaultServingLabel,
    default_serving_grams: defaultServingGrams,
    default_nutrients: {
      calories: customFood.calories,
      protein_g: customFood.protein_g,
      carbs_g: customFood.carbs_g,
      fat_g: customFood.fat_g,
    },
    portions: [
      {
        id: `custom-portion:${customFood.id}`,
        food_id: customFood.id,
        amount: 1,
        unit: 'serving',
        modifier: null,
        gram_weight: defaultServingGrams,
        label: defaultServingLabel,
        is_default: true,
      },
    ],
    is_custom: true,
    is_favorite: favoriteKeys.has(foodIdentityKey('manual', null, customFood.id)),
  };
}
