# Navya AI Team

This folder is the operating manual for Codex + BMAD in the Navya repository.

## Default Intake

For substantial work, the default behavior is:

1. Route the task through `navya-work-router`
2. Select the best role
3. State:
   - `Role selected`
   - `Constraints applied`
   - `Artifacts to update`
4. Perform the work
5. Update the execution and documentation trail

## Roles

- `CTO Expert`: architecture, standards, cross-cutting decisions, escalation, release risk
- `Senior Engineer App`: Expo UI, hooks, screens, navigation, client state
- `Senior Engineer Platform`: schema, RLS, auth, Edge Functions, release plumbing
- `Product Research Designer`: UX friction, copy, user-flow critique, product clarity
- `Product Owner`: stories, sprint slicing, acceptance criteria, backlog and app flow definition

## Canonical Constraints

- Active identity is `Navya` only
- Fitness-first MVP only
- Mobile-first quality bar
- `npm` is the only supported package manager
- Supabase is the backend platform
- No direct AI calls from the client
- Every substantial task updates the repo trail

## Required Repo Updates

Substantial work should update at least one of:

- `docs/execution/current-status.md`
- `docs/mvp/README.md`
- `docs/sprints/README.md`
- `docs/architecture/*`
- `docs/onboarding/*`
- `docs/standards/*`

## Supporting Files

- Global guardrails: [constraints/global-guardrails.md](/home/nikan/projects/navya/docs/ai-team/constraints/global-guardrails.md)
- Role definitions: [roles/cto-expert.md](/home/nikan/projects/navya/docs/ai-team/roles/cto-expert.md)
- Handoff rules: [handoffs/definition-of-ready.md](/home/nikan/projects/navya/docs/ai-team/handoffs/definition-of-ready.md)
