# Data Model

Canonical tables for the active MVP:

- `user_profiles`
- `exercise_library`
- `workout_plans`
- `workout_plan_days`
- `plan_exercises`
- `workout_sessions`
- `session_exercises`
- `food_logs`
- `coach_messages`
- `ai_usage_logs`
- `feature_flags`
- `push_tokens`

## Rules

- every new table needs a migration
- every new table needs RLS
- every schema update needs regenerated client types
- `user_profiles` is the canonical profile table
