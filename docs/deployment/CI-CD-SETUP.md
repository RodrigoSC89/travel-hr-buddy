# 🔄 CI/CD Setup Guide

## Overview

Continuous Integration and Deployment configuration for Nautilus One.

## GitHub Actions Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and PR:

```yaml
- Lint code
- Type check
- Unit tests
- Build verification
```

### 2. Staging Deploy (`.github/workflows/cd-deploy-staging.yml`)

Runs on push to `develop`:

```yaml
- All CI checks
- Deploy to staging environment
- Smoke tests
```

### 3. Production Deploy (`.github/workflows/cd-deploy-production.yml`)

Runs on push to `main`:

```yaml
- All CI checks
- Quality gates
- Deploy to production
- Post-deploy verification
```

## Environment Variables

### Required Secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Service role key |
| `SENTRY_DSN` | Sentry error tracking |

### Per Environment

| Environment | Prefix |
|-------------|--------|
| Staging | `STAGING_*` |
| Production | `PROD_*` |

## Branch Strategy

```
main        → Production
develop     → Staging
feature/*   → Feature branches
fix/*       → Bug fixes
```

## Deployment Flow

```
feature → PR → develop → staging → main → production
                  ↓          ↓
              Auto deploy  Auto deploy
```

## Manual Deployment

### Lovable

1. Click "Publish" in editor
2. Updates deploy automatically

### Vercel

```bash
vercel --prod
```

## Rollback

### Lovable

Use version history to restore previous state.

### Vercel

```bash
vercel rollback
```

## Monitoring

- **Sentry** - Error tracking
- **PostHog** - Analytics
- **Supabase** - Database monitoring
