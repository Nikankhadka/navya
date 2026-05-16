# Developer Onboarding — Navya

## Welcome

This directory contains onboarding documentation for developers joining the Navya project. Start here to get your environment set up and understand the project structure.

## Quick Start

```bash
# Clone and install
git clone git@github-personal:Nikankhadka/navya.git
cd navya
npm install
cp .env.example .env.local

# Verify the setup
npm run verify

# Start development
npm start
```

## First Day Checklist

- [ ] Read [CLAUDE.md](/CLAUDE.md) — project AI configuration and rules
- [ ] Read [TASKS.md](/TASKS.md) — current sprint task board
- [ ] Read [PROJECT_JOURNAL.md](/PROJECT_JOURNAL.md) — recent session history
- [ ] Read [docs/TECH_STACK.md](tech-stack) — technology overview
- [ ] Read [docs/mvp/README.md](/docs/mvp/README.md) — MVP scope and phases
- [ ] Read [docs/ai-team/README.md](/docs/ai-team/README.md) — AI team roles and routing
- [ ] Set up Supabase locally or connect to staging
- [ ] Run `npm run typecheck` to confirm TypeScript works
- [ ] Run `npm run smoke:web` to verify web build
- [ ] Explore the demo mode (login screen → "Explore Demo App")

## Project Structure

```
navya/
├── CLAUDE.md              # AI agent primary instruction file
├── AGENTS.md              # Multi-agent configuration
├── TASKS.md               # Sprint task board
├── PROJECT_JOURNAL.md     # Cross-session memory
├── .agent/                # Agent-agnostic config (agents, commands, skills, rules)
├── src/                   # Application source code
│   ├── app/               # Expo Router screens (file-based routing)
│   ├── components/        # Shared UI and layout components
│   ├── features/          # Feature domains (auth, coach, home, etc.)
│   ├── lib/               # Library configurations (supabase, auth)
│   ├── providers/         # React context providers
│   ├── store/             # Zustand state stores
│   ├── theme/             # Tamagui theme configuration
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Utility functions
├── docs/                  # Project documentation
├── supabase/              # Supabase schema, migrations, functions
└── scripts/               # Build and utility scripts
```

## Key Concepts

### Feature-First Architecture
Each feature domain (auth, coach, home, nutrition, etc.) is self-contained under `src/features/` with its own:
- `api/` — API calls and Supabase queries
- `hooks/` — React hooks for data fetching and state
- `screens/` — Screen components (only if feature has dedicated screens)
- `utils/` — Pure utility functions and business logic
- `types.ts` — Feature-specific types

### State Management Rules
- **Server state** (data from Supabase) → TanStack Query
- **Client state** (UI state, auth tokens, onboarding progress) → Zustand
- Never mix the two — no caching server data in Zustand

### AI Team
Navya uses a multi-agent AI development system (tool-agnostic — works with Claude Code, Cursor, Copilot, or any AI tool). See:
- `AGENTS.md` — Agent definitions, commands, skills, and workflow
- `docs/ai-team/README.md` — AI team configuration and routing
- `docs/ai-team/coding-flow.md` — Task lifecycle and handoff protocol
- `.agent/` — All agent configuration files

## Need Help?
- Check `docs/ai-team/role-boundary-matrix.md` if unsure which team role handles a concern
- Check `docs/execution/current-status.md` for what's actively in flight
- Check `docs/sprints/README.md` for sprint planning and backlog