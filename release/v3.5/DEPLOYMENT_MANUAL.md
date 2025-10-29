# Travel HR Buddy - Deployment Manual v3.5

## 🚀 Deployment Guide

### Prerequisites

#### Required Software
- Node.js 20.x or higher
- npm 8.x or higher
- Git
- PostgreSQL 14+ (or Supabase account)

#### Required Accounts
- Supabase account (for database and auth)
- Vercel/Netlify account (for hosting)
- OpenAI API key (for AI features)

### Environment Setup

#### 1. Clone Repository
```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create `.env.production` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=Travel HR Buddy

# OpenAI (optional)
VITE_OPENAI_API_KEY=your-openai-key

# Sentry (optional)
VITE_SENTRY_DSN=your-sentry-dsn
```

### Build Process

#### Development Build
```bash
npm run build:dev
```

#### Production Build
```bash
npm run build
```

#### Verify Build
```bash
npm run verify:postbuild
```

### Database Setup

#### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Note down project URL and anon key

#### 2. Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### 3. Setup Row Level Security
All RLS policies are included in migrations.
Verify with:
```sql
SELECT * FROM pg_policies;
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: Docker
```bash
# Build image
docker build -t travel-hr-buddy .

# Run container
docker run -p 3000:3000 travel-hr-buddy
```

### Post-Deployment Verification

#### 1. Health Check
```bash
curl https://your-domain.com/health
```

#### 2. Run Smoke Tests
```bash
npm run test:e2e
```

#### 3. Check Monitoring
- Verify Sentry is receiving events
- Check application logs
- Monitor performance metrics

### Rollback Procedure

#### Vercel Rollback
```bash
vercel rollback
```

#### Netlify Rollback
From Netlify dashboard:
1. Go to Deploys
2. Select previous deploy
3. Click "Publish deploy"

#### Database Rollback
```bash
supabase db reset
supabase db push --version <previous-version>
```

### Monitoring & Maintenance

#### Performance Monitoring
- Use built-in performance dashboard
- Monitor Web Vitals
- Check error rates in Sentry

#### Database Maintenance
- Regular backups (automated by Supabase)
- Monitor query performance
- Review slow query log

#### Security Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Rebuild and test
npm run build && npm test
```

### Troubleshooting

#### Build Fails
1. Clear cache: `npm run clean`
2. Reinstall: `rm -rf node_modules && npm install`
3. Check Node version: `node --version`

#### Database Connection Issues
1. Verify environment variables
2. Check Supabase project status
3. Verify network connectivity

#### Performance Issues
1. Check CDN cache
2. Review bundle size: `npm run build -- --stats`
3. Enable performance monitoring

### Support Contacts

- **Technical Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **Emergency**: [Contact Info]

---
**Document Version**: v3.5
**Last Updated**: 2025-10-29
**Status**: Production Ready ✅
