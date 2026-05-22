# Navya

Navya is a fitness-first, mobile-first Expo application with Supabase as the backend platform. This repository includes a complete AI-powered development operating system, architecture documentation, and a standardized MVP execution track.

## Current Focus

- Canonical product: `Navya`
- MVP scope: auth, onboarding, workout plan viewing and tracking, nutrition logging, limited AI coach, profile, and internal beta deployment
- Active sprint: **Sprint 3** (MVP Phase 1 — Complete The Daily Diary)
- Primary runtime targets: iOS and Android
- Secondary runtime target: web

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run verify
npm run start
```

If Supabase is not configured yet, you can still use the `Explore Demo App` entry on the login screen for a local MVP walkthrough.

## AI Development System

Navya runs on an AI development system aligned with the **AI-Powered Software Development Framework (2026 Edition)**. All agent configuration is tool-agnostic and stored in `.agent/`.

| Layer | Tool | Purpose |
|---|---|---|
| **Agent Brain** | `CLAUDE.md` | Project-wide AI configuration and rules |
| **Agents** | `.agent/agents/` | Code reviewer, task executor, technical designer |
| **Commands** | `.agent/commands/` | `/review`, `/implement`, `/diagnose` |
| **Skills** | `.agent/skills/` | Coding standards, testing principles, security checklist |
| **Rules** | `.agent/rules/` | TypeScript, testing, and general coding rules |
| **MCP Servers** | `.mcp.json` | GitHub, Supabase, and Filesystem tool access |
| **Memory** | `TASKS.md` + `PROJECT_JOURNAL.md` | Cross-session context and sprint tracking |

## Project Operating System

- AI team and routing: [docs/ai-team/README.md](docs/ai-team/README.md)
- Multi-agent configuration: [AGENTS.md](AGENTS.md)
- Current execution state: [docs/execution/current-status.md](docs/execution/current-status.md)
- MVP definition: [docs/mvp/README.md](docs/mvp/README.md)
- Sprint tracking: [docs/sprints/README.md](docs/sprints/README.md)
- Architecture docs: [docs/architecture/README.md](docs/architecture/README.md)
- Developer onboarding: [docs/onboarding/README.md](docs/onboarding/README.md)
- Engineering standards: [docs/standards/engineering-standards.md](docs/standards/engineering-standards.md)
- Security checklist: [docs/standards/security-checklist.md](docs/standards/security-checklist.md)
- Tech stack: [docs/TECH_STACK.md](docs/TECH_STACK.md)

## Standard Commands

```bash
npm run typecheck       # TypeScript check
npm run verify          # Project verification
npm run ci:local        # Full local CI (types + tests)
npm run test            # Run tests
npm run test:coverage   # Run tests with coverage
npm run smoke:web       # Web smoke test
npm run export:web      # Web export
npm run seed:tester     # Seed tester data
```

## Notes

- `npm` is the only supported package manager.
- `package-lock.json` is authoritative.
- No `src/` code was modified during the AI framework alignment — all changes are documentation and configuration.