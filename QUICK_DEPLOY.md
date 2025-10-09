# 🚀 Quick Deployment Guide

## Prerequisites
- Node.js >= 22.0.0
- npm >= 8.0.0

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Configure Environment Variables
Go to your Vercel project settings and add these variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Step 2: Deploy
```bash
npm run deploy:vercel
```

Or push to your Git repository - Vercel will auto-deploy.

## Option 2: Deploy to Netlify

### Step 1: Configure Environment Variables
Go to Netlify Site Settings → Environment Variables and add the same variables as above.

### Step 2: Build and Deploy
```bash
npm run build
npm run deploy:netlify
```

## Option 3: Manual Deployment

### Step 1: Setup Environment
```bash
# Copy and edit environment variables
cp .env.example .env
nano .env  # Edit with your actual values
```

### Step 2: Build
```bash
npm install
npm run build
```

### Step 3: Deploy
Upload the `dist/` folder to your hosting provider.

## Verify Deployment

After deployment, test these URLs:
- `https://yourapp.com/` - Should load the home page
- `https://yourapp.com/analytics` - Should load analytics (SPA routing)
- `https://yourapp.com/settings` - Should load settings (SPA routing)

All routes should work without 404 errors thanks to the SPA routing configuration.

## Troubleshooting

### 404 on Routes
- Verify `vercel.json` or `_redirects` is properly deployed
- Check browser console for errors
- Ensure environment variables are set

### Build Fails
- Check Node.js version: `node --version` (must be >= 22)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check build logs for specific errors

### Environment Variables Not Working
- Ensure all variables start with `VITE_` prefix
- Restart the build after adding variables
- Check they're set in the hosting platform dashboard

## Support
See `DEPLOYMENT_CONFIG_REPORT.md` for detailed documentation.
