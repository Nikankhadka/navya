---
name: refine
description: Refine a raw prompt using the Prompt Master skill and agent before execution
---

# /refine

Refine a raw, unrefined prompt using the Prompt Master skill before passing it to an execution agent.

## Usage
```
/refine "Add a water tracking widget to the home dashboard"
/refine "Fix the login bug"
/refine --agent=code-reviewer "Review my PR"
/refine --show-report-only "Build a new settings screen"
```

## What It Does
1. Takes your raw prompt
2. Passes it through the prompt-master agent for analysis and refinement
3. Returns a **Refinement Report** showing:
   - Issues detected (ambiguity, missing context, scope creep)
   - The refined prompt with full context filled in
   - Suggested route (which agent/command to execute)
   - Verification criteria
4. Waits for your approval to execute the refined prompt
5. On approval, passes the refined prompt to the appropriate execution agent/command

## When to Use
- **Always** — when starting a new task or feature
- **When stuck** — if an agent produces bad output, refine your prompt
- **For complex tasks** — multi-file changes, architecture decisions, cross-cutting work
- **When context is low** — maximize the value of every context window token

## Flags
| Flag | Description |
|------|-------------|
| `--agent=<agent>` | Target a specific agent (code-reviewer, task-executor, technical-designer) |
| `--show-report-only` | Show the refinement report without executing |
| `--auto-approve` | Skip approval and execute immediately (use with caution) |
| `--template=<template>` | Use a specific template (implementation, review, debug) |

## Example Workflow

```
You: /refine "Add a water logging feature to the nutrition screen"

Prompt Master:
  🔍 Issues Detected:
    - 🚫 Missing: what "water logging" means (add/edit/delete/view?)
    - 🚫 Missing: file references (which screen, which store?)
    - ⚠️ Missing: verification criteria
  
  ✨ Refined Prompt:
    [structured prompt with full context]

  → Route to: task-executor (via /implement)

You: Looks good, execute it.

System: Executes the refined prompt through the task-executor agent.
```

## Anti-Patterns
- Don't use `/refine` for simple yes/no questions — just ask directly
- Don't use `/refine` when you already have a well-structured prompt — pass it to `/implement` directly
- Don't use `/refine` in the middle of an execution — let the current task finish first