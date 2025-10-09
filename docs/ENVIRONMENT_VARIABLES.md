# Environment Variables Configuration Guide

## Overview

This application supports flexible environment variable naming conventions for Supabase authentication and database configuration. This allows compatibility with different frameworks and deployment platforms.

## Supported Naming Conventions

The application checks environment variables in the following priority order:

### 1. VITE_ Prefix (Recommended for Vite Projects) ⭐
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Use this when:**
- Deploying to Vercel
- Deploying to Netlify
- Using Vite for local development

### 2. NEXT_PUBLIC_ Prefix (Next.js Compatibility)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Use this when:**
- Migrating from Next.js
- Working with teams that use Next.js conventions
- Deploying to platforms that expect NEXT_PUBLIC_ prefix

### 3. Plain Names (Alternative)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Use this when:**
- Working with environment variable systems that don't support prefixes
- Simplifying configuration
- Using generic deployment scripts

## Priority Resolution

The application checks variables in this order:
1. `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`

**Example:** If both `VITE_SUPABASE_URL` and `SUPABASE_URL` are defined, `VITE_SUPABASE_URL` will be used.

## Configuration Examples

### Example 1: Standard Vite Setup
```env
# .env
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=vnbptmixvwropvanyhdb
```

### Example 2: Next.js Style Setup
```env
# .env
NEXT_PUBLIC_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 3: Simple Setup
```env
# .env
SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 4: Mixed Setup (Priority in Action)
```env
# .env
VITE_SUPABASE_URL=https://production.supabase.co  # ← This will be used
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
SUPABASE_URL=https://dev.supabase.co

VITE_SUPABASE_ANON_KEY=production-key  # ← This will be used
SUPABASE_ANON_KEY=dev-key
```

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Choose your naming convention** and edit `.env` with your actual values:
   ```bash
   nano .env
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

## Deployment Platforms

### Vercel
In your Vercel project settings, add:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Netlify
In Netlify Site Settings → Environment Variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Docker
In your `docker-compose.yml` or Dockerfile:
```yaml
environment:
  - VITE_SUPABASE_URL=your-supabase-url
  - VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Generic Platforms
If your platform doesn't support the `VITE_` prefix, use plain names:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Issue: "Cannot connect to Supabase"
**Solution:** Check that your environment variables are set correctly:
```bash
# In development
echo $VITE_SUPABASE_URL

# In production (check your platform's dashboard)
```

### Issue: "Wrong database being used"
**Solution:** Check variable priority. If you have multiple variables set, the one with highest priority (VITE_ prefix) will be used.

### Issue: "Environment variables not loading"
**Solution:**
1. Restart your dev server after changing `.env`
2. Clear your browser cache
3. Verify the variable names match exactly (case-sensitive)
4. Ensure `.env` file is in the project root

## Security Best Practices

1. ✅ **Never commit** `.env` to version control
2. ✅ **Use** `.env.example` for templates (with dummy values)
3. ✅ **Rotate keys** regularly in production
4. ✅ **Use different keys** for development, staging, and production
5. ✅ **Enable Row Level Security** (RLS) in Supabase

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Deployment Guide](../QUICK_DEPLOY.md)
- [Configuration Report](../DEPLOYMENT_CONFIG_REPORT.md)
