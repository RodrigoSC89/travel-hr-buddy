# 📚 Complete Cron Monitoring Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Usage](#usage)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Introduction

### What Is This?
A comprehensive monitoring system that:
- ✅ Tracks every cron job execution
- ✅ Detects when jobs fail to run on schedule
- ✅ Sends professional email alerts to administrators
- ✅ Provides historical data for analysis

### Why Do You Need It?
Without monitoring, you won't know when:
- 🚨 Daily reports stop being sent
- 🚨 Cron jobs silently fail
- 🚨 Scheduled tasks are missed
- 🚨 System reliability degrades

### What Problem Does It Solve?
**Before:** Cron jobs run (or don't) with no visibility  
**After:** Complete execution tracking with proactive alerts

## Architecture

### Database Layer

#### cron_execution_logs Table
```sql
CREATE TABLE cron_execution_logs (
  id UUID PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL,              -- 'success', 'error', 'warning'
  message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  error_details JSONB,
  execution_duration_ms INTEGER,
  metadata JSONB
);
```

**Indexes:**
- `executed_at DESC` - Fast recent queries
- `function_name, executed_at DESC` - Per-function queries
- `status, executed_at DESC` - Status filtering

**RLS Policies:**
- Insert: Service role only
- Select: Admins only

#### check_daily_cron_execution() Function
```sql
check_daily_cron_execution(
  p_function_name TEXT,      -- Function to check
  p_hours_threshold INTEGER  -- Hours before warning
) RETURNS TABLE(
  status TEXT,               -- 'ok' or 'warning'
  message TEXT,
  last_execution TIMESTAMPTZ,
  hours_since_last_execution NUMERIC
)
```

### Application Layer

#### Modified: send-daily-assistant-report
Logs execution at 4 critical points:
1. **Log Fetch Failure** - When assistant_logs query fails
2. **Email Send Failure** - When email delivery fails
3. **Success** - After email sent successfully
4. **Critical Error** - On unexpected exceptions

#### New: monitor-cron-health
- Calls `check_daily_cron_execution()`
- Sends HTML email alerts if status is 'warning'
- Returns API response for manual checks

## Deployment

### Prerequisites
- Supabase CLI installed
- Project linked: `supabase link --project-ref your-ref`
- Environment variables configured

### Step 1: Deploy Database Migrations

```bash
# Apply migrations
supabase db push

# Verify tables created
supabase db diff
```

**What gets created:**
- `cron_execution_logs` table
- 3 indexes
- 2 RLS policies
- `check_daily_cron_execution()` function

### Step 2: Deploy Edge Functions

```bash
# Deploy modified function
supabase functions deploy send-daily-assistant-report

# Deploy new monitoring function
supabase functions deploy monitor-cron-health
```

### Step 3: Configure Environment Variables

In Supabase Dashboard → Settings → Edge Functions:

```bash
ADMIN_EMAIL=admin@nautilus.ai
EMAIL_FROM=alertas@nautilus.ai
RESEND_API_KEY=re_your_key_here
```

Or via CLI:
```bash
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=alertas@nautilus.ai
supabase secrets set RESEND_API_KEY=re_your_key_here
```

### Step 4: Schedule Health Monitor

**Option A: config.toml** (Recommended)
```toml
# supabase/config.toml
[functions.monitor-cron-health]
verify_jwt = false

[[functions.monitor-cron-health.triggers]]
type = "cron"
schedule = "0 */12 * * *"  # Every 12 hours
```

**Option B: Supabase Dashboard**
1. Go to Edge Functions → monitor-cron-health
2. Click "Add Trigger"
3. Type: Cron
4. Schedule: `0 */12 * * *`

### Step 5: Verify Deployment

```bash
# Check function logs
supabase functions logs send-daily-assistant-report
supabase functions logs monitor-cron-health

# Query execution logs
psql -c "SELECT * FROM cron_execution_logs ORDER BY executed_at DESC LIMIT 5;"
```

## Configuration

### Alert Thresholds

Adjust the warning threshold in `monitor-cron-health`:

```typescript
// Default: 36 hours
const { data } = await supabase.rpc("check_daily_cron_execution", {
  p_function_name: "send-daily-assistant-report",
  p_hours_threshold: 36  // ⬅️ Adjust this
});
```

**Recommended Values:**
- Daily job: 36 hours (1.5 days)
- Hourly job: 2 hours
- Weekly job: 192 hours (8 days)

### Email Configuration

**Email Template Customization:**
Edit `monitor-cron-health/index.ts` → `sendAlertEmail()` function

**Subject Line:**
```typescript
subject: `⚠️ Falha na execução do CRON diário - ${functionName}`
```

**Recipients:**
- Single: Set `ADMIN_EMAIL` to one address
- Multiple: Modify code to accept comma-separated list

## Testing

### Manual Health Check
```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response (Healthy):**
```json
{
  "success": true,
  "status": "ok",
  "message": "Cron job is healthy",
  "healthCheck": {
    "status": "ok",
    "message": "Function send-daily-assistant-report executed successfully 2.5 hours ago",
    "last_execution": "2025-10-12T18:30:00Z",
    "hours_since_last_execution": 2.5
  }
}
```

**Expected Response (Warning):**
```json
{
  "success": true,
  "status": "warning",
  "message": "Alert email sent",
  "healthCheck": {
    "status": "warning",
    "message": "Function send-daily-assistant-report has not executed successfully in 40.2 hours",
    "last_execution": "2025-10-10T04:00:00Z",
    "hours_since_last_execution": 40.2
  }
}
```

### Test Alert Email

Simulate a missed execution:

```sql
-- Delete recent logs (TESTING ONLY!)
DELETE FROM cron_execution_logs 
WHERE function_name = 'send-daily-assistant-report'
AND executed_at > NOW() - INTERVAL '48 hours';

-- Now trigger health check
-- Alert email should be sent
```

### Query Execution History

```sql
-- Recent executions
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 20;

-- Success rate (last 30 days)
SELECT 
  function_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status='success') as successful,
  COUNT(*) FILTER (WHERE status='error') as failed,
  ROUND(COUNT(*) FILTER (WHERE status='success') * 100.0 / COUNT(*), 2) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;

-- Average execution duration
SELECT 
  function_name,
  AVG(execution_duration_ms) as avg_duration_ms,
  MIN(execution_duration_ms) as min_duration_ms,
  MAX(execution_duration_ms) as max_duration_ms
FROM cron_execution_logs
WHERE status = 'success'
GROUP BY function_name;
```

## Usage

### View Execution Logs (Admin Dashboard)

Create a simple admin page to display logs:

```typescript
// Example React component
const { data: logs } = await supabase
  .from('cron_execution_logs')
  .select('*')
  .order('executed_at', { ascending: false })
  .limit(100);
```

### Monitor Multiple Functions

To add monitoring for additional cron jobs:

**1. Add logging to your function:**
```typescript
// In your-cron-function/index.ts
const startTime = Date.now();

try {
  // ... your function logic ...
  
  // Log success
  await supabase.from("cron_execution_logs").insert({
    function_name: "your-function-name",
    status: "success",
    message: "Your success message",
    execution_duration_ms: Date.now() - startTime,
    metadata: { /* any relevant data */ }
  });
} catch (error) {
  // Log error
  await supabase.from("cron_execution_logs").insert({
    function_name: "your-function-name",
    status: "error",
    message: "Your error message",
    error_details: { error },
    execution_duration_ms: Date.now() - startTime
  });
  throw error;
}
```

**2. Add health check in monitor-cron-health:**
```typescript
// Check multiple functions
const functions = [
  { name: "send-daily-assistant-report", threshold: 36 },
  { name: "your-function-name", threshold: 24 }
];

for (const func of functions) {
  const { data } = await supabase.rpc("check_daily_cron_execution", {
    p_function_name: func.name,
    p_hours_threshold: func.threshold
  });
  
  if (data[0].status === "warning") {
    await sendAlertEmail(/* ... */);
  }
}
```

### Custom Alerts

Integrate with other alerting systems:

**Slack:**
```typescript
await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    text: `🚨 Cron Alert: ${message}`
  })
});
```

**Discord:**
```typescript
await fetch(DISCORD_WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    content: `🚨 **Cron Alert**\n${message}`
  })
});
```

## Monitoring & Maintenance

### Daily Tasks
- ✅ Check email for alerts
- ✅ Review execution logs if alerts received

### Weekly Tasks
- ✅ Query success rates
- ✅ Check execution durations
- ✅ Review error patterns

### Monthly Tasks
- ✅ Archive old logs (optional)
- ✅ Review alert thresholds
- ✅ Update documentation

### Log Retention

Archive logs older than 90 days:

```sql
-- Create archive table (one-time)
CREATE TABLE cron_execution_logs_archive (LIKE cron_execution_logs);

-- Move old logs monthly
INSERT INTO cron_execution_logs_archive
SELECT * FROM cron_execution_logs
WHERE executed_at < NOW() - INTERVAL '90 days';

DELETE FROM cron_execution_logs
WHERE executed_at < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### No Logs Appearing

**Check 1: Table exists**
```sql
SELECT EXISTS(
  SELECT FROM information_schema.tables 
  WHERE table_name = 'cron_execution_logs'
);
```

**Check 2: RLS policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'cron_execution_logs';
```

**Check 3: Service role key**
```bash
# Verify in .env or dashboard
echo $SUPABASE_SERVICE_ROLE_KEY
```

### No Email Alerts Sent

**Check 1: RESEND_API_KEY configured**
```bash
supabase secrets list | grep RESEND_API_KEY
```

**Check 2: Health monitor scheduled**
```bash
# View function configuration
supabase functions list
```

**Check 3: Monitor logs**
```bash
supabase functions logs monitor-cron-health --tail
```

### False Alerts

**Scenario 1: Job runs but logs missing**
- Check: Function deployed with latest code?
- Check: No database connection issues?

**Scenario 2: Threshold too aggressive**
- Increase `p_hours_threshold` value
- Daily job: 36 hours minimum

**Scenario 3: Multiple executions counted as single**
- Check: Logs have unique timestamps?
- Check: Function not running concurrently?

### High Error Rate

**Investigate:**
```sql
-- Get recent errors
SELECT message, error_details, executed_at
FROM cron_execution_logs
WHERE status = 'error'
ORDER BY executed_at DESC
LIMIT 10;

-- Error patterns
SELECT 
  message,
  COUNT(*) as occurrences
FROM cron_execution_logs
WHERE status = 'error'
GROUP BY message
ORDER BY occurrences DESC;
```

### Performance Issues

**Check index usage:**
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'cron_execution_logs';
```

**Optimize queries:**
- Use `executed_at` in WHERE clauses
- Filter by `function_name` early
- Limit result sets

## Best Practices

1. **Always log executions** - Even successful ones
2. **Include context** - Use metadata field generously
3. **Set appropriate thresholds** - Not too sensitive, not too lax
4. **Monitor the monitor** - Check health function logs weekly
5. **Document changes** - Update thresholds in code comments
6. **Test alerts** - Verify email delivery works
7. **Plan for scale** - Archive old logs regularly

## Security Considerations

- ✅ **RLS Enabled** - Only admins see logs
- ✅ **Service Role Protected** - Can't be called from client
- ✅ **No Sensitive Data** - Don't log passwords/keys
- ✅ **Error Sanitization** - Be careful what goes in error_details

## Next Steps

- 📖 [Quick Reference](./CRON_MONITORING_QUICKREF.md)
- 🔧 [Implementation Details](./CRON_MONITORING_IMPLEMENTATION.md)
- 📊 [Visual Guide](./CRON_MONITORING_VISUAL.md)
- 📋 [Before/After Comparison](./CRON_MONITORING_BEFORE_AFTER.md)
