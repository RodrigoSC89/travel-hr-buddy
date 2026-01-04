# 🚀 Nautilus One - CI/CD & Monitoring Configuration

**Version:** v3.2.0  
**Date:** 2026-01-04

---

## 📊 1. Sentry Monitoring (Production)

### Configuration
- **File:** `sentry.client.config.ts`
- **Features:**
  - ✅ Error tracking with custom fingerprinting
  - ✅ Performance monitoring (traces)
  - ✅ Session replay (10% sample, 100% on error)
  - ✅ Button click tracking
  - ✅ Navigation breadcrumbs
  - ✅ User feedback integration

### Environment Variable Required
```env
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Usage in Code
```typescript
import { captureError, setUserContext, trackButtonClick } from './sentry.client.config';

// Track user
setUserContext({ id: 'user-123', email: 'user@example.com' });

// Track button clicks
trackButtonClick('save-button', 'VesselContracts', 'save');

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  captureError(error as Error, { context: 'vessel-save' });
}
```

---

## 🧪 2. E2E Tests (Playwright)

### Test Suites
| Suite | File | Coverage |
|-------|------|----------|
| PEOTRAM 2024 | `e2e/peotram.spec.ts` | 13 elements, score, export |
| PEO-DP 2021 | `e2e/peo-dp.spec.ts` | 6 sections, IPCLV, DP events |
| SGSO ANP | `e2e/sgso.spec.ts` | 16 practices, incidents, reports |
| Compliance Suite | `e2e/compliance-suite.spec.ts` | All modules integration |

### Run Commands
```bash
# Install Playwright
npx playwright install --with-deps chromium

# Run all compliance tests
npx playwright test e2e/ --project=chromium

# Run specific module
npx playwright test e2e/peotram.spec.ts --project=chromium
npx playwright test e2e/peo-dp.spec.ts --project=chromium
npx playwright test e2e/sgso.spec.ts --project=chromium

# Run with HTML report
npx playwright test e2e/ --reporter=html

# Run in headed mode (visible browser)
npx playwright test e2e/ --headed
```

---

## 🔄 3. CI/CD Pipeline (GitHub Actions)

### Workflow Files
| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `full-ci-cd-pipeline.yml` | push/PR to main/develop | Complete pipeline |
| `playwright-tests.yml` | push/PR | E2E tests only |
| `cd-deploy-production.yml` | push to main | Production deploy |
| `cd-deploy-staging.yml` | push to develop | Staging deploy |

### Pipeline Phases
```
1. Code Quality    → ESLint, TypeScript check
2. Security Audit  → npm audit
3. Unit Tests      → Vitest
4. Build           → Vite production build
5. E2E Tests       → Playwright compliance suite
6. Deploy Staging  → develop branch
7. Deploy Prod     → main branch
8. Monitoring      → Verify Sentry active
```

### Required GitHub Secrets
```yaml
VITE_SUPABASE_URL: "https://xxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbG..."
VITE_SENTRY_DSN: "https://xxx@sentry.io/xxx"
```

### Manual Deployment
```bash
# Trigger via GitHub CLI
gh workflow run full-ci-cd-pipeline.yml -f deploy_target=production
```

---

## 📋 4. Quick Reference

### Local Development
```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm run test
npm run test:unit

# Build for production
npm run build
```

### E2E Testing Locally
```bash
# Start the app
npm run dev

# In another terminal, run E2E tests
npx playwright test e2e/compliance-suite.spec.ts --headed
```

### Production Validation
```bash
# Run full validation script
chmod +x scripts/production-validation.sh
./scripts/production-validation.sh
```

---

## 🔐 5. Monitoring Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Sentry | sentry.io | Error tracking |
| Supabase | supabase.com/dashboard | Database & logs |
| GitHub Actions | github.com/.../actions | CI/CD status |

---

## ✅ Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Sentry Config | ✅ Ready | Requires VITE_SENTRY_DSN |
| E2E Tests | ✅ Ready | PEOTRAM, PEO-DP, SGSO |
| CI/CD Pipeline | ✅ Ready | Full automation |
| Production Scripts | ✅ Ready | Validation automation |

---

*Documentation generated for Nautilus One v3.2.0*
