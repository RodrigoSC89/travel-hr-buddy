# 🔧 Staging Environment Configuration

**Document:** Staging Environment Setup  
**Version:** v3.2.0  
**Status:** Ready for Configuration  

---

## Overview

This document describes the staging environment configuration with anonymized data for final testing before the soft launch with 50 beta users.

---

## Environment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENTS                                  │
├─────────────────┬─────────────────────┬────────────────────────┤
│   DEVELOPMENT   │      STAGING        │      PRODUCTION        │
├─────────────────┼─────────────────────┼────────────────────────┤
│ Local machines  │ Pre-prod testing    │ Live users             │
│ Mock data       │ Anonymized data     │ Real data              │
│ No RLS          │ Full RLS            │ Full RLS               │
│ Debug mode      │ Production config   │ Production config      │
└─────────────────┴─────────────────────┴────────────────────────┘
```

---

## Staging Supabase Project

### Option 1: Separate Supabase Project (Recommended)

Create a new Supabase project for staging:

1. **Project Name:** `nautilus-staging`
2. **Region:** Same as production (for latency parity)
3. **Plan:** Free tier (sufficient for testing)

### Configuration

```bash
# Environment variables for staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_ENVIRONMENT=staging
```

---

## Data Anonymization

### SQL Script for Anonymized Data

```sql
-- ============================================
-- STAGING DATA ANONYMIZATION SCRIPT
-- Run this in staging Supabase SQL Editor
-- ============================================

-- 1. Create anonymized profiles
INSERT INTO profiles (id, full_name, email, role, avatar_url, created_at)
SELECT 
  gen_random_uuid(),
  'User ' || generate_series || ' ' || (ARRAY['Silva', 'Santos', 'Oliveira', 'Costa', 'Pereira'])[1 + floor(random() * 5)::int],
  'user' || generate_series || '@staging.nautilus.app',
  (ARRAY['crew', 'officer', 'captain', 'hr_manager', 'admin'])[1 + floor(random() * 5)::int],
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || generate_series,
  NOW() - (random() * interval '365 days')
FROM generate_series(1, 100);

-- 2. Create sample vessels
INSERT INTO vessels (id, name, imo_number, vessel_type, flag_state, gross_tonnage)
VALUES
  (gen_random_uuid(), 'MV Staging Alpha', 'IMO9999001', 'cargo', 'Panama', 45000),
  (gen_random_uuid(), 'MV Staging Beta', 'IMO9999002', 'tanker', 'Liberia', 62000),
  (gen_random_uuid(), 'MV Staging Gamma', 'IMO9999003', 'container', 'Marshall Islands', 78000),
  (gen_random_uuid(), 'MV Staging Delta', 'IMO9999004', 'bulk_carrier', 'Singapore', 55000),
  (gen_random_uuid(), 'MV Staging Epsilon', 'IMO9999005', 'offshore', 'Brazil', 12000);

-- 3. Create sample crew members
INSERT INTO crew_members (id, vessel_id, profile_id, rank, department, embarkation_date)
SELECT
  gen_random_uuid(),
  (SELECT id FROM vessels ORDER BY random() LIMIT 1),
  p.id,
  (ARRAY['Captain', 'Chief Officer', 'Second Officer', 'Third Officer', 'Bosun', 'AB Seaman', 'Chief Engineer', 'Second Engineer', 'Oiler', 'Cook'])[1 + floor(random() * 10)::int],
  (ARRAY['Deck', 'Engine', 'Catering', 'Safety'])[1 + floor(random() * 4)::int],
  NOW() - (random() * interval '180 days')
FROM profiles p
LIMIT 50;

-- 4. Create sample audits
INSERT INTO audits (id, vessel_id, audit_type, status, scheduled_date, completed_date, score)
SELECT
  gen_random_uuid(),
  (SELECT id FROM vessels ORDER BY random() LIMIT 1),
  (ARRAY['PEOTRAM', 'PEO-DP', 'SGSO', 'MLC', 'ISPS', 'ISM'])[1 + floor(random() * 6)::int],
  (ARRAY['scheduled', 'in_progress', 'completed', 'pending_review'])[1 + floor(random() * 4)::int],
  NOW() + (random() * interval '90 days'),
  CASE WHEN random() > 0.5 THEN NOW() - (random() * interval '30 days') ELSE NULL END,
  CASE WHEN random() > 0.5 THEN 70 + floor(random() * 30)::int ELSE NULL END
FROM generate_series(1, 50);

-- 5. Create sample evidence entries
INSERT INTO evidence (id, audit_id, element_id, file_url, status, uploaded_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM audits ORDER BY random() LIMIT 1),
  'ELEM-' || floor(random() * 100)::text,
  'https://staging-storage.nautilus.app/evidence/' || gen_random_uuid() || '.pdf',
  (ARRAY['pending', 'approved', 'rejected', 'needs_review'])[1 + floor(random() * 4)::int],
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 200);

-- 6. Create sample sensor readings (for predictive maintenance)
INSERT INTO equipment_sensors (id, equipment_id, sensor_type, value, unit, recorded_at)
SELECT
  gen_random_uuid(),
  'EQUIP-' || (1 + floor(random() * 10)::int),
  (ARRAY['temperature', 'pressure', 'vibration', 'rpm', 'fuel_flow'])[1 + floor(random() * 5)::int],
  CASE 
    WHEN (ARRAY['temperature', 'pressure', 'vibration', 'rpm', 'fuel_flow'])[1 + floor(random() * 5)::int] = 'temperature' THEN 40 + random() * 40
    WHEN (ARRAY['temperature', 'pressure', 'vibration', 'rpm', 'fuel_flow'])[1 + floor(random() * 5)::int] = 'pressure' THEN 5 + random() * 10
    WHEN (ARRAY['temperature', 'pressure', 'vibration', 'rpm', 'fuel_flow'])[1 + floor(random() * 5)::int] = 'vibration' THEN random() * 5
    WHEN (ARRAY['temperature', 'pressure', 'vibration', 'rpm', 'fuel_flow'])[1 + floor(random() * 5)::int] = 'rpm' THEN 500 + random() * 1500
    ELSE 10 + random() * 50
  END,
  (ARRAY['°C', 'bar', 'mm/s', 'RPM', 'L/h'])[1 + floor(random() * 5)::int],
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 1000);

-- 7. Create sample incidents
INSERT INTO incidents (id, vessel_id, incident_type, severity, status, reported_at, description)
SELECT
  gen_random_uuid(),
  (SELECT id FROM vessels ORDER BY random() LIMIT 1),
  (ARRAY['near_miss', 'minor_injury', 'equipment_failure', 'environmental', 'security'])[1 + floor(random() * 5)::int],
  (ARRAY['low', 'medium', 'high', 'critical'])[1 + floor(random() * 4)::int],
  (ARRAY['reported', 'investigating', 'resolved', 'closed'])[1 + floor(random() * 4)::int],
  NOW() - (random() * interval '90 days'),
  'Staging incident description for testing purposes. This is simulated data.'
FROM generate_series(1, 25);

-- 8. Create sample health check-ins
INSERT INTO crew_health_logs (id, crew_member_id, check_in_date, stress_level, fatigue_level, sleep_hours, mood)
SELECT
  gen_random_uuid(),
  (SELECT id FROM crew_members ORDER BY random() LIMIT 1),
  (NOW() - (random() * interval '30 days'))::date,
  1 + floor(random() * 5)::int,
  1 + floor(random() * 5)::int,
  4 + random() * 6,
  (ARRAY['excellent', 'good', 'neutral', 'stressed', 'tired'])[1 + floor(random() * 5)::int]
FROM generate_series(1, 300);

-- 9. Create test users with known credentials
-- Password: StagingTest2026!
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'captain@staging.nautilus.app', crypt('StagingTest2026!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'engineer@staging.nautilus.app', crypt('StagingTest2026!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'hr@staging.nautilus.app', crypt('StagingTest2026!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'admin@staging.nautilus.app', crypt('StagingTest2026!', gen_salt('bf')), NOW(), NOW(), NOW());

-- Link test users to profiles
INSERT INTO profiles (id, full_name, email, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Captain', 'captain@staging.nautilus.app', 'captain'),
  ('22222222-2222-2222-2222-222222222222', 'Test Engineer', 'engineer@staging.nautilus.app', 'officer'),
  ('33333333-3333-3333-3333-333333333333', 'Test HR Manager', 'hr@staging.nautilus.app', 'hr_manager'),
  ('44444444-4444-4444-4444-444444444444', 'Test Admin', 'admin@staging.nautilus.app', 'admin');

COMMIT;
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Captain | captain@staging.nautilus.app | StagingTest2026! |
| Engineer | engineer@staging.nautilus.app | StagingTest2026! |
| HR Manager | hr@staging.nautilus.app | StagingTest2026! |
| Admin | admin@staging.nautilus.app | StagingTest2026! |

---

## Testing Checklist

### Functional Tests

- [ ] Login with each test role
- [ ] Navigate all main modules
- [ ] Create new audit
- [ ] Upload evidence file
- [ ] Complete health check-in
- [ ] View predictive maintenance
- [ ] Export PDF report
- [ ] Test offline mode

### Performance Tests

- [ ] Load dashboard (< 2s)
- [ ] API response times (< 500ms P95)
- [ ] Large data table scrolling
- [ ] Image/file upload
- [ ] Real-time updates

### Security Tests

- [ ] RLS policies working correctly
- [ ] Role-based access enforced
- [ ] Cross-tenant data isolation
- [ ] Session management
- [ ] Rate limiting active

### Mobile/PWA Tests

- [ ] Responsive layout
- [ ] Touch interactions
- [ ] Offline indicator
- [ ] Data sync on reconnect
- [ ] Install to home screen

---

## Environment Variables

### Staging (.env.staging)

```bash
# Supabase Staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key

# Environment Flag
VITE_ENVIRONMENT=staging
VITE_DEBUG_MODE=true

# Feature Flags
VITE_FEATURE_AI_ASSISTANT=true
VITE_FEATURE_PREDICTIVE_ML=true
VITE_FEATURE_SATELLITE_SYNC=true

# Monitoring (Staging)
VITE_SENTRY_DSN=your-staging-sentry-dsn
VITE_POSTHOG_KEY=your-staging-posthog-key

# Disable production alerts
VITE_SLACK_ALERTS_ENABLED=false
```

---

## Deployment

### Build for Staging

```bash
# Build with staging config
npm run build -- --mode staging

# Or with environment file
VITE_ENVIRONMENT=staging npm run build
```

### Deploy to Staging URL

Options:
1. **Lovable Preview** - Use branch preview URLs
2. **Vercel/Netlify** - Deploy to staging subdomain
3. **Custom Domain** - staging.nautilus.app

---

## Data Refresh

### Weekly Reset Script

```bash
#!/bin/bash
# Reset staging data weekly

# 1. Clear old data
psql $STAGING_DB_URL -c "TRUNCATE TABLE audits, evidence, incidents CASCADE;"

# 2. Regenerate anonymized data
psql $STAGING_DB_URL -f staging-seed.sql

# 3. Notify team
curl -X POST $SLACK_WEBHOOK -d '{"text": "✅ Staging data refreshed"}'
```

---

## Monitoring

### Staging-Specific Dashboards

- **Sentry Project:** nautilus-staging
- **PostHog Environment:** staging
- **Supabase Dashboard:** Separate project

### Alerts (Staging-Only)

- Error rate > 5% → Slack #staging-alerts
- P95 latency > 1s → Email to dev team
- Database connections > 80% → PagerDuty (silent)

---

## Access Control

### Who Can Access Staging

| Role | Access Level |
|------|--------------|
| Engineering | Full access |
| QA | Full access |
| Product | Read-only + test accounts |
| Support | Test accounts only |

### IP Restrictions (Optional)

```nginx
# Restrict staging to office IPs
allow 192.168.1.0/24;
allow 10.0.0.0/8;
deny all;
```

---

## Graduation to Production

### Criteria for Production Promotion

1. ✅ All staging tests pass
2. ✅ No P0/P1 bugs in staging
3. ✅ Performance targets met
4. ✅ Security scan clean
5. ✅ Product sign-off

### Promotion Process

```bash
# 1. Merge staging to main
git checkout main
git merge staging

# 2. Run production build
npm run build

# 3. Deploy to production
npm run deploy:production

# 4. Smoke tests
npm run test:smoke

# 5. Monitor for 24h
```

---

*Document Version: 1.0*  
*Last Updated: 2026-01-05*
