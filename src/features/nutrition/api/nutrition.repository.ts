import * as Crypto from 'expo-crypto';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import {
  mapCustomFoodRow,
  mapFavoriteFoodRow,
  mapFoodLogRow,
  mapWaterLogRow,
} from '@/lib/supabase/mappers';
import type { Database } from '@/types/database';
import type {
  CreateCustomFoodInput,
  CreateFoodLogInput,
  CustomFood,
  DailyNutritionSummary,
  FavoriteFood,
  FavoriteFoodInput,
  FoodLog,
  FoodNutrients,
  FoodPortion,
  FoodSearchResult,
  NutritionSyncRecord,
  RecentFood,
  WaterLog,
} from '@/types/app';
import { MOCK_DAILY_NUTRITION, MOCK_PROFILE } from '@/features/demo/mockData';
import {
  getNutritionDatabaseAsync,
  isNutritionLocalDatabaseSupported,
  type SQLiteDatabase,
} from '@/features/nutrition/db/nutritionDatabase';

type FoodLogRow = Database['public']['Tables']['food_logs']['Row'];
type CustomFoodRow = Database['public']['Tables']['custom_foods']['Row'];
type FavoriteFoodRow = Database['public']['Tables']['favorite_foods']['Row'];
type WaterLogRow = Database['public']['Tables']['water_logs']['Row'];

type LocalFoodLogRow = {
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

type LocalCustomFoodRow = {
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

type LocalFavoriteFoodRow = {
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

type CatalogFoodRow = {
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

type CatalogPortionRow = {
  id: string;
  food_id: string;
  amount: number;
  unit: string | null;
  modifier: string | null;
  gram_weight: number | null;
  label: string;
  is_default: number;
};

const DEFAULT_WATER_GOAL_ML = 2500;
const DEFAULT_CALORIE_GOAL = 2200;
const DEFAULT_PROTEIN_GOAL = 140;
const DEFAULT_USDA_DATA_VERSION = 'usda_fdc_2026_04_mvp';

const activeSyncs = new Map<string, Promise<void>>();

function nowIso(): string {
  return new Date().toISOString();
}

function shouldUseDemoNutrition(userId: string): boolean {
  return userId === MOCK_PROFILE.id;
}

function isTodayIso(isoString: string): boolean {
  return isoString.startsWith(new Date().toISOString().slice(0, 10));
}

function nullIfBlank(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function foodIdentityKey(source: string, sourceFoodId: string | null, customFoodId: string | null): string {
  return [source, sourceFoodId ?? '', customFoodId ?? ''].join(':');
}

function toFoodLog(row: LocalFoodLogRow): FoodLog {
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

function toCustomFood(row: LocalCustomFoodRow): CustomFood {
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

function toFavoriteFood(row: LocalFavoriteFoodRow): FavoriteFood {
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

function toRecentFood(log: FoodLog): RecentFood {
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

function buildRecentFoods(meals: FoodLog[]): RecentFood[] {
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

function buildDailySummary(
  meals: FoodLog[],
  waterLogs: WaterLog[],
  favorites: FavoriteFood[],
): DailyNutritionSummary {
  const todaysMeals = meals.filter((meal) => isTodayIso(meal.logged_at) && !meal.deleted_at);
  const todaysWaterLogs = waterLogs.filter((entry) => isTodayIso(entry.logged_at));

  return {
    date: new Date().toISOString(),
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

function buildFtsQuery(input: string): string {
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

async function enqueueSyncRecord(
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

async function getLocalMealsAsync(db: SQLiteDatabase, userId: string): Promise<FoodLog[]> {
  const rows = await db.getAllAsync<LocalFoodLogRow>(
    `SELECT * FROM food_logs_local
      WHERE user_id = ?
      ORDER BY logged_at DESC, updated_at DESC`,
    userId,
  );

  return rows.map(toFoodLog).filter((row) => !row.deleted_at);
}

async function getLocalFoodActivityKeysAsync(db: SQLiteDatabase, userId: string): Promise<string[]> {
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

async function getLocalFavoritesAsync(db: SQLiteDatabase, userId: string): Promise<FavoriteFood[]> {
  const rows = await db.getAllAsync<LocalFavoriteFoodRow>(
    `SELECT * FROM favorite_foods_local
      WHERE user_id = ?
      ORDER BY updated_at DESC`,
    userId,
  );

  return rows.map(toFavoriteFood).filter((favorite) => !favorite.deleted_at);
}

async function getFavoriteKeysAsync(db: SQLiteDatabase, userId: string): Promise<Set<string>> {
  const favorites = await getLocalFavoritesAsync(db, userId);
  return new Set(
    favorites.map((favorite) =>
      foodIdentityKey(favorite.source, favorite.source_food_id, favorite.custom_food_id),
    ),
  );
}

async function getFoodPortionsAsync(db: SQLiteDatabase, foodId: string): Promise<FoodPortion[]> {
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

async function buildCatalogSearchResultAsync(
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
      calories: Math.round((row.calories_per_100g ?? 0) * ((row.default_serving_grams ?? 100) / 100)),
      protein_g:
        row.protein_g_per_100g == null
          ? null
          : Number(((row.protein_g_per_100g * (row.default_serving_grams ?? 100)) / 100).toFixed(1)),
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

function buildCustomFoodSearchResult(customFood: CustomFood, favoriteKeys: Set<string>): FoodSearchResult {
  const defaultServingLabel = customFood.default_serving_label;
  const defaultServingGrams = customFood.default_serving_grams;
  const perHundredMultiplier = defaultServingGrams && defaultServingGrams > 0 ? 100 / defaultServingGrams : null;

  return {
    id: `manual:${customFood.id}`,
    source: 'manual',
    source_food_id: null,
    custom_food_id: customFood.id,
    name: customFood.name,
    category: 'Custom food',
    data_version: DEFAULT_USDA_DATA_VERSION,
    calories_per_100g: perHundredMultiplier ? Math.round(customFood.calories * perHundredMultiplier) : null,
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

async function getRemoteWaterLogsAsync(userId: string): Promise<WaterLog[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Error fetching water logs:', error);
    return [];
  }

  return ((data ?? []) as WaterLogRow[]).map(mapWaterLogRow);
}

async function getRemoteFavoriteFoodsAsync(userId: string): Promise<FavoriteFood[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorite_foods')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite foods:', error);
    return [];
  }

  return ((data ?? []) as FavoriteFoodRow[]).map(mapFavoriteFoodRow).filter((row) => !row.deleted_at);
}

async function addRemoteMealAsync(userId: string, meal: CreateFoodLogInput): Promise<FoodLog> {
  if (!isSupabaseConfigured) {
    return {
      id: Crypto.randomUUID(),
      user_id: userId,
      logged_at: nowIso(),
      updated_at: nowIso(),
      deleted_at: null,
      sync_status: 'pending',
      ...meal,
    };
  }

  const timestamp = nowIso();
  const payload: Database['public']['Tables']['food_logs']['Insert'] = {
    user_id: userId,
    meal_name: meal.meal_name.trim(),
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fat_g: meal.fat_g,
    meal_time: meal.meal_time,
    logged_at: timestamp,
    notes: meal.notes,
    source: meal.source,
    source_food_id: meal.source_food_id,
    custom_food_id: meal.custom_food_id,
    quantity: meal.quantity,
    serving_label: meal.serving_label,
    serving_grams: meal.serving_grams,
    is_custom: meal.is_custom,
    updated_at: timestamp,
    deleted_at: null,
  };

  const { data, error } = await supabase
    .from('food_logs')
    .insert(payload as never)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating food log:', error);
    return {
      id: Crypto.randomUUID(),
      user_id: userId,
      logged_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
      sync_status: 'error',
      ...meal,
    };
  }

  return mapFoodLogRow(data);
}

async function saveRemoteCustomFoodAsync(userId: string, input: CreateCustomFoodInput): Promise<CustomFood> {
  const timestamp = nowIso();
  const payload: Database['public']['Tables']['custom_foods']['Insert'] = {
    user_id: userId,
    name: input.name.trim(),
    calories: input.calories,
    protein_g: input.protein_g,
    carbs_g: input.carbs_g,
    fat_g: input.fat_g,
    default_serving_label: input.default_serving_label.trim(),
    default_serving_grams: input.default_serving_grams,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };

  const { data, error } = await supabase
    .from('custom_foods')
    .insert(payload as never)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating custom food:', error);
    return {
      id: Crypto.randomUUID(),
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
      sync_status: 'error',
      ...input,
    };
  }

  return mapCustomFoodRow(data);
}

async function upsertRemoteFoodLogAsync(row: LocalFoodLogRow): Promise<void> {
  const payload: Database['public']['Tables']['food_logs']['Insert'] = {
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
  };

  const { error } = await supabase.from('food_logs').upsert(payload as never, {
    onConflict: 'id',
  });

  if (error) {
    throw error;
  }
}

async function upsertRemoteCustomFoodAsync(row: LocalCustomFoodRow): Promise<void> {
  const payload: Database['public']['Tables']['custom_foods']['Insert'] = {
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
  };

  const { error } = await supabase.from('custom_foods').upsert(payload as never, {
    onConflict: 'id',
  });

  if (error) {
    throw error;
  }
}

async function upsertRemoteFavoriteFoodAsync(row: LocalFavoriteFoodRow): Promise<void> {
  const payload: Database['public']['Tables']['favorite_foods']['Insert'] = {
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
  };

  const { error } = await supabase.from('favorite_foods').upsert(payload as never, {
    onConflict: 'id',
  });

  if (error) {
    throw error;
  }
}

async function markEntitySyncedAsync(
  db: SQLiteDatabase,
  entityType: NutritionSyncRecord['entity_type'],
  entityId: string,
): Promise<void> {
  const tableName =
    entityType === 'food_log'
      ? 'food_logs_local'
      : entityType === 'custom_food'
        ? 'custom_foods_local'
        : 'favorite_foods_local';

  await db.runAsync(
    `UPDATE ${tableName}
      SET sync_status = 'synced', last_error = NULL
      WHERE id = ?`,
    entityId,
  );

  await db.runAsync(
    'DELETE FROM nutrition_sync_queue WHERE entity_type = ? AND entity_id = ?',
    entityType,
    entityId,
  );
}

async function markEntitySyncErrorAsync(
  db: SQLiteDatabase,
  entityType: NutritionSyncRecord['entity_type'],
  entityId: string,
  message: string,
): Promise<void> {
  const tableName =
    entityType === 'food_log'
      ? 'food_logs_local'
      : entityType === 'custom_food'
        ? 'custom_foods_local'
        : 'favorite_foods_local';

  await db.runAsync(
    `UPDATE ${tableName}
      SET sync_status = 'error', last_error = ?
      WHERE id = ?`,
    message,
    entityId,
  );

  await db.runAsync(
    'UPDATE nutrition_sync_queue SET last_error = ? WHERE entity_type = ? AND entity_id = ?',
    message,
    entityType,
    entityId,
  );
}

async function pushPendingChangesAsync(db: SQLiteDatabase): Promise<void> {
  const queue = await db.getAllAsync<NutritionSyncRecord>(
    `SELECT * FROM nutrition_sync_queue
      ORDER BY updated_at ASC`,
  );

  for (const item of queue) {
    try {
      if (item.entity_type === 'food_log') {
        const row = await db.getFirstAsync<LocalFoodLogRow>(
          'SELECT * FROM food_logs_local WHERE id = ?',
          item.entity_id,
        );

        if (row) {
          await upsertRemoteFoodLogAsync(row);
        }
      } else if (item.entity_type === 'custom_food') {
        const row = await db.getFirstAsync<LocalCustomFoodRow>(
          'SELECT * FROM custom_foods_local WHERE id = ?',
          item.entity_id,
        );

        if (row) {
          await upsertRemoteCustomFoodAsync(row);
        }
      } else {
        const row = await db.getFirstAsync<LocalFavoriteFoodRow>(
          'SELECT * FROM favorite_foods_local WHERE id = ?',
          item.entity_id,
        );

        if (row) {
          await upsertRemoteFavoriteFoodAsync(row);
        }
      }

      await markEntitySyncedAsync(db, item.entity_type, item.entity_id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown nutrition sync error';
      await markEntitySyncErrorAsync(db, item.entity_type, item.entity_id, message);
    }
  }
}

async function upsertPulledFoodLogsAsync(db: SQLiteDatabase, rows: FoodLog[]): Promise<void> {
  for (const row of rows) {
    const local = await db.getFirstAsync<Pick<LocalFoodLogRow, 'updated_at' | 'sync_status'>>(
      'SELECT updated_at, sync_status FROM food_logs_local WHERE id = ?',
      row.id,
    );

    if (local && local.updated_at > row.updated_at && local.sync_status !== 'synced') {
      continue;
    }

    await db.runAsync(
      `INSERT INTO food_logs_local (
        id, user_id, meal_name, calories, protein_g, carbs_g, fat_g, meal_time, logged_at,
        notes, source, source_food_id, custom_food_id, quantity, serving_label, serving_grams,
        is_custom, updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        meal_name = excluded.meal_name,
        calories = excluded.calories,
        protein_g = excluded.protein_g,
        carbs_g = excluded.carbs_g,
        fat_g = excluded.fat_g,
        meal_time = excluded.meal_time,
        logged_at = excluded.logged_at,
        notes = excluded.notes,
        source = excluded.source,
        source_food_id = excluded.source_food_id,
        custom_food_id = excluded.custom_food_id,
        quantity = excluded.quantity,
        serving_label = excluded.serving_label,
        serving_grams = excluded.serving_grams,
        is_custom = excluded.is_custom,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
        sync_status = 'synced',
        last_error = NULL`,
      row.id,
      row.user_id,
      row.meal_name,
      row.calories,
      row.protein_g,
      row.carbs_g,
      row.fat_g,
      row.meal_time,
      row.logged_at,
      row.notes,
      row.source,
      row.source_food_id,
      row.custom_food_id,
      row.quantity,
      row.serving_label,
      row.serving_grams,
      row.is_custom ? 1 : 0,
      row.updated_at,
      row.deleted_at,
    );
  }
}

async function upsertPulledCustomFoodsAsync(db: SQLiteDatabase, rows: CustomFood[]): Promise<void> {
  for (const row of rows) {
    const local = await db.getFirstAsync<Pick<LocalCustomFoodRow, 'updated_at' | 'sync_status'>>(
      'SELECT updated_at, sync_status FROM custom_foods_local WHERE id = ?',
      row.id,
    );

    if (local && local.updated_at > row.updated_at && local.sync_status !== 'synced') {
      continue;
    }

    await db.runAsync(
      `INSERT INTO custom_foods_local (
        id, user_id, name, calories, protein_g, carbs_g, fat_g, default_serving_label,
        default_serving_grams, created_at, updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        name = excluded.name,
        calories = excluded.calories,
        protein_g = excluded.protein_g,
        carbs_g = excluded.carbs_g,
        fat_g = excluded.fat_g,
        default_serving_label = excluded.default_serving_label,
        default_serving_grams = excluded.default_serving_grams,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
        sync_status = 'synced',
        last_error = NULL`,
      row.id,
      row.user_id,
      row.name,
      row.calories,
      row.protein_g,
      row.carbs_g,
      row.fat_g,
      row.default_serving_label,
      row.default_serving_grams,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    );
  }
}

async function upsertPulledFavoritesAsync(db: SQLiteDatabase, rows: FavoriteFood[]): Promise<void> {
  for (const row of rows) {
    const local = await db.getFirstAsync<Pick<LocalFavoriteFoodRow, 'updated_at' | 'sync_status'>>(
      'SELECT updated_at, sync_status FROM favorite_foods_local WHERE id = ?',
      row.id,
    );

    if (local && local.updated_at > row.updated_at && local.sync_status !== 'synced') {
      continue;
    }

    await db.runAsync(
      `INSERT INTO favorite_foods_local (
        id, user_id, source, source_food_id, custom_food_id, food_name, category, calories,
        protein_g, carbs_g, fat_g, default_serving_label, default_serving_grams, created_at,
        updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        source = excluded.source,
        source_food_id = excluded.source_food_id,
        custom_food_id = excluded.custom_food_id,
        food_name = excluded.food_name,
        category = excluded.category,
        calories = excluded.calories,
        protein_g = excluded.protein_g,
        carbs_g = excluded.carbs_g,
        fat_g = excluded.fat_g,
        default_serving_label = excluded.default_serving_label,
        default_serving_grams = excluded.default_serving_grams,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at,
        sync_status = 'synced',
        last_error = NULL`,
      row.id,
      row.user_id,
      row.source,
      row.source_food_id,
      row.custom_food_id,
      row.food_name,
      row.category,
      row.calories,
      row.protein_g,
      row.carbs_g,
      row.fat_g,
      row.default_serving_label,
      row.default_serving_grams,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    );
  }
}

async function pullRemoteChangesAsync(db: SQLiteDatabase, userId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const [
    { data: foodLogs, error: foodError },
    { data: customFoods, error: customError },
    { data: favoriteFoods, error: favoriteError },
  ] = await Promise.all([
    supabase.from('food_logs').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('custom_foods').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('favorite_foods').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
  ]);

  if (foodError) {
    throw foodError;
  }

  if (customError) {
    throw customError;
  }

  if (favoriteError) {
    throw favoriteError;
  }

  await upsertPulledFoodLogsAsync(db, ((foodLogs ?? []) as FoodLogRow[]).map(mapFoodLogRow));
  await upsertPulledCustomFoodsAsync(db, ((customFoods ?? []) as CustomFoodRow[]).map(mapCustomFoodRow));
  await upsertPulledFavoritesAsync(db, ((favoriteFoods ?? []) as FavoriteFoodRow[]).map(mapFavoriteFoodRow));
}

async function bootstrapRemoteIntoLocalIfNeededAsync(
  db: SQLiteDatabase,
  userId: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT
      (
        (SELECT COUNT(*) FROM food_logs_local WHERE user_id = ?)
        + (SELECT COUNT(*) FROM custom_foods_local WHERE user_id = ?)
        + (SELECT COUNT(*) FROM favorite_foods_local WHERE user_id = ?)
      ) as count`,
    userId,
    userId,
    userId,
  );

  if ((row?.count ?? 0) > 0) {
    return;
  }

  await pullRemoteChangesAsync(db, userId);
}

async function syncNutritionInternalAsync(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !isNutritionLocalDatabaseSupported()) {
    return;
  }

  const db = await getNutritionDatabaseAsync();

  if (!db) {
    return;
  }

  await bootstrapRemoteIntoLocalIfNeededAsync(db, userId);
  await pushPendingChangesAsync(db);
  await pullRemoteChangesAsync(db, userId);
}

export const nutritionRepository = {
  async getDailySummary(userId: string): Promise<DailyNutritionSummary> {
    if (shouldUseDemoNutrition(userId)) {
      return MOCK_DAILY_NUTRITION;
    }

    if (!userId) {
      return {
        date: nowIso(),
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0,
        calorie_goal: DEFAULT_CALORIE_GOAL,
        protein_goal_g: DEFAULT_PROTEIN_GOAL,
        water_total_ml: 0,
        water_goal_ml: DEFAULT_WATER_GOAL_ML,
        meals: [],
        recent_foods: [],
        favorite_foods: [],
        water_logs: [],
      };
    }

    if (!isNutritionLocalDatabaseSupported()) {
      if (!isSupabaseConfigured) {
        return MOCK_DAILY_NUTRITION;
      }

      const [{ data: foodData, error: foodError }, waterLogs, favoriteFoods] = await Promise.all([
        supabase.from('food_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }),
        getRemoteWaterLogsAsync(userId),
        getRemoteFavoriteFoodsAsync(userId),
      ]);

      if (foodError) {
        console.error('Error fetching food logs:', foodError);
        return {
          ...MOCK_DAILY_NUTRITION,
          meals: [],
          recent_foods: [],
          favorite_foods: favoriteFoods,
          water_logs: waterLogs,
        };
      }

      return buildDailySummary(
        ((foodData ?? []) as FoodLogRow[]).map(mapFoodLogRow).filter((row) => !row.deleted_at),
        waterLogs,
        favoriteFoods,
      );
    }

    try {
      await this.syncPendingChanges(userId);
    } catch (error) {
      console.warn('Nutrition sync skipped while building summary.', error);
    }

    const db = await getNutritionDatabaseAsync();

    if (!db) {
      return MOCK_DAILY_NUTRITION;
    }

    const [meals, favorites, waterLogs] = await Promise.all([
      getLocalMealsAsync(db, userId),
      getLocalFavoritesAsync(db, userId),
      getRemoteWaterLogsAsync(userId),
    ]);

    return buildDailySummary(meals, waterLogs, favorites);
  },

  async searchFoods(userId: string, query: string): Promise<FoodSearchResult[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const db = await getNutritionDatabaseAsync();

    if (!db) {
      return [];
    }

    const favoriteKeys = userId ? await getFavoriteKeysAsync(db, userId) : new Set<string>();

    const customRows = await db.getAllAsync<LocalCustomFoodRow>(
      `SELECT * FROM custom_foods_local
        WHERE user_id = ?
          AND deleted_at IS NULL
          AND lower(name) LIKE lower(?)
        ORDER BY
          CASE
            WHEN lower(name) = lower(?) THEN 0
            WHEN lower(name) LIKE lower(?) THEN 1
            ELSE 2
          END,
          updated_at DESC
        LIMIT 8`,
      userId,
      `%${trimmedQuery}%`,
      trimmedQuery,
      `${trimmedQuery}%`,
    );

    const customResults = customRows.map((row: LocalCustomFoodRow) =>
      buildCustomFoodSearchResult(toCustomFood(row), favoriteKeys),
    );

    const ftsQuery = buildFtsQuery(trimmedQuery);
    let catalogRows: CatalogFoodRow[] = [];

    if (ftsQuery) {
      try {
        catalogRows = await db.getAllAsync<CatalogFoodRow>(
          `SELECT
            f.id,
            f.source,
            f.source_food_id,
            f.name,
            f.category,
            f.data_version,
            f.calories_per_100g,
            f.protein_g_per_100g,
            f.carbs_g_per_100g,
            f.fat_g_per_100g,
            f.default_serving_label,
            f.default_serving_grams,
            f.source_rank
          FROM catalog_foods_fts
          JOIN catalog_foods f ON f.id = catalog_foods_fts.food_id
          WHERE catalog_foods_fts MATCH ?
          ORDER BY
            CASE
              WHEN lower(f.name) = lower(?) THEN 0
              WHEN lower(f.name) LIKE lower(?) THEN 1
              ELSE 2
            END,
            f.source_rank ASC,
            bm25(catalog_foods_fts, 1.0, 0.2),
            f.name ASC
          LIMIT 24`,
          ftsQuery,
          trimmedQuery,
          `${trimmedQuery}%`,
        );
      } catch (error) {
        console.warn('FTS search failed, falling back to LIKE search.', error);
      }
    }

    if (catalogRows.length === 0) {
      catalogRows = await db.getAllAsync<CatalogFoodRow>(
        `SELECT
          id,
          source,
          source_food_id,
          name,
          category,
          data_version,
          calories_per_100g,
          protein_g_per_100g,
          carbs_g_per_100g,
          fat_g_per_100g,
          default_serving_label,
          default_serving_grams,
          source_rank
        FROM catalog_foods
        WHERE lower(name) LIKE lower(?)
        ORDER BY
          CASE
            WHEN lower(name) = lower(?) THEN 0
            WHEN lower(name) LIKE lower(?) THEN 1
            ELSE 2
          END,
          source_rank ASC,
          name ASC
        LIMIT 24`,
        `%${trimmedQuery}%`,
        trimmedQuery,
        `${trimmedQuery}%`,
      );
    }

    const catalogResults = await Promise.all(
      catalogRows.map((row) => buildCatalogSearchResultAsync(db, row, favoriteKeys)),
    );

    return [...customResults, ...catalogResults];
  },

  async addMeal(userId: string, meal: CreateFoodLogInput): Promise<FoodLog> {
    const timestamp = nowIso();
    const payload: FoodLog = {
      id: Crypto.randomUUID(),
      user_id: userId,
      meal_name: meal.meal_name.trim(),
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      meal_time: meal.meal_time,
      logged_at: timestamp,
      notes: meal.notes,
      source: meal.source,
      source_food_id: meal.source_food_id,
      custom_food_id: meal.custom_food_id,
      quantity: meal.quantity,
      serving_label: meal.serving_label,
      serving_grams: meal.serving_grams,
      is_custom: meal.is_custom,
      updated_at: timestamp,
      deleted_at: null,
      sync_status: 'pending',
    };

    const db = await getNutritionDatabaseAsync();

    if (!db) {
      return addRemoteMealAsync(userId, meal);
    }

    await db.runAsync(
      `INSERT INTO food_logs_local (
        id, user_id, meal_name, calories, protein_g, carbs_g, fat_g, meal_time, logged_at,
        notes, source, source_food_id, custom_food_id, quantity, serving_label, serving_grams,
        is_custom, updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending', NULL)`,
      payload.id,
      payload.user_id,
      payload.meal_name,
      payload.calories,
      payload.protein_g,
      payload.carbs_g,
      payload.fat_g,
      payload.meal_time,
      payload.logged_at,
      payload.notes,
      payload.source,
      payload.source_food_id,
      payload.custom_food_id,
      payload.quantity,
      payload.serving_label,
      payload.serving_grams,
      payload.is_custom ? 1 : 0,
      payload.updated_at,
    );

    await enqueueSyncRecord(db, {
      entity_type: 'food_log',
      entity_id: payload.id,
      operation: 'upsert',
      updated_at: payload.updated_at,
      payload_json: JSON.stringify(payload),
      last_error: null,
    });

    void this.syncPendingChanges(userId);

    return payload;
  },

  async deleteMeal(userId: string, mealId: string): Promise<void> {
    const db = await getNutritionDatabaseAsync();

    if (!db) {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('food_logs')
          .update({ deleted_at: nowIso(), updated_at: nowIso() } as never)
          .eq('id', mealId);
        if (error) {
          console.error('Error deleting food log:', error);
        }
      }
      return;
    }

    const existing = await db.getFirstAsync<Pick<LocalFoodLogRow, 'deleted_at'>>(
      'SELECT deleted_at FROM food_logs_local WHERE id = ?',
      mealId,
    );

    if (!existing || existing.deleted_at) {
      return;
    }

    const timestamp = nowIso();

    await db.runAsync(
      `UPDATE food_logs_local
        SET deleted_at = ?, updated_at = ?, sync_status = 'pending', last_error = NULL
        WHERE id = ?`,
      timestamp,
      timestamp,
      mealId,
    );

    await enqueueSyncRecord(db, {
      entity_type: 'food_log',
      entity_id: mealId,
      operation: 'delete',
      updated_at: timestamp,
      payload_json: null,
      last_error: null,
    });

    void this.syncPendingChanges(userId);
  },

  async saveCustomFood(userId: string, input: CreateCustomFoodInput): Promise<CustomFood> {
    const timestamp = nowIso();
    const payload: CustomFood = {
      id: Crypto.randomUUID(),
      user_id: userId,
      name: input.name.trim(),
      calories: input.calories,
      protein_g: input.protein_g,
      carbs_g: input.carbs_g,
      fat_g: input.fat_g,
      default_serving_label: input.default_serving_label.trim(),
      default_serving_grams: input.default_serving_grams,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
      sync_status: 'pending',
    };

    const db = await getNutritionDatabaseAsync();

    if (!db) {
      if (!isSupabaseConfigured) {
        return payload;
      }

      return saveRemoteCustomFoodAsync(userId, input);
    }

    await db.runAsync(
      `INSERT INTO custom_foods_local (
        id, user_id, name, calories, protein_g, carbs_g, fat_g, default_serving_label,
        default_serving_grams, created_at, updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending', NULL)`,
      payload.id,
      payload.user_id,
      payload.name,
      payload.calories,
      payload.protein_g,
      payload.carbs_g,
      payload.fat_g,
      payload.default_serving_label,
      payload.default_serving_grams,
      payload.created_at,
      payload.updated_at,
    );

    await enqueueSyncRecord(db, {
      entity_type: 'custom_food',
      entity_id: payload.id,
      operation: 'upsert',
      updated_at: payload.updated_at,
      payload_json: JSON.stringify(payload),
      last_error: null,
    });

    void this.syncPendingChanges(userId);

    return payload;
  },

  async toggleFavorite(userId: string, input: FavoriteFoodInput): Promise<FavoriteFood | null> {
    const db = await getNutritionDatabaseAsync();

    if (!db) {
      if (!isSupabaseConfigured) {
        return null;
      }

      let existingQuery = supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', userId)
        .eq('source', input.source)
        .is('deleted_at', null)
        .limit(1);

      existingQuery =
        input.source_food_id == null
          ? existingQuery.is('source_food_id', null)
          : existingQuery.eq('source_food_id', input.source_food_id);
      existingQuery =
        input.custom_food_id == null
          ? existingQuery.is('custom_food_id', null)
          : existingQuery.eq('custom_food_id', input.custom_food_id);

      const existing = await existingQuery.maybeSingle();

      if (existing.error) {
        console.error('Error checking favorite food:', existing.error);
        return null;
      }

      const existingFavorite = existing.data as FavoriteFoodRow | null;

      if (existingFavorite) {
        const { error } = await supabase
          .from('favorite_foods')
          .update({ deleted_at: nowIso(), updated_at: nowIso() } as never)
          .eq('id', existingFavorite.id);

        if (error) {
          console.error('Error deleting favorite food:', error);
        }

        return null;
      }

      const timestamp = nowIso();
      const { data, error } = await supabase
        .from('favorite_foods')
        .insert({
          user_id: userId,
          source: input.source,
          source_food_id: input.source_food_id,
          custom_food_id: input.custom_food_id,
          food_name: input.food_name.trim(),
          category: nullIfBlank(input.category),
          calories: input.calories,
          protein_g: input.protein_g,
          carbs_g: input.carbs_g,
          fat_g: input.fat_g,
          default_serving_label: nullIfBlank(input.default_serving_label),
          default_serving_grams: input.default_serving_grams,
          created_at: timestamp,
          updated_at: timestamp,
          deleted_at: null,
        } as never)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating favorite food:', error);
        return null;
      }

      return mapFavoriteFoodRow(data);
    }

    const existing = await db.getFirstAsync<LocalFavoriteFoodRow>(
      `SELECT * FROM favorite_foods_local
        WHERE user_id = ?
          AND source = ?
          AND COALESCE(source_food_id, '') = COALESCE(?, '')
          AND COALESCE(custom_food_id, '') = COALESCE(?, '')
        LIMIT 1`,
      userId,
      input.source,
      input.source_food_id,
      input.custom_food_id,
    );

    const timestamp = nowIso();

    if (existing && !existing.deleted_at) {
      await db.runAsync(
        `UPDATE favorite_foods_local
          SET deleted_at = ?, updated_at = ?, sync_status = 'pending', last_error = NULL
          WHERE id = ?`,
        timestamp,
        timestamp,
        existing.id,
      );

      await enqueueSyncRecord(db, {
        entity_type: 'favorite_food',
        entity_id: existing.id,
        operation: 'delete',
        updated_at: timestamp,
        payload_json: null,
        last_error: null,
      });

      void this.syncPendingChanges(userId);
      return null;
    }

    const payload: FavoriteFood = {
      id: existing?.id ?? Crypto.randomUUID(),
      user_id: userId,
      source: input.source,
      source_food_id: input.source_food_id,
      custom_food_id: input.custom_food_id,
      food_name: input.food_name.trim(),
      category: nullIfBlank(input.category),
      calories: input.calories,
      protein_g: input.protein_g,
      carbs_g: input.carbs_g,
      fat_g: input.fat_g,
      default_serving_label: nullIfBlank(input.default_serving_label),
      default_serving_grams: input.default_serving_grams,
      created_at: existing?.created_at ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
      sync_status: 'pending',
    };

    await db.runAsync(
      `INSERT INTO favorite_foods_local (
        id, user_id, source, source_food_id, custom_food_id, food_name, category, calories,
        protein_g, carbs_g, fat_g, default_serving_label, default_serving_grams, created_at,
        updated_at, deleted_at, sync_status, last_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending', NULL)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        source = excluded.source,
        source_food_id = excluded.source_food_id,
        custom_food_id = excluded.custom_food_id,
        food_name = excluded.food_name,
        category = excluded.category,
        calories = excluded.calories,
        protein_g = excluded.protein_g,
        carbs_g = excluded.carbs_g,
        fat_g = excluded.fat_g,
        default_serving_label = excluded.default_serving_label,
        default_serving_grams = excluded.default_serving_grams,
        updated_at = excluded.updated_at,
        deleted_at = NULL,
        sync_status = 'pending',
        last_error = NULL`,
      payload.id,
      payload.user_id,
      payload.source,
      payload.source_food_id,
      payload.custom_food_id,
      payload.food_name,
      payload.category,
      payload.calories,
      payload.protein_g,
      payload.carbs_g,
      payload.fat_g,
      payload.default_serving_label,
      payload.default_serving_grams,
      payload.created_at,
      payload.updated_at,
    );

    await enqueueSyncRecord(db, {
      entity_type: 'favorite_food',
      entity_id: payload.id,
      operation: 'upsert',
      updated_at: payload.updated_at,
      payload_json: JSON.stringify(payload),
      last_error: null,
    });

    void this.syncPendingChanges(userId);

    return payload;
  },

  async addWater(userId: string, amountMl: number): Promise<WaterLog> {
    const payload: WaterLog = {
      id: `water-${Date.now()}`,
      user_id: userId,
      amount_ml: amountMl,
      logged_at: nowIso(),
    };

    if (!isSupabaseConfigured) {
      return payload;
    }

    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        amount_ml: amountMl,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating water log:', error);
      return payload;
    }

    return mapWaterLogRow(data);
  },

  async getLocalFoodActivityKeys(userId: string): Promise<string[]> {
    if (shouldUseDemoNutrition(userId)) {
      return MOCK_DAILY_NUTRITION.meals.map((meal) => meal.logged_at.slice(0, 10));
    }

    const db = await getNutritionDatabaseAsync();

    if (!db) {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('food_logs')
        .select('logged_at,deleted_at')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(60);

      if (error) {
        console.error('Error fetching meal activity:', error);
        return [];
      }

      return (((data ?? []) as Array<Pick<FoodLogRow, 'logged_at' | 'deleted_at'>>)
        .filter((row) => !row.deleted_at)
        .map((row) => row.logged_at.slice(0, 10)));
    }

    return getLocalFoodActivityKeysAsync(db, userId);
  },

  async syncPendingChanges(userId: string): Promise<void> {
    if (!userId || !isSupabaseConfigured || !isNutritionLocalDatabaseSupported()) {
      return;
    }

    const existing = activeSyncs.get(userId);

    if (existing) {
      return existing;
    }

    const syncPromise = syncNutritionInternalAsync(userId).finally(() => {
      activeSyncs.delete(userId);
    });

    activeSyncs.set(userId, syncPromise);

    return syncPromise;
  },
};
