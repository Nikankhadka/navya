# Services Codemap

**Last Updated:** 2026-06-13

## Backend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Supabase Backend                       │
│                                                           │
│  ┌─────────────┐  ┌────────────────────────────────────┐ │
│  │    Auth      │  │           Postgres Database        │ │
│  │  magic-link  │  │                                    │ │
│  │  OTP email   │  │  ┌──────────┐ ┌────────────────┐  │ │
│  └─────────────┘  │  │ profiles │ │ food_logs       │  │ │
│                    │  ├──────────┤ ├────────────────┤  │ │
│  ┌─────────────┐  │  │ weight   │ │ custom_foods    │  │ │
│  │  Storage    │  │  │ _logs    │ ├────────────────┤  │ │
│  │  avatars    │  │  ├──────────┤ │ favorite_foods  │  │ │
│  └─────────────┘  │  │ water    │ ├────────────────┤  │ │
│                    │  │ _logs    │ │ food_catalog    │  │ │
│  ┌─────────────┐  │  ├──────────┤ ├────────────────┤  │ │
│  │   Edge      │  │  │ workout  │ │ meal_templates  │  │ │
│  │  Functions  │  │  │ _plans   │ ├────────────────┤  │ │
│  │             │  │  ├──────────┤ │ exercise_library│  │ │
│  │ coach-action│  │  │ workout  │ ├────────────────┤  │ │
│  │ coach-weekly│  │  │ _plan    │ │ coach_messages  │  │ │
│  │ -summary    │  │  │ _days    │ ├────────────────┤  │ │
│  │      │      │  │  ├──────────┤ │ feature_flags   │  │ │
│  │   OpenAI    │  │  │ workout  │ ├────────────────┤  │ │
│  │   GPT-4o    │  │  │ _sessions│ │ habit_streaks   │  │ │
│  └─────────────┘  │  ├──────────┤ │                  │  │ │
│                    │  │ session  │ │  + RLS policies  │  │ │
│                    │  │ _exercises│ │  on all tables   │  │ │
│                    │  └──────────┘ └────────────────┘  │ │
│                    └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Supabase Client (`src/lib/supabase/client.ts`)

**Purpose:** Typed Supabase client with cross-platform auth storage

**Key Features:**
- Uses Supabase type-gen (`Database` type from `src/types/database.ts`)
- **Native:** `expo-secure-store` for secure token storage
- **Web:** `localStorage` with in-memory fallback
- Auto-refresh tokens enabled (except native web)
- Session persistence with URL detection on web

**Exports:**
| Export | Type | Description |
|--------|------|-------------|
| `supabase` | SupabaseClient | Typed Supabase client instance |
| `isSupabaseConfigured` | boolean | Whether env vars are set |

**Dependencies:** `@supabase/supabase-js`, `expo-secure-store`, `@/config/env`

---

## Database Mappers (`src/lib/supabase/mappers.ts`)

**Purpose:** Transform raw Supabase query results to app-level types

**Exports:**
| Function | Input → Output |
|----------|---------------|
| `mapWorkoutPlanRow` | DB row → `WorkoutPlan` |
| `mapWorkoutSessionRow` | DB row → `WorkoutSession` |
| `mapSessionExerciseRow` | DB row → `SessionExercise` |
| `mapFoodLogRow` | DB row → `FoodLog` |
| `mapCustomFoodRow` | DB row → `CustomFood` |
| `mapFavoriteFoodRow` | DB row → `FavoriteFood` |
| `mapWaterLogRow` | DB row → `WaterLog` |
| `mapWeightLogRow` | DB row → `WeightLog` |
| `mapCoachMessageRow` | DB row → `CoachMessage` |
| `mapFeatureFlagsRow` | DB row → `FeatureFlags` |

Used by all feature service layers for type-safe DB → app type conversion.

---

## Auth Utilities (`src/lib/auth/`)

### `redirects.ts`
| Export | Purpose |
|--------|---------|
| `getAuthRedirectUrl()` | Builds platform-appropriate callback URL (native scheme or web URL) |
| `getAuthCallbackError(url)` | Extracts user-friendly error from callback URL params |
| `createSessionFromUrl(url)` | Handles full callback flow: extract params, detect errors, exchange code or set session |

### `loading.ts`
| Export | Purpose |
|--------|---------|
| `withMinimumLoading<T>(fn, minMs)` | Ensures operation takes at least `minMs` for smooth UX transitions |

---

## Logger (`src/lib/logger.ts`)

**Purpose:** Leveled logging utility (debug/info/warn/error) with environment-aware filtering

| Export | Type | Description |
|--------|------|-------------|
| `logger.debug(msg, data?)` | Method | Debug log (dev only) |
| `logger.info(msg, data?)` | Method | Info log |
| `logger.warn(msg, data?)` | Method | Warning log |
| `logger.error(msg, data?)` | Method | Error log |

Behaves: `__DEV__` → all levels; production → warn+ only.

---

## Validation (`src/lib/validation.ts`)

**Purpose:** Shared Zod schemas for input validation

| Export | Type | Description |
|--------|------|-------------|
| `emailSchema` | ZodString | Email validation (trim, lowercase, format check) |
| `getFirstErrorMessage(result, field)` | Function | Extracts first Zod error for a field |

---

## Nutrition Repository (`src/features/nutrition/api/nutrition.repository.ts`)

**Purpose:** Offline-first SQLite database for food catalog and nutrition data

**Architecture:**
```
nutritionRepository (facade)
  ├── nutritionDatabase.native.ts → expo-sqlite (native)
  └── nutritionDatabase.web.ts    → OPFS via expo-sqlite (web)
```

**Key Capabilities:**
- Local food search (full-text via SQLite FTS)
- Offline food log queue with sync status tracking
- Custom foods and favorites stored locally
- Periodic sync with Supabase

---

## Edge Functions (`supabase/functions/`)

### `coach-action`
**Purpose:** AI coach response generation via OpenAI GPT-4o

**Flow:**
```
Client → Edge Function → OpenAI Chat Completion → Coach response → stored in coach_messages
```

Input: user message, action_type, recent context
Output: AI-generated coach message stored in DB

### `coach-weekly-summary`
**Purpose:** Weekly AI-generated summary of user progress

**Flow:**
```
Client → Edge Function → aggregates week's data → OpenAI → summary → returned to client
```

Input: user_id, week date range
Output: structured weekly summary with nutrition/workout/progress highlights

---

## Database Migrations (`supabase/migrations/`)

| Migration | Date | Purpose |
|-----------|------|---------|
| `20260410_mvp_core_schema.sql` | Apr 10 | Core tables: profiles, workout plans, sessions, food logs |
| `20260411_mvp_phase1_water_logs.sql` | Apr 11 | Water tracking table + RLS |
| `20260412_onboarding_fields.sql` | Apr 12 | Onboarding fields on profiles |
| `20260508_mvp_phase2_progress_logs.sql` | May 8 | Progress tracking, habit streaks |
| `20260509_nutrition_offline_search.sql` | May 9 | Food catalog + FTS indexes |
| `20260522_fix_security_lints.sql` | May 22 | Security hardening + RLS fixes |
| `20260612_add_performance_indexes_and_timestamps.sql` | Jun 12 | Performance indexes, updated_at triggers |
| `20260612_meal_templates.sql` | Jun 12 | Meal templates table + RLS |
| `20260613_exercise_library_seed.sql` | Jun 13 | Seed data: exercise library |

---

## Feature Service Pattern

All feature services follow a consistent pattern:

```typescript
// src/features/{domain}/api/{domain}.service.ts

export const domainService = {
  async fetch(userId: string): Promise<DomainType> {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return mapRow(data);  // via mappers.ts
  },

  async create(input: CreateInput): Promise<DomainType> {
    // insert → return mapped result
  },

  async update(id: string, input: UpdateInput): Promise<DomainType> {
    // update → return mapped result
  },
};
```

---

## External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | 2.99.1 | Database client + auth |
| `@tanstack/react-query` | ^5.90.21 | Server state management |
| `zustand` | ^5.0.11 | Client state management |
| `zod` | ^4.3.6 | Input validation |
| `expo-secure-store` | ~55.0.14 | Secure token storage |
| `expo-sqlite` | ~55.0.16 | Offline food database |
| `expo-router` | ~55.0.16 | File-based navigation |
| `openai` (edge function) | — | AI coach responses |

---

## Testing Infrastructure

| Tool | Config | Purpose |
|------|--------|---------|
| Jest | `jest.config.js` | Unit + integration tests |
| React Native Testing Library | setup in jest config | Component tests |
| Playwright | `playwright.config.ts` | E2E tests (web) |
| `jest-expo` preset | jest preset | Expo environment mocking |

**Test locations:**
- `src/**/__tests__/*.test.ts` — Unit/integration tests
- `e2e/*.spec.ts` — E2E Playwright specs
