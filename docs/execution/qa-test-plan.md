# QA Test Plan

## Automated Gates

- `npm run typecheck`
- `npm run verify`
- `npm run smoke:web`
- `npm run visual:smoke` when local port binding or `NAVYA_VISUAL_BASE_URL` is available

## Live Supabase Setup Checks

1. Sign in through the app with a real tester email using magic link.
2. Confirm Supabase Auth creates the tester user.
3. Render and run the full tester seed SQL for that Auth UUID.
4. Render and run the validation SQL; every row should report `pass`.
5. Sign out and sign back in as the tester before validating app reads.

## Functional Test Cases

| Area | Test Case | Expected Result |
| --- | --- | --- |
| Auth | Request magic link for tester email | Email is sent without client error |
| Auth callback | Open newest magic link on same device/browser | Session completes and routes by profile state |
| Profile | Seeded complete profile signs in | User lands on tabs instead of onboarding |
| Profile | Edit profile fields and save | `user_profiles` updates and survives sign-out/sign-in |
| Nutrition | Load seeded diary | Today shows meals, calories, macros, water, and recent meals |
| Nutrition | Add and delete a meal | Food log mutates in Supabase and UI refreshes |
| Progress | Log weight check-in | `weight_logs` row is created and profile weight updates |
| Workout | Load active plan | Plan days and nested exercises render |
| Workout | Start and finish session | `workout_sessions` and `session_exercises` persist |
| Habits | Load Home streak | Streak reflects live food, water, and completed workout activity |
| Coach | Load weekly summary | Summary reflects live workout, nutrition, hydration, streak, and weight signals |

## Regression Checklist

- Demo mode still opens when allowed.
- Incomplete real profile still routes to onboarding.
- Seeded complete real profile routes to tabs.
- RLS prevents cross-user data from appearing in app flows.
- No Critical or High issues remain before moving to the next weekly milestone.
