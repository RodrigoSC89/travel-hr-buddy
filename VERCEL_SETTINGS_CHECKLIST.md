# ✅ Vercel Project Settings Checklist

Quick reference for optimal Vercel project configuration for Nautilus One.

> 💡 **New to Vercel?** Start with [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for a visual 5-minute setup guide!

---

## 🏗️ Build Settings

Navigate to: **Project Settings → Builds**

### Build Configuration
- [x] **Build Command:** `npm run build` ✅ (Already configured in vercel.json)
- [x] **Output Directory:** `dist` ✅ (Already configured in vercel.json)
- [x] **Install Command:** `npm install` ✅ (Already configured in vercel.json)
- [x] **Framework Preset:** Vite ✅ (Already configured)
- [x] **Node.js Version:** 20.x ✅ (Configured in package.json)

### Advanced Build Settings
- [ ] **On-Demand Concurrent Builds:** ⚠️ Currently Disabled
  - **Recommendation:** Enable for faster development workflow
  - **Benefit:** Never wait for queued builds
  - **Note:** May require plan upgrade
  
- [ ] **Build Machine:** Currently Standard (4 vCPUs, 8 GB Memory)
  - **Current Status:** Adequate for most builds
  - **Consider Upgrade If:** Build time consistently > 2 minutes
  - **Options:** Enhanced (8 vCPUs) or Premium (16 vCPUs)

- [x] **Prioritize Production Builds:** ✅ Enabled
  - **Status:** Correctly configured
  - **Benefit:** Production deployments never queued

---

## ⚡ Runtime Settings

Navigate to: **Project Settings → Functions**

### Function Configuration
- [x] **Fluid Compute:** ✅ Enabled
  - **Status:** Optimized for automatic scaling
  - **Benefit:** Pay only for what you use

- [x] **Function CPU:** Standard (1 vCPU, 2 GB Memory)
  - **Current Status:** Sufficient for current workload
  - **Consider Upgrade If:** Heavy computation or data processing needed

### Cold Start Prevention
- [ ] **Cold Start Prevention:** ⚠️ Status Unknown
  - **Recommendation:** Enable for better performance
  - **Benefit:** Reduces first request latency
  - **Target:** User-facing API endpoints
  - **Trade-off:** Minimal cost increase for improved UX

---

## 🛡️ Deployment Protection

Navigate to: **Project Settings → Deployment Protection**

### Protection Settings
- [x] **Standard Protection:** ✅ Enabled
  - **Features:** Password protection for preview deployments
  - **Status:** Correctly configured

- [x] **Skew Protection:** ✅ Enabled (12 hours)
  - **Duration:** 12 hours (optimal for most use cases)
  - **Benefit:** Prevents version mismatch during rollouts
  - **Status:** Correctly configured

---

## 🌍 Environment Variables

Navigate to: **Project Settings → Environment Variables**

### Required Variables
- [ ] **VITE_SUPABASE_URL**
  - Environments: Production, Preview, Development
  - Type: Plain Text
  
- [ ] **VITE_SUPABASE_PUBLISHABLE_KEY**
  - Environments: Production, Preview, Development
  - Type: Secret (Encrypted)

### Optional Variables (for full features)
- [ ] **VITE_OPENAI_API_KEY** - AI chat features
- [ ] **VITE_AMADEUS_API_KEY** - Travel API integration
- [ ] **VITE_MAPBOX_TOKEN** - Maps functionality
- [ ] **VITE_MAPBOX_ACCESS_TOKEN** - Additional maps features
- [ ] **VITE_OPENWEATHER_API_KEY** - Weather integration
- [ ] **VITE_ELEVENLABS_API_KEY** - Voice features

**Best Practice:**
- Use different Supabase projects for Production vs Preview/Development
- Store all secrets as "Secret" type (encrypted)
- Review and rotate keys regularly

---

## 📊 Analytics & Monitoring

Navigate to: **Project Settings → Analytics**

### Web Analytics
- [ ] **Vercel Analytics:** Recommended to Enable
  - **Benefit:** Track Web Vitals and user behavior
  - **Cost:** Free tier available
  - **Metrics:** LCP, FID, CLS, TTFB

### Speed Insights
- [ ] **Speed Insights:** Recommended to Enable
  - **Benefit:** Real-time performance monitoring
  - **Target Scores:**
    - LCP (Largest Contentful Paint): < 2.5s
    - FID (First Input Delay): < 100ms
    - CLS (Cumulative Layout Shift): < 0.1

---

## 🔔 Notifications

Navigate to: **Project Settings → Notifications**

### Deployment Notifications
- [ ] **Email Notifications:** Configure as needed
  - Build failures
  - Deployment success
  - Domain configuration changes

### Integration Notifications
- [ ] **Slack Integration:** Optional
- [ ] **Discord Integration:** Optional
- [ ] **Webhook Integration:** For custom notifications

---

## 🔒 Security

Navigate to: **Project Settings → Security**

### Headers
- [x] **Security Headers:** ✅ Configured in vercel.json
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block

### SSL/TLS
- [x] **Automatic HTTPS:** ✅ Enabled by default
- [x] **Certificate:** ✅ Auto-managed by Vercel

---

## 🌐 Domains

Navigate to: **Project Settings → Domains**

### Production Domain
- [ ] **Custom Domain:** Configure if desired
  - Add your domain (e.g., nautilus.example.com)
  - Configure DNS records
  - SSL certificate auto-issued

### Preview Domains
- [x] **Automatic Preview URLs:** ✅ Enabled by default
  - Format: `project-git-branch-username.vercel.app`

---

## 💾 Cache Configuration

**Status:** ✅ Already configured in vercel.json

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Cache Strategy:**
- Assets: 1 year cache with immutable flag
- HTML: No cache (always fresh)

---

## 📈 Performance Targets

### Build Performance
- ✅ **Build Time:** Currently ~20 seconds (excellent)
- 🎯 **Target:** < 60 seconds
- ⚠️ **Alert If:** > 120 seconds

### Bundle Performance
- ✅ **Total Bundle:** ~1.1 MB gzipped (good)
- 🎯 **Target:** < 1.5 MB gzipped
- ✅ **Initial Load:** ~600 KB (acceptable)

### Runtime Performance
- 🎯 **TTFB (Time to First Byte):** < 600ms
- 🎯 **LCP (Largest Contentful Paint):** < 2.5s
- 🎯 **FID (First Input Delay):** < 100ms
- 🎯 **CLS (Cumulative Layout Shift):** < 0.1

---

## 🚨 Action Items

### High Priority (Do Now)
1. [ ] Verify all environment variables are set
2. [ ] Enable Cold Start Prevention
3. [ ] Set up Vercel Analytics
4. [ ] Configure deployment notifications

### Medium Priority (This Week)
1. [ ] Review and enable On-Demand Concurrent Builds (if available)
2. [ ] Set up performance monitoring alerts
3. [ ] Configure custom domain (if desired)
4. [ ] Review security headers

### Low Priority (This Month)
1. [ ] Evaluate Build Machine upgrade need
2. [ ] Implement advanced caching strategies
3. [ ] Set up integration notifications (Slack/Discord)
4. [ ] Review and optimize bundle size

---

## 📚 Reference Links

### Internal Documentation
- [VERCEL_OPTIMIZATION_GUIDE.md](./VERCEL_OPTIMIZATION_GUIDE.md) - Comprehensive optimization guide
- [VERCEL_DEPLOYMENT_READINESS.md](./VERCEL_DEPLOYMENT_READINESS.md) - Deployment readiness report
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Quick deployment guide

### Vercel Documentation
- [Build Configuration](https://vercel.com/docs/build-step)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Analytics](https://vercel.com/docs/analytics)

---

## ✅ Current Status Summary

### ✅ Configured Correctly (9/12)
- Build command and output directory
- Framework preset (Vite)
- Node.js version
- Prioritize Production Builds
- Fluid Compute
- Standard Protection
- Skew Protection
- Security headers
- SPA routing

### ⚠️ Needs Attention (3/12)
- On-Demand Concurrent Builds (disabled)
- Cold Start Prevention (status unknown)
- Vercel Analytics (not configured)

### 📊 Overall Score: 75% (Good)

**Recommendation:** Address the 3 items above to reach 100% optimization.

---

**Last Updated:** October 9, 2025  
**Review Frequency:** Monthly or after significant changes  
**Next Review:** November 9, 2025
