---
name: security-checklist
description: Security review checklist for AI-generated code
---

# Security Checklist

## Review Every AI-Generated Change For

### Secrets & Credentials
- [ ] No API keys, tokens, or secrets in code
- [ ] No hardcoded URLs pointing to internal/private services
- [ ] No credentials in test files or comments

### Input Validation
- [ ] All user input validated with Zod schema
- [ ] No direct SQL string concatenation (parameterized queries only)
- [ ] File uploads validated for type and size

### Authentication & Authorization
- [ ] Every API endpoint checks auth
- [ ] RLS policies exist for every table access
- [ ] No service-role calls from client-side code
- [ ] Token expiry handled gracefully

### Data Protection
- [ ] No sensitive data logged (passwords, tokens, PII, health data)
- [ ] No sensitive data in URL parameters
- [ ] Local storage not used for sensitive data (use SecureStore)

### Error Handling
- [ ] Error messages don't leak internal state or stack traces
- [ ] No silent error catches
- [ ] User-facing errors are sanitized

### Dependencies
- [ ] New npm packages reviewed for:
  - Last publish date (should be < 1 year)
  - Weekly downloads (should be > 1K for anything critical)
  - Known CVEs
- [ ] Package versions locked after installation

## When to Apply
Run through this checklist for every PR that touches auth, data access, or external integrations. For simple UI changes, skip to "Secrets & Credentials" section only.