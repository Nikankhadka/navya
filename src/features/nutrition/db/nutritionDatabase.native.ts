/**
 * Nutrition local database — runtime access layer.
 *
 * Initialization / migration logic lives in nutritionDatabase.init.ts.
 * This module exports the public API: isNutritionLocalDatabaseSupported,
 * getNutritionDatabaseAsync, and the SQLiteDatabase type (re-exported).
 */
import { initializeNutritionDatabaseAsync, type SQLiteDatabase } from './nutritionDatabase.init';

// Re-export the database interface for consumers that import from this module.
export type { SQLiteDatabase };

let databasePromise: Promise<SQLiteDatabase | null> | null = null;

export function isNutritionLocalDatabaseSupported(): boolean {
  return process.env.EXPO_OS !== 'web';
}

export async function getNutritionDatabaseAsync(): Promise<SQLiteDatabase | null> {
  if (!isNutritionLocalDatabaseSupported()) {
    return null;
  }

  if (!databasePromise) {
    databasePromise = initializeNutritionDatabaseAsync().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}
