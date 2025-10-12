# 📘 Cron Monitoring System - Complete Guide

Comprehensive guide for setup, deployment, and usage of the Cron Execution Monitoring System.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Security](#security)

---

## 🎯 Overview

The Cron Monitoring System provides comprehensive tracking and alerting for automated cron job executions. It automatically:

- ✅ Logs every cron execution with timestamp and status
- ✅ Detects failed or overdue executions
- ✅ Sends email alerts to administrators
- ✅ Maintains historical execution data
- ✅ Provides fast queries with optimized indexes

### Key Features

| Feature | Description |
|---------|-------------|
| **Automated Logging** | Every execution logged automatically with status |
| **Health Checks** | SQL function checks if cron ran within threshold |
| **Email Alerts** | Professional HTML emails when issues detected |
| **Historical Data** | Track success rates and identify patterns |
| **Fast Queries** | Optimized indexes for quick data retrieval |
| **Secure Access** | RLS policies protect sensitive execution data |

---

## 📦 Prerequisites

### Required

- ✅ Supabase project with database access
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Resend API account and API key
- ✅ Admin email address for alerts

### Optional

- 📧 SendGrid API key (alternative to Resend)
- 🛠️ PostgreSQL client for direct database access
- 📊 Admin dashboard for visual monitoring (future)

### Environment Requirements

```bash
Node.js >= 16.x
Deno >= 1.20.x (for edge functions)
Supabase CLI >= 1.0.0
```

---

## 🚀 Installation

### Step 1: Deploy Database Migrations

The system requires two database migrations:

#### Migration 1: Create cron_execution_logs Table

```bash
# Apply migration
supabase db push
```

This creates:
- `cron_execution_logs` table with proper schema
- Three optimized indexes for fast queries
- RLS policies for secure access

**What it does:**
- Stores all cron job execution records
- Tracks function name, status, message, and errors
- Enables fast time-based and status-based queries

#### Migration 2: Create Health Check Function

The second migration creates `check_daily_cron_execution()`:

**What it does:**
- Checks if send-assistant-report-daily executed recently
- Returns 'ok' if execution within 36 hours
- Returns 'warning' if execution overdue
- Includes last execution timestamp in response

### Step 2: Deploy Edge Functions

#### Deploy Modified send-daily-assistant-report

```bash
supabase functions deploy send-daily-assistant-report
```

**Changes made:**
- Added `logCronExecution()` helper function
- Logs to `cron_execution_logs` at 4 critical points:
  1. Success: After email sent
  2. Error: Log fetch failure
  3. Error: Email send failure
  4. Error: General exception

**Impact:**
- ✅ No breaking changes to existing functionality
- ✅ Minimal code additions (4 lines per logging point)
- ✅ Non-blocking logging (failures don't break main flow)

#### Deploy New monitor-cron-health Function

```bash
supabase functions deploy monitor-cron-health
```

**What it does:**
- Calls `check_daily_cron_execution()` SQL function
- Sends email alert if status is 'warning'
- Returns detailed health status via API
- Configurable via environment variables

---

## ⚙️ Configuration

### Environment Variables

Configure the following in Supabase Dashboard > Edge Functions > Settings:

#### Required Variables

```bash
# Admin email for alerts
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai

# Email sender address
supabase secrets set EMAIL_FROM=alertas@nautilus.ai

# Resend API key for sending emails
supabase secrets set RESEND_API_KEY=re_your_api_key

# Supabase credentials (usually auto-set)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Verify Configuration

```bash
# List all secrets
supabase secrets list

# Expected output:
# ADMIN_EMAIL
# EMAIL_FROM
# RESEND_API_KEY
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

### Cron Schedule Configuration

#### Schedule Daily Report (Daily at 8 AM UTC)

In Supabase Dashboard > Database > Cron Jobs:

```sql
SELECT cron.schedule(
  'daily-assistant-report',
  '0 8 * * *',  -- Daily at 8 AM UTC
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-daily-assistant-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

#### Schedule Health Monitor (Every 12 Hours)

```sql
SELECT cron.schedule(
  'monitor-cron-health',
  '0 */12 * * *',  -- Every 12 hours
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/monitor-cron-health',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

**Important:** Replace `your-project` and `YOUR_ANON_KEY` with your actual values.

---

## 🧪 Testing

### Manual Testing

#### Test Daily Report Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 15,
  "recipient": "admin@nautilus.ai",
  "emailSent": true
}
```

#### Test Health Monitor Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Expected Healthy Response:**
```json
{
  "success": true,
  "status": "ok",
  "message": "Last execution was 5.2 hours ago at 2025-10-12 08:00:00",
  "lastExecution": "2025-10-12T08:00:00.000Z",
  "alertSent": false
}
```

**Expected Warning Response:**
```json
{
  "success": true,
  "status": "warning",
  "message": "Last execution was 48.5 hours ago at 2025-10-10 08:00:00",
  "lastExecution": "2025-10-10T08:00:00.000Z",
  "alertSent": true
}
```

### Database Testing

#### Verify Logs Are Being Created

```sql
-- Check recent executions
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;

-- Should see entries with:
-- function_name: 'send-assistant-report-daily'
-- status: 'success' or 'error'
-- executed_at: Recent timestamps
```

#### Test Health Check Function

```sql
-- Manually call health check function
SELECT * FROM check_daily_cron_execution();

-- Expected output:
-- status | message                          | last_execution
-- -------|----------------------------------|-------------------
-- ok     | Last execution was 5.2 hours ago | 2025-10-12 08:00:00
```

#### Test Success Rate Calculation

```sql
-- Calculate success rate for last 30 days
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status='success') as success_count,
  COUNT(*) FILTER (WHERE status='error') as error_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status='success') / COUNT(*), 2) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days';

-- Should return reasonable values:
-- total > 0
-- success_rate ideally > 95%
```

---

## 📊 Monitoring

### View Execution History

```sql
-- Recent executions
SELECT 
  function_name,
  status,
  message,
  executed_at,
  EXTRACT(EPOCH FROM (NOW() - executed_at))/3600 as hours_ago
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 20;
```

### Check Success Rate by Day

```sql
-- Daily success rate
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status='success') as successful,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status='success') / COUNT(*), 2) as rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

### Find Failed Executions

```sql
-- Failed executions with error details
SELECT 
  function_name,
  message,
  error_details,
  executed_at
FROM cron_execution_logs
WHERE status = 'error'
  AND executed_at >= NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;
```

### Monitor Execution Gaps

```sql
-- Find gaps > 30 hours between executions
WITH execution_gaps AS (
  SELECT 
    executed_at,
    LAG(executed_at) OVER (ORDER BY executed_at) as prev_execution,
    EXTRACT(EPOCH FROM (executed_at - LAG(executed_at) OVER (ORDER BY executed_at)))/3600 as gap_hours
  FROM cron_execution_logs
  WHERE function_name = 'send-assistant-report-daily'
    AND status = 'success'
)
SELECT * FROM execution_gaps
WHERE gap_hours > 30
ORDER BY executed_at DESC;
```

---

## 🐛 Troubleshooting

### Issue: No Logs Being Created

**Symptoms:**
- `cron_execution_logs` table is empty
- Manual function test works but no logs appear

**Solutions:**

1. **Check RLS Policies**
   ```sql
   -- Verify policies exist
   SELECT * FROM pg_policies 
   WHERE tablename = 'cron_execution_logs';
   ```

2. **Verify Service Role Permissions**
   ```sql
   -- Test insert as service role
   INSERT INTO cron_execution_logs (function_name, status, message)
   VALUES ('test', 'success', 'Test log');
   ```

3. **Check Function Logs**
   ```bash
   supabase functions logs send-daily-assistant-report --follow
   ```

### Issue: Health Alerts Not Sending

**Symptoms:**
- Status is 'warning' but no email received
- Health monitor runs but no alerts

**Solutions:**

1. **Verify RESEND_API_KEY**
   ```bash
   supabase secrets list | grep RESEND
   ```

2. **Test Resend API Directly**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_RESEND_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@nautilus.ai",
       "to": "admin@nautilus.ai",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

3. **Check Monitor Function Logs**
   ```bash
   supabase functions logs monitor-cron-health
   ```

### Issue: Cron Jobs Not Running

**Symptoms:**
- Manual tests work but scheduled cron doesn't run
- No new logs appearing at scheduled times

**Solutions:**

1. **Verify Cron Schedule**
   ```sql
   SELECT * FROM cron.job;
   ```

2. **Check Cron Run History**
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 10;
   ```

3. **Verify Timezone**
   ```sql
   SELECT NOW(), NOW() AT TIME ZONE 'UTC';
   -- Cron uses UTC timezone
   ```

### Issue: High Error Rate

**Symptoms:**
- Many 'error' status entries in logs
- Functions failing frequently

**Solutions:**

1. **Analyze Error Patterns**
   ```sql
   SELECT 
     error_details->>'error' as error_message,
     COUNT(*) as occurrences
   FROM cron_execution_logs
   WHERE status = 'error'
     AND executed_at >= NOW() - INTERVAL '7 days'
   GROUP BY error_details->>'error'
   ORDER BY occurrences DESC;
   ```

2. **Check Environment Variables**
   ```bash
   supabase secrets list
   ```

3. **Test Dependencies**
   - Verify Resend API is working
   - Check database connectivity
   - Verify table permissions

---

## 🔒 Security

### Row Level Security (RLS)

The system uses RLS to protect sensitive execution data:

#### Insert Policy (Service Role Only)
```sql
CREATE POLICY "Service role can insert execution logs"
  ON cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

**Purpose:** Only edge functions (using service role) can create logs.

#### Select Policy (Admins Only)
```sql
CREATE POLICY "Admins can view all execution logs"
  ON cron_execution_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Purpose:** Only users with admin role can view logs.

### API Key Protection

- ✅ Use Supabase Secrets for API keys (never hardcode)
- ✅ Rotate API keys regularly (every 90 days)
- ✅ Use separate keys for dev/staging/production
- ✅ Monitor API key usage in Resend dashboard

### Error Information

The system logs error details but sanitizes sensitive data:

```typescript
error_details: error ? {
  error: error.message || String(error),
  stack: error.stack  // Stack trace for debugging
} : null
```

**Note:** Sensitive data (passwords, tokens) should never appear in error messages.

---

## 📈 Performance Optimization

### Index Usage

Three indexes ensure fast queries:

1. **executed_at (DESC)** - Fast time-based queries
2. **function_name** - Fast filtering by function
3. **status** - Fast status filtering

### Query Optimization Tips

```sql
-- ✅ GOOD: Uses index
SELECT * FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;

-- ✅ GOOD: Uses index
SELECT * FROM cron_execution_logs
WHERE function_name = 'send-assistant-report-daily'
AND status = 'success';

-- ❌ AVOID: Full table scan
SELECT * FROM cron_execution_logs
WHERE message LIKE '%error%';
```

### Data Retention

Consider implementing data retention policy:

```sql
-- Delete logs older than 90 days
DELETE FROM cron_execution_logs
WHERE executed_at < NOW() - INTERVAL '90 days';

-- Or archive them
INSERT INTO cron_execution_logs_archive
SELECT * FROM cron_execution_logs
WHERE executed_at < NOW() - INTERVAL '90 days';
```

---

## 🚀 Next Steps

After successful installation:

1. ✅ Monitor logs for first 24 hours
2. ✅ Verify email alerts are received
3. ✅ Set up data retention policy
4. ✅ Create dashboard for visual monitoring (optional)
5. ✅ Add more cron functions to monitoring (optional)

---

## 📞 Support

For issues or questions:
- Check [Quick Reference](CRON_MONITORING_QUICKREF.md)
- Review [Visual Guide](CRON_MONITORING_VISUAL.md)
- Check function logs in Supabase Dashboard
- Query `cron_execution_logs` table

---

**Guide Version:** 1.0.0  
**Last Updated:** October 12, 2025  
**Status:** Production Ready ✅
