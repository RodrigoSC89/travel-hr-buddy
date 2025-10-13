# 🚀 Quick Vercel Deployment Guide

Deploy Nautilus One to Vercel in under 5 minutes.

---

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier is sufficient)
- Required API keys:
  - Supabase URL
  - Supabase Publishable Key

---

## Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose `RodrigoSC89/travel-hr-buddy`
5. Click **"Import"**

Vercel will automatically detect:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

---

## Step 2: Configure Environment Variables

In the **"Configure Project"** section:

### Required Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional Variables (for full features)

```bash
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENWEATHER_API_KEY=...
VITE_SENTRY_DSN=https://...
```

**Important:**
- Use actual values, NOT secret references (no `@secret_name`)
- Set for both **Production** and **Preview** environments
- Get these values from your service providers

---

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait ~45 seconds for build to complete
3. Build time: approximately 42 seconds

---

## Step 4: Verify Deployment

### Check Health Endpoint

Visit: `https://your-project.vercel.app/health`

You should see:
- ✅ **"System is Running"** status
- ✅ All required variables loaded
- ✅ Green checkmarks for Supabase config

### Test Main Application

Visit: `https://your-project.vercel.app`

---

## 🎯 Quick Reference

| Item | Value |
|------|-------|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node Version** | 22.x (auto-detected) |
| **Build Time** | ~42 seconds |
| **Bundle Size** | ~6.5 MB (123 precached entries) |

---

## 🔧 Post-Deployment Setup

### Add Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

### Configure Git Integration

1. Enable **Automatic Deployments** for `main` branch
2. Enable **Preview Deployments** for pull requests
3. Set **Production Branch** to `main`

### Set Up Monitoring (Optional)

1. Enable **Vercel Analytics** in project settings
2. Configure **Sentry** with `VITE_SENTRY_DSN`
3. Monitor via Vercel Dashboard

---

## ⚠️ Common Issues

### Build Fails

**Check:**
- Node version compatibility (requires 22.x)
- Environment variables are set correctly
- No TypeScript errors locally

**Solution:**
```bash
# Test locally first
npm install
npm run build
```

### Environment Variables Not Loading

**Check:**
- Variable names are exact (case-sensitive)
- Variables are set for correct environment
- No typos in variable names

**Solution:**
Redeploy after verifying variables in dashboard.

### Health Check Shows Missing Variables

**Check:**
- Variables are added in Vercel Dashboard
- Variables are set for Production environment
- Deployment was triggered after adding variables

**Solution:**
Add variables and redeploy.

---

## 🎉 Success!

Your deployment is ready when:

1. ✅ Build succeeds without errors
2. ✅ `/health` shows "System is Running"
3. ✅ Application loads correctly
4. ✅ No console errors in browser

---

## 📚 Next Steps

- Read [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) for detailed troubleshooting
- Check [README.md](./README.md) for application features
- Review [.env.example](./.env.example) for all available environment variables

---

## 🆘 Need Help?

1. **Check Health Page**: Visit `/health` to diagnose issues
2. **Review Build Logs**: Vercel Dashboard → Deployments → Build Logs
3. **Consult Troubleshooting Guide**: [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md)

---

**Deployment Time:** ~5 minutes
**Build Time:** ~42 seconds
**Configuration:** Simple and straightforward
