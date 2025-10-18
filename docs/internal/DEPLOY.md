# 🚀 Deployment Guide

## Overview

Nautilus One uses a modern deployment strategy with Vercel for frontend/API hosting and Supabase for backend services. This guide covers the complete deployment process, configuration, and cron job setup.

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                 RodrigoSC89/travel-hr-buddy             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Git Push
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│  Vercel         │         │  Supabase       │
│  - Frontend     │◄────────┤  - Database     │
│  - API Routes   │  Auth   │  - Auth         │
│  - Static       │  & RLS  │  - Edge Funcs   │
│  - PWA          │         │  - Storage      │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Users     │
              │ (Browsers)  │
              └─────────────┘
```

## 📦 Platform: Vercel

### Initial Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

### Configuration

#### vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Environment Variables

Set in Vercel Dashboard or via CLI:

```bash
# Required variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_PROJECT_ID
vercel env add VITE_OPENAI_API_KEY

# Optional but recommended
vercel env add VITE_SENTRY_DSN
vercel env add SENTRY_AUTH_TOKEN
vercel env add SENTRY_ORG
vercel env add SENTRY_PROJECT

# Backend service keys (for API routes)
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### Deployment Commands

#### Preview Deployment
```bash
vercel
```

#### Production Deployment
```bash
vercel --prod
# or
npm run deploy:vercel
```

### Build Configuration

**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`
**Node Version**: 22.x

### Vercel Project Settings

1. **Framework Preset**: Vite
2. **Root Directory**: `./`
3. **Build Output**: `dist`
4. **Install Command**: `npm install --legacy-peer-deps`
5. **Build Command**: `npm run build`

### CI/CD Integration

Automatic deployments on:
- **Push to `main`**: Production deployment
- **Pull Requests**: Preview deployments
- **All branches**: Preview deployments (optional)

Configure in Vercel dashboard:
```
Settings > Git > Production Branch = main
Settings > Git > Deploy Hooks = enabled
```

## 🗄️ Platform: Supabase

### Initial Setup

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Database Setup

#### Run Migrations
```bash
# Apply all migrations
supabase db push

# Create new migration
supabase migration new migration_name

# Reset database (development only)
supabase db reset
```

#### Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Should return empty (all tables have RLS enabled)
```

### Edge Functions

#### Deploy All Functions
```bash
supabase functions deploy
```

#### Deploy Specific Function
```bash
supabase functions deploy ai-chat
supabase functions deploy send-assistant-report
supabase functions deploy jobs-forecast
```

#### Set Function Secrets
```bash
# Required for email functions
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@company.com

# Required for AI functions
supabase secrets set OPENAI_API_KEY=sk-...

# Required for weather functions
supabase secrets set OPENWEATHER_API_KEY=...

# Required for maps
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

#### List Deployed Functions
```bash
supabase functions list
```

### Storage Configuration

#### Buckets
- `documents` - User uploaded documents
- `avatars` - User profile pictures
- `evidence` - Checklist evidence photos
- `certificates` - Crew certificates

#### Storage Policies

```sql
-- Public read for avatars
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Documents are private
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Supabase Environment

Set in Supabase Dashboard > Settings > API:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Anonymous (public) key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)

## ⏰ Cron Jobs Configuration

### Supabase Cron Setup

Configure in `supabase/functions/cron.yaml`:

```yaml
# Daily Assistant Report - 8:00 AM UTC
- name: daily-assistant-report
  schedule: "0 8 * * *"
  function: send-assistant-report

# Daily Restore Dashboard - 9:00 AM UTC
- name: daily-restore-dashboard
  schedule: "0 9 * * *"
  function: send-restore-dashboard-daily

# Forecast Report - Every Monday at 7:00 AM UTC
- name: weekly-forecast
  schedule: "0 7 * * 1"
  function: send-forecast-report

# Certificate Expiry Check - Daily at 6:00 AM UTC
- name: check-certificates
  schedule: "0 6 * * *"
  function: check-certificate-expiry

# Cron Health Monitor - Every 2 hours
- name: monitor-cron
  schedule: "0 */2 * * *"
  function: monitor-cron-health

# Price Monitor - Every 6 hours
- name: price-monitor
  schedule: "0 */6 * * *"
  function: monitor-prices
```

### Deploy Cron Configuration
```bash
supabase functions deploy --no-verify-jwt
```

### Vercel Cron (Alternative)

For API routes in `pages/api/cron/`:

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-real-forecast",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## 🔍 Monitoring Setup

### Supabase Logs

Access via dashboard or CLI:
```bash
# View function logs
supabase functions logs send-assistant-report

# Follow logs in real-time
supabase functions logs send-assistant-report --follow
```

### Vercel Analytics

Enabled automatically for all deployments:
- Page views and traffic
- Performance metrics (Web Vitals)
- Geographic distribution

### Sentry Integration

1. **Install Sentry SDK** (already installed)
   ```bash
   npm install @sentry/react @sentry/vite-plugin
   ```

2. **Configure Sentry**
   ```typescript
   // src/main.tsx
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay(),
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

3. **Configure Source Maps**
   ```typescript
   // vite.config.ts
   import { sentryVitePlugin } from "@sentry/vite-plugin";

   export default defineConfig({
     plugins: [
       sentryVitePlugin({
         org: process.env.SENTRY_ORG,
         project: process.env.SENTRY_PROJECT,
         authToken: process.env.SENTRY_AUTH_TOKEN,
       }),
     ],
   });
   ```

### Monitoring Tools Overview

| Tool | Purpose | Access |
|------|---------|--------|
| Supabase Dashboard | Database logs, Edge function logs | https://supabase.com/dashboard |
| Vercel Dashboard | Build logs, deployment status | https://vercel.com/dashboard |
| Sentry | Error tracking, performance | https://sentry.io |
| Resend Dashboard | Email delivery logs | https://resend.com/dashboard |

## 🏗️ Build Optimization

### Production Build

```bash
npm run build
```

Output:
- Static HTML/CSS/JS in `dist/`
- Service Worker for PWA
- Optimized and minified assets
- Source maps (for debugging)

### Build Performance

Current build metrics:
- **Build Time**: ~60 seconds
- **Bundle Size**: 7.5 MB (uncompressed)
- **Gzipped**: ~2.5 MB
- **Largest Chunk**: mapbox-gl (~1.6 MB)

### Optimization Strategies

1. **Tree Shaking** (enabled by default)
   - Removes unused code
   - Vite automatically optimizes

2. **Lazy Loading** (implemented)
   ```typescript
   const Dashboard = React.lazy(() => import("./pages/Dashboard"));
   ```

3. **Code Splitting**
   - Automatic via dynamic imports
   - Separate chunks per route

4. **Asset Optimization**
   - Images optimized via build process
   - SVG icons inlined when small

5. **PWA Caching**
   ```typescript
   // vite.config.ts
   VitePWA({
     registerType: 'autoUpdate',
     workbox: {
       globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
       runtimeCaching: [
         {
           urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
           handler: 'NetworkFirst',
           options: {
             cacheName: 'supabase-cache',
             expiration: {
               maxEntries: 50,
               maxAgeSeconds: 60 * 60 * 24, // 24 hours
             },
           },
         },
       ],
     },
   })
   ```

### Lighthouse Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance | > 90 | 88-95 |
| Accessibility | > 95 | 98 |
| Best Practices | > 95 | 100 |
| SEO | > 90 | 92 |

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Build locally: `npm run build`
- [ ] Check for console.logs: `npm run clean:logs`
- [ ] Validate API keys: `npm run validate:api-keys`
- [ ] Update documentation if needed
- [ ] Review security headers in `vercel.json`

### Deployment

- [ ] Commit and push changes
- [ ] Verify CI/CD pipeline passes
- [ ] Deploy to preview: `vercel`
- [ ] Test preview deployment
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify production deployment
- [ ] Check Sentry for errors
- [ ] Monitor Supabase logs

### Post-Deployment

- [ ] Run smoke tests on production
- [ ] Verify cron jobs are running
- [ ] Check email delivery (Resend dashboard)
- [ ] Monitor performance (Vercel analytics)
- [ ] Update status page if needed
- [ ] Notify team of deployment

## 🔄 Rollback Procedure

### Vercel Rollback

1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "Promote to Production"

### Supabase Rollback

```bash
# Rollback database migration
supabase db reset

# Rollback to specific migration
supabase db reset --version 20250101000000

# Redeploy previous Edge Function version
supabase functions deploy function-name --import-map import_map.json
```

## 📞 Support & Troubleshooting

### Common Issues

**Build Fails**
- Check Node version matches `package.json` engines
- Clear cache: `rm -rf node_modules && npm install`
- Check for TypeScript errors

**Edge Function Fails**
- Check function logs: `supabase functions logs <function-name>`
- Verify secrets are set: `supabase secrets list`
- Test locally: `supabase functions serve <function-name>`

**RLS Issues**
- Verify policies in Supabase SQL Editor
- Check user authentication
- Test with service role key (bypass RLS)

### Getting Help

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Supabase Documentation](https://supabase.com/docs)
3. Review [MONITORING.md](./MONITORING.md)
4. Contact DevOps team

## 📚 Additional Resources

- [Vercel Deployment Best Practices](https://vercel.com/docs/concepts/deployments/overview)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
