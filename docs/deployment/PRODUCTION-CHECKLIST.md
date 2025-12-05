# ✅ Production Checklist

## Pre-Deployment

### Code Quality

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed and approved

### Security

- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] RLS policies verified
- [ ] Security headers configured
- [ ] Input validation in place

### Performance

- [ ] Bundle size optimized (< 200KB initial)
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Caching configured

### Configuration

- [ ] Production environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] DNS configured (if custom domain)

## Deployment

### Build

```bash
# Build production bundle
npm run build

# Verify build
npm run preview
```

### Deploy Steps

1. [ ] Merge to main branch
2. [ ] CI/CD pipeline passes
3. [ ] Auto-deploy triggers
4. [ ] Verify deployment URL

## Post-Deployment

### Verification

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Core features functional
- [ ] No console errors
- [ ] Mobile responsive

### Monitoring

- [ ] Error tracking active (Sentry)
- [ ] Analytics configured
- [ ] Database monitoring enabled
- [ ] Uptime monitoring set

### Documentation

- [ ] Release notes updated
- [ ] Changelog updated
- [ ] Team notified

## Rollback Plan

If issues arise:

1. **Lovable**: Use version history to restore
2. **Vercel**: `vercel rollback`
3. **Database**: Restore from backup

## Emergency Contacts

- **On-call Engineer**: [contact]
- **DevOps**: [contact]
- **Security**: security@nautilus.app

## Sign-off

| Role | Name | Date |
|------|------|------|
| Developer | | |
| QA | | |
| DevOps | | |
| Product | | |
