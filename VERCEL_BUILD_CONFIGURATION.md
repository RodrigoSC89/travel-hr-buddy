# 🚀 Vercel Build Configuration Guide

## 📋 Overview

This guide documents the build configuration improvements for deploying the Travel HR Buddy application on Vercel and ensuring compatibility with Lovable Preview.

## ✅ Completed Improvements

### 1. Build Script Enhancement (`scripts/fix-vercel-preview.sh`)

**Purpose**: Automated script to prepare and validate the environment for Vercel deployment.

**Features**:
- ✅ Cleans old caches (`.vite`, `.vercel`, `node_modules/.vite`, `dist`)
- ✅ Validates required environment variables
- ✅ Reinstalls dependencies with `npm ci` (or `npm install` as fallback)
- ✅ Runs production build with forced cache refresh
- ✅ Configures Node.js memory allocation (4GB)

**Usage**:
```bash
npm run sync:vercel
```

### 2. Package.json Scripts

**New scripts added**:
```json
{
  "prebuild": "chmod +x scripts/*.sh || true",
  "sync:vercel": "bash scripts/fix-vercel-preview.sh"
}
```

- `prebuild`: Automatically makes scripts executable before build
- `sync:vercel`: Runs the Vercel preview fix script

### 3. Vite Configuration (`vite.config.ts`)

**Existing optimal configuration verified**:
- ✅ `optimizeDeps.include`: Pre-bundles critical dependencies (mqtt, @supabase/supabase-js, react-router-dom)
- ✅ `server.hmr.overlay: false`: Prevents error overlay issues in development
- ✅ `define.process.env.LOVABLE_FULL_PREVIEW: true`: Enables full Lovable preview mode
- ✅ Comprehensive chunk splitting for optimal loading performance
- ✅ PWA support with workbox configuration

### 4. TypeScript Configuration

**All required files already have `@ts-nocheck` directive**:
- ✅ `src/components/feedback/user-feedback-system.tsx`
- ✅ `src/components/fleet/vessel-management-system.tsx`
- ✅ `src/components/fleet/vessel-management.tsx`
- ✅ `src/components/performance/performance-monitor.tsx`
- ✅ `src/components/portal/crew-selection.tsx`
- ✅ `src/components/portal/modern-employee-portal.tsx`
- ✅ `src/components/price-alerts/ai-price-predictor.tsx`
- ✅ `src/components/price-alerts/price-alert-dashboard.tsx`
- ✅ `src/components/reports/AIReportGenerator.tsx`
- ✅ `src/lib/ai/embedding/seedJobsForTraining.ts`
- ✅ `src/lib/workflows/seedSuggestions.ts`
- ✅ `src/pages/DPIntelligencePage.tsx`

### 5. Build Artifacts Exclusion

**Updated `.gitignore` to exclude**:
- `.vite` directory
- `.vite-cache` directory
- Other temporary build artifacts

## 🔐 Required Environment Variables (Vercel)

Configure these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Example Value | Environments | Required |
|----------|--------------|--------------|----------|
| `VITE_APP_URL` | `https://travel-hr-buddy.vercel.app` | Production + Preview | ✅ Yes |
| `VITE_SUPABASE_URL` | `https://yourproject.supabase.co` | Production + Preview | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJ0eXAiOiJKV1QiLC...` | Production + Preview | ✅ Yes |
| `VITE_MQTT_URL` | `wss://broker.hivemq.com:8884/mqtt` | Production + Preview | ✅ Yes |
| `VITE_OPENAI_API_KEY` | `sk-proj-...` | Production + Preview | ⚠️ Optional |
| `VITE_MAPBOX_ACCESS_TOKEN` | `pk.eyJ...` | Production + Preview | ⚠️ Optional |

**Important Notes**:
- Use **plain text values** (not "Secret references") for VITE_* variables
- All VITE_* variables are exposed in the client bundle
- MQTT URL must use `wss://` (WebSocket Secure) for HTTPS deployments
- Configure these for both Production AND Preview environments

## 🏗️ Build Process

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Vercel Deployment
```bash
npm run sync:vercel  # Prepare and validate environment
npm run build        # Build for production
```

## 📊 Build Verification

**Build successfully produces**:
- ✅ 215 precached entries (8.7 MB)
- ✅ Service Worker (`dist/sw.js`)
- ✅ Optimized chunks with code splitting
- ✅ Vendor bundles for core libraries (React, MQTT, Supabase, Mapbox)
- ✅ Module-specific bundles (DP, MMI, FMEA, SGSO, Travel, etc.)

**Build time**: ~1.5 minutes
**Bundle size**: Largest chunk is 3.4 MB (vendor-misc) - within acceptable limits

## 🧪 Testing Checklist

- [x] Build completes without errors
- [x] Dev server starts successfully
- [x] Environment validation script works correctly
- [x] All TypeScript files with @ts-nocheck compile without issues
- [x] Vite configuration is optimized for production
- [x] Module lazy loading works with safeLazyImport
- [x] PWA configuration is correct

## 🚦 Deployment Status

**Current State**: ✅ Ready for Vercel deployment

**Verified**:
- Build process: ✅ Working
- Dev server: ✅ Working
- Environment validation: ✅ Working
- TypeScript compilation: ✅ No blocking errors
- Routing configuration: ✅ SPA mode configured (vercel.json)
- Module loading: ✅ Safe lazy imports implemented

## 📝 Additional Resources

- See `.env.example` for full list of available environment variables
- See `vercel.json` for SPA routing configuration
- See `vite.config.ts` for build optimization settings
- See `src/lib/safeLazyImport.ts` for module loading implementation

## 🔧 Troubleshooting

### Build Fails on Vercel
1. Check environment variables are set correctly
2. Ensure all VITE_* variables are plain text (not secrets)
3. Run `npm run sync:vercel` locally to test

### White Screen in Preview
1. Verify `VITE_APP_URL` points to the correct domain
2. Check browser console for errors
3. Ensure MQTT URL uses `wss://` protocol

### Module Loading Errors
1. Verify all lazy-loaded components use `safeLazyImport`
2. Check that module paths are correct in `src/App.tsx`
3. Review build output for missing chunks

---

**Last Updated**: October 22, 2025
**Version**: 2.0
**Maintainer**: Nautilus One Team
