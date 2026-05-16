---
name: coding-standards
description: TypeScript and React Native coding standards for Navya
---

# Coding Standards

## TypeScript Rules
- No `any` — use `unknown` and narrow with type guards
- No non-null assertion `!` — handle nulls explicitly
- All async functions return typed promises
- Prefer `const` over `let` unless reassignment is required
- No unused variables or imports — the linter should catch these

## Component Patterns
- Functional components only — no class components
- Named exports only — default exports only for Expo Router screens
- Props interface defined above the component, exported
- Keep components under 150 lines — extract hooks and sub-components

## Error Handling
- Every async operation needs try/catch with typed errors
- Never use empty `catch` blocks — always handle or re-throw
- Error boundaries at the route/screen level for React errors
- User-facing errors should be actionable, not cryptic

## File Organization
- One component (or hook, util, type) per file
- Barrel exports (`index.ts`) for feature directories
- Keep files under 300 lines; split into sub-modules when exceeded

## When to Apply
Apply these rules whenever writing or reviewing TypeScript or React Native files.