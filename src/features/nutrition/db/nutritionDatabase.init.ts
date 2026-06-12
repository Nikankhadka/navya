/**
 * Nutrition local database initialization and migration logic.
 *
 * Extracted from nutritionDatabase.native.ts to keep per-file line counts
 * under 300. This module handles database creation, schema migration,
 * and fallback catalog seeding.
 */

interface SQLiteStatementResult<T = unknown> {
  getAllAsync(): Promise<T[]>;
  getFirstAsync(): Promise<T | null>;
}

interface SQLitePreparedStatement {
  executeAsync<T = unknown>(...params: unknown[]): Promise<SQLiteStatementResult<T>>;
  finalizeAsync(): Promise<void>;
}

export interface SQLiteDatabase {
  execAsync(source: string): Promise<void>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
  prepareAsync(source: string): Promise<SQLitePreparedStatement>;
  runAsync(source: string, ...params: unknown[]): Promise<unknown>;
  getFirstAsync<T = unknown>(source: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T = unknown>(source: string, ...params: unknown[]): Promise<T[]>;
}

const NUTRITION_DATABASE_NAME = 'nutrition.db';
const NUTRITION_CATALOG_ASSET = require('../../../../assets/nutrition/catalog.db');

const FALLBACK_FOODS = [
  {
    id: 'usda_foundation:534358',
    source: 'usda_foundation',
    source_food_id: '534358',
    name: 'Chicken, rice bowl',
    category: 'Mixed dishes',
    calories_per_100g: 182,
    protein_g_per_100g: 14.1,
    carbs_g_per_100g: 19.1,
    fat_g_per_100g: 5.2,
    default_serving_label: '100 g',
    default_serving_grams: 100,
    source_rank: 0,
  },
  {
    id: 'usda_sr_legacy:173944',
    source: 'usda_sr_legacy',
    source_food_id: '173944',
    name: 'Oats, cooked with water',
    category: 'Breakfast cereals',
    calories_per_100g: 71,
    protein_g_per_100g: 2.5,
    carbs_g_per_100g: 12,
    fat_g_per_100g: 1.5,
    default_serving_label: '100 g',
    default_serving_grams: 100,
    source_rank: 1,
  },
  {
    id: 'usda_sr_legacy:43566',
    source: 'usda_sr_legacy',
    source_food_id: '43566',
    name: 'Banana, raw',
    category: 'Fruit',
    calories_per_100g: 89,
    protein_g_per_100g: 1.1,
    carbs_g_per_100g: 22.8,
    fat_g_per_100g: 0.3,
    default_serving_label: '100 g',
    default_serving_grams: 100,
    source_rank: 1,
  },
  {
    id: 'usda_foundation:746782',
    source: 'usda_foundation',
    source_food_id: '746782',
    name: 'Protein powder, whey based',
    category: 'Supplements',
    calories_per_100g: 406,
    protein_g_per_100g: 71.4,
    carbs_g_per_100g: 17.1,
    fat_g_per_100g: 8.6,
    default_serving_label: '1 scoop',
    default_serving_grams: 35,
    source_rank: 0,
  },
] as const;

const FALLBACK_PORTIONS = [
  {
    id: 'portion-1',
    food_id: 'usda_foundation:534358',
    amount: 1,
    unit: 'bowl',
    modifier: null,
    gram_weight: 340,
    label: '1 bowl (340 g)',
    is_default: 0,
  },
  {
    id: 'portion-2',
    food_id: 'usda_sr_legacy:173944',
    amount: 1,
    unit: 'cup',
    modifier: 'cooked',
    gram_weight: 234,
    label: '1 cup cooked (234 g)',
    is_default: 0,
  },
  {
    id: 'portion-3',
    food_id: 'usda_sr_legacy:43566',
    amount: 1,
    unit: 'banana',
    modifier: 'medium',
    gram_weight: 118,
    label: '1 medium banana (118 g)',
    is_default: 0,
  },
  {
    id: 'portion-4',
    food_id: 'usda_foundation:746782',
    amount: 1,
    unit: 'scoop',
    modifier: null,
    gram_weight: 35,
    label: '1 scoop (35 g)',
    is_default: 1,
  },
] as const;

/**
 * Open the nutrition SQLite database from the bundled catalog asset,
 * run schema migrations, and seed fallback data if needed.
 */
export async function initializeNutritionDatabaseAsync(): Promise<SQLiteDatabase | null> {
  const { importDatabaseFromAssetAsync, openDatabaseAsync } = await import('expo-sqlite');

  await importDatabaseFromAssetAsync(NUTRITION_DATABASE_NAME, {
    assetId: NUTRITION_CATALOG_ASSET,
    forceOverwrite: false,
  });

  const db = await openDatabaseAsync(NUTRITION_DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS catalog_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_foods (
      id TEXT PRIMARY KEY NOT NULL,
      source TEXT NOT NULL,
      source_food_id TEXT NOT NULL,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      category TEXT,
      data_version TEXT NOT NULL,
      calories_per_100g REAL,
      protein_g_per_100g REAL,
      carbs_g_per_100g REAL,
      fat_g_per_100g REAL,
      default_serving_label TEXT,
      default_serving_grams REAL,
      source_rank INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS catalog_portions (
      id TEXT PRIMARY KEY NOT NULL,
      food_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 1,
      unit TEXT,
      modifier TEXT,
      gram_weight REAL,
      label TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS catalog_foods_fts USING fts5(
      food_id UNINDEXED,
      name,
      category
    );

    CREATE TABLE IF NOT EXISTS food_logs_local (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      meal_name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      meal_time TEXT NOT NULL,
      logged_at TEXT NOT NULL,
      notes TEXT,
      source TEXT NOT NULL,
      source_food_id TEXT,
      custom_food_id TEXT,
      quantity REAL NOT NULL,
      serving_label TEXT,
      serving_grams REAL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS custom_foods_local (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      default_serving_label TEXT NOT NULL,
      default_serving_grams REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS favorite_foods_local (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      source TEXT NOT NULL,
      source_food_id TEXT,
      custom_food_id TEXT,
      food_name TEXT NOT NULL,
      category TEXT,
      calories REAL NOT NULL,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      default_serving_label TEXT,
      default_serving_grams REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS nutrition_sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      payload_json TEXT,
      last_error TEXT,
      UNIQUE(entity_type, entity_id)
    );

    CREATE INDEX IF NOT EXISTS idx_catalog_foods_source_food_id
      ON catalog_foods(source, source_food_id);
    CREATE INDEX IF NOT EXISTS idx_catalog_portions_food_id
      ON catalog_portions(food_id);
    CREATE INDEX IF NOT EXISTS idx_food_logs_local_user_date
      ON food_logs_local(user_id, logged_at DESC);
    CREATE INDEX IF NOT EXISTS idx_custom_foods_local_user_name
      ON custom_foods_local(user_id, name);
    CREATE INDEX IF NOT EXISTS idx_favorite_foods_local_user_updated
      ON favorite_foods_local(user_id, updated_at DESC);
  `);

  await seedFallbackCatalogAsync(db);

  return db;
}

/**
 * Seed the catalog tables with small fallback food data when the database
 * is freshly created (catalog is empty).
 */
async function seedFallbackCatalogAsync(db: SQLiteDatabase): Promise<void> {
  const existingCatalog = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM catalog_foods',
  );

  if ((existingCatalog?.count ?? 0) > 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT OR REPLACE INTO catalog_meta (key, value) VALUES (?, ?)',
      'data_version',
      'usda_fallback_seed',
    );

    for (const food of FALLBACK_FOODS) {
      await db.runAsync(
        `INSERT OR REPLACE INTO catalog_foods (
          id, source, source_food_id, name, normalized_name, category, data_version,
          calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g,
          default_serving_label, default_serving_grams, source_rank
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        food.id,
        food.source,
        food.source_food_id,
        food.name,
        food.name.toLowerCase(),
        food.category,
        'usda_fallback_seed',
        food.calories_per_100g,
        food.protein_g_per_100g,
        food.carbs_g_per_100g,
        food.fat_g_per_100g,
        food.default_serving_label,
        food.default_serving_grams,
        food.source_rank,
      );

      await db.runAsync(
        'INSERT INTO catalog_foods_fts (food_id, name, category) VALUES (?, ?, ?)',
        food.id,
        food.name,
        food.category,
      );
    }

    for (const portion of FALLBACK_PORTIONS) {
      await db.runAsync(
        `INSERT OR REPLACE INTO catalog_portions (
          id, food_id, amount, unit, modifier, gram_weight, label, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        portion.id,
        portion.food_id,
        portion.amount,
        portion.unit,
        portion.modifier,
        portion.gram_weight,
        portion.label,
        portion.is_default,
      );
    }
  });
}
