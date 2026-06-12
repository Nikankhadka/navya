import * as Crypto from 'expo-crypto';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { mapFavoriteFoodRow, mapFoodLogRow, mapWaterLogRow } from '@/lib/supabase/mappers';
import type {
  CreateCustomFoodInput,
  CreateFoodLogInput,
  CustomFood,
  DailyNutritionSummary,
  FavoriteFood,
  FavoriteFoodInput,
  FoodLog,
  FoodSearchResult,
  WaterLog,
} from '@/types/app';
import { MOCK_DAILY_NUTRITION, MOCK_FOOD_SEARCH_RESULTS } from '@/features/demo/mockData';
import {
  getNutritionDatabaseAsync,
  isNutritionLocalDatabaseSupported,
} from '@/features/nutrition/db/nutritionDatabase';
import { getTodayDateString } from '@/utils/date';
import {
  buildCatalogSearchResultAsync,
  buildCustomFoodSearchResult,
  buildDailySummary,
  buildFtsQuery,
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_WATER_GOAL_ML,
  enqueueSyncRecord,
  getFavoriteKeysAsync,
  getLocalFavoritesAsync,
  getLocalFoodActivityKeysAsync,
  getLocalMealsAsync,
  nowIso,
  nullIfBlank,
  shouldUseDemoNutrition,
  toCustomFood,
  type CatalogFoodRow,
  type LocalCustomFoodRow,
  type LocalFavoriteFoodRow,
  type LocalFoodLogRow,
} from './nutritionRepository.helpers';
import {
  addRemoteMealAsync,
  getRemoteFavoriteFoodsAsync,
  getRemoteWaterLogsAsync,
  saveRemoteCustomFoodAsync,
  syncNutritionInternalAsync,
  type FavoriteFoodRow,
  type FoodLogRow,
} from './nutritionRepository.queries';

// ---------------------------------------------------------------------------
// Module-level state - deduplication map for concurrent syncs
// ---------------------------------------------------------------------------

const activeSyncs = new Map<string, Promise<void>>();

// ---------------------------------------------------------------------------
// Public repository object
// ---------------------------------------------------------------------------

export const nutritionRepository = {
  async getDailySummary(userId: string, dateKey?: string): Promise<DailyNutritionSummary> {
    const targetDate = dateKey ?? getTodayDateString();

    if (shouldUseDemoNutrition(userId)) {
      return MOCK_DAILY_NUTRITION;
    }

    if (!userId) {
      return {
        date: new Date().toISOString(),
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
        supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .order('logged_at', { ascending: false }),
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
        targetDate,
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

    return buildDailySummary(meals, waterLogs, favorites, targetDate);
  },

  async searchFoods(userId: string, query: string): Promise<FoodSearchResult[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    if (shouldUseDemoNutrition(userId)) {
      return MOCK_FOOD_SEARCH_RESULTS.filter((f) =>
        f.name.toLowerCase().includes(trimmedQuery.toLowerCase()),
      );
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

      return ((data ?? []) as Pick<FoodLogRow, 'logged_at' | 'deleted_at'>[])
        .filter((row) => !row.deleted_at)
        .map((row) => row.logged_at.slice(0, 10));
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
