# Deployment Architecture Guide
**PATCH 159.0 - Global Deploy with Isolated Environments**

## Overview

Nautilus One uses a three-tier deployment strategy with completely isolated environments:

- **Development** - Local and cloud development environment
- **Staging** - QA and pre-production testing
- **Production** - Live production system

## Environment Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ DEVELOPMENT  │──▶│   STAGING    │──▶│  PRODUCTION  │   │
│  │              │   │              │   │              │   │
│  │ • Local Dev  │   │ • QA Testing │   │ • Live Users │   │
│  │ • Feature    │   │ • Pre-prod   │   │ • Full Scale │   │
│  │   Branches   │   │ • Integration│   │ • Monitoring │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Supabase Projects

### Development
- **Project Name**: nautilus-dev
- **URL**: https://your-dev-project.supabase.co
- **Purpose**: Local development and feature testing
- **Data**: Test data, can be reset
- **Access**: Development team only

### Staging
- **Project Name**: nautilus-staging
- **URL**: https://your-staging-project.supabase.co
- **Purpose**: QA testing and integration tests
- **Data**: Sanitized production-like data
- **Access**: QA team and developers

### Production
- **Project Name**: nautilus-prod
- **URL**: https://your-prod-project.supabase.co
- **Purpose**: Live production system
- **Data**: Real operational data
- **Access**: Restricted to operators and admins

## Vercel Configuration

### Project Structure

Create three separate Vercel projects:

#### 1. nautilus-dev
```bash
# Connect to: git branch 'development'
# Environment: Development
# Build Command: npm run build:dev
# Install Command: npm install
# Output Directory: dist
```

#### 2. nautilus-staging  
```bash
# Connect to: git branch 'staging'
# Environment: Preview/Staging
# Build Command: npm run build
# Install Command: npm install
# Output Directory: dist
```

#### 3. nautilus-prod
```bash
# Connect to: git branch 'main'
# Environment: Production
# Build Command: npm run build
# Install Command: npm install
# Output Directory: dist
```

### Environment Variables Setup

For each Vercel project, configure environment variables via:
1. Project Settings → Environment Variables
2. Select appropriate environment (Production/Preview/Development)
3. Add all variables from corresponding `.env.*` file

### Branch Protection

```bash
# main (production)
- Require pull request reviews: 2
- Require status checks to pass
- Require branches to be up to date
- Include administrators

# staging
- Require pull request reviews: 1
- Require status checks to pass

# development
- Allow direct pushes for rapid iteration
```

## Setting Up Environments

### 1. Supabase Setup

For each environment (dev, staging, prod):

```bash
# Create new Supabase project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: nautilus-{env}
4. Region: Choose closest to users
5. Database Password: Use secure password manager

# Run migrations
supabase db push --project-ref your-project-ref

# Set secrets (for Edge Functions)
supabase secrets set --env-file .env.{environment}
```

### 2. Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# For each environment:

# Development
vercel link --project nautilus-dev
vercel env add < .env.development

# Staging
vercel link --project nautilus-staging
vercel env add < .env.staging

# Production
vercel link --project nautilus-prod
vercel env add < .env.production
```

### 3. DNS Configuration

```
# Development
dev.nautilus.ai → nautilus-dev.vercel.app

# Staging
staging.nautilus.ai → nautilus-staging.vercel.app

# Production
nautilus.ai → nautilus-prod.vercel.app
app.nautilus.ai → nautilus-prod.vercel.app
```

## Deployment Workflow

### Development → Staging

```bash
# 1. Develop feature
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 2. Create PR to development
# Auto-deploys to dev environment

# 3. After testing, merge to development
git checkout development
git merge feature/my-feature
# Auto-deploys to dev.nautilus.ai

# 4. Create PR from development to staging
# Review and approve
# Auto-deploys to staging.nautilus.ai
```

### Staging → Production

```bash
# 1. Test thoroughly in staging
# Run all integration tests
npm run test:e2e
npm run stress:all

# 2. Create release PR from staging to main
git checkout staging
git checkout -b release/v1.0.0

# 3. Update version and changelog
npm version minor
# Update CHANGELOG.md

# 4. Create PR to main
# Require 2 approvals
# Run full test suite

# 5. After approval, merge to main
# Auto-deploys to nautilus.ai
```

## Environment-Specific Configurations

### Development
```json
{
  "features": {
    "debug": true,
    "mockData": true,
    "analytics": false,
    "rateLimit": false
  },
  "logging": {
    "level": "debug",
    "verbose": true
  },
  "performance": {
    "cacheEnabled": false,
    "compressionEnabled": false
  }
}
```

### Staging
```json
{
  "features": {
    "debug": false,
    "mockData": false,
    "analytics": true,
    "rateLimit": true
  },
  "logging": {
    "level": "info",
    "verbose": false
  },
  "performance": {
    "cacheEnabled": true,
    "compressionEnabled": true
  }
}
```

### Production
```json
{
  "features": {
    "debug": false,
    "mockData": false,
    "analytics": true,
    "rateLimit": true
  },
  "logging": {
    "level": "warn",
    "verbose": false
  },
  "performance": {
    "cacheEnabled": true,
    "compressionEnabled": true
  },
  "monitoring": {
    "sentry": true,
    "performanceMonitoring": true
  }
}
```

## Database Migration Strategy

### Development
- Apply migrations immediately
- Can reset database as needed
- Test data only

### Staging
- Apply migrations after dev testing
- Use sanitized production copy
- Test with production-like data

### Production
- Apply after successful staging tests
- Schedule during maintenance window
- Always backup before migration
- Have rollback plan ready

```bash
# Backup before migration
supabase db dump --project-ref prod-ref > backup-$(date +%Y%m%d).sql

# Apply migration
supabase db push --project-ref prod-ref

# If issues, rollback
supabase db reset --project-ref prod-ref
psql -h your-host -U postgres -d postgres < backup-YYYYMMDD.sql
```

## Monitoring & Alerts

### Development
- Basic error logging
- Console warnings
- No alerts

### Staging
- Sentry error tracking
- Performance monitoring
- Email alerts for critical errors

### Production
- Full Sentry integration
- Real-time performance monitoring
- Multiple alert channels:
  - Email
  - Slack
  - PagerDuty for critical issues
- Uptime monitoring
- Resource usage alerts

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] No secrets in code or config files
- [ ] Different API keys per environment
- [ ] Production secrets rotated regularly
- [ ] HTTPS enforced for all environments
- [ ] CORS configured per environment
- [ ] Rate limiting enabled in staging/prod
- [ ] Authentication required for all APIs
- [ ] Database backups automated
- [ ] Access logs enabled
- [ ] Security headers configured

## Troubleshooting

### Environment Variable Issues
```bash
# Verify environment variables
vercel env ls --project nautilus-prod

# Pull environment variables locally
vercel env pull .env.local --project nautilus-prod
```

### Build Failures
```bash
# Check build logs
vercel logs --project nautilus-prod

# Test build locally
npm run build
```

### Database Connection Issues
```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

## Rollback Procedures

### Vercel Rollback
```bash
# List deployments
vercel ls --project nautilus-prod

# Promote previous deployment
vercel promote <deployment-url>
```

### Database Rollback
```bash
# Restore from backup
psql -h your-host -U postgres -d postgres < backup.sql

# Or use Supabase point-in-time recovery
# Go to Supabase Dashboard → Database → Backups
```

## Support Contacts

- **DevOps Lead**: devops@nautilus.ai
- **Database Admin**: dba@nautilus.ai
- **Security Team**: security@nautilus.ai

## Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [Environment Variables Best Practices](https://12factor.net/config)
