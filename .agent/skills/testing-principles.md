---
name: testing-principles
description: Testing principles and patterns for Navya
---

# Testing Principles

## What to Test
- **Unit test** all business logic in services and feature utils
- **Integration test** API calls with mocked Supabase client
- **Component test** forms and interactive elements
- **DO NOT** write snapshot tests — too fragile, low value

## What NOT to Test
- Pure UI elements without logic (buttons with no interactive behavior)
- Third-party library behavior (assume they work as documented)
- Navigation structure (test this manually)

## Coverage Targets
- 70% on `services/` and feature `utils/` directories
- 50% overall project coverage
- Focus on critical paths over trivial getters/setters

## Mocking Strategy
- Mock Supabase client at the module level
- Mock API responses, not network requests (unit level)
- Use Jest mocks for Zustand stores when testing components
- Never mock what you don't own (unless it's an external API)

## Test Structure
```typescript
describe('ComponentName / HookName / UtilName', () => {
  it('should X when Y', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Edge Cases Checklist
- Empty/null inputs
- Error states (API failure, network timeout)
- Loading states
- Auth boundaries (unauthenticated, unauthorized)
- Boundary values (empty arrays, max lengths, zero values)

## When to Apply
Apply these principles when writing new tests or reviewing test coverage.