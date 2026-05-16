---
name: prompt-master
description: Prompt engineering skill for refining and optimizing prompts before execution. Apply this skill whenever a prompt is ambiguous, incomplete, or could benefit from structured improvement.
---

# Prompt Master Skill

A structured methodology for refining prompts before execution. This skill is **tool-agnostic** — it works with any AI system (Cursor, Claude Code, GitHub Copilot, etc.).

## Core Philosophy

A well-crafted prompt is the difference between a correct implementation on the first try and a frustrating debug loop. The Prompt Master ensures every prompt that enters the system is:
- **Unambiguous** — no room for misinterpretation
- **Complete** — has all context needed for success
- **Bounded** — clear scope, constraints, and output format
- **Optimized** — structured for the target AI's strengths

## The PROMPT Framework

Use this framework to analyze and refine any prompt:

### P — Purpose & Persona
- **Purpose**: What is the single goal of this prompt? (Not multiple goals — split if needed)
- **Persona**: What role should the AI adopt? (senior engineer, architect, reviewer, etc.)
- **Tone**: Technical, instructional, exploratory?

### R — Role & Responsibility
- **Role definition**: Explicitly state the AI's role in the interaction
- **Responsibility boundaries**: What the AI SHOULD do AND what it should NOT do
- **Decision authority**: Is the AI making decisions or just providing options?

### O — Objective & Output
- **Objective**: The exact deliverable (code, plan, analysis, test, etc.)
- **Output format**: JSON, markdown, code block, diff, etc.
- **Quality bar**: Tests required? Typecheck? Lint?

### M — Materials & Context
- **Relevant files**: What files does the AI need to read?
- **Existing patterns**: What conventions should the output follow?
- **Constraints**: Dependencies, compatibility, performance, security requirements

### P — Process & Precision
- **Process**: Step-by-step instructions if the task is complex
- **Precision requirements**: Exact strings, specific types, naming conventions
- **Edge cases**: What the input/output boundaries look like

### T — Testing & Truth
- **Verification criteria**: How to confirm the output is correct
- **Testing approach**: What tests to write or run
- **Truth anchors**: Known-good reference points (existing code, docs, specs)

## Applying the PROMPT Framework

### Phase 1: Detect
When a prompt enters the system:
1. Scan for ambiguity ("handle it", "make it better", "fix it")
2. Check for missing context (no file references, no constraints)
3. Identify scope creep (one prompt doing too many things)
4. Note missing output format

### Phase 2: Diagnose
For each issue found, determine the severity:
| Severity | Label | Action |
|----------|-------|--------|
| 🚫 Fatal | Prompt will produce wrong output | Must fix before execution |
| ⚠️ Major | Prompt may produce suboptimal output | Should fix before execution |
| 💡 Minor | Prompt could be clearer | Nice to fix |

### Phase 3: Refine
Apply the PROMPT framework to rewrite the prompt:
1. **Add missing persona/role** — "You are a senior React Native engineer..."
2. **Add context** — reference specific files, patterns, constraints
3. **Structure instructions** — numbered steps for complex tasks
4. **Define output format** — "Return as TypeScript code block"
5. **Add verification criteria** — "Run typecheck after implementation"
6. **Set boundaries** — list what NOT to do

### Phase 4: Route
After refinement, route the prompt to the appropriate agent:
- **Technical work** → Task Executor or implement command
- **Review** → Code Reviewer or review command
- **Architecture** → Technical Designer or CTO Expert
- **Bug diagnosis** → Diagnose command
- **UX/Design** → Product Research Designer
- **Product work** → Product Owner

## Refinement Templates

### Template: Code Implementation
```
## Context
{reference files and patterns from CLAUDE.md}

## Task
{clear, single-responsibility task description}

## Constraints
{technical constraints from CLAUDE.md + any specific constraints}

## Output
{expected output format}

## Verification
{verification steps — typecheck, tests, etc.}
```

### Template: Code Review
```
## Context
{files to review, what the feature does}

## Review Focus
{priority areas — security, edge cases, logic}

## Output Format
{review format with severity labels}

## Boundaries
{what NOT to comment on}
```

### Template: Debug/Diagnose
```
## Symptom
{what's happening}

## Expected Behavior
{what should happen}

## Environment
{OS, versions, relevant config}

## Files Involved
{suspected files}

## What I've Tried
{already attempted fixes}
```

## Tool-Specific Optimizations

### For Cursor (Current Environment)
- Use `@file` syntax to reference files
- Be explicit about which agent to use
- Leverage Composer for multi-file changes
- Use Ctrl+K for inline edits on small changes

### For Claude Code (Terminal)
- Use `@-R` for reference context
- Break large tasks into atomic chunks (< 200 lines net new code)
- Use `/compact` when context is high (70%+)
- Pass `--no-prompt-cache` for sensitive operations

### For MCP Tools
- Specify which MCP server to use
- Provide exact tool names and parameter schemas
- Handle authentication and error states explicitly

## Integration with Navya Agent System

When the Prompt Master is active:
1. **User provides raw prompt** → Prompt Master detects ambiguity and missing context
2. **Prompt Master refines** → Applies PROMPT framework, adds context from CLAUDE.md and project files
3. **Refined prompt is presented** → User can approve or iterate
4. **Execution** → Refined prompt is passed to the appropriate agent/command
5. **Feedback loop** → If output is suboptimal, diagnose where the prompt was weak and improve

## Anti-Patterns
| Anti-Pattern | Why | Instead |
|--------------|-----|---------|
| Over-specifying | Kills AI creativity | Give constraints, not implementation details |
| Under-specifying | Wastes iterations | Provide context, examples, and boundaries |
| Assuming shared context | AI has no memory of prior conversation | Re-state context or reference files explicitly |
| Multiple tasks in one prompt | Context dilution, partial failures | Split into atomic prompts |
| Vague success criteria | Can't verify correctness | Define exact verification steps |