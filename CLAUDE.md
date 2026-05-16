# CLAUDE.md — Navya Project AI Configuration

## Project Overview
Navya is a **fitness-first, mobile-first Expo (React Native) application** targeting Australian and Nepalese markets. MVP phase. The app provides workout tracking, nutrition logging, AI coaching, water tracking, progress check-ins, and streak adherence — targeting 70% MyFitnessPal core daily user loop parity.

Current focus: Sprint 3 (MVP Phase 1 — Complete The Daily Diary).

## Stack
- **Frontend:** Expo SDK 55, React Native 0.83, TypeScript (strict)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** Tamagui (primary), NativeWind (legacy screen migration)
- **State:** Zustand (client state), TanStack Query (server state)
- **Backend:** Supabase (auth, postgres, realtime, storage, Edge Functions)
- **AI:** OpenAI via Supabase Edge Functions (no direct AI calls from client)
- **Testing:** Jest + React Native Testing Library
- **Package Manager:** npm only (with `--legacy-peer-deps` for React 19)
- **Deployment:** EAS (iOS/Android), Vercel (web export)

## Architecture Principles
1. **Feature-first folder structure** — `src/features/{domain}/` with api/, hooks/, screens/, utils/ sub-folders
2. **Domain separation** — screens present, hooks fetch, services talk to Supabase, stores hold transient client state
3. **Shared UI** in `src/components/ui/` — never feature-specific logic here
4. **API calls** ONLY in `/services` layers or feature api/ directories — never directly in components
5. **Zustand stores** in `src/store/` — one store per domain
6. **Types** in `src/types/` — shared types exported from index.ts
7. **No direct AI calls from client** — all AI logic through Supabase Edge Functions

## Critical Rules (DO NOT VIOLATE)
- NEVER use `any` — use `unknown` and narrow with type guards
- NEVER commit `console.log` — use the logger utility
- NEVER hardcode API keys, tokens, or secrets in code
- NEVER skip error boundaries on async operations
- NEVER modify `package.json`, `tsconfig.json`, `app.json`, `eas.json`, or `supabase/migrations/` without asking first
- ALWAYS run `npm run typecheck` before saying a task is complete
- ALWAYS check auth before returning data (RLS at DB layer + app layer)
- NEVER trust user input without validation and sanitization
- NEVER log sensitive data (passwords, tokens, PII)

## Code Style
- Functional components only (no class components)
- Named exports only (no default exports except Expo Router screens)
- Error handling: try/catch with typed errors, never silent catch
- Comments: explain WHY, not what
- File length: flag if > 300 lines, ask before proceeding

## Commit Message Format
```
<type>(<scope>): <short description>

Types: feat | fix | refactor | test | docs | chore
Example: feat(nutrition): add meal grouping by breakfast/lunch/dinner/snack
```

## Running the Project
```bash
npm start                 # Start Expo dev server
npm run typecheck         # TypeScript check (run before committing)
npm run verify            # Project verification
npm run smoke:web         # Web smoke test
npm run ci:local          # Full local CI (lint + types + tests)
npm run seed:tester       # Seed tester data
```

## Test Strategy
- Unit test all business logic in /services and feature utils
- Integration test API calls with mocked fetch/Supabase
- Component tests for forms and interactive elements
- Skip snapshot tests (fragile)
- Coverage target: 70% on services/utils, 50% overall

## Context Management Rules
| Context Level | Action |
|---|---|
| 0–50% | Work freely |
| 50–70% | Stay aware, avoid big tangents |
| 70–85% | Run `/compact` (Claude Code) |
| 85%+ | End session. Update PROJECT_JOURNAL.md. `/clear` |

## Task Management
- See `TASKS.md` for current sprint task board
- Update `TASKS.md` after completing each task
- Add session notes to `PROJECT_JOURNAL.md` at session end
- Start every session: read CLAUDE.md, AGENTS.md, TASKS.md, PROJECT_JOURNAL.md

## CI Recovery Rule
If ci:local fails:
- Attempt 1: Fix the specific failing assertion
- Attempt 2: Check if the test expectation is wrong (not the implementation)
- Attempt 3: Revert to last clean commit and report the issue
- After 3 attempts: STOP. Add a TODO comment. Ask for human help.

## Do Not Touch (without explicit instruction)
- `tsconfig.json`
- `app.json` / `eas.json`
- `supabase/migrations/` (use migration tool instead)
- `.env` files
- `metro.config.js`
- `tailwind.config.js`
- `nativewind-env.d.ts`

## Known Issues / Gotchas
- React Native peer dep: react pinned to 19.2.0, react-dom to 19.2.0, @types/react to ~19.2.2
- Expo Router requires screens to have default exports
- Supabase RLS must be enabled — check policies before any data query
- npm requires `--legacy-peer-deps` for React 19 compatibility

## Security Rules
- NEVER include API keys, tokens, or secrets in code
- NEVER trust user input without validation and sanitization
- ALWAYS check auth before returning data (RLS at DB layer + app layer)
- NEVER log sensitive data (passwords, tokens, PII)
- ALWAYS use parameterized queries (Supabase SDK handles this, raw SQL does not)
- Run `gitleaks detect --source . --verbose` before every push

## MCP Server Access
- GitHub MCP: available for issue/PR management and code operations
- Supabase MCP: available for schema inspection and migration management

## Automatic Task Routing Protocol (Work Router)
When any substantial task is received, Cline MUST automatically follow this protocol:

### Step 1: Classify the Task
Analyze the task against these categories:

| Category | Keywords | Route To |
|---|---|---|
| **New Feature** | "add", "implement", "create", "build", "new screen", "new component" | Product Owner → Technical Designer → Task Executor |
| **Bug Fix** | "fix", "bug", "error", "crash", "broken", "not working", "issue" | Diagnostic Agent → Task Executor → Code Reviewer |
| **Architecture** | "architecture", "design", "schema", "migration", "plan", "structure" | CTO Expert → Senior Engineer App/Platform |
| **UX/Design** | "ux", "ui", "design", "flow", "layout", "copy", "styling" | Product Research Designer → Senior Engineer App |
| **Backend** | "backend", "supabase", "migration", "rls", "auth", "edge function", "api" | Senior Engineer Platform → Senior Engineer App |
| **Frontend** | "screen", "component", "hook", "navigation", "store", "state" | Senior Engineer App → Product Research Designer |
| **Product** | "story", "sprint", "backlog", "mvp", "scope", "requirement" | Product Owner → CTO Expert |
| **Code Review** | "review", "pr", "pull request", "diff" | Code Reviewer |
| **Prompt Refinement** | "refine", "prompt", "ambiguous", "unclear" | Prompt Master |

### Step 2: State the Routing Preamble
```
🧭 Work Router: Task Classification
─────────────────────────────────
Task Type: [New Feature / Bug Fix / Architecture / UX/Design / Backend / Frontend / Product / Code Review / Prompt Refinement]
Primary Role: [agent name]
Secondary Roles: [agent names]
Escalation Trigger: [if applicable]
Artifacts to Update: [files that will change]
```

### Step 3: Route to Primary Role
Execute the task following the primary role's definition in `.agent/agents/[role].md`:
- Apply the PROMPT framework (Purpose, Role, Objective, Materials, Process, Testing)
- Coordinate with secondary roles as needed
- Escalate to CTO Expert if blocked or cross-domain

### Step 4: Update Trail
- Update `TASKS.md` after completion
- Add session notes to `PROJECT_JOURNAL.md`
- Update `docs/execution/current-status.md` for operational changes

## Multi-Agent Workflow
### Cline Integration
- **Cline**: Full agent orchestration with prompt refinement, technical design, implementation, and review
- Follows the same patterns as Cursor/Claude Code but with integrated agent system
- Uses PROMPT framework for all substantial tasks
- Maintains consistency across all AI systems

### Agent System Compatibility
- **Cursor**: Planning, architecture, code review, quick inline edits
- **Claude Code (terminal)**: Implementation, tests, refactoring, file operations
- **Cline**: Integrated agent orchestration with all roles
- **Branch Strategy**: 
  - Cursor: `feat/design-XXX`
  - Claude Code: `feat/impl-XXX`
  - Cline: `feat/cline-XXX` (when using Cline as primary agent)

### Cline-Specific Instructions
1. **Always classify the task first** using the Automatic Task Routing Protocol above
2. **State agent role and constraints** at task start with the routing preamble
3. **Follow context management rules**:
   - 0-50%: Work freely
   - 50-70%: Stay aware, avoid tangents
   - 70-85%: Use compact mode when available
   - 85%+: End session, update PROJECT_JOURNAL.md
4. **Maintain agent-agnostic output** - same quality regardless of AI model
5. **Leverage MCP servers** (GitHub, Supabase, Filesystem) for tool operations
6. **Follow the agent definition** in `.agent/agents/[role].md` for the active role

### Cross-Model Consistency
- All AI systems follow the same agent definitions in `.agent/`
- Same automatic task routing protocol
- Same PROMPT framework application
- Same output quality standards
- Same file operations patterns
- Same context management rules

## Agent System Reference
See `AGENTS.md` for the full agent definitions. See `.agent/agents/` for detailed role descriptions. See `docs/ai-team/cline-workflow.md` for Cline-specific patterns.