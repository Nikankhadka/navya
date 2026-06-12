# Code Deletion Log

## 2026-06-12 — Comprehensive Dead Code Cleanup

### Unused Files Deleted (9)
| File | Reason |
|---|---|
| `src/hooks/useToastAlert.ts` | Zero imports in entire codebase. Unused Toast abstraction. |
| `src/features/auth/index.ts` | Barrel export — no code imports from feature barrel; all imports use direct sub-paths. |
| `src/features/coach/index.ts` | Barrel export — dead, same pattern. |
| `src/features/demo/index.ts` | Barrel export — dead. |
| `src/features/home/index.ts` | Barrel export — dead. |
| `src/features/nutrition/index.ts` | Barrel export — dead. |
| `src/features/onboarding/index.ts` | Barrel export — dead. |
| `src/features/profile/index.ts` | Barrel export — dead. |
| `src/features/workout/index.ts` | Barrel export — dead. |

### Unused Dependencies Removed (1)
| Package | Reason |
|---|---|
| `expo-web-browser@~55.0.16` | Zero code imports. Not referenced by any source file. |

### Unused Exports Removed/Privatized

#### src/config/env.ts
- Removed `appEnv` — only used by removed `isHostedAppEnv`
- Removed `demoModeFlag` — only used by removed `isDemoModeAvailable`
- Removed `isHostedAppEnv` — only used by removed `isDemoModeAvailable`
- Removed `isDemoModeAvailable` — no external consumers after `client.ts` re-export removal
- Removed `isLocalDev` — no references anywhere
- Un-exported `coachFeatureFlag` → `const` (internal use only by `isCoachEnabled`)

#### src/features/demo/mockData.ts
- Removed `MOCK_WEEKLY_STREAK` — never referenced by any import
- Removed `MOCK_WATER_LOGS` — was only a convenience alias for `MOCK_DAILY_NUTRITION.water_logs`, unused after un-export
- Un-exported `MOCK_FOOD_LOGS` → internal only (used by `MOCK_DAILY_NUTRITION`)
- Un-exported `MOCK_COMPLETED_WORKOUTS` → internal only (used by `MOCK_WORKOUT_HISTORY`)
- Removed unused `WaterLog` import

#### src/lib/validation.ts
- Removed `passwordSchema` — dead after migration to magic-link-only auth
- Removed `EmailInput` type — unused
- Removed `PasswordInput` type — unused

#### src/store/useDateStore.ts
- Removed `isDateToday()` — zero callers in codebase

#### src/utils/helpers.ts
- Removed `formatDate()` — unused
- Removed `getTodayDateString()` — duplicate of `src/utils/date.ts` version
- Removed `calcCalorieGoal()` — unused
- Removed `calcProteinGoal()` — unused
- Removed `macroPercent()` — unused
- Removed `dayLabel()` — unused
- Removed `dayShort()` — unused
- Removed `getWeekDayLabels()` — duplicate of `src/utils/date.ts` version
- Removed unused `ActivityLevel` and `DayOfWeek` imports

#### src/utils/date.ts
- Un-exported `toDateKey()` → internal only (used by `addDays`, `getMonthGrid`)
- Removed `getWeekKeys()` — never called by any code

#### src/utils/visualTest.ts
- Un-exported `getVisualTestScenario()` → internal only (used by `isVisualTestScenario`)

#### src/lib/supabase/mappers.ts
- Un-exported `mapExerciseRow()` → internal only (used by `mapPlanExerciseRow`)
- Un-exported `mapPlanExerciseRow()` → internal only (used by `mapWorkoutPlanDayRow`)
- Un-exported `mapWorkoutPlanDayRow()` → internal only (used by `mapWorkoutPlanRow`)

#### src/lib/supabase/client.ts
- Removed `isDemoModeAvailable` import and re-export — no consumers

#### src/components/shared/index.tsx
- Removed `MacroRing, ProgressBar` barrel re-export — components imported directly via `@/components/shared/MacroRing`

#### src/components/ui/index.tsx
- Removed `Calendar` barrel re-export — component imported directly via `@/components/ui/Calendar`

#### src/types/app.ts
- Removed `TabRoute` type — zero references

### Duplicate Code Identified (NOTES — not removed)
| Duplicate | Location 1 | Location 2 | Note |
|---|---|---|---|
| `getTodayDateString()` | `src/utils/helpers.ts` (line 39) | `src/utils/date.ts` (line 1) | Kept the `date.ts` version (used by 5+ files); removed `helpers.ts` copy |
| `getWeekDayLabels()` | `src/utils/helpers.ts` (line 124) | `src/utils/date.ts` (line 89) | Kept `date.ts` version (used by HomeScreen); removed `helpers.ts` copy |

### False Positives (NOT removed — with justification)
| Item | Knip Flag | Why Kept |
|---|---|---|
| `babel.config.js` | Unused file | Build config used by Expo Metro bundler at build time — not imported as module |
| `supabase/functions/coach-action/index.ts` | Unused file | Supabase Edge Function — invoked via `supabase.functions.invoke('coach-action')` at runtime |
| `@tamagui/babel-plugin` | Unused dependency | Referenced by `babel.config.js` — needed for Tamagui compilation |
| `expo-notifications` | Unused dependency | Configured in `app.json` as Expo plugin — needed at build time |
| Database types (`Tables`, `TablesInsert`, etc.) | Unused exports | Auto-generated Supabase types — provide complete type coverage |
| `tamagui.config.ts` exports (`config`, `default`, `AppTamaguiConfig`) | Unused exports | Framework config — consumed by Tamagui internally |
| `CoachActionType`, `NutritionSyncStatus`, `DayOfWeek`, `SessionStatus` | Unused exported types | Used internally within feature domain types that ARE imported externally |

### Impact Summary
- **Files deleted**: 9
- **Dependencies removed**: 1
- **Approximate lines of dead code removed**: ~220
- **Bundle size impact**: Minimal (primarily type-level and unused utility code)

### Verification
- ✅ `npm run typecheck` — passes clean
- ✅ `npm run test` — all tests pass
- ✅ `npm run lint` — no new errors (11 pre-existing errors, unrelated to cleanup)
- ✅ Build configuration intact
- ✅ No public API breakage
