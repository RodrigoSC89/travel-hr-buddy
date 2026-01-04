# 📖 Nautilus One - Operations Runbook

**Version:** 3.2.0  
**Last Updated:** 2025-01-04  
**Owner:** [TEAM NAME]

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Monitoring](#monitoring)
5. [Incident Response](#incident-response)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Overview

### Description
Nautilus One is a Maritime HR Management System built with:
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** OpenAI GPT-4o + ElevenLabs TTS
- **Hosting:** Vercel / Lovable

### Key Modules (147 total)
- PEOTRAM 2024 - Regulatory compliance
- PEO-DP - Petrobras safety protocol
- SGSO - Safety management system
- Crew Management - Personnel tracking
- Document Management - Certificates & contracts

### Critical Endpoints
| Endpoint | Purpose | SLA |
|----------|---------|-----|
| `/api/health` | Health check | 99.9% |
| `/api/auth/*` | Authentication | 99.9% |
| `/api/crew/*` | Crew management | 99.5% |
| `/api/documents/*` | Document handling | 99.5% |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                             │
│  (Web Browser / PWA / iOS / Android via Capacitor)      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    CDN / VERCEL                          │
│              (Static Assets + SSR)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ PostgreSQL  │ │    Auth     │ │   Storage   │        │
│  │   (RLS)     │ │   (JWT)     │ │   (S3)      │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────────────────────────────────────┐        │
│  │          Edge Functions (Deno)              │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ OpenAI   │ │ElevenLabs│ │  Sentry  │ │ PostHog  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Environment Variables
```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_SENTRY_DSN=xxx

# Optional
VITE_POSTHOG_KEY=xxx
VITE_ELEVENLABS_API_KEY=xxx
```

### Deploy Commands
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

### Rollback Procedure
```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback [deployment-url]

# Expected time: < 2 minutes
```

---

## 📊 Monitoring

### Dashboards
| Service | URL | Purpose |
|---------|-----|---------|
| Sentry | sentry.io/nautilus | Error tracking |
| PostHog | posthog.com/nautilus | Analytics |
| BetterUptime | betteruptime.com/nautilus | Uptime |
| Supabase | supabase.com/dashboard | Database |

### Key Metrics
- **Uptime Target:** 99.5%
- **Error Rate Target:** < 1%
- **P95 Latency Target:** < 2s
- **LCP Target:** < 2.5s

### Alerts
| Alert | Threshold | Action |
|-------|-----------|--------|
| Error spike | > 10/min | Page on-call |
| Latency high | P95 > 5s | Investigate |
| Uptime down | < 99% | Immediate response |
| CPU high | > 90% | Scale up |

---

## 🚨 Incident Response

### Severity Levels
| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P0 | Critical | < 15 min | System down |
| P1 | High | < 1 hour | Major feature broken |
| P2 | Medium | < 4 hours | Minor feature issue |
| P3 | Low | < 24 hours | Cosmetic bug |

### Escalation Path
```
P0: On-call → DevOps Lead → CTO → CEO
P1: On-call → DevOps Lead
P2: On-call (next business day OK)
P3: Ticket queue
```

### Incident Template
```markdown
## Incident: [TITLE]
**Severity:** P[0-3]
**Started:** [TIME]
**Detected:** [TIME]
**Resolved:** [TIME]

### Impact
[Description of impact]

### Timeline
- HH:MM - Event
- HH:MM - Action taken
- HH:MM - Resolution

### Root Cause
[Analysis]

### Action Items
- [ ] Task 1
- [ ] Task 2
```

---

## 🔧 Common Tasks

### Database Backup
```sql
-- Manual backup via Supabase Dashboard
-- Settings > Database > Backups > Create backup
```

### Clear Cache
```bash
# CDN cache
vercel --force

# Browser cache
# Users: Ctrl+Shift+R
```

### Rotate Secrets
```bash
# 1. Generate new secret
# 2. Add to environment
vercel env add NEW_SECRET

# 3. Deploy
vercel --prod

# 4. Remove old secret
vercel env rm OLD_SECRET
```

### Scale Database
```
Supabase Dashboard > Settings > Upgrade Plan
```

---

## 🔍 Troubleshooting

### Common Issues

#### "500 Internal Server Error"
```bash
# 1. Check Sentry for error details
# 2. Check Supabase logs
# 3. Check Edge Function logs
supabase functions logs [function-name]
```

#### "Database connection failed"
```bash
# 1. Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# 2. Check connection pool
# Supabase Dashboard > Database > Connection pooling

# 3. Scale if needed
```

#### "Authentication failed"
```bash
# 1. Check JWT expiry
# 2. Verify Supabase Auth config
# 3. Check RLS policies
```

#### "Slow page load"
```bash
# 1. Run Lighthouse
lighthouse https://nautilus.app

# 2. Check bundle size
npm run build
du -sh dist

# 3. Check API latency
# PostHog > Web Analytics > Performance
```

---

## 📞 Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-call Primary | [NAME] | [PHONE] | [EMAIL] |
| On-call Backup | [NAME] | [PHONE] | [EMAIL] |
| DevOps Lead | [NAME] | [PHONE] | [EMAIL] |
| CTO | [NAME] | [PHONE] | [EMAIL] |

### External Support
- **Supabase:** support@supabase.io
- **Vercel:** support@vercel.com
- **Sentry:** support@sentry.io

---

*Last reviewed: 2025-01-04*
