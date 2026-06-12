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
  FavoriteFood,
  FoodLog,
  NutritionSyncRecord,
  WaterLog,
} from '@/types/app';
import {
  getNutritionDatabaseAsync,
  isNutritionLocalDatabaseSupported,
  type SQLiteDatabase,
} from '@/features/nutrition/db/nutritionDatabase';
import {
  nowIso,
  type LocalCustomFoodRow,
  type LocalFavoriteFoodRow,
  type LocalFoodLogRow,
} from './nutritionRepository.helpers';

// ---------------------------------------------------------------------------
// Supabase row types (derived from Database schema)
// ---------------------------------------------------------------------------

export type FoodLogRow = Database['public']['Tables']['food_logs']['Row'];
export type CustomFoodRow = Database['public']['Tables']['custom_foods']['Row'];
export type FavoriteFoodRow = Database['public']['Tables']['favorite_foods']['Row'];
export type WaterLogRow = Database['public']['Tables']['water_logs']['Row'];

// ---------------------------------------------------------------------------
// Remote read helpers
// ---------------------------------------------------------------------------

export async function getRemoteWaterLogsAsync(userId: string): Promise<WaterLog[]> {
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

export async function getRemoteFavoriteFoodsAsync(userId: string): Promise<FavoriteFood[]> {
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

  return ((data ?? []) as FavoriteFoodRow[])
    .map(mapFavoriteFoodRow)
    .filter((row) => !row.deleted_at);
}

// ---------------------------------------------------------------------------
// Remote write helpers
// ---------------------------------------------------------------------------

export async function addRemoteMealAsync(
  userId: string,
  meal: CreateFoodLogInput,
): Promise<FoodLog> {
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

export async function saveRemoteCustomFoodAsync(
  userId: string,
  input: CreateCustomFoodInput,
): Promise<CustomFood> {
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

// ---------------------------------------------------------------------------
// Sync: push (local → remote)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sync: pull (remote → local)
// ---------------------------------------------------------------------------

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
    supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('favorite_foods')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
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
  await upsertPulledCustomFoodsAsync(
    db,
    ((customFoods ?? []) as CustomFoodRow[]).map(mapCustomFoodRow),
  );
  await upsertPulledFavoritesAsync(
    db,
    ((favoriteFoods ?? []) as FavoriteFoodRow[]).map(mapFavoriteFoodRow),
  );
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

export async function syncNutritionInternalAsync(userId: string): Promise<void> {
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
