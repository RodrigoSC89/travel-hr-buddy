# Deployment Guide - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment](#post-deployment)
6. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Code coverage meets threshold (>70%)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] No console errors in development

### Security
- [ ] Security scan completed (`npm run test:security`)
- [ ] All dependencies up to date
- [ ] No known vulnerabilities (`npm audit`)
- [ ] Environment variables secured
- [ ] API keys rotated if needed

### Performance
- [ ] Performance tests passing
- [ ] Lighthouse score > 90
- [ ] Bundle size within budget (<500KB)
- [ ] Images optimized
- [ ] Code splitting implemented

### Documentation
- [ ] CHANGELOG updated
- [ ] API documentation current
- [ ] README updated
- [ ] Migration guide (if schema changes)

---

## Environment Configuration

### Required Environment Variables

```bash
# Production .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn

# Build-time variables
SENTRY_ORG=your-org
SENTRY_PROJECT=nautilus-one
SENTRY_AUTH_TOKEN=your-auth-token
```

### Verification Script

```bash
#!/bin/bash
# verify-env.sh

required_vars=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_PUBLISHABLE_KEY"
  "VITE_SENTRY_DSN"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
done

echo "✅ All required environment variables set"
```

---

## Build Process

### Production Build

```bash
# 1. Clean previous builds
rm -rf dist/

# 2. Run tests
npm test

# 3. Build for production
npm run build

# 4. Verify build
npm run preview
```

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-chunks]
├── index.html
└── favicon.ico
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'chart.js'],
        }
      }
    },
    sourcemap: true,  // For error tracking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs
      }
    }
  }
});
```

---

## Deployment Steps

### Option 1: Lovable Platform (Recommended)

```bash
# 1. Commit changes
git add .
git commit -m "Release v1.2.3"

# 2. Push to main branch
git push origin main

# 3. Click "Publish" in Lovable interface
# Automatic deployment triggered
```

### Option 2: Manual Deployment

```bash
# 1. Build
npm run build

# 2. Deploy to hosting
# Example: Netlify
netlify deploy --prod --dir=dist

# Example: Vercel
vercel --prod

# Example: AWS S3
aws s3 sync dist/ s3://your-bucket/ --delete
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and deploy
docker build -t nautilus-one:latest .
docker push your-registry/nautilus-one:latest
```

---

## Post-Deployment

### Verification Steps

```bash
# 1. Health check
curl https://your-domain.com/health

# 2. Verify version
curl https://your-domain.com/api/version

# 3. Check Sentry for errors
# Visit Sentry dashboard

# 4. Verify monitoring
# Check monitoring dashboard
```

### Smoke Tests

```typescript
// smoke-test.ts
async function runSmokeTests() {
  const tests = [
    { name: 'Homepage loads', url: '/', expected: 200 },
    { name: 'API responds', url: '/api/health', expected: 200 },
    { name: 'Login page accessible', url: '/login', expected: 200 },
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`https://your-domain.com${test.url}`);
      const pass = response.status === test.expected;
      console.log(`${pass ? '✅' : '❌'} ${test.name}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}
```

### Monitoring Setup

```typescript
// Initialize monitoring
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { errorTracker } from '@/lib/monitoring/error-tracker';
import { userAnalytics } from '@/lib/monitoring/user-analytics';

performanceMonitor.initialize();
errorTracker.initialize();
userAnalytics.initialize();

// Set up alerts
errorTracker.subscribe((error) => {
  if (error.severity === 'critical') {
    // Send alert to team
    sendSlackAlert(`Critical error: ${error.message}`);
  }
});
```

### Database Migrations

```bash
# If using Supabase migrations
supabase db push

# Verify migration
supabase db diff
```

---

## Rollback Procedures

### Quick Rollback

```bash
# Option 1: Revert commit
git revert HEAD
git push origin main

# Option 2: Deploy previous version
git checkout v1.2.2
npm run build
npm run deploy

# Option 3: Platform rollback
# Use Lovable/Netlify/Vercel UI to rollback
```

### Database Rollback

```sql
-- If migration needs rollback
-- Run down migration
BEGIN;
  -- Undo changes
  DROP TABLE IF EXISTS new_table;
  -- Restore previous state
ROLLBACK;  -- Or COMMIT if successful
```

### Incident Response

```bash
# 1. Identify issue
# Check error logs, monitoring dashboard

# 2. Assess severity
# Critical: Immediate rollback
# High: Deploy hotfix
# Medium: Fix in next release

# 3. Execute rollback if needed
./scripts/rollback.sh

# 4. Communicate
# Notify team and stakeholders

# 5. Post-mortem
# Document what happened and prevention steps
```

---

## Deployment Checklist

```markdown
## Pre-Deploy
- [ ] Tests passing
- [ ] Security scan clean
- [ ] Performance budget met
- [ ] Environment variables set
- [ ] Backup database

## Deploy
- [ ] Build successful
- [ ] Assets uploaded
- [ ] DNS configured
- [ ] SSL certificate valid

## Post-Deploy
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Monitoring active
- [ ] No error spikes
- [ ] Performance metrics normal

## Documentation
- [ ] CHANGELOG updated
- [ ] Team notified
- [ ] Release notes published
- [ ] Stakeholders informed
```

---

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and retry
rm -rf node_modules dist
npm ci
npm run build
```

**Environment Variables Not Found**
```bash
# Verify .env file
cat .env

# Check build logs
npm run build -- --debug
```

**Performance Issues**
```bash
# Analyze bundle
npm run build -- --analyze

# Check for large dependencies
npm run build -- --report
```

---

## Maintenance Windows

### Scheduled Maintenance

```bash
# 1. Notify users (24h advance)
# Post maintenance notice

# 2. Enable maintenance mode
# Deploy maintenance page

# 3. Perform updates
# Run migrations, updates

# 4. Verify functionality
# Run smoke tests

# 5. Disable maintenance mode
# Deploy updated application
```

---

## Resources

- [Lovable Deployment Docs](https://docs.lovable.dev/deployment)
- [Supabase Deployment Guide](https://supabase.com/docs/guides/cli)
- [Vite Production Guide](https://vitejs.dev/guide/build.html)

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
