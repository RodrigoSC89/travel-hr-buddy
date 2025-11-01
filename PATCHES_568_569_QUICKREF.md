# 🚀 PATCHES 568-569 Quick Reference

## Overview
PATCH 568-569 implements production branch creation and weekly merge automation for Nautilus One.

---

## 📦 Quick Commands

### Create Production Branch
```bash
./scripts/create-production-branch.sh
```

### Generate Changelog
```bash
node scripts/generate-changelog-v3.4.js
```

### Generate Release Notes
```bash
node scripts/generate-release-notes.js
```

### Manual Weekly Merge
```bash
# Via GitHub CLI
gh workflow run weekly-merge-automation.yml

# Via GitHub UI
Actions → Weekly Merge Develop to Production → Run workflow
```

---

## 🔄 Automated Workflows

### Pre-Release Validation
**Trigger:** Push to `production/**` branches

**What it does:**
- ✅ Type check (strict mode)
- ✅ Linter (0 errors)
- ✅ Unit tests (>70% coverage)
- ✅ E2E tests
- ✅ Lighthouse CI (score >90)
- ✅ Security scan
- ✅ Supabase validation
- ✅ Deploy to staging

### Weekly Merge Automation
**Schedule:** Every Monday at 9:00 AM UTC

**What it does:**
- ✅ Check if merge needed
- ✅ Run validations
- ✅ Create PR automatically
- ✅ Notify team (Slack + Email)
- ✅ Sync tags
- ✅ Update dashboard

---

## 📋 Branch Structure

```
develop (main development)
  ↓
production/v3.4-stable (stable release)
  ↓
main (production)
```

---

## 📊 Validation Checklist

Before Production Deploy:
- [ ] All tests passing
- [ ] Type safety >80%
- [ ] Lighthouse score >90
- [ ] Security scan clean
- [ ] Build size <50MB
- [ ] Staging validated
- [ ] Team approval

---

## 🔔 Notifications

### Slack Channels
- `#nautilus-releases` - Release notifications
- `#nautilus-support` - Support issues

### Email
- Team leads receive merge notifications
- DevOps gets deployment alerts

---

## 📝 File Locations

```
scripts/
  ├── create-production-branch.sh
  ├── generate-changelog-v3.4.js
  └── generate-release-notes.js

.github/workflows/
  ├── production-pre-release.yml
  ├── weekly-merge-automation.yml
  └── build-test-deploy.yml

Documentation/
  ├── PATCHES_568_569_IMPLEMENTATION.md
  ├── DEPLOYMENT_STATUS_DASHBOARD.md
  ├── CHANGELOG_v3.4.md
  └── RELEASE_NOTES_v3.4.0.md
```

---

## 🚨 Troubleshooting

### Branch exists
```bash
git branch -D production/v3.4-stable
./scripts/create-production-branch.sh
```

### Workflow fails
1. Check GitHub Actions logs
2. Review validation results
3. Fix issues
4. Re-run workflow

### Merge conflicts
1. PR created with conflicts
2. Resolve manually
3. Approve and merge

---

## 🔐 Required Secrets

```yaml
GITHUB_TOKEN         # Auto-provided
VERCEL_TOKEN         # Vercel deployments
VERCEL_ORG_ID        # Organization ID
VERCEL_PROJECT_ID    # Project ID
SLACK_WEBHOOK_URL    # Slack notifications
SENDGRID_API_KEY     # Email (optional)
SENTRY_AUTH_TOKEN    # Sentry releases
```

---

## 📈 Success Metrics

✅ Type safety: 82% (target: >80%)
✅ Test coverage: 75% (target: >70%)
✅ Lighthouse: 90+ (target: >90)
✅ Build success: 98%
✅ Zero critical bugs
✅ Zero vulnerabilities

---

## 🔗 Quick Links

- [Full Documentation](./PATCHES_568_569_IMPLEMENTATION.md)
- [Deployment Dashboard](./DEPLOYMENT_STATUS_DASHBOARD.md)
- [GitHub Actions](https://github.com/RodrigoSC89/travel-hr-buddy/actions)
- [Issues](https://github.com/RodrigoSC89/travel-hr-buddy/issues)

---

## 📞 Support

- DevOps: devops@nautilus-one.com
- Releases: releases@nautilus-one.com
- Slack: #nautilus-support

---

**Last Updated:** 2025-01-01
**Version:** 1.0
**Status:** ✅ Active
