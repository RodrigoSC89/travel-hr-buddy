# 📊 Monitoring & Observability Guide

## Overview

Nautilus One implements comprehensive monitoring across multiple layers: application performance, error tracking, database operations, edge functions, and user analytics. This guide covers monitoring strategies, tools, and best practices.

## 🎯 Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Monitoring Stack                      │
└─────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   Sentry    │  │   Vercel    │  │  Supabase   │  │    Resend    │
│   Errors    │  │  Analytics  │  │    Logs     │  │  Email Logs  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
       │                │                │                 │
       └────────────────┴────────────────┴─────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Central Dashboard  │
                    │  /admin/status      │
                    └─────────────────────┘
```

## 🔍 Application Monitoring (Sentry)

### Configuration

Sentry is configured in `src/main.tsx` and `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV || "development",
  
  // Performance Monitoring
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/.*\.vercel\.app/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Sampling rates
  tracesSampleRate: 1.0,           // 100% of transactions
  replaysSessionSampleRate: 0.1,   // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of errors
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes('Network Error')) {
      return null; // Don't send to Sentry
    }
    return event;
  },
});
```

### Monitored Metrics

**Errors**
- JavaScript exceptions
- React component errors (via ErrorBoundary)
- API request failures
- Database query errors

**Performance**
- Page load times
- API response times
- Database query duration
- Browser rendering metrics

**User Context**
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.user_metadata?.full_name,
});
```

### Alerts Configuration

Set up alerts in Sentry dashboard:

1. **Critical Errors** (immediate notification)
   - Authentication failures
   - Payment processing errors
   - Data loss incidents

2. **Performance Degradation** (hourly digest)
   - Page load > 3s
   - API response > 2s
   - Database queries > 1s

3. **Error Rate Spike** (threshold: 10% increase)
   - More than 10 errors/minute
   - Same error affecting multiple users

### Accessing Sentry

**Dashboard**: https://sentry.io/organizations/[your-org]/projects/

**Key Reports**:
- Issues: Grouped errors with stack traces
- Performance: Transaction performance metrics
- Replays: Session recordings with errors

## 📈 Platform Analytics (Vercel)

### Vercel Analytics

Automatically enabled for all deployments:

**Real-time Metrics**
- Page views and unique visitors
- Geographic distribution
- Referrer sources
- Device and browser breakdown

**Web Vitals**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

**Speed Insights**
- Real user monitoring (RUM)
- Core Web Vitals per page
- Performance score (0-100)

### Accessing Vercel Analytics

**Dashboard**: https://vercel.com/[account]/[project]/analytics

**Key Metrics**:
```
Analytics > Web Vitals
  - LCP: 2.1s (Good)
  - FID: 45ms (Good)
  - CLS: 0.05 (Good)
  - TTFB: 450ms (Good)

Analytics > Audiences
  - Total visitors: 1,234
  - Unique visitors: 876
  - Bounce rate: 35%
  - Avg. session: 5m 23s
```

## 🗄️ Database Monitoring (Supabase)

### Supabase Dashboard

**Database Logs**: Track all queries and performance

Access: https://supabase.com/dashboard/project/[ref]/logs/postgres-logs

**Monitored Metrics**:
- Query execution time
- Connection pool usage
- Slow queries (> 1s)
- Failed queries
- Lock contention

### Query Performance

**Slow Query Log**
```sql
-- Enable slow query logging
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second

-- View slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY total_time DESC
LIMIT 20;
```

**Connection Monitoring**
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT
  pid,
  now() - query_start as duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

### Database Size Monitoring

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

## ⚡ Edge Functions Monitoring

### Function Logs

Access via Supabase CLI:
```bash
# View logs for specific function
supabase functions logs send-assistant-report

# Follow logs in real-time
supabase functions logs send-assistant-report --follow

# Filter by level
supabase functions logs ai-chat --level error
```

### Function Metrics

**Key Metrics**:
- Invocation count
- Average execution time
- Error rate
- Cold start duration

**Dashboard**: https://supabase.com/dashboard/project/[ref]/functions

### Monitoring Cron Jobs

Custom health check function (`monitor-cron-health`):

```typescript
// supabase/functions/monitor-cron-health/index.ts
export async function checkCronHealth() {
  const checks = [
    {
      name: 'send-assistant-report',
      schedule: '0 8 * * *',
      lastRun: await getLastRun('send-assistant-report'),
    },
    {
      name: 'send-restore-dashboard-daily',
      schedule: '0 9 * * *',
      lastRun: await getLastRun('send-restore-dashboard-daily'),
    },
  ];

  const alerts = checks.filter(check => {
    const expectedRun = getExpectedRunTime(check.schedule);
    const timeSinceRun = Date.now() - check.lastRun;
    return timeSinceRun > expectedRun + 3600000; // 1 hour grace period
  });

  if (alerts.length > 0) {
    await sendAlert(alerts);
  }

  return { healthy: alerts.length === 0, checks };
}
```

**Accessing Cron Status**:
- Dashboard: `/admin/status`
- API: `/api/cron/status`

## 📧 Email Delivery Monitoring (Resend)

### Resend Dashboard

**Access**: https://resend.com/dashboard

**Metrics**:
- Emails sent
- Delivery rate
- Bounce rate
- Complaint rate
- Open rate (if tracking enabled)

### Email Monitoring

```typescript
// Track email status
const { data, error } = await resend.emails.send({
  from: 'reports@nautilus.ai',
  to: 'admin@company.com',
  subject: 'Daily Report',
  html: reportHtml,
  tags: [
    { name: 'report_type', value: 'daily_assistant' },
    { name: 'environment', value: 'production' },
  ],
});

// Log email ID for tracking
if (data?.id) {
  await supabase.from('email_logs').insert({
    resend_id: data.id,
    recipient: 'admin@company.com',
    subject: 'Daily Report',
    status: 'sent',
  });
}
```

### Email Webhooks

Configure webhooks in Resend dashboard to track delivery:

```typescript
// pages/api/webhooks/resend.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const event = req.body;

  switch (event.type) {
    case 'email.delivered':
      await updateEmailStatus(event.data.email_id, 'delivered');
      break;
    case 'email.bounced':
      await updateEmailStatus(event.data.email_id, 'bounced');
      await notifyAdmin('Email bounced', event.data);
      break;
    case 'email.complained':
      await updateEmailStatus(event.data.email_id, 'complained');
      await notifyAdmin('Spam complaint', event.data);
      break;
  }

  res.status(200).json({ received: true });
}
```

## 📊 Custom Monitoring Dashboard

### Admin Status Page

Located at `/admin/status`, shows:

**System Health**
- ✅ API status
- ✅ Database status
- ✅ Edge functions status
- ✅ Storage status

**Cron Jobs**
- Last run times
- Success/failure status
- Next scheduled run

**Performance Metrics**
- Average response time
- Error rate (last 24h)
- Active users

**Recent Errors**
- Last 10 errors from Sentry
- Stack traces
- User impact

**Database Stats**
- Connection pool usage
- Query performance
- Storage usage

### Implementation Example

```typescript
// src/pages/admin/status.tsx
import { useQuery } from '@tanstack/react-query';

export default function StatusPage() {
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const [api, db, functions] = await Promise.all([
        checkApiHealth(),
        checkDatabaseHealth(),
        checkFunctionsHealth(),
      ]);
      return { api, db, functions };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: cronStatus } = useQuery({
    queryKey: ['cron-status'],
    queryFn: fetchCronStatus,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div>
      <SystemHealthCards health={systemHealth} />
      <CronJobsTable jobs={cronStatus} />
      <RecentErrorsList />
      <PerformanceMetrics />
    </div>
  );
}
```

## 🚨 Alerting Strategy

### Alert Levels

**Critical** (immediate notification)
- Database connection lost
- Authentication service down
- Payment processing failure
- Data corruption detected

**High** (15-minute notification)
- Error rate > 5%
- Response time > 3s
- Cron job failed
- Storage > 90% full

**Medium** (hourly digest)
- Error rate > 1%
- Response time > 2s
- Slow queries detected

**Low** (daily digest)
- Minor performance degradation
- Deprecated API usage
- Security updates available

### Notification Channels

**Sentry Alerts**
- Email: team@company.com
- Slack: #alerts channel
- PagerDuty: On-call rotation

**Supabase Alerts**
- Email: devops@company.com
- Webhook: Custom alerting system

**Vercel Alerts**
- Email: devops@company.com
- GitHub: Automatic issue creation

## 📈 Metrics Dashboard

### Key Performance Indicators (KPIs)

**Availability**
- Target: 99.9% uptime
- Measurement: HTTP 200 responses / total requests

**Performance**
- Target: P95 response time < 2s
- Measurement: Vercel Analytics + Sentry

**Error Rate**
- Target: < 0.1% of requests
- Measurement: Sentry error count / total requests

**User Engagement**
- Target: 80% weekly active users
- Measurement: Supabase auth logs

**Database Health**
- Target: P95 query time < 500ms
- Measurement: pg_stat_statements

### Custom Metrics

Track business-specific metrics:

```typescript
// Track feature usage
await supabase.from('usage_metrics').insert({
  feature: 'ai_chat',
  user_id: user.id,
  success: true,
  duration_ms: 234,
  metadata: { prompt_tokens: 50 },
});

// Track document operations
await supabase.from('operation_logs').insert({
  operation: 'document_restore',
  document_id: doc.id,
  user_id: user.id,
  success: true,
});
```

## 🔄 Continuous Monitoring

### Automated Health Checks

```typescript
// Run every 5 minutes
async function healthCheck() {
  const checks = await Promise.allSettled([
    fetch('https://api.nautilus.ai/health').then(r => r.json()),
    supabase.from('profiles').select('count').single(),
    supabase.functions.invoke('health-check'),
  ]);

  const failed = checks.filter(c => c.status === 'rejected');
  
  if (failed.length > 0) {
    await sendAlert({
      level: 'critical',
      message: 'Health check failed',
      details: failed,
    });
  }
}
```

### Synthetic Monitoring

Use external services to monitor from different locations:
- **UptimeRobot**: Basic uptime monitoring
- **Pingdom**: Advanced monitoring with multi-location checks
- **StatusPage**: Public status page for transparency

## 📚 Best Practices

### Logging

1. **Structured Logging**
   ```typescript
   logger.info('User action completed', {
     userId: user.id,
     action: 'document_upload',
     duration: 1234,
     success: true,
   });
   ```

2. **Log Levels**
   - `DEBUG`: Development only
   - `INFO`: Normal operations
   - `WARN`: Potential issues
   - `ERROR`: Failures requiring attention

3. **Never Log Sensitive Data**
   - No passwords
   - No API keys
   - No PII (without consent)

### Performance Monitoring

1. **Set Performance Budgets**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       chunkSizeWarningLimit: 1000, // 1MB
     },
   });
   ```

2. **Monitor Third-Party Scripts**
   - Track loading time
   - Measure performance impact
   - Consider lazy loading

3. **Optimize Database Queries**
   - Add indexes for frequently queried columns
   - Use query explain plans
   - Cache expensive queries

## 📞 Support & Escalation

### On-Call Rotation

**Critical Issues** (24/7 response)
- Database outage
- Security breach
- Data loss

**Non-Critical** (business hours)
- Performance degradation
- Feature bugs
- User reports

### Incident Response

1. **Acknowledge** - Respond within 15 minutes
2. **Assess** - Determine severity and impact
3. **Mitigate** - Implement quick fix or rollback
4. **Communicate** - Update stakeholders
5. **Resolve** - Implement permanent fix
6. **Review** - Post-mortem analysis

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/logs)
- [DEPLOY.md](./DEPLOY.md) - Deployment procedures
- [SECURITY.md](./SECURITY.md) - Security monitoring
