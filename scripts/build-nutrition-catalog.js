#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');

const USDA_NUTRIENT_IDS = {
  protein_g: new Set(['1003']),
  fat_g: new Set(['1004']),
  carbs_g: new Set(['1005']),
  calories: new Set(['1008', '2047', '2048']),
};

const DEFAULT_OUT = path.join(process.cwd(), 'assets', 'nutrition', 'catalog.db');

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith('--') ? next : 'true';
    if (args[key] === next) {
      index += 1;
    }
  }

  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

async function forEachCsvRow(filePath, onRow) {
  const input = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!headers) {
      headers = readCsvLine(line);
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    const cells = readCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });

    await onRow(row);
  }
}

function findFileRecursive(rootDir, fileName) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const nested = findFileRecursive(fullPath, fileName);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (entry.name === fileName) {
      return fullPath;
    }
  }

  return null;
}

function unzipArchive(zipPath, outputDir) {
  const result = spawnSync('unzip', ['-q', '-o', zipPath, '-d', outputDir], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    fail(`Failed to unzip ${zipPath}`);
  }
}

function numberOrNull(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeSql(value) {
  if (value == null) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function compactLabel(parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAmount(value) {
  if (value == null) {
    return '';
  }

  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

async function loadDatasetFromDirectory(source, rootDir) {
  const foodPath = findFileRecursive(rootDir, 'food.csv');
  const foodCategoryPath = findFileRecursive(rootDir, 'food_category.csv');
  const foodNutrientPath = findFileRecursive(rootDir, 'food_nutrient.csv');
  const foodPortionPath = findFileRecursive(rootDir, 'food_portion.csv');
  const measureUnitPath = findFileRecursive(rootDir, 'measure_unit.csv');

  if (!foodPath || !foodCategoryPath || !foodNutrientPath || !foodPortionPath || !measureUnitPath) {
    fail(`Missing required USDA CSV files in ${rootDir}`);
  }

  const categoryMap = new Map();
  const measureUnitMap = new Map();
  const foods = new Map();
  const portions = [];

  await forEachCsvRow(foodCategoryPath, async (row) => {
    categoryMap.set(row.id, row.description || row.code || '');
  });

  await forEachCsvRow(measureUnitPath, async (row) => {
    measureUnitMap.set(row.id, row.name || '');
  });

  await forEachCsvRow(foodPath, async (row) => {
    const dataType = row.data_type;
    const allowRow =
      source === 'usda_foundation'
        ? dataType === 'foundation_food'
        : dataType === 'sr_legacy_food';

    if (!allowRow) {
      return;
    }

    const fdcId = row.fdc_id;
    const description = row.description?.trim();

    if (!fdcId || !description) {
      return;
    }

    const id = `${source}:${fdcId}`;
    foods.set(fdcId, {
      id,
      source,
      source_food_id: fdcId,
      name: description,
      normalized_name: description.toLowerCase(),
      category: categoryMap.get(row.food_category_id) || dataType || null,
      data_version: 'usda_fdc_2026_04_mvp',
      calories_per_100g: null,
      protein_g_per_100g: null,
      carbs_g_per_100g: null,
      fat_g_per_100g: null,
      default_serving_label: '100 g',
      default_serving_grams: 100,
      source_rank: source === 'usda_foundation' ? 0 : 1,
    });
  });

  await forEachCsvRow(foodNutrientPath, async (row) => {
    const food = foods.get(row.fdc_id);

    if (!food) {
      return;
    }

    const nutrientId = row.nutrient_id;
    const amount = numberOrNull(row.amount);

    if (amount == null) {
      return;
    }

    if (USDA_NUTRIENT_IDS.calories.has(nutrientId)) {
      food.calories_per_100g = food.calories_per_100g ?? amount;
    } else if (USDA_NUTRIENT_IDS.protein_g.has(nutrientId)) {
      food.protein_g_per_100g = food.protein_g_per_100g ?? amount;
    } else if (USDA_NUTRIENT_IDS.carbs_g.has(nutrientId)) {
      food.carbs_g_per_100g = food.carbs_g_per_100g ?? amount;
    } else if (USDA_NUTRIENT_IDS.fat_g.has(nutrientId)) {
      food.fat_g_per_100g = food.fat_g_per_100g ?? amount;
    }
  });

  await forEachCsvRow(foodPortionPath, async (row) => {
    const food = foods.get(row.fdc_id);

    if (!food) {
      return;
    }

    const amount = numberOrNull(row.amount) ?? 1;
    const gramWeight = numberOrNull(row.gram_weight);
    const unitName = measureUnitMap.get(row.measure_unit_id) || '';
    const modifier = row.modifier?.trim() || '';
    const portionDescription = row.portion_description?.trim() || '';
    const labelBase = compactLabel([
      formatAmount(amount),
      unitName,
      modifier,
      portionDescription,
    ]);

    portions.push({
      id: `${food.id}:portion:${row.id || portions.length + 1}`,
      food_id: food.id,
      amount,
      unit: unitName || null,
      modifier: modifier || null,
      gram_weight: gramWeight,
      label: gramWeight ? `${labelBase || 'Serving'} (${formatAmount(gramWeight)} g)` : labelBase || 'Serving',
      is_default: 0,
    });
  });

  for (const food of foods.values()) {
    const firstPortion = portions.find((portion) => portion.food_id === food.id && portion.gram_weight);
    if (firstPortion) {
      food.default_serving_label = firstPortion.label;
      food.default_serving_grams = firstPortion.gram_weight;
      firstPortion.is_default = 1;
    }
  }

  return {
    foods: Array.from(foods.values()).filter((food) => food.calories_per_100g != null),
    portions,
  };
}

function buildSql({ foods, portions }) {
  const lines = [
    'PRAGMA journal_mode = WAL;',
    'PRAGMA synchronous = NORMAL;',
    'BEGIN;',
    'DROP TABLE IF EXISTS catalog_meta;',
    'DROP TABLE IF EXISTS catalog_foods;',
    'DROP TABLE IF EXISTS catalog_portions;',
    'DROP TABLE IF EXISTS catalog_foods_fts;',
    `CREATE TABLE catalog_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
    `CREATE TABLE catalog_foods (
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
    );`,
    `CREATE TABLE catalog_portions (
      id TEXT PRIMARY KEY NOT NULL,
      food_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 1,
      unit TEXT,
      modifier TEXT,
      gram_weight REAL,
      label TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE VIRTUAL TABLE catalog_foods_fts USING fts5(
      food_id UNINDEXED,
      name,
      category
    );`,
    `INSERT INTO catalog_meta (key, value) VALUES ('data_version', 'usda_fdc_2026_04_mvp');`,
  ];

  for (const food of foods) {
    lines.push(
      `INSERT INTO catalog_foods (
        id, source, source_food_id, name, normalized_name, category, data_version,
        calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g,
        default_serving_label, default_serving_grams, source_rank
      ) VALUES (
        ${escapeSql(food.id)},
        ${escapeSql(food.source)},
        ${escapeSql(food.source_food_id)},
        ${escapeSql(food.name)},
        ${escapeSql(food.normalized_name)},
        ${escapeSql(food.category)},
        ${escapeSql(food.data_version)},
        ${escapeSql(food.calories_per_100g)},
        ${escapeSql(food.protein_g_per_100g)},
        ${escapeSql(food.carbs_g_per_100g)},
        ${escapeSql(food.fat_g_per_100g)},
        ${escapeSql(food.default_serving_label)},
        ${escapeSql(food.default_serving_grams)},
        ${escapeSql(food.source_rank)}
      );`,
    );

    lines.push(
      `INSERT INTO catalog_foods_fts (food_id, name, category) VALUES (
        ${escapeSql(food.id)},
        ${escapeSql(food.name)},
        ${escapeSql(food.category)}
      );`,
    );
  }

  for (const portion of portions) {
    lines.push(
      `INSERT INTO catalog_portions (
        id, food_id, amount, unit, modifier, gram_weight, label, is_default
      ) VALUES (
        ${escapeSql(portion.id)},
        ${escapeSql(portion.food_id)},
        ${escapeSql(portion.amount)},
        ${escapeSql(portion.unit)},
        ${escapeSql(portion.modifier)},
        ${escapeSql(portion.gram_weight)},
        ${escapeSql(portion.label)},
        ${escapeSql(portion.is_default)}
      );`,
    );
  }

  lines.push(
    'CREATE INDEX idx_catalog_foods_source_food_id ON catalog_foods(source, source_food_id);',
    'CREATE INDEX idx_catalog_portions_food_id ON catalog_portions(food_id);',
    'COMMIT;',
    'VACUUM;',
  );

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const foundationZip = args.foundation || process.env.USDA_FDC_FOUNDATION_ZIP;
  const srZip = args.sr || process.env.USDA_FDC_SR_ZIP;
  const outPath = path.resolve(args.out || DEFAULT_OUT);

  if (!foundationZip || !srZip) {
    fail('Expected --foundation <zip> and --sr <zip> or matching env vars.');
  }

  if (!fs.existsSync(foundationZip)) {
    fail(`Foundation archive not found: ${foundationZip}`);
  }

  if (!fs.existsSync(srZip)) {
    fail(`SR archive not found: ${srZip}`);
  }

  ensureDir(path.dirname(outPath));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'navya-nutrition-'));
  const foundationDir = path.join(tempDir, 'foundation');
  const srDir = path.join(tempDir, 'sr');

  unzipArchive(foundationZip, foundationDir);
  unzipArchive(srZip, srDir);

  const [foundationData, srData] = await Promise.all([
    loadDatasetFromDirectory('usda_foundation', foundationDir),
    loadDatasetFromDirectory('usda_sr_legacy', srDir),
  ]);

  const foods = [...foundationData.foods, ...srData.foods];
  const portions = [...foundationData.portions, ...srData.portions];
  const sql = buildSql({ foods, portions });

  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { force: true });
  }

  const sqliteResult = spawnSync('sqlite3', [outPath], {
    input: sql,
    encoding: 'utf8',
  });

  if (sqliteResult.status !== 0) {
    process.stderr.write(sqliteResult.stderr || '');
    fail('Failed to build nutrition catalog database.');
  }

  const stats = fs.statSync(outPath);
  console.log(`Built nutrition catalog at ${outPath}`);
  console.log(`Foods indexed: ${foods.length}`);
  console.log(`Portions indexed: ${portions.length}`);
  console.log(`File size: ${Math.round(stats.size / 1024)} KB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
