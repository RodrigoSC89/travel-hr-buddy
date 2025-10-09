# 🏥 Health Check Guide

## Overview

The Nautilus One system includes a comprehensive health check page to help diagnose environment variable issues and verify the system is running correctly.

## Accessing the Health Check Page

### Local Development
```
http://localhost:8080/health
```

### Production (Vercel)
```
https://your-deployment-url.vercel.app/health
```

## What It Shows

The health check page displays:

### ✅ System Status
- **Overall Status**: Whether all required environment variables are loaded
- **Build Time**: Current date/time when the page was loaded
- **Environment**: Current environment mode (development/production)
- **Vite Version**: 5.4.19
- **React Version**: 18.3.1

### 🔑 Required Configuration
These variables **must** be set for the system to function:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anonymous/public key

### 🎁 Optional Configuration
These variables enable enhanced features but are not required:
- `VITE_MAPBOX_TOKEN` - Mapbox maps integration
- `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox API access
- `VITE_OPENAI_API_KEY` - AI chat and analysis features
- `VITE_OPENWEATHER_API_KEY` - Weather data integration

## Interpreting Results

### ✅ System is Running (Green)
All required environment variables are loaded. The system should work correctly.

### ❌ System has Issues (Red)
One or more required environment variables are missing. Follow the configuration instructions to fix.

## Configuration Instructions

If you see missing required variables:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   nano .env
   # or use your preferred editor
   ```

3. **Add your API keys:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here
   # ... other keys
   ```

4. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Vercel
1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables"
3. Add all required variables (same names as in .env)
4. Redeploy the application

### Other Platforms
Follow your platform's documentation for setting environment variables. All variables should use the same names as defined in `.env.example`.

## Troubleshooting

### Environment variables not taking effect?
1. Restart the development server after changing `.env`
2. Clear build cache: `rm -rf dist node_modules/.vite`
3. Rebuild: `npm run build`
4. For production: Redeploy after changing environment variables

### App not loading?
1. Check the health page first: `/health`
2. Open browser console to see any errors
3. Verify all required variables are set
4. Check that `.env` file exists in the project root

### API errors?
1. Verify API keys are valid on their respective platforms
2. Check that keys have necessary permissions
3. Ensure URLs don't have trailing slashes
4. Check rate limits on your API dashboards

## Files Involved

- **Health Check Page**: `/src/pages/Health.tsx`
- **Environment Variables**: `/.env` (not committed to Git)
- **Environment Template**: `/.env.example` (committed to Git)
- **Route Configuration**: `/src/App.tsx` (line with `/health` route)

## See Also

- [API Keys Setup Guide](./API_KEYS_SETUP_GUIDE.md) - Detailed API key configuration
- [README.md](./README.md) - General project documentation
- [.env.example](./.env.example) - All available environment variables
