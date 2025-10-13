# ⚡ Vercel Quick Start - Nautilus One

## 🚀 5-Minute Deployment

### Step 1: Connect to Vercel (1 min)
```bash
# Option A: Via Dashboard
# Go to https://vercel.com/new
# Click "Import Project" → Select your GitHub repo

# Option B: Via CLI
npm install -g vercel
vercel login
vercel
```

### Step 2: Add Required Environment Variables (2 min)

In Vercel Dashboard → Settings → Environment Variables, add:

**Minimum Required:**
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional (but recommended):**
```
VITE_MAPBOX_TOKEN = pk.eyJ...
VITE_OPENAI_API_KEY = sk-proj-...
VITE_SENTRY_DSN = https://...@sentry.io/...
```

### Step 3: Deploy (2 min)
```bash
# If using CLI
vercel --prod

# If using Dashboard
# Click "Deploy" button
```

### Step 4: Verify
Visit: `https://your-project.vercel.app/health`

✅ Green status = Everything working!  
❌ Red status = Add missing environment variables

## 🔑 Where to Get API Keys

| Service | Get Keys From | Required? |
|---------|---------------|-----------|
| Supabase | https://app.supabase.com → Project Settings → API | ✅ Yes |
| Mapbox | https://account.mapbox.com/access-tokens/ | 🎁 Optional |
| OpenAI | https://platform.openai.com/api-keys | 🎁 Optional |
| Sentry | https://sentry.io/settings/projects/ | 🎁 Optional |

## ⚠️ Common Mistakes

### ❌ Don't: Reference non-existent secrets
```
VITE_SUPABASE_URL = @supabase_url  # This will fail if secret doesn't exist!
```

### ✅ Do: Add values directly
```
VITE_SUPABASE_URL = https://your-project.supabase.co  # Add the actual URL
```

### ❌ Don't: Forget VITE_ prefix
```
SUPABASE_URL = https://...  # Won't work in frontend!
```

### ✅ Do: Use VITE_ prefix
```
VITE_SUPABASE_URL = https://...  # Works correctly
```

## 🐛 Troubleshooting

### Build fails with "Environment Variable references Secret"
**Solution:** Don't use `@secret_name` syntax. Just paste the actual value in Vercel dashboard.

### "VITE_SUPABASE_URL is undefined" in browser console
**Solution:** 
1. Add `VITE_SUPABASE_URL` in Vercel dashboard
2. Redeploy the project

### Page shows 404 on refresh
**Solution:** Already fixed in `vercel.json` with SPA rewrite. If still happens, clear Vercel cache and redeploy.

## 📚 More Information

- Full guide: `VERCEL_DEPLOYMENT.md`
- API keys guide: `API_KEYS_SETUP_GUIDE.md`
- All variables: `.env.example`

---

**Need help?** Check `/health` page after deployment for diagnostic information.
