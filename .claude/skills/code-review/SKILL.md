---
description: 'Invoke when reviewing code changes, pull requests, diffs, or when asked to evaluate code quality, find bugs, or suggest improvements'
---

# Code Review Skill

## Purpose

Provide thorough, constructive code reviews that improve code quality while being respectful and educational.

## Review Process

### 1. Understand Context

- What is the purpose of this change?
- What problem does it solve?
- How does it fit into the broader codebase?

### 2. Check for Critical Issues

- **Security vulnerabilities**: SQL injection, XSS, auth bypasses, secrets in code
- **Data integrity**: Race conditions, data loss scenarios, improper validation
- **Breaking changes**: API compatibility, database migrations, config changes

### 3. Evaluate Code Quality

- **Correctness**: Does the code do what it's supposed to do?
- **Edge cases**: Are boundary conditions handled?
- **Error handling**: Are errors caught and handled appropriately?
- **Performance**: Any obvious inefficiencies or N+1 queries?

### 4. Review Design & Architecture

- **Single Responsibility**: Does each function/class do one thing well?
- **DRY**: Is there unnecessary duplication?
- **Coupling**: Are dependencies appropriate and minimal?
- **Testability**: Can this code be easily tested?

### 5. Check Readability

- **Naming**: Are variables, functions, and classes named clearly?
- **Comments**: Are complex sections documented?
- **Structure**: Is the code organized logically?

## Feedback Guidelines

### Be Constructive

- Explain WHY something is an issue, not just WHAT
- Suggest specific improvements with examples
- Acknowledge good patterns and decisions

### Prioritize Feedback

- 🔴 **Critical**: Must fix before merge (security, bugs, data loss)
- 🟡 **Important**: Should fix, significant quality impact
- 🟢 **Suggestion**: Nice to have, minor improvements
- 💡 **Nitpick**: Style preferences, optional

### Example Feedback Format

```
🔴 **Security Issue**: User input is not sanitized before SQL query

**Problem**: This allows SQL injection attacks
**Location**: `src/db/users.ts:45`
**Suggestion**: Use parameterized queries instead:
\`\`\`typescript
// Before (vulnerable)
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// After (safe)
db.query('SELECT * FROM users WHERE id = ?', [userId])
\`\`\`
```

## Review Checklist

- [ ] No security vulnerabilities
- [ ] Error handling is appropriate
- [ ] Edge cases are covered
- [ ] Code is readable and well-named
- [ ] No unnecessary complexity
- [ ] Tests cover the changes (if applicable)
- [ ] Documentation is updated (if needed)
- [ ] No breaking changes (or they're documented)
