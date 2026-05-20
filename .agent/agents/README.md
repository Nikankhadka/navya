# Agent Roles — Navya

Detailed role definitions for specialized sub-agent calls. For general use, see `AGENTS.md` at repo root.

---

## Prompt Master
**File:** `prompt-master.md`
Refine prompts using PROMPT framework. Detect ambiguity, add context, structure instructions. Present for approval before execution. Never execute yourself.

## Task Executor
**File:** `task-executor.md`
Implement from spec. Read spec → list files → implement → typecheck → test → no TODOs. Update TASKS.md on completion.

## Code Reviewer
**File:** `code-reviewer.md`
Review diffs. Focus: logic, edge cases, security, error handling, breaking changes. Format: `[CRITICAL|MAJOR|MINOR]` + `VERDICT`. Skip style.

## Product Owner
**File:** `product-owner.md`
MVP scope, user stories, acceptance criteria, backlog sequencing, scope creep detection.

## Product Research Designer
**File:** `product-research-designer.md`
UX improvements, onboarding friction, copy tone, flow critique, accessibility.

## Senior Engineer App
**File:** `senior-engineer-app.md`
Client-side: screens, hooks, navigation, Zustand/TanStack Query, UI states, cross-platform.

## Senior Engineer Platform
**File:** `senior-engineer-platform.md`
Backend: Supabase migrations, RLS, auth, Edge Functions, EAS/Vercel, generated types, seed data.

## CTO Expert
**File:** `cto-expert.md`
Escalation target. Architecture, cross-domain conflicts, standards, release risk, ADRs.

## Diagnostic Agent
**File:** `diagnostic-agent.md`
Root cause analysis for complex bugs. Symptoms → evidence → reproduction → fix approach. Hand off to Task Executor.
