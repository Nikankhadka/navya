export interface SQLiteStatementResult<T = unknown> {
  getAllAsync(): Promise<T[]>;
  getFirstAsync(): Promise<T | null>;
}

export interface SQLitePreparedStatement {
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

export function getNutritionDatabaseAsync(): Promise<SQLiteDatabase | null>;
export function isNutritionLocalDatabaseSupported(): boolean;
