# Cline Workflow — Navya Agent System

This document defines Cline-specific workflow adjustments and operational patterns within Navya's multi-agent orchestration system.

## Cline Operational Guidelines

### 1. Default Intake Protocol

When starting any task, Cline must state:
```
Role selected: [appropriate agent]
Constraints applied: [relevant guardrails from CLAUDE.md]
Artifacts to update: [list of files that will be touched]
```

### 2. Context Management Rules

Cline follows Navya's context management protocol:
- **0-50% context usage**: Work freely, explore complex problems
- **50-70% context usage**: Stay aware, avoid unnecessary tangents
- **70-85% context usage**: Use compact mode when available, focus on essentials
- **85%+ context usage**: End session, update PROJECT_JOURNAL.md, use clear context

### 3. File Operations Protocol

#### File References
- Use `@file` syntax for explicit file references
- Reference specific files rather than pasting entire content
- Break large tasks into atomic chunks (< 200 lines net new code)

#### File Structure Maintenance
- Follow existing patterns in `src/features/{domain}/` structure
- Maintain separation: screens present, hooks fetch, services talk to Supabase
- Keep shared UI in `src/components/ui/` - no feature-specific logic

## Cline Command Implementations

### `/refine` Command Implementation

#### Process Flow
1. **Analyze Raw Prompt**
   - Scan for ambiguity ("handle it", "make it better", "fix it")
   - Check for missing context (no file references, no constraints)
   - Identify scope creep (one prompt doing too many things)
   - Note missing output format

2. **Apply PROMPT Framework**
   - **Purpose & Persona**: Define single goal and AI role
   - **Role & Responsibility**: Set boundaries and decision authority
   - **Objective & Output**: Define exact deliverable and format
   - **Materials & Context**: Reference relevant files and patterns
   - **Process & Precision**: Structure instructions for complex tasks
   - **Testing & Truth**: Set verification criteria

3. **Present Refinement Report**
   ```
   ## 🔍 Prompt Master — Refinement Report

   ### Issues Detected
   - [🚫/⚠️/💡] Issue 1: description
   - [🚫/⚠️/💡] Issue 2: description

   ### Refined Prompt
   [fully structured prompt with all context filled in]

   ### Suggested Route
   → Route to: [agent/command]
   → Why: [reasoning]

   ### Verification
   How to confirm the output is correct:
   - [Verification step 1]
   - [Verification step 2]
   ```

4. **Wait for Approval**
   - Never execute refined prompt without approval
   - Be prepared to iterate based on feedback

### `/implement` Command Implementation

#### Process Flow
1. **Read Spec or Task Description**
   - Review acceptance criteria thoroughly
   - Understand full scope before starting
   - Identify any ambiguities

2. **Technical Design Phase**
   - List all files to create/modify
   - Break down implementation order
   - Identify risks and edge cases
   - Present plan for approval

3. **Implementation Phase**
   - Start from clean git state
   - Implement one logical unit at a time
   - After each unit: verify with `npm run typecheck`
   - Write tests for implementation

4. **Completion Phase**
   - Run `npm run ci:local`
   - Update TASKS.md
   - Update PROJECT_JOURNAL.md
   - Present completion summary

#### Implementation Rules
- Never start coding without understanding the full task
- List all files you'll touch before making changes
- Implement one logical unit at a time
- Write tests for happy path, edge cases, error states
- Never leave TODO or FIXME comments
- If stuck after 3 attempts, flag blocker and ask for help

### `/diagnose` Command Implementation

#### Process Flow
1. **Gather Diagnostic Information**
   - Symptom description
   - Expected behavior
   - Environment details
   - Files involved
   - Previous attempts

2. **Root Cause Analysis**
   - Examine error messages and stack traces
   - Check relevant logs
   - Analyze recent changes
   - Identify patterns

3. **Diagnostic Report**
   ```
   ## Diagnostic Report

   ### Symptom
   [Clear description of what's happening]

   ### Root Cause
   [Identified cause with evidence]

   ### Solution
   [Step-by-step fix]

   ### Verification
   [How to confirm the fix works]
   ```

### `/review` Command Implementation

#### Process Flow
1. **Analyze Changes**
   - Review diff or PR changes
   - Understand feature context
   - Check against acceptance criteria

2. **Apply Review Standards**
   - Flag CRITICAL and MAJOR issues
   - Use severity labels appropriately
   - Focus on logic, not style
   - Check security and performance

3. **Review Output**
   ```
   ## Code Review

   ### Summary
   [Brief overview of changes]

   ### Issues
   - [🚫 CRITICAL] Issue description
   - [⚠️ MAJOR] Issue description
   - [💡 MINOR] Issue description

   ### Suggestions
   [Optional improvement suggestions]

   ### Approval
   [✓/✗] Changes ready for merge
   ```

## Cline-Specific Patterns

### 1. Session Management

#### Session Start
```
Read CLAUDE.md, TASKS.md, PROJECT_JOURNAL.md.
Tell me the current state in 3 sentences.
```

#### Task Start
```
I'm working on TASK-XXX: [description].
First: list what files you'll change.
Wait for my approval before writing any code.
```

#### Session End
```
Update PROJECT_JOURNAL.md: what we built, current state, known issues, what's next.
```

### 2. Context Optimization

#### High Context Handling
- When context > 70%, use compact mode if available
- Focus on essential information
- Remove unnecessary details
- Use file references instead of pasting content

#### Context Preservation
- Update PROJECT_JOURNAL.md when context drift occurs
- Use fresh sessions for new tasks
- Reference files explicitly with `@file` syntax

### 3. Quality Assurance

#### Code Quality
- Follow TypeScript strict mode
- No `any` types - use `unknown` and type guards
- Functional components only
- Named exports only
- Error handling with typed errors

#### Testing Requirements
- Unit test all business logic
- Integration test API calls
- Component tests for interactive elements
- Skip snapshot tests (fragile)

#### Security Compliance
- Run `gitleaks detect` before commits
- Never commit sensitive data
- Follow security checklist
- Validate user input

## Error Handling

### CI Recovery Rules
If `npm run ci:local` fails:
1. **Attempt 1**: Fix the specific failing assertion
2. **Attempt 2**: Check if test expectation is wrong
3. **Attempt 3**: Revert to last clean commit and report
4. **After 3 attempts**: STOP, add TODO, ask for human help

### Common Error Patterns
- **Type errors**: Check TypeScript strict mode compliance
- **Test failures**: Review expectations vs implementation
- **Build errors**: Check dependencies and configuration
- **Runtime errors**: Check error boundaries and async handling

## Performance Optimization

### Context Window Management
- Monitor usage percentage
- Break large tasks into smaller chunks
- Use compact mode when approaching limits
- Reference files instead of pasting content

### Task Chunking
- Maximum 200 lines of net new code per task
- Break complex features into logical units
- Complete one unit before starting next
- Verify each unit before proceeding

## Documentation Updates

### Required Updates
After implementing Cline integration:
1. Update `docs/ai-team/README.md` to include Cline examples
2. Update `CLAUDE.md` with Cline-specific instructions
3. Update `docs/onboarding/README.md` with Cline workflow
4. Update `docs/standards/*` with Cline patterns

### Team Communication
- Share integration documentation with team
- Provide examples of Cline usage
- Establish feedback mechanism for continuous improvement
- Monitor for consistency across AI models

## Troubleshooting

### Common Issues
1. **Context Drift**: Update PROJECT_JOURNAL.md, use fresh session
2. **Output Quality**: Use `/refine` to improve prompts
3. **Tool Issues**: Verify MCP server configuration
4. **Performance**: Break tasks into smaller chunks

### Escalation Path
- **Tool Issues**: Check MCP server configuration
- **Architecture Issues**: Consult CTO Expert
- **Scope Issues**: Consult Product Owner
- **Blockers**: Flag and ask for human help

## Next Steps

1. Test Cline workflow with current sprint tasks
2. Update team documentation
3. Establish feedback loop
4. Monitor for consistency
5. Refine based on usage patterns