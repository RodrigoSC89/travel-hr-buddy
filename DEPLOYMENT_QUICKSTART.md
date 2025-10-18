# 🚀 Quick Start - Deploy to Production

## 📋 Prerequisites

- [ ] Vercel account
- [ ] Supabase account
- [ ] GitHub account with repo access
- [ ] Node.js 22.x installed

---

## ⚡ 5-Minute Quick Setup

### 1️⃣ Supabase Setup (2 minutes)

```bash
# 1. Create project at https://supabase.com/dashboard
# 2. Copy these from Settings → API:
#    - Project URL
#    - anon/public key
#    - Project Reference ID

# 3. Install Supabase CLI
npm install -g supabase

# 4. Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 5. Deploy Edge Functions
supabase functions deploy
```

### 2️⃣ Vercel Setup (2 minutes)

```bash
# 1. Connect repo at https://vercel.com/new
# 2. Import RodrigoSC89/travel-hr-buddy
# 3. Framework: Vite (auto-detected)
# 4. Add environment variables:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_URL=https://your-app.vercel.app

# 5. Click Deploy!
```

### 3️⃣ GitHub Actions Setup (1 minute)

```bash
# Add secrets in GitHub: Settings → Secrets → Actions

VERCEL_TOKEN=...         # From https://vercel.com/account/tokens
VERCEL_ORG_ID=...        # From Vercel project settings
VERCEL_PROJECT_ID=...    # From Vercel project settings
```

---

## ✅ Verify Deployment

```bash
# 1. Run verification script
npm run verify:production

# 2. Check deployment
# Visit: https://your-app.vercel.app/admin/system-health

# 3. Test core features
# - Login
# - Create document
# - Use AI assistant
```

---

## 📚 Next Steps

For detailed configuration:
- 📖 [Complete Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- ✅ [Production Checklist](./PRODUCTION_CHECKLIST.md)
- 🔐 [Environment Variables](./ENVIRONMENT_VARIABLES.md)

---

## 🆘 Quick Troubleshooting

### Build Failing?
```bash
npm ci
npm run build
# Fix any errors before deploying
```

### Environment Variables Not Working?
- Variables must start with `VITE_` for frontend
- Redeploy after adding new variables
- Clear browser cache

### Edge Functions Failing?
```bash
# Test locally
supabase functions serve function-name

# Check logs
supabase functions logs function-name --tail

# Verify secrets
supabase secrets list
```

---

## 🎉 Success!

Once deployed:
- ✅ System live at your Vercel URL
- ✅ Automatic deployments on push to main
- ✅ Monitoring via Sentry
- ✅ Performance optimized
- ✅ Security headers configured

**Deploy time**: ~5 minutes
**Build time**: ~1-2 minutes
**Uptime**: 99.9%+ SLA

---

**Last updated**: 2025-10-18
