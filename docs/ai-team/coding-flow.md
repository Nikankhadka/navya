# Navya Coding Flow

This document describes how a task moves through roles in the Navya AI team — from intake to completion. Think of it as the routing protocol for all substantial work.

## The Core Workflow: Spec → Plan → Build → Ship

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE AI DEV PIPELINE                           │
│                                                                  │
│  SPEC → PLAN → CHUNK → BUILD → VERIFY → COMMIT → REVIEW → SHIP │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 0: REFINE (Prompt Master — Always First)
Before any agent touches code, run your prompt through the Prompt Master.

The Prompt Master applies the **PROMPT framework** (Purpose, Role, Objective, Materials, Process, Testing) to:
1. Detect ambiguity, missing context, and scope creep in your raw prompt
2. Fill in project context from CLAUDE.md, TASKS.md, and existing files
3. Structure the prompt using templates from `.agent/skills/prompt-master.md`
4. Route to the appropriate agent or command
5. Present a Refinement Report for your approval

This single step dramatically improves AI output quality — use `/refine` or route through the `prompt-master` agent.

### Phase 1: SPEC (You, AI-Assisted)
Before any agent writes code, you need a spec. Every substantial task starts with acceptance criteria in a user story or SPEC.md.

### Phase 2: PLAN (AI-Generated, You-Approved)
This step alone improves AI success rates from ~33% to ~66% on complex tasks. Before any code:
1. List every file you will create or modify
2. List every function/component/hook you'll add or change
3. Identify any ambiguities or missing info
4. Propose the implementation order
5. Flag any risks or edge cases
Wait for approval before proceeding.

### Phase 3: CHUNK (Break Into Atomic Tasks)
Never give an agent a task larger than ~200 lines of net new code at a time. Break the plan into TASK-001, TASK-002, etc.

### Phase 4: BUILD (Agent Executes, You Verify)
For each task: start from clean git state → give agent one task with full context → agent executes → review the diff → run quality gates → commit.

### Phase 5: VERIFY
Run: `npm run ci:local` (lint + types + tests). Manually check edge cases, error handling, hardcoded values.

### Phase 6: COMMIT → REVIEW → SHIP
Use the commit message format. Update TASKS.md and PROJECT_JOURNAL.md.

---

## Default Intake Preamble

When a task enters, the selected agent must state:
```
Role selected: [role name]
Constraints applied: [list of relevant guardrails or doc boundaries]
Artifacts to update: [list of files that will be touched]
```

## When to Escalate to CTO Expert

Escalate immediately if any of these are true:

| Trigger | Example |
|---------|---------|
| Task spans multiple domains | A feature needs new migration + new screen + new RLS all at once |
| Role is unclear | Task could be app work or platform work |
| Architecture decision needed | Should we add a new table or use an existing one? |
| Release risk | Change affects auth, deployment, or environment config |
| Scope boundary crossed | Feature request stretches MVP definition |
| Conflict between roles | App and Platform disagree on contract approach |

## When to Coordinate Laterally

Coordinate directly (without CTO) when:

| Pair | Typical Coordination |
|------|---------------------|
| App ↔ Platform | API contract shape, generated types, Edge Function interface |
| App ↔ PRD | UX flow feedback, copy suggestions, screen state validation |
| PO ↔ PRD | Flow definition, user research, competitive positioning |
| PO ↔ App/Platform | Technical feasibility during story refinement |

## Context Management Rules

| Context Level | Action |
|---|---|
| 0–50% | Work freely |
| 50–70% | Stay aware, avoid big tangents |
| 70–85% | Run `/compact` |
| 85%+ | End session. Update PROJECT_JOURNAL.md. Use `/clear` |

## Session Template

### Session Start
```
Read CLAUDE.md, TASKS.md, PROJECT_JOURNAL.md.
Tell me the current state in 3 sentences.
```

### Task Start
```
I'm working on TASK-XXX: [description].
First: list what files you'll change.
Wait for my approval before writing any code.
```

### Session End
```
Update PROJECT_JOURNAL.md: what we built, current state, known issues, what's next.
```

## Anti-Patterns (What NOT to Do)

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| Paste entire files into context | Context bloat → degraded output | Use @file syntax |
| Give AI a vague task | Low success rate on complex work | Write a spec first |
| Let AI pick dependencies | Supply chain risk, bloat | You choose deps, AI implements |
| Code review the whole file | Misses subtle AI errors | Review the diff only |
| Let AI rewrite configs | Breaks team standards | Lock tsconfig, eslint in CLAUDE.md |
| Long, chained sessions | Context degrades after ~70% | Fresh session per task |
| No tests on AI output | Logic errors ship silently | Tests are non-negotiable |
| `any` types everywhere | Type safety erodes | Strict TypeScript in CLAUDE.md |
| No secret scanning | Credentials leak in commits | gitleaks pre-commit hook |
| One big PR | Hard to review, hard to revert | One task = one PR |

## Agent-Agnostic Equivalents
| Role | Agent File/Command |
|------|--------------------|
| Prompt Master | `.agent/agents/prompt-master.md` |
| Technical Designer | `.agent/agents/technical-designer.md` |
| Task Executor | `.agent/agents/task-executor.md` |
| Code Reviewer | `.agent/agents/code-reviewer.md` |
| Refine Prompt | `.agent/commands/refine.md` |
| Implement Feature | `.agent/commands/implement.md` |
| Diagnose Bug | `.agent/commands/diagnose.md` |
| Review Diff | `.agent/commands/review.md` |

See `AGENTS.md` for the full multi-agent configuration.