---
name: review
description: Review the current uncommitted changes or a specific diff
---

# /review

Review the current uncommitted changes as a senior engineer would.

## Usage
```
/review                                   # Review working tree changes
/review --staged                          # Review staged changes only
/review --since=<commit-hash>             # Review changes since a commit
/review --all                             # Review all files (default: only changed)
```

## What It Does
1. Gets the current git diff
2. Passes it to the code-reviewer agent
3. Returns findings in CRITICAL / MAJOR / MINOR format
4. Asks if you want to fix any CRITICAL issues

## When to Use
- Before committing any change
- After merging a PR from a sub-agent
- When you see a file and think "that doesn't look right"