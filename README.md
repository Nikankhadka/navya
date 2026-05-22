# Navya

Fitness-first Expo (React Native) app targeting AU/NP markets. ~70% MyFitnessPal core daily user loop parity.

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npm run verify
npm start
```

If Supabase is not configured, use the **"Explore Demo App"** entry on the login screen for a local MVP walkthrough.

## Development Setup

**Prerequisites:** Node.js >= 20 (see .nvmrc), Docker Desktop (for local Supabase).

```bash
npm run dev        # Start Supabase + Expo together
npm run db:reset   # Fresh DB with migrations, seed, and types
npm run db:stop    # Stop Supabase containers
```

- Supabase Studio: http://localhost:54323
- Inbucket (local email): http://localhost:54324

See [docs/onboarding/local-setup.md](docs/onboarding/local-setup.md) for troubleshooting.

## Available Commands

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run typecheck` | TypeScript check |
| `npm run verify` | Project verification |
| `npm run ci:local` | Full local CI (types + tests) |
| `npm test` | Run tests |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run verify -- --smoke-web` | Web smoke test (via verify) |
| `npm run dev` | Start Supabase + Expo together |
| `npm run seed:tester` | Seed tester data |

## Project Structure

```
src/
  app/                   # Expo Router screens (file-based routing)
  components/ui/         # Shared UI components
  features/{domain}/     # Feature domains (auth, coach, home, nutrition, ...)
    api/ hooks/ screens/ utils/
  store/                 # Zustand stores
  types/                 # Shared TypeScript types
  lib/                   # Library configs (supabase, auth)
docs/                    # Documentation
supabase/                # Schema, migrations, edge functions
```

## Tech Stack

Expo SDK 55 · React Native 0.83 · TypeScript (strict) · Tamagui · Expo Router · Zustand · TanStack Query · Supabase (auth, Postgres, RLS, Edge Functions, storage) · OpenAI (via Edge Functions only)

## Project Status

Active Sprint: **Sprint 3 — Complete The Daily Diary** (May 11–24, 2026)

| Phase | Status |
|---|---|
| Sprint 1: Foundation | ✅ Complete |
| Sprint 2: Core Screens | ✅ Complete |
| Sprint 3: The Daily Diary | 🚧 In Progress |
| Sprint 4: Progress & Adherence | 📋 Planned |
| Sprint 5: Coach & Capture Speed | 📋 Planned |
| Sprint 6: Polish & Beta | 📋 Planned |

See [docs/mvp/README.md](docs/mvp/README.md) for MVP scope and [docs/sprints/README.md](docs/sprints/README.md) for sprint details.

## Testing

- **E2E:** Playwright — 67 tests across 7 specs covering all user flows
- **Unit:** Jest + React Native Testing Library (infrastructure ready)
- Run `npm run test:e2e` or `npm run ci:local`

## AI Development System

Navya uses a tool-agnostic multi-agent AI development system (works with Claude Code, Cursor, Cline, opencode, etc.). Agent configuration lives in `.agent/` — see [AGENTS.md](AGENTS.md) and [docs/ai-team/README.md](docs/ai-team/README.md).

## Documentation

- [Developer Onboarding](docs/onboarding/README.md) — first-day checklist and project overview
- [Local Setup](docs/onboarding/local-setup.md) — Supabase, Docker, env config
- [MVP Scope](docs/mvp/README.md) — capability buckets and upgrade phases
- [Architecture](docs/architecture/README.md) — system design and domain boundaries
- [Tech Stack](docs/TECH_STACK.md) — full technology overview
- [Engineering Standards](docs/standards/engineering-standards.md) — code quality and PR standards
- [Sprint Tracking](docs/sprints/README.md) — sprint planning and backlog
- [Execution Status](docs/execution/current-status.md) — current sprint progress

## Notes

- `npm` is the only supported package manager. `package-lock.json` is authoritative.
- Requires `--legacy-peer-deps` for React 19 compatibility.
- Demo mode works without Supabase — mock data loads automatically.
- No direct AI calls from the client — all AI logic goes through Supabase Edge Functions.
