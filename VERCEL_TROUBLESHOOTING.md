# 🔧 Vercel Deployment Troubleshooting Guide

This guide addresses common Vercel deployment errors and best practices for the Travel HR Buddy / Nautilus One application.

---

## ✅ Current Configuration Status

The `vercel.json` configuration has been optimized with:

- ✅ Schema reference for IDE support
- ✅ Enhanced security headers (Referrer-Policy, Permissions-Policy)
- ✅ Optimized caching for assets and images
- ✅ Proper SPA routing configuration
- ✅ No secret references (uses direct environment variables)

---

## 🚨 Common Errors and Solutions

### 1. Environment Variable References Secret Error

**Error:**
```
Environment Variable "VITE_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

**Cause:**
Using Vercel's secret reference syntax (`@secret_name`) without creating secrets via Vercel CLI.

**Solution:**
Use direct environment variable values in the Vercel dashboard instead of secret references.

#### ✅ Correct Approach (Recommended)
In Vercel Dashboard → Project Settings → Environment Variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = your-key-here
```

#### ❌ Avoid This (Requires CLI Setup)
```
VITE_SUPABASE_URL = @supabase_url
```

**Why Direct Values?**
- ✅ Simpler setup (no CLI required)
- ✅ Faster deployment
- ✅ More transparent
- ✅ Industry standard for most Vercel deployments
- ✅ Easier to troubleshoot

---

### 2. Invalid Route Source Pattern

**Error:**
```
Invalid route source pattern
The source property follows the syntax from path-to-regexp, not the RegExp syntax.
```

**Cause:**
Using RegExp syntax (like negative lookaheads) without proper grouping.

**❌ Before (Wrong):**
```json
{
  "source": "/feedback/(?!general)",
  "destination": "/api/feedback/general"
}
```

**✅ After (Correct):**
```json
{
  "source": "/feedback/((?!general).*)",
  "destination": "/api/feedback/general"
}
```

**Note:** Our current `vercel.json` uses simple rewrites for SPA routing, avoiding this issue entirely.

---

### 3. Invalid Route Destination Segment

**Error:**
```
Invalid route destination segment
A named segment parameter defined in the destination property must also be defined in the source property.
```

**❌ Before (Wrong):**
```json
{
  "source": "/feedback/:type",
  "destination": "/api/feedback/:id"
}
```

**✅ After (Correct):**
```json
{
  "source": "/feedback/:id",
  "destination": "/api/feedback/:id"
}
```

**Note:** Our SPA configuration doesn't use named parameters, avoiding this issue.

---

### 4. Mixed Routing Properties

**Error:**
```
If you have rewrites, redirects, headers, cleanUrls or trailingSlash defined in your configuration file, then routes cannot be defined.
```

**Solution:**
Never mix `routes` with `rewrites`, `redirects`, or `headers`. Use the newer properties instead.

**✅ Our Configuration:**
We use `rewrites` and `headers`, which are the modern, recommended approach.

---

### 5. Conflicting Configuration Files

**Errors:**
- Both `vercel.json` and `now.json` exist
- Both `.vercel` and `.now` directories exist
- Both `.vercelignore` and `.nowignore` exist

**Solution:**
Keep only the `vercel.*` versions, delete the `now.*` legacy files:
```bash
# Delete legacy files if they exist
rm -f now.json
rm -rf .now
rm -f .nowignore
```

---

### 6. Conflicting Functions and Builds Configuration

**Error:**
```
Conflicting functions and builds configuration
```

**Solution:**
Use only `functions` OR `builds`, never both. We recommend `functions` for:
- Memory configuration support
- Specific npm package versions
- Clean URLs by default

**Note:** Our application doesn't use Vercel Functions yet, only static builds.

---

### 7. Deploying Functions to Multiple Regions

**Error:**
```
If a CLI Deployment defines the --regions option, the Vercel Function Region setting is ignored.
```

**Note:**
- Multiple regions is only available to Enterprise teams
- Pro plan: Limitation applied July 10, 2020
- This doesn't affect our current static site deployment

---

### 8. Unmatched Function Pattern

**Error:**
```
Unmatched function pattern
The functions property uses a glob pattern for each key.
```

**❌ Not Allowed:**
```json
{
  "functions": {
    "users/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

**✅ Allowed:**
```json
{
  "functions": {
    "api/users/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

**Note:** Functions must match files in the `api` directory (or `pages/api` for Next.js).

---

### 9. Build Failures

**Error:**
```
Failed to install builder dependencies
```

**Common Causes:**
1. npm not available (Vercel provides this)
2. Internet connection issues (Vercel infrastructure)
3. Invalid Builder package name

**Solution:**
Verify your `vercel.json` build configuration:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

---

### 10. Git Default Ignore List Warning

**Warning:**
```
Several files ignored for security and performance reasons
```

**Solution:**
Deployments via Git use `.gitignore`. If you accidentally committed sensitive files:

```bash
# Remove the file
git rm file.txt

# Add to .gitignore
echo 'file.txt' >> .gitignore

# Stage and commit
git add .gitignore
git commit -m "Removed sensitive file"
git push
```

---

## 🔐 Security Best Practices

### Environment Variables

**✅ Do:**
- Add environment variables in Vercel Dashboard
- Use different values for Preview and Production
- Keep secrets out of code and git
- Use `.env.example` as template

**❌ Don't:**
- Commit `.env` files to git
- Use secret references without CLI setup
- Hardcode API keys in code
- Mix environment variable formats

### Security Headers

Our `vercel.json` includes enhanced security headers:

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] All required environment variables set in Vercel Dashboard
- [ ] Build succeeds locally (`npm run build`)
- [ ] No secrets in code or git history
- [ ] `.env.example` is up to date
- [ ] No conflicting configuration files (`.now*`, etc.)

### Environment Variables Required

**Production & Preview:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

**Optional (for full features):**
```
VITE_MAPBOX_TOKEN
VITE_OPENAI_API_KEY
VITE_OPENWEATHER_API_KEY
VITE_SENTRY_DSN
```

### After Deploying

- [ ] Visit `/health` endpoint to verify configuration
- [ ] Check Vercel deployment logs for warnings
- [ ] Test main application features
- [ ] Verify environment variables are loaded

---

## 🎯 Quick Deployment Steps

### Option 1: Dashboard Deployment (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Vite framework

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add required variables (see list above)
   - Set for both Production and Preview

3. **Deploy**
   - Click "Deploy"
   - Wait ~45 seconds for build
   - Build time: ~42 seconds

4. **Verify**
   - Visit `https://your-project.vercel.app/health`
   - Check that all required variables are loaded

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📊 Monitoring Deployments

### Check Deployment Status

1. **Vercel Dashboard**
   - View deployment logs
   - Check build output
   - Monitor deployment duration

2. **Health Check**
   - Visit `/health` endpoint
   - Verify all required env vars loaded
   - Check system status

3. **Application Logs**
   - Vercel Dashboard → Project → Logs
   - Filter by deployment
   - Look for runtime errors

---

## 🔍 Debugging Failed Deployments

### Build Failed

1. Check build logs in Vercel Dashboard
2. Look for TypeScript errors
3. Verify dependencies are in `package.json`
4. Check Node version compatibility (requires 22.x)

### Deployment Succeeded but App Broken

1. Visit `/health` to check environment variables
2. Check browser console for errors
3. Verify API endpoint connectivity
4. Check Vercel function logs (if using functions)

### Environment Variables Not Loading

1. Verify variables are set in Vercel Dashboard
2. Check variable names match exactly (case-sensitive)
3. Verify variables are set for correct environment
4. Redeploy after adding variables

---

## 📚 Additional Resources

- [Vercel Configuration Docs](https://vercel.com/docs/configuration)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Build Configuration](https://vercel.com/docs/build-configuration)
- [path-to-regexp Syntax](https://github.com/pillarjs/path-to-regexp)

---

## 🆘 Getting Help

### If You're Still Stuck

1. **Check the Health Page**
   - Visit `/health` to diagnose configuration issues

2. **Review Deployment Logs**
   - Vercel Dashboard → Deployments → [Your Deployment] → Build Logs

3. **Verify Configuration**
   - Compare your setup with this guide
   - Check `vercel.json` syntax

4. **Contact Support**
   - [Vercel Support](https://vercel.com/support)
   - GitHub Issues for this project

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Build completes in ~42 seconds
- ✅ `/health` endpoint shows "System is Running"
- ✅ All required environment variables are loaded
- ✅ Application loads without console errors
- ✅ API calls work correctly

---

**Last Updated:** 2025-10-13
**Configuration Version:** vercel.json v1.1
