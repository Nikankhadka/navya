# Cline Integration — Navya Agent System

This document defines how Cline integrates with Navya's multi-agent orchestration system to ensure consistency across different AI models.

## Overview

Cline operates as an executor within Navya's agent system, maintaining the same workflows, standards, and output quality regardless of the AI model used. This integration ensures your team has a consistent experience across all AI systems.

## Integration Principles

1. **Agent-Agnostic Design**: Cline follows the same agent definitions and workflows defined in `.agent/`
2. **Consistent Output**: Maintains the same output formats and quality standards
3. **Context Management**: Adheres to Navya's context management rules
4. **Tool Compatibility**: Leverages existing MCP servers and tools

## Cline in the Agent System

### Agent Roles
Cline can operate as any of the primary agents:

| Agent | Cline Implementation | Use Case |
|---|---|---|
| Prompt Master | Built-in prompt refinement using PROMPT framework | Always first for substantial tasks |
| Technical Designer | Structured planning and architecture | Before implementation |
| Task Executor | Feature implementation from spec | Building features |
| Code Reviewer | Automated review with severity labels | Before commits |

### Command Mapping
| Command | Cline Implementation | Purpose |
|---|---|---|
| `/refine` | Cline prompt refinement | Structured prompt analysis and refinement |
| `/implement` | Cline feature implementation | End-to-end feature development |
| `/diagnose` | Cline bug analysis | Error diagnosis and debugging |
| `/review` | Cline code review | Automated code review |

## Cline Workflow Integration

### 1. Default Intake Process
When a task enters Cline:
```
Role selected: [appropriate agent]
Constraints applied: [relevant guardrails from CLAUDE.md]
Artifacts to update: [list of files that will be touched]
```

### 2. Prompt Refinement Process
Cline automatically applies the PROMPT framework to:
1. Detect ambiguity and missing context
2. Fill in project context from CLAUDE.md, TASKS.md, and existing files
3. Structure the prompt with appropriate templates
4. Route to the correct agent/command
5. Present a refinement report for approval

### 3. Context Management
Cline adheres to Navya's context management rules:
- **0-50%**: Work freely
- **50-70%**: Stay aware, avoid big tangents
- **70-85%**: Use compact mode when available
- **85%+**: End session, update PROJECT_JOURNAL.md

### 4. Quality Assurance
Cline follows Navya's quality standards:
- Run `npm run typecheck` after implementation
- Write tests for all features
- Follow TypeScript strict mode
- Apply security checklist
- Update TASKS.md after completion

## Cline-Specific Implementation

### Tool Usage
Cline leverages your existing MCP servers:
- **GitHub**: Issue/PR management, code operations
- **Supabase**: Schema inspection, migration management
- **Filesystem**: File operations, code analysis

### File Operations
- Use `@file` syntax for file references
- Break large tasks into atomic chunks (< 200 lines net new code)
- Maintain your existing file structure and conventions

### Error Handling
- Follow your CI recovery rules
- Implement proper error boundaries
- Handle async operation errors
- Never leave TODO or FIXME comments

## Cross-Model Consistency

### Agent Behavior
Regardless of the AI model, each agent should:
1. **Prompt Master**: Apply PROMPT framework consistently
2. **Technical Designer**: Produce structured, reviewable plans
3. **Task Executor**: Implement features with proper testing
4. **Code Reviewer**: Flag critical and major issues with severity labels

### Output Standards
- **Code**: Follow TypeScript strict mode, no `any` types
- **Documentation**: Explain WHY, not what
- **Tests**: Unit tests for business logic, integration tests for APIs
- **Commit Messages**: Follow `<type>(<scope>): <description>` format

## Integration with Existing Workflows

### Sprint Management
- Update TASKS.md after each completed task
- Add session notes to PROJECT_JOURNAL.md
- Follow your existing sprint planning process

### Code Review Process
- Run `/review` command before commits
- Address all flagged issues
- Maintain PR review protocol as defined in `docs/ai-team/README.md`

### Architecture Decisions
- Follow ADR format for architectural decisions
- Consult CTO Expert for cross-domain concerns
- Document decisions in `docs/architecture/README.md`

## Quality Assurance

### Testing
- Unit test all business logic
- Integration test API calls with mocked fetch/Supabase
- Component tests for forms and interactive elements
- Skip snapshot tests (fragile)

### Security
- Run `gitleaks detect` before every push
- Never commit sensitive data
- Follow security checklist from `.agent/skills/security-checklist.md`

### Performance
- Monitor context window usage
- Use compact mode when approaching limits
- Break large tasks into smaller chunks

## Troubleshooting

### Context Issues
- If context drift occurs, update PROJECT_JOURNAL.md
- Use fresh session for new tasks
- Reference files explicitly with `@file` syntax

### Output Quality Issues
- Use `/refine` to improve prompts
- Check against PROMPT framework
- Verify against existing patterns

### Integration Issues
- Verify MCP server configuration
- Check file permissions
- Ensure environment variables are set

## Next Steps

1. Test integration with current sprint tasks
2. Update team documentation
3. Establish feedback loop for continuous improvement
4. Monitor for consistency across AI models