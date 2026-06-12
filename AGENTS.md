# AGENTS.md — Navya Universal Agent Reference

> **ECC Enhanced** — Agents, commands, and plugin hooks loaded globally from
> `~/.config/opencode/`. See `WORKFLOW.md` for daily usage guide.
> To disable ECC globally: `rm -rf ~/.config/opencode/{commands,prompts,plugins,tools,instructions,skills,dist,index.ts,package.json,tsconfig.json}` and restore `~/.config/opencode/opencode.jsonc`.

---

## Project Context

**Navya** — fitness-first Expo (React Native) app targeting AU/NP markets. MVP phase, Sprint 3 ("Complete The Daily Diary").
Target: ~70% MyFitnessPal core daily user loop parity.

### Stack
| Layer | Tech |
|---|---|
| Frontend | Expo SDK 55, React Native 0.83, TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Styling | Tamagui |
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
`tsconfig.json`, `app.json`, `eas.json`, `supabase/migrations/`, `.env` files, `metro.config.js`

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

## ECC Agent Quick-Map

Use opencode slash commands to activate specialized subagents. Each agent runs with isolated context and restricted tool access.

| Command | Agent | Purpose |
|---|---|---|
| `/plan` | planner | Implementation planning — no code until approved |
| `/tdd` | tdd-guide | Red → Green → Refactor cycle with 80%+ coverage |
| `/code-review` | code-reviewer | Post-change quality/security review |
| `/security` | security-reviewer | Deep security audit |
| `/build-fix` | build-error-resolver | Fix TypeScript/build errors |
| `/e2e` | e2e-runner | Generate E2E Playwright tests |
| `/refactor-clean` | refactor-cleaner | Dead code cleanup |
| `/orchestrate` | planner | Multi-agent pipeline for complex tasks |
| `/update-docs` | doc-updater | Update documentation and codemaps |
| `/test-coverage` | tdd-guide | Analyze coverage gaps |

> See `WORKFLOW.md` for full command reference and best practices.

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
4. After 3 attempts: STOP. Ask for human help.

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

> **Project context and rules auto-apply. ECC agents/commands extend via `opencode.json`.**
