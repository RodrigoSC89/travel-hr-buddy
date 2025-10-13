# 🔧 Vercel Deployment Troubleshooting

## Common Error: "Environment Variable references Secret which does not exist"

### Error Message
```
Deployment failed — Environment Variable "VITE_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

### Understanding the Error

This error occurs when you try to reference a Vercel secret using the `@secret_name` syntax, but the secret hasn't been created yet.

**Example of what causes this error:**
```
Variable name: VITE_SUPABASE_URL
Value: @supabase_url   ❌ This fails if secret "supabase_url" doesn't exist
```

### Solution Options

#### Option 1: Add Value Directly (Recommended for Most Cases)

Instead of using secrets, add the actual value directly in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings → Environment Variables**
3. Add variable directly with the actual value:
   ```
   Variable name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   ```
4. Click "Save"
5. Redeploy your project

**Pros:**
- ✅ Simple and straightforward
- ✅ No additional steps required
- ✅ Works immediately

**Cons:**
- ⚠️ Value is visible in Vercel dashboard (but still secure)

#### Option 2: Create Vercel Secrets (Advanced)

If you want to use the secret reference syntax, you must create the secrets first:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Create secrets:**
   ```bash
   vercel secrets add supabase_url "https://your-project.supabase.co"
   vercel secrets add supabase_key "your-supabase-anon-key"
   ```

4. **Reference secrets in Vercel dashboard:**
   ```
   Variable name: VITE_SUPABASE_URL
   Value: @supabase_url
   ```

5. **Redeploy**

**Pros:**
- ✅ Centralized secret management
- ✅ Can reuse secrets across multiple projects
- ✅ Secrets are encrypted and not visible in dashboard

**Cons:**
- ⚠️ Requires CLI setup
- ⚠️ Extra step to create secrets

### Which Option Should You Use?

**Use Option 1 (Direct Values) if:**
- You're just getting started
- You have a single project
- You want the simplest setup

**Use Option 2 (Secrets) if:**
- You manage multiple projects with the same keys
- You want centralized secret management
- Your team has strict security requirements

## Other Common Vercel Deployment Issues

### Issue: "VITE_SUPABASE_URL is undefined in browser"

**Cause:** Environment variable not set or missing `VITE_` prefix

**Solution:**
1. Ensure variable name starts with `VITE_` (required for Vite to expose it to the browser)
2. Add the variable in Vercel dashboard
3. Redeploy

### Issue: "404 Page Not Found on Direct URL"

**Cause:** Missing SPA rewrite configuration

**Solution:** Already fixed in `vercel.json`. If you still see this:
1. Verify `vercel.json` exists and has the rewrite rule
2. Clear Vercel cache: Settings → General → Clear Cache
3. Redeploy

### Issue: "Build fails with module not found"

**Cause:** Missing dependencies or cache issues

**Solution:**
1. Ensure all dependencies are in `package.json`
2. Clear Vercel build cache
3. Redeploy

### Issue: "Build timeout"

**Cause:** Build takes too long (free tier has 45-second limit)

**Solution:**
1. Upgrade to Vercel Pro for longer build time
2. Optimize your build process
3. Consider pre-building some assets

## Vercel Configuration Best Practices

### ✅ Do's

- ✅ Use `VITE_` prefix for frontend environment variables
- ✅ Set environment variables in Vercel dashboard before deploying
- ✅ Test your build locally first: `npm run build`
- ✅ Use the `/health` page to verify deployment
- ✅ Keep secrets out of your repository
- ✅ Use different values for preview vs production

### ❌ Don'ts

- ❌ Don't commit `.env` file to repository
- ❌ Don't use `@secret_name` syntax without creating the secret first
- ❌ Don't forget the `VITE_` prefix for frontend variables
- ❌ Don't hardcode secrets in your code
- ❌ Don't share API keys publicly

## Debugging Steps

### 1. Check Vercel Build Logs

1. Go to your project in Vercel
2. Click on the failed deployment
3. View the build logs
4. Look for the specific error message

### 2. Test Build Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Test production build
npm run preview
```

### 3. Verify Environment Variables

```bash
# Check what variables your app needs
cat .env.example

# Compare with what's in Vercel dashboard
```

### 4. Use Health Check

After deployment:
```
https://your-project.vercel.app/health
```

This shows:
- ✅ Which environment variables are loaded
- ❌ Which required variables are missing
- 🎁 Which optional variables are not set

## Getting Help

### Documentation Resources
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Complete deployment guide
- [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) - Quick start guide
- [API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md) - How to get API keys
- `.env.example` - List of all available variables

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Secrets](https://vercel.com/docs/cli/secrets)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Support Channels
- Vercel Support: https://vercel.com/support
- Project Issues: GitHub Issues
- Vercel Community: https://github.com/vercel/vercel/discussions

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0
