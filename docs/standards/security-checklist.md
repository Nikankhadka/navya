# Security Review Checklist

> For the full security review process, see `.agent/skills/security-checklist.md`. This document is a quick-reference checklist for manual review.

## Pre-Commit Security Check

Run this checklist before every commit that touches auth, data, or external integrations.

### Secrets & Credentials
- [ ] No API keys, tokens, or secrets in code
- [ ] No hardcoded URLs pointing to internal/private services
- [ ] No credentials in test files or comments
- [ ] `.env` files are in `.gitignore`

### Input Validation
- [ ] All user input validated with Zod schema
- [ ] No direct SQL string concatenation (parameterized queries only)
- [ ] File uploads validated for type and size

### Authentication & Authorization
- [ ] Every API endpoint checks auth
- [ ] RLS policies exist for every table access
- [ ] No service-role calls from client-side code
- [ ] Token expiry handled gracefully (refresh flow works)

### Data Protection
- [ ] No sensitive data logged (passwords, tokens, PII, health data)
- [ ] No sensitive data in URL parameters
- [ ] SecureStore used for sensitive data (not AsyncStorage)

### Error Handling
- [ ] Error messages don't leak internal state or stack traces
- [ ] No silent error catches
- [ ] User-facing errors are sanitized

## Secret Scanning

### Setup
```bash
brew install gitleaks
gitleaks detect --source . --verbose
```

### Pre-Commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
gitleaks protect --staged
```
Make executable: `chmod +x .git/hooks/pre-commit`

## Supply Chain Security

Before adding any new npm dependency:
- [ ] Check last publish date (< 1 year preferred)
- [ ] Check weekly downloads (> 1K for security-adjacent packages)
- [ ] Check for open CVEs (run `npm audit`)
- [ ] Prefer packages > 1M weekly downloads for auth/storage/crypto
- [ ] Lock package versions after installation

## CI Security

- [ ] No `--dangerously-skip-permissions` in CI/CD pipelines
- [ ] MCP server tokens use least-privilege permissions
- [ ] GitHub Actions secrets are scoped to the repo, not org-wide

## Incident Response

If a secret is accidentally committed:
1. Immediately revoke the exposed credential
2. Remove it from git history (BFG Repo-Cleaner or `git filter-repo`)
3. Rotate any keys or tokens that may be compromised
4. Document the incident in `docs/execution/decision-log.md`