# ✅ Production Deployment Checklist

Use this checklist before deploying Nautilus One to production.

## Pre-Deployment

### 1. Code Quality
- [x] Build passes: `npm run build`
- [x] Linting complete: `npm run lint` (only non-critical warnings remain)
- [x] Code formatted: `npm run format:check`
- [x] TypeScript compiles: `npx tsc --noEmit`

### 2. Environment Configuration
- [ ] `.env` file configured with production values
- [ ] All required API keys present:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_OPENAI_API_KEY`
  - [ ] `VITE_MAPBOX_ACCESS_TOKEN`
  - [ ] Other service keys as needed
- [ ] Production URLs configured
- [ ] Feature flags set correctly

### 3. Database & Backend
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] RLS (Row Level Security) policies enabled
- [ ] Edge functions deployed
- [ ] Storage buckets configured
- [ ] Backup strategy in place

### 4. Security
- [ ] No sensitive data in code
- [ ] API keys properly configured
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] SSL/TLS certificate active

### 5. Performance
- [x] Code splitting implemented
- [x] Lazy loading configured
- [x] Images optimized
- [x] Bundle size acceptable (~4.1MB)
- [ ] CDN configured (if applicable)
- [ ] Caching strategy defined

### 6. Monitoring & Logging
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Analytics integrated (if required)
- [ ] Performance monitoring active
- [ ] Log aggregation setup
- [ ] Uptime monitoring configured

## Deployment

### 7. Build & Test
```bash
# Clean build
rm -rf node_modules dist .next
npm install
npm run build

# Test production build locally
npm run preview
```

### 8. Deploy
Choose your deployment method:

#### Vercel
```bash
npm run deploy:vercel
```

#### Netlify
```bash
npm run deploy:netlify
```

#### Manual
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Post-Deployment

### 9. Verification
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database connections successful
- [ ] API integrations functioning
- [ ] Maps and external services working
- [ ] All modules accessible
- [ ] No console errors in browser

### 10. Performance Check
- [ ] Lighthouse score acceptable
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Page load time acceptable

### 11. Functionality Test
- [ ] Login/Authentication
- [ ] Dashboard loads
- [ ] Navigation works
- [ ] Data fetching successful
- [ ] Forms submit correctly
- [ ] File uploads work
- [ ] Real-time features active
- [ ] Mobile responsive

### 12. Monitoring Setup
- [ ] Error tracking active
- [ ] Alerts configured
- [ ] Backup verification
- [ ] Rollback plan ready
- [ ] Team notified

## Emergency Rollback

If issues occur:

### Vercel
```bash
# Rollback to previous deployment in Vercel dashboard
# or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

### Manual
```bash
# Restore previous dist/ folder
# or rebuild from previous commit
git checkout <previous-commit>
npm run build
# Redeploy dist/ folder
```

## Documentation

- [x] README.md updated
- [x] CHANGELOG.md updated
- [x] API documentation current
- [x] Deployment guide available
- [ ] Team trained on new features

## Support

- [ ] Support channels ready
- [ ] On-call schedule defined
- [ ] Escalation path clear
- [ ] Documentation accessible

---

## Quick Command Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Deploy
npm run deploy:vercel    # Vercel
npm run deploy:netlify   # Netlify

# Code quality
npm run lint
npm run format
npm run test
```

---

**Deployment Approved By**: _________________  
**Date**: _________________  
**Version**: 1.0.0  
**Environment**: Production

---

*Complete this checklist before each production deployment*
