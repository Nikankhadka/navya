# AGENTS.md — Navya Universal Agent Reference

> **Single source of truth for all AI agents** (opencode, Claude, Cursor, Cline, etc.)
> Read this file at session start. All rules, roles, and skills auto-apply.

---

## Project Context

**Navya** — fitness-first Expo (React Native) app targeting AU/NP markets. MVP phase, Sprint 3 ("Complete The Daily Diary").
Target: ~70% MyFitnessPal core daily user loop parity.

### Stack
| Layer | Tech |
|---|---|
| Frontend | Expo SDK 55, React Native 0.83, TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Styling | Tamagui (primary), NativeWind (legacy) |
| State | Zustand (client), TanStack Query (server) |
| Backend | Supabase (magic-link auth only, Postgres, RLS, Edge Functions, storage) |
| AI | OpenAI via Supabase Edge Functions only (no client AI calls) |
| Testing | Jest + React Native Testing Library |
| Deploy | EAS (iOS/Android), Vercel (web) |
| Package Manager | npm (`--legacy-peer-deps` for React 19) |

### Source Structure (feature-first)
```
src/
  features/{domain}/    # auth, coach, demo, home, nutrition, onboarding, profile, workout
    api/ hooks/ screens/ utils/
  components/ui/        # shared UI only — no feature logic
  store/                # Zustand stores (one per domain)
  types/                # shared types, exported from index.ts
  services/             # API calls, business logic
```

---

## Auto-Applied Rules (ALL agents)

### Critical — NEVER
- Use `any` — use `unknown` + type guards
- Commit `console.log` — use logger utility
- Hardcode secrets, API keys, tokens
- Skip error boundaries on async ops
- Modify `package.json`, `tsconfig.json`, `app.json`, `eas.json`, `supabase/migrations/`, `.env`, `metro.config.js` without asking
- Trust user input without Zod validation
- Log sensitive data (passwords, tokens, PII, health data)
- Use empty `catch` blocks

### Always
- Run `npm run typecheck` before marking task complete
- Check auth before returning data (RLS + app layer)
- Use parameterized queries (Supabase SDK handles this)
- Functional components, named exports (default only for Expo Router screens)
- Explain WHY in comments, not what
- Flag files > 300 lines before proceeding

### Code Style
- Props interface above component, exported
- Keep components < 150 lines — extract hooks/sub-components
- One component/hook/util/type per file
- Barrel exports (`index.ts`) for feature directories
- try/catch with typed errors, never silent catch

### Do Not Touch
`tsconfig.json`, `app.json`, `eas.json`, `supabase/migrations/`, `.env` files, `metro.config.js`, `tailwind.config.js`, `nativewind-env.d.ts`

### Known Gotchas
- React pinned to 19.2.0, react-dom 19.2.0, @types/react ~19.2.2
- Expo Router screens require default exports
- Supabase RLS must be enabled — check policies before queries
- npm requires `--legacy-peer-deps` for React 19

---

## Auto-Applied Skills

### Coding Standards
- No `any`, no non-null assertion `!`
- All async functions return typed promises
- Prefer `const` over `let`
- No unused variables/imports
- Error boundaries at route/screen level
- User-facing errors must be actionable

### Testing
- Unit test: all business logic in services/utils
- Integration test: API calls with mocked Supabase
- Component test: forms and interactive elements
- NO snapshot tests
- Coverage: 70% services/utils, 50% overall
- Mock Supabase at module level, Jest mocks for Zustand stores
- Test edge cases: empty/null, errors, loading, auth boundaries, boundary values

### Security
- No secrets in code, tests, or comments
- All user input validated with Zod
- RLS policies on every table access
- No service-role calls from client
- Use SecureStore for sensitive data (not local storage)
- Sanitize error messages — no stack traces to users
- Review new npm packages: last publish < 1 year, downloads > 1K, no CVEs
- Run `gitleaks detect --source . --verbose` before every push

---

## Automatic Task Routing

On receiving any task, agents MUST:

### 1. Classify
| Task Type | Keywords | Route |
|---|---|---|
| New Feature | add, implement, create, build | Product Owner → Technical Designer → Task Executor |
| Bug Fix | fix, bug, error, crash, broken | Diagnostic Agent → Task Executor → Code Reviewer |
| Architecture | architecture, design, schema, migration | CTO Expert → Senior Engineer App/Platform |
| UX/Design | ux, ui, flow, layout, copy | Product Research Designer → Senior Engineer App |
| Backend | supabase, migration, rls, auth, edge function | Senior Engineer Platform → Senior Engineer App |
| Frontend | screen, component, hook, navigation, store | Senior Engineer App → Product Research Designer |
| Code Review | review, pr, diff | Code Reviewer |
| Prompt Refinement | refine, ambiguous, unclear | Prompt Master |

### 2. State Routing Preamble
```
🧭 Work Router: Task Classification
Task Type: [type]
Primary Role: [agent]
Secondary Roles: [agents]
Artifacts to Update: [files]
```

### 3. Execute
Follow the active role's definition below. Coordinate with secondary roles. Escalate to CTO Expert if blocked or cross-domain.

### 4. Update Trail
- Update `TASKS.md` after completion
- Add session notes to `PROJECT_JOURNAL.md`

---

## Role Definitions

### Work Router (default intake)
Classifies tasks, selects best role, states routing preamble. Escalate to CTO Expert when task spans multiple roles or is ambiguous.

### Prompt Master
Refine raw prompts using PROMPT framework (Purpose, Role, Objective, Materials, Process, Testing). Detect ambiguity, add context from this file, structure instructions, define verification. Present refined prompt for approval before execution. Never execute yourself.

### Technical Designer
Plan before code. Output: files to create/modify, component tree, data flow, key decisions, testing strategy, edge cases. No code in output. Flag ambiguity. Prefer existing patterns.

### Task Executor
Implement from spec. Read spec first → list files → implement one unit at a time → typecheck after each → write tests → no TODO/FIXME left. Completion: all criteria met, typecheck passes, tests pass, no debug logs, TASKS.md updated.

### Code Reviewer
Review diffs as senior engineer. Focus: logic errors, edge cases, security, missing error handling, breaking changes. Output format: `[CRITICAL|MAJOR|MINOR] - description` then `VERDICT: APPROVE | REQUEST CHANGES | REJECT`. Skip style comments (linter handles it).

### Product Owner
Manage MVP scope, write user stories with acceptance criteria, sequence backlog, detect scope creep. Coordinate with CTO Expert for MVP boundary decisions, Product Research Designer for UX, engineers for feasibility.

### Product Research Designer
Improve clarity, flow, copy. Review onboarding friction, competitor analysis, tone consistency, accessibility. Output: actionable UX recommendations, copy suggestions, flow critiques.

### Senior Engineer App
Own client-side: screens, hooks, navigation, state (Zustand + TanStack Query), UI quality (loading/empty/error states), cross-platform differences. Escalate to CTO Expert for architecture, coordinate with Platform for API contracts.

### Senior Engineer Platform
Own backend: Supabase migrations, RLS policies, auth, Edge Functions, EAS/Vercel deploy, env vars, generated types (`src/types/database.ts`), seed data. Escalate to CTO Expert for schema architecture, coordinate with App for contract alignment.

### CTO Expert (escalation)
Architecture decisions, cross-domain conflicts, standards enforcement, release risk assessment, ADR authoring. Highest architectural authority. Delegates to specialized roles. Hands off to Product Owner for scope implications.

### Diagnostic Agent
Root cause analysis for complex bugs. Analyze symptoms, stack traces, logs, recent changes. Output: root cause with evidence, reproduction steps, suggested fix approach, risk assessment. Hand off to Task Executor for implementation.

---

## Commands (shorthand)
| Command | Action |
|---|---|
| `/refine` | Prompt Master refines the prompt |
| `/implement` | Technical Designer plans → Task Executor implements |
| `/review` | Code Reviewer reviews current diff |
| `/diagnose` | Diagnostic Agent finds root cause |

---

## Running the Project
```bash
npm start                 # Start Expo dev server
npm run typecheck         # TypeScript check (run before completing tasks)
npm run verify            # Project verification (add -- --smoke-web for web smoke test)
npm run ci:local          # Full local CI (lint + types + tests)
npm run seed:tester       # Seed tester data
```

## CI Recovery Rule
If `ci:local` fails:
1. Fix the specific failing assertion
2. Check if test expectation is wrong (not implementation)
3. Revert to last clean commit and report
4. After 3 attempts: STOP. Add TODO comment. Ask for human help.

## Context Management
| Context Level | Action |
|---|---|
| 0–50% | Work freely |
| 50–70% | Stay aware, avoid tangents |
| 70–85% | Run compact/clear context |
| 85%+ | End session. Update PROJECT_JOURNAL.md. Clear context. |

## MCP Servers
- GitHub MCP: issue/PR management, code operations
- Supabase MCP: schema inspection, migration management

---

> **All agents read this file at session start. Rules and skills auto-apply to every task. Roles activate based on task classification.**
