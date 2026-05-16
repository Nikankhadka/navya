---
name: implement
description: Implement a feature from a spec or task description
---

# /implement

Implement a feature given a task description, spec reference, or set of acceptance criteria.

## Usage
```
/implement TASK-003 from TASKS.md
/implement docs/user-stories/nutrition.md
/implement "Add water logging widget to Home dashboard"
/implement --plan-only "Design the meal template feature"
```

## What It Does
1. Reads the spec or task description
2. Passes it through the technical-designer agent for planning
3. Presents the plan for approval
4. On approval, executes using the task-executor agent
5. Runs typecheck, writes tests, updates TASKS.md

## When to Use
- Starting a new task from the sprint backlog
- When you have a clear spec and want autonomous execution