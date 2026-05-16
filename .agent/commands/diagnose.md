---
name: diagnose
description: Diagnose a bug, error, or unexpected behavior
---

# /diagnose

Diagnose a bug or unexpected behavior. Given a description of what's wrong, find the root cause.

## Usage
```
/diagnose "Nutrition diary doesn't save when offline"
/diagnose --file src/features/nutrition/hooks/useFoodLog.ts "the hook returns 0 calories"
/diagnose "TypeScript error on line 42 of ProfileCard"
```

## What It Does
1. Reads the relevant files
2. Tries to reproduce the issue mentally
3. Traces the data/code path from trigger to symptom
4. Outputs: root cause, fix suggestion, files to change

## Output Format
```
## Root Cause
[explanation of what's wrong]

## Fix
[exact code change needed]

## Files to Change
- file.ts (line ~X): description of change

## Test to Add
[test that would catch this regression]
```

## When to Use
- When things don't work and you don't know why
- Before filing a bug report
- When CI fails unexpectedly