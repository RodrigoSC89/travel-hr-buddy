# 📖 NAUTILUS ONE - PRODUCTION RUNBOOK

## 🚨 EMERGENCY CONTACTS

| Role | Name | Phone | Email | Slack |
|------|------|-------|-------|-------|
| On-Call Dev | [Name] | [Phone] | [Email] | @handle |
| DevOps Lead | [Name] | [Phone] | [Email] | @handle |
| Product Manager | [Name] | [Phone] | [Email] | @handle |
| CEO | [Name] | [Phone] | [Email] | @handle |

**War Room Slack:** #incident-response
**Status Page:** https://status.nautilus.com
**PagerDuty:** [LINK]

---

## 🏗️ SYSTEM ARCHITECTURE

```
[Browser] → [Vercel CDN] → [Next.js App] → [Supabase]
                ↓                ↓
           [Cloudflare]    [External APIs]
                              ├─ Claude API
                              ├─ Gemini API
                              ├─ ElevenLabs
                              └─ Weather/Maritime APIs
```

**Critical Dependencies:**
- Vercel (Hosting)
- Supabase (Database + Auth + Storage)
- Anthropic (Claude API)
- Google (Gemini API)
- Cloudflare (CDN + DDoS protection)

---

## 📊 MONITORING & ALERTS

### Dashboards
- **Vercel:** [DASHBOARD_LINK]
- **Supabase:** [DASHBOARD_LINK]
- **Sentry:** [DASHBOARD_LINK]
- **Grafana:** [DASHBOARD_LINK]

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error Rate | >1% | >3% | Investigate immediately |
| Response Time | >2s | >5s | Scale up |
| CPU | >80% | >95% | Scale up |
| Memory | >85% | >95% | Restart + scale |
| DB Connections | >40/50 | >48/50 | Scale database |
| API Rate Limit | >80% | >95% | Throttle users |

---

## 🔥 COMMON INCIDENTS & SOLUTIONS

### 1. ⚠️ HIGH ERROR RATE (>3%)

**Symptoms:**
- Sentry flooding with errors
- Users reporting "Something went wrong"
- Dashboard shows red spikes

**Diagnosis:**
```bash
# Check Sentry for most common error
# Check Vercel logs
vercel logs --follow

# Check Supabase status
curl https://[project].supabase.co/rest/v1/
```

**Common Causes & Fixes:**

**A) Database Connection Pool Exhausted**
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
AND query_start < NOW() - INTERVAL '5 minutes';
```

**B) API Rate Limit Hit**
```bash
# Check rate limit status
curl -H "Authorization: Bearer $API_KEY" \
  https://api.anthropic.com/v1/ratelimits

# Temporary fix: Enable fallback
vercel env add ENABLE_FALLBACK_AI production
```

**C) Deployment Issue**
```bash
# Rollback to previous version
vercel rollback [deployment-url]

# Verify rollback
curl https://nautilus.com/api/health
```

**Resolution Time:** 5-15 minutes

---

### 2. 🐌 SLOW RESPONSE TIME (>5s)

**Symptoms:**
- Users complaining about slowness
- Lighthouse score dropping
- P95 latency >5s

**Diagnosis:**
```bash
# Check response times
vercel logs --filter="duration" | tail -100

# Check database query performance
# Supabase Dashboard > Performance > Slow Queries
```

**Common Causes & Fixes:**

**A) Slow Database Queries**
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_vessels_fleet_id ON vessels(fleet_id);
CREATE INDEX idx_logs_timestamp ON logs(created_at);
```

**B) Cold Starts (Vercel Functions)**
```bash
# Warm up functions
curl https://nautilus.com/api/warm
curl https://nautilus.com/api/health
```

**Resolution Time:** 10-30 minutes

---

### 3. 🔒 AUTH ISSUES (Users Can't Login)

**Symptoms:**
- "Invalid credentials" errors
- Session expiration loops
- OAuth not working

**Diagnosis:**
```bash
# Check Supabase Auth status
# Supabase Dashboard > Authentication > Users
```

**Common Causes & Fixes:**

**A) Session Token Expired**
```javascript
// Force refresh in browser console
const { error } = await supabase.auth.refreshSession();
console.log(error);
```

**B) Rate Limiting on Auth**
```bash
# Temporarily increase limit
# Supabase Dashboard > Authentication > Rate Limits
```

**Resolution Time:** 5-10 minutes

---

### 4. 💾 DATABASE DOWN / UNREACHABLE

**CRITICAL INCIDENT - Follow DR Plan**

**Immediate Actions:**
1. Announce incident on status page
2. Page on-call DevOps immediately
3. Enable read-only mode (serve cached data)

**Diagnosis:**
```bash
# Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# Check database directly
psql -h [db-host] -U postgres -d nautilus
```

**Resolution Time:** 30-120 minutes

---

### 5. 🤖 AI API NOT RESPONDING

**Symptoms:**
- AI features returning errors
- "Claude is unavailable" messages
- Timeout errors

**Diagnosis:**
```bash
# Test Claude API directly
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-sonnet-20240229","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

**Common Fixes:**
- Switch to Gemini fallback
- Increase rate limit (upgrade plan)
- Check: https://status.anthropic.com

**Resolution Time:** 5-15 minutes

---

## 🔄 ROLLBACK PROCEDURE

**When to Rollback:**
- Critical bug affecting >50% of users
- Data corruption risk
- Security vulnerability discovered
- Performance degradation >10x normal

**Steps:**
```bash
# 1. Get previous deployment URL
vercel list

# 2. Rollback
vercel rollback [previous-deployment-url]

# 3. Verify
curl https://nautilus.com/api/health

# 4. Notify users via status page
```

**Target Time:** <5 minutes

---

## 📞 ESCALATION MATRIX

| Severity | Response Time | Who to Page | Notification |
|----------|---------------|-------------|--------------|
| P0 - Critical | 5 minutes | Everyone | PagerDuty + Slack |
| P1 - High | 15 minutes | On-call + Lead | Slack |
| P2 - Medium | 1 hour | On-call | Slack |
| P3 - Low | Next business day | Create ticket | Email |

**Severity Definitions:**

- **P0 (Critical):** System completely down, data loss, security breach, >80% users affected
- **P1 (High):** Major feature broken, 20-80% users affected
- **P2 (Medium):** Minor feature broken, <20% users affected
- **P3 (Low):** UI glitch, individual users, has workaround

---

## 📝 POST-INCIDENT CHECKLIST

After ANY P0 or P1 incident:

- [ ] Write incident report (within 24h)
- [ ] Schedule post-mortem meeting (within 48h)
- [ ] Update runbook with learnings
- [ ] Create tickets for improvements
- [ ] Notify affected users (if applicable)
- [ ] Update status page with resolution

---

**Last Updated:** 2025-01-04
**Maintained By:** DevOps Team
**Review Frequency:** Monthly
