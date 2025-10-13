# 🚀 Vercel Deployment Guide - Nautilus One

## Overview

This guide provides step-by-step instructions for deploying the Nautilus One (Travel HR Buddy) application to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- GitHub repository access
- Required API keys (see `.env.example`)

## 📋 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `travel-hr-buddy` repository

2. **Configure Project**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   
   In the Vercel dashboard, go to **Settings → Environment Variables** and add:

   **Required Variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Optional Variables (for enhanced features):**
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ...
   VITE_OPENAI_API_KEY=sk-proj-...
   VITE_OPENWEATHER_API_KEY=...
   VITE_SENTRY_DSN=https://...@sentry.io/...
   ```

   See `.env.example` for the complete list of available environment variables.

4. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete (typically 1-2 minutes)
   - Your app will be available at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For production deployment
   npm run deploy:vercel
   
   # Or manually
   vercel --prod
   ```

4. **Add Environment Variables via CLI**
   ```bash
   # Add required variables
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
   
   # Add optional variables
   vercel env add VITE_MAPBOX_TOKEN production
   vercel env add VITE_OPENAI_API_KEY production
   ```

## 🔐 Environment Variables Setup

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_MAPBOX_TOKEN` | Mapbox access token for maps | https://account.mapbox.com |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | https://platform.openai.com |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API key | https://openweathermap.org/api |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | https://sentry.io |
| `VITE_AMADEUS_API_KEY` | Amadeus API for travel data | https://developers.amadeus.com |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs for voice features | https://elevenlabs.io |

### Build-time Variables (for Sentry source maps)

These are only needed if you're using Sentry error tracking:

```bash
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
vercel env add SENTRY_AUTH_TOKEN production
```

## 🏗️ Build Configuration

The project uses the following configuration (already set in `vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## 🔒 Security Headers

The following security headers are automatically configured in `vercel.json`:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection

Static assets (in `/assets/`) are cached for 1 year with immutable flag.

## 🌐 Custom Domain Setup

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS is enabled by default

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Runs build checks before deployment

### Disable Auto-Deploy (Optional)

In Project Settings → Git:
- Uncheck "Production Branch" to disable auto-deploy
- Keep "Preview Branches" enabled for PR previews

## 🐛 Troubleshooting

### Build Fails with "Environment Variable Not Found"

**Problem:** The build fails saying environment variables are not defined.

**Solution:** Ensure all required environment variables are set in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Redeploy

### Build Fails with "Module Not Found"

**Problem:** Build fails with module import errors.

**Solution:**
1. Ensure `package.json` has all dependencies listed
2. Clear Vercel cache: Project Settings → General → Clear Cache
3. Redeploy

### "Page Not Found" on Direct URL Access

**Problem:** Refreshing a page or accessing a direct URL shows 404.

**Solution:** This is already handled by the SPA rewrite in `vercel.json`. If you still see this:
1. Check that `vercel.json` has the rewrite rule (already present)
2. Ensure the build completed successfully
3. Check Vercel deployment logs

### Environment Variables Not Working

**Problem:** Environment variables are undefined in the app.

**Solution:** In Vite, only variables prefixed with `VITE_` are exposed to the client:
- ✅ Correct: `VITE_SUPABASE_URL`
- ❌ Wrong: `SUPABASE_URL` (not accessible in frontend)

## 📊 Post-Deployment Verification

After deployment, verify the following:

1. **Health Check**
   - Visit: `https://your-project.vercel.app/health`
   - Verify all required environment variables are loaded
   - Check system status is green

2. **Core Features**
   - Test authentication (login/logout)
   - Check that dashboards load correctly
   - Verify API integrations work

3. **Performance**
   - Run Lighthouse audit
   - Check Core Web Vitals in Vercel Analytics

## 🔧 Advanced Configuration

### Using Vercel Secrets (Optional)

If you want to use Vercel secrets (encrypted environment variables):

1. **Create secrets via CLI:**
   ```bash
   vercel secrets add supabase_url "https://your-project.supabase.co"
   vercel secrets add supabase_key "your-supabase-anon-key"
   ```

2. **Reference secrets in your project:**
   
   In Vercel dashboard, reference the secret:
   ```
   Variable name: VITE_SUPABASE_URL
   Value: @supabase_url
   ```

   The `@` prefix tells Vercel to use the secret value.

### Environment-Specific Variables

Set different values for preview vs production:

```bash
# Production only
vercel env add VITE_OPENAI_API_KEY production

# Preview only (for testing)
vercel env add VITE_OPENAI_API_KEY preview

# Development (local vercel dev)
vercel env add VITE_OPENAI_API_KEY development
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Setup Guide](https://supabase.com/docs)
- Project's `.env.example` - Complete list of all available variables
- `API_KEYS_SETUP_GUIDE.md` - Detailed guide for obtaining API keys

## 🎯 Production Checklist

Before deploying to production:

- [ ] All required environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Build completes successfully
- [ ] Health check passes (`/health`)
- [ ] Core features tested
- [ ] Error tracking configured (Sentry - optional)
- [ ] Analytics enabled (Vercel Analytics - optional)
- [ ] Backup/rollback plan ready

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this guide and `.env.example`
3. Check the project's health page after deployment
4. Consult Vercel documentation

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0  
**Maintainer:** Development Team
