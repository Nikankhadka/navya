# Navya

Navya is a fitness-first, mobile-first Expo application with Supabase as the backend platform and Codex as the primary delivery interface. This repository now includes a project operating system for Codex + BMAD, architecture documentation for new developers, and a standardized MVP execution track.

## Current Focus

- Canonical product: `Navya`
- MVP scope: auth, onboarding, workout plan viewing and tracking, nutrition logging, limited AI coach, profile, and internal beta deployment
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

## Project Operating System

- AI team and routing: [docs/ai-team/README.md](/home/nikan/projects/navya/docs/ai-team/README.md)
- Current execution state: [docs/execution/current-status.md](/home/nikan/projects/navya/docs/execution/current-status.md)
- MVP definition: [docs/mvp/README.md](/home/nikan/projects/navya/docs/mvp/README.md)
- Sprint tracking: [docs/sprints/README.md](/home/nikan/projects/navya/docs/sprints/README.md)
- Architecture docs: [docs/architecture/README.md](/home/nikan/projects/navya/docs/architecture/README.md)
- Onboarding docs: [docs/onboarding/README.md](/home/nikan/projects/navya/docs/onboarding/README.md)
- Beginner tester guide: [docs/onboarding/tester-guide.md](/home/nikan/projects/navya/docs/onboarding/tester-guide.md)
- Standards: [docs/standards/engineering-standards.md](/home/nikan/projects/navya/docs/standards/engineering-standards.md)

## Standard Commands

```bash
npm run typecheck
npm run verify
npm run smoke:web
npm run seed:tester -- YOUR_SUPABASE_USER_ID
npm run sync:codex-skills
```

## Notes

- `npm` is the only supported package manager.
- `package-lock.json` is authoritative.
- Repo-local plugin metadata lives in `plugins/navya-ai-team/`.
- BMAD customization lives in `_bmad/_config/agents/core-bmad-master.customize.yaml`.
