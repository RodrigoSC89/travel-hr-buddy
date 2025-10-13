# 🚀 Vercel Deployment Guide

Quick guide to deploy Travel HR Buddy (Nautilus One) to Vercel.

## Prerequisites

- GitHub account connected to Vercel
- Supabase project created
- Environment variables ready

## Quick Deploy

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `RodrigoSC89/travel-hr-buddy`
4. Vercel will auto-detect Vite configuration

### 2. Configure Environment Variables

In Vercel project settings, add these secrets:

#### Supabase (Required)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

#### Sentry (Optional - for error tracking)
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

#### OpenAI (Required for AI features)
```bash
VITE_OPENAI_API_KEY=sk-proj-...
```

#### Mapbox (Required for maps)
```bash
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...
```

#### Application Settings
```bash
VITE_APP_URL=https://your-app.vercel.app
VITE_EMBED_ACCESS_TOKEN=your-secret-token
```

### 3. Build Settings

Vercel should auto-detect these from `vercel.json`, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

### Verify Deployment

1. **Check Build Logs**
   - Should show "✓ built in Xs"
   - No TypeScript errors
   - PWA files generated

2. **Test Application**
   - Navigate to your Vercel URL
   - Check authentication works
   - Verify API connections to Supabase

3. **Check Environment Variables**
   - Go to Settings → Environment Variables
   - Ensure all required variables are set
   - Test in different environments (Production, Preview)

### Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Enable automatic HTTPS

## Supabase Edge Functions

The application uses Supabase Edge Functions, not Vercel API routes.

### Deploy Edge Functions

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Deploy all functions
npx supabase functions deploy

# Or deploy specific function
npx supabase functions deploy assistant-query
```

### Set Supabase Secrets

```bash
npx supabase secrets set OPENAI_API_KEY=sk-proj-...
npx supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set ADMIN_EMAIL=admin@yourcompany.com
```

## Troubleshooting

### Build Fails

**Check:**
- Node version is 18.x or higher
- All dependencies install correctly
- No TypeScript errors in logs

**Fix:**
```bash
# Locally test build
npm run build

# Check for TypeScript errors
npm run lint
```

### Environment Variables Not Working

**Issue:** Variables not accessible in the app

**Fix:**
- Ensure all variables start with `VITE_` prefix
- Redeploy after adding variables
- Check Vercel deployment logs

### Supabase Connection Issues

**Issue:** Cannot connect to Supabase

**Fix:**
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure RLS policies are configured
- Check CORS settings in Supabase

### 404 on Routes

**Issue:** Refresh on routes shows 404

**Fix:**
- Verify `vercel.json` has correct rewrites
- Should have: `{ "source": "/(.*)", "destination": "/index.html" }`
- This is configured correctly in this project

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics:
- Web Vitals tracking
- Real User Monitoring
- Performance insights

### Sentry Integration

If Sentry is configured:
1. Errors automatically reported
2. Check Sentry dashboard for issues
3. Source maps uploaded during build

### Logs

View deployment and runtime logs:
- Vercel Dashboard → Deployments → Logs
- Filter by function/edge function
- Monitor for errors and warnings

## Rollback

If deployment has issues:

1. Go to Deployments tab
2. Find last working deployment
3. Click "⋯" → Promote to Production

## Environment-Specific Deployments

### Production
- Deployed from `main` branch
- All features enabled
- Production environment variables

### Preview (Pull Requests)
- Automatic preview deployments
- Uses same environment variables
- Perfect for testing before merge

### Development
- Can configure separate development branch
- Use development environment variables
- Test new features safely

## Performance Optimization

Already configured in this project:

✅ **Code Splitting**
- Vendor chunks separated
- Route-based lazy loading
- Large libraries (mapbox) isolated

✅ **Caching**
- Static assets cached (1 year)
- Service Worker for offline support
- PWA manifest configured

✅ **Compression**
- Gzip enabled automatically
- Brotli compression on Vercel
- Optimized bundle sizes

✅ **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- Referrer-Policy configured

## Continuous Deployment

Already configured:
- Push to `main` → Production deploy
- Pull Request → Preview deploy
- Automatic builds on commit

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project Issues:** https://github.com/RodrigoSC89/travel-hr-buddy/issues

---

**Quick Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [Project Repository](https://github.com/RodrigoSC89/travel-hr-buddy)

✅ Your application is production-ready and optimized for Vercel!
