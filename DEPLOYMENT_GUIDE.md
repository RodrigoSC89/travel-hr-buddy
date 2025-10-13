# 🚀 Deployment Guide - Nautilus One

Complete guide for deploying Nautilus One (Travel HR Buddy) to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- ✅ **Supabase Account** - [Create account](https://supabase.com)
- ✅ **Vercel Account** (recommended) or Netlify - [Create account](https://vercel.com)
- 🔐 **Sentry Account** (optional, for error tracking) - [Create account](https://sentry.io)

### Optional API Keys

- 🗺️ **Mapbox** - For interactive maps ([Get API key](https://mapbox.com))
- 🤖 **OpenAI** - For AI features ([Get API key](https://platform.openai.com))
- ✈️ **Amadeus** - For travel data ([Get API key](https://developers.amadeus.com))

---

## Environment Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Navigate to **SQL Editor** and run the database setup (see `supabase/` folder)

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

### Essential Variables (REQUIRED)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# App Configuration
VITE_APP_URL=https://your-domain.vercel.app
VITE_NODE_ENV=production
```

### Optional Variables

```bash
# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# OpenAI (AI Features)
VITE_OPENAI_API_KEY=sk-proj-...

# Mapbox (Maps)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Amadeus (Travel APIs)
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables from your `.env` file
6. Click **"Deploy"**

### Option 2: Netlify

#### Via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Via Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables
6. Click **"Deploy site"**

### Option 3: Self-Hosted

```bash
# Build for production
npm run build

# Upload dist/ folder to your web server
scp -r dist/* user@your-server:/var/www/html/

# Or use rsync
rsync -avz dist/ user@your-server:/var/www/html/
```

Configure your web server (Nginx example):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:

- ✅ Application loads
- ✅ No console errors
- ✅ Authentication works
- ✅ API integrations functioning

### 2. Configure Domain (Optional)

#### Vercel

1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed

#### Netlify

1. Go to **Site settings → Domain management**
2. Add custom domain
3. Configure DNS

### 3. Setup Monitoring

#### Sentry Integration

1. Create a Sentry project
2. Copy DSN
3. Add to environment variables:
   ```bash
   VITE_SENTRY_DSN=https://...@sentry.io/...
   ```
4. Redeploy

### 4. Enable HTTPS

Both Vercel and Netlify automatically provide SSL certificates.

For self-hosted, use Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Build Failures

#### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### "Out of memory"
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Runtime Errors

#### "Failed to fetch"
- Check CORS settings in Supabase
- Verify API URLs in environment variables
- Check network connectivity

#### "Unauthorized"
- Verify Supabase anon key is correct
- Check RLS policies in Supabase
- Ensure authentication is configured

### Performance Issues

#### Large bundle size
```bash
# Analyze bundle
npm run build -- --stats

# Consider code splitting for large components
```

#### Slow page load
- Enable CDN caching
- Optimize images
- Check API response times

---

## Security Checklist

Before going live:

- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] Sentry monitoring active
- [ ] Regular backups scheduled

---

## Maintenance

### Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring

- Check Vercel/Netlify analytics
- Review Sentry error reports
- Monitor Supabase usage
- Track API quota usage

---

## Support

- 📧 **Email**: [Your support email]
- 📚 **Documentation**: [Your docs URL]
- 🐛 **Issues**: [GitHub Issues](https://github.com/RodrigoSC89/travel-hr-buddy/issues)

---

**Last Updated**: 2025-10-13  
**Version**: 1.0.0  
**Platform**: Nautilus One (Travel HR Buddy)

🚢 **Ready to sail!**
