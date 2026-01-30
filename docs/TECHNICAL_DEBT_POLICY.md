# 📋 Technical Debt Policy

**Version:** 1.0  
**Last Updated:** January 30, 2026  
**Status:** Active

---

## 🎯 Policy Overview

This policy establishes standards for identifying, tracking, and eliminating technical debt in the Nauti One codebase. Our goal is to maintain a **zero critical debt** status and keep overall debt under control.

---

## 📊 Debt Classification

### Severity Levels

| Level | Description | Max Resolution Time | Blocks Release |
|-------|-------------|---------------------|----------------|
| **CRITICAL** | Security vulnerabilities, data integrity risks | 7 days | ✅ Yes |
| **HIGH** | Performance issues, major maintainability problems | 14 days | ✅ Yes |
| **MEDIUM** | Code smells, minor architectural issues | 30 days | ❌ No |
| **LOW** | Style issues, documentation gaps | 60 days | ❌ No |

### Categories

| Category | Examples |
|----------|----------|
| **Security** | XSS, SQL injection, hardcoded secrets |
| **Type Safety** | `any` types, `@ts-ignore`, missing types |
| **Performance** | N+1 queries, memory leaks, slow renders |
| **Architecture** | Large files, high complexity, tight coupling |
| **Testing** | Missing tests, low coverage |
| **Documentation** | TODO/FIXME comments, missing docs |

---

## 🚫 Never Acceptable

These patterns are **never acceptable** in the codebase:

1. **Security Issues**
   - `eval()` or `new Function()`
   - `dangerouslySetInnerHTML` without sanitization
   - SQL template literals with user input
   - Hardcoded credentials or API keys

2. **TypeScript Violations**
   - `@ts-nocheck` in production code
   - `any` type without documented justification
   - More than 3 `@ts-ignore` per file

3. **React Anti-patterns**
   - Hooks inside loops or conditions
   - Class components (use functional)
   - Inline function definitions in JSX (performance)

4. **Code Quality**
   - Functions > 100 lines
   - Files > 500 lines
   - Cyclomatic complexity > 20
   - Duplicated code blocks > 20 lines

---

## ✅ Acceptable Debt (with Justification)

These may be temporarily acceptable with proper documentation:

```typescript
// TECH-DEBT: [CATEGORY] [SEVERITY]
// Reason: [Why this exists]
// Owner: [Who will fix it]
// Deadline: [When it must be fixed]
// Issue: #[Issue number]

// Example:
// TECH-DEBT: TYPE_SAFETY HIGH
// Reason: Legacy API returns untyped response, awaiting backend update
// Owner: @developer-name
// Deadline: 2026-02-15
// Issue: #1234
const data = response.data as any; // Temporary until API v2
```

---

## 📈 Metrics & Thresholds

### Current Targets

| Metric | Target | Current |
|--------|--------|---------|
| Critical Issues | 0 | ✅ 0 |
| High Issues | < 10 | ✅ OK |
| TypeScript Strict | 100% | ✅ 100% |
| Test Coverage | > 80% | 🎯 WIP |
| Lighthouse Score | > 90 | ✅ 95 |

### Quality Gates

PRs are blocked if they:
- Introduce any CRITICAL debt
- Increase HIGH debt by more than 3 items
- Reduce test coverage below 80%
- Add `@ts-nocheck` or untyped `any`

---

## 🔧 Tools & Automation

### Analysis Scripts

```bash
# Full debt analysis
npx ts-node scripts/analyze-technical-debt.ts

# Auto-fix trivial issues
npx ts-node scripts/fix-technical-debt.ts --dry-run
npx ts-node scripts/fix-technical-debt.ts

# Generate sprint plan
npx ts-node scripts/plan-debt-sprints.ts
```

### CI/CD Integration

```yaml
# .github/workflows/quality-gates.yml
- name: Analyze Technical Debt
  run: npx ts-node scripts/analyze-technical-debt.ts
  
- name: Check Critical Debt
  run: |
    CRITICAL=$(cat technical-debt-report.json | jq '.stats.bySeverity.CRITICAL')
    if [ "$CRITICAL" -gt 0 ]; then
      echo "❌ Critical technical debt detected!"
      exit 1
    fi
```

---

## 📅 Debt Review Process

### Weekly Review

Every Monday:
1. Run debt analysis script
2. Review new CRITICAL/HIGH items
3. Assign owners to unowned debt
4. Update sprint plan if needed

### Sprint Planning

Every sprint:
1. Reserve 20% capacity for debt reduction
2. Prioritize CRITICAL > HIGH > MEDIUM
3. Track debt velocity (items resolved vs created)

### Quarterly Audit

Every quarter:
1. Full debt inventory review
2. Update thresholds if needed
3. Celebrate debt-free achievements! 🎉

---

## 📝 Reporting

### Reports Generated

| File | Description | Frequency |
|------|-------------|-----------|
| `technical-debt-report.json` | Full debt inventory | On demand |
| `TECHNICAL_DEBT.md` | Human-readable report | On demand |
| `debt-sprint-plan.json` | Sprint planning data | On demand |
| `SPRINT_PLAN.md` | Sprint plan document | On demand |

### Metrics Dashboard

Track these metrics over time:
- Total debt items
- Debt by severity
- Debt velocity (created vs resolved)
- Average age of debt items
- Top debt categories

---

## 🏆 Best Practices

### Prevention

1. **Code Review Checklist**
   - [ ] No new `any` types
   - [ ] No `@ts-ignore` without justification
   - [ ] Tests included
   - [ ] No console.log statements
   - [ ] File size < 400 lines

2. **Development Standards**
   - Enable strict TypeScript
   - Write tests first (TDD)
   - Keep functions < 50 lines
   - Use proper error handling

3. **Architecture**
   - Small, focused components
   - Separate concerns
   - Use composition over inheritance
   - Follow established patterns

### Elimination

1. **Quick Wins First**
   - Fix trivial issues immediately
   - Use auto-fix scripts
   - Address issues during refactoring

2. **Strategic Refactoring**
   - Plan large refactors in sprints
   - Pair program on complex debt
   - Document architectural decisions

---

## 📞 Contacts

| Role | Responsibility |
|------|----------------|
| Tech Lead | Policy enforcement |
| Security Lead | Critical security debt |
| QA Lead | Test coverage debt |
| All Developers | Report and fix debt |

---

*This policy is reviewed quarterly and updated as needed.*
