# 📘 Cron Monitoring System - Complete Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Scheduling](#scheduling)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Overview

This system provides comprehensive monitoring for cron job executions with:
- Automatic execution logging
- Failure detection within 36 hours
- Email alerts to administrators
- Historical tracking and analytics
- Fast query performance (<5ms)

### Components

1. **Database**: `cron_execution_logs` table with optimized indexes
2. **SQL Function**: `check_daily_cron_execution()` for health checks
3. **Edge Functions**:
   - `send-daily-assistant-report` - Main cron job with logging
   - `monitor-cron-health` - Health monitor with email alerts
4. **Scheduler**: pg_cron for automated execution

## Prerequisites

### Required
- ✅ Supabase project (v2.0+)
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Resend account with API key
- ✅ Admin email address

### Optional
- SendGrid account (alternative to Resend)
- PostgreSQL client for direct database access

### Verify Prerequisites

```bash
# Check Supabase CLI
supabase --version
# Should output: supabase 1.x.x or higher

# Check project connection
supabase status
# Should show project URL and status
```

## Installation

### Step 1: Deploy Database Migrations

```bash
# Navigate to project directory
cd /path/to/travel-hr-buddy

# Deploy all migrations
supabase db push

# Verify tables were created
supabase db remote exec "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cron_execution_logs';"
```

Expected output:
```
 tablename
-----------------
 cron_execution_logs
(1 row)
```

### Step 2: Verify SQL Function

```bash
supabase db remote exec "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'check_daily_cron_execution';"
```

Expected output:
```
        routine_name
----------------------------
 check_daily_cron_execution
(1 row)
```

### Step 3: Deploy Edge Functions

```bash
# Deploy send-daily-assistant-report
supabase functions deploy send-daily-assistant-report
# Output: Deployed function send-daily-assistant-report (version: xxx)

# Deploy monitor-cron-health
supabase functions deploy monitor-cron-health
# Output: Deployed function monitor-cron-health (version: xxx)
```

## Configuration

### Step 1: Set Environment Variables

```bash
# Required: Admin email for alerts
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai

# Required: Resend API key for sending emails
supabase secrets set RESEND_API_KEY=re_xxxxx_your_api_key

# Optional: Custom "from" email address
supabase secrets set EMAIL_FROM=alertas@nautilus.ai

# Alternative: SendGrid API key (if not using Resend)
supabase secrets set SENDGRID_API_KEY=SG.xxxxx_your_api_key
```

### Step 2: Verify Secrets

```bash
supabase secrets list
```

Expected output:
```
ADMIN_EMAIL: ad***@nautilus.ai
RESEND_API_KEY: re_***
EMAIL_FROM: al***@nautilus.ai
```

### Step 3: Get Project Credentials

```bash
# Get project URL and keys
supabase status

# You'll need:
# - API URL (for scheduling)
# - Service role key (for cron authentication)
```

## Scheduling

### Enable pg_cron Extension

```sql
-- Run this in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Schedule Daily Report (8 AM UTC)

```sql
SELECT cron.schedule(
  'daily-assistant-report',           -- Job name
  '0 8 * * *',                        -- Cron expression (8 AM daily)
  $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-daily-assistant-report',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb
    ) AS request_id;
  $$
);
```

**Replace:**
- `YOUR_PROJECT_ID` with your Supabase project ID
- `YOUR_SERVICE_ROLE_KEY` with your service role key

### Schedule Health Monitor (Every 12 Hours)

```sql
SELECT cron.schedule(
  'monitor-cron-health',              -- Job name
  '0 */12 * * *',                     -- Cron expression (every 12 hours)
  $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/monitor-cron-health',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb
    ) AS request_id;
  $$
);
```

### Verify Scheduled Jobs

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname IN ('daily-assistant-report', 'monitor-cron-health');
```

Expected output:
```
 jobid |       jobname          |  schedule   | active | command
-------+------------------------+-------------+--------+---------
  123  | daily-assistant-report | 0 8 * * *   |   t    | SELECT...
  124  | monitor-cron-health    | 0 */12 * * *|   t    | SELECT...
```

## Testing

### Manual Function Tests

#### Test Daily Report Function

```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-daily-assistant-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@nautilus.ai",
  "emailSent": true
}
```

#### Test Health Monitor Function

```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/monitor-cron-health" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Expected response (if OK):
```
✅ Cron executado normalmente.
```

Expected response (if warning):
```
⚠️ Alerta enviado com sucesso
```

### Verify Database Logging

```sql
-- Check recent executions
SELECT 
  function_name,
  status,
  message,
  executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 5;
```

Expected output:
```
      function_name          | status  |           message           |      executed_at
-----------------------------+---------+-----------------------------+------------------------
 send-daily-assistant-report | success | Report sent successfully... | 2024-10-13 08:00:00+00
 monitor-cron-health         | success | Health check completed      | 2024-10-13 00:00:00+00
```

### Test SQL Function

```sql
SELECT * FROM check_daily_cron_execution();
```

Expected output (if healthy):
```
 status |                   message
--------+---------------------------------------------
 ok     | Cron executado normalmente. Última execução há 2.5 horas
```

Expected output (if overdue):
```
 status  |                   message
---------+---------------------------------------------
 warning | Última execução há 48.0 horas. Última execução: 11/10/2024 08:00:00
```

## Monitoring

### Dashboard Queries

#### Recent Executions (Last 24 Hours)

```sql
SELECT 
  function_name,
  status,
  message,
  executed_at,
  EXTRACT(EPOCH FROM (NOW() - executed_at))/3600 as hours_ago
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '24 hours'
ORDER BY executed_at DESC;
```

#### Success Rate (Last 30 Days)

```sql
SELECT 
  function_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  ROUND(COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*), 2) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

#### Error Summary

```sql
SELECT 
  function_name,
  status,
  COUNT(*) as count,
  array_agg(message ORDER BY executed_at DESC) FILTER (WHERE message IS NOT NULL) as recent_messages
FROM cron_execution_logs
WHERE status IN ('error', 'critical')
  AND executed_at >= NOW() - INTERVAL '7 days'
GROUP BY function_name, status
ORDER BY count DESC;
```

#### Execution Timeline

```sql
SELECT 
  DATE(executed_at) as date,
  function_name,
  COUNT(*) as executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status != 'success') as failed
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(executed_at), function_name
ORDER BY date DESC, function_name;
```

### Check Cron Job Status

```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View recent job runs
SELECT 
  job_id,
  run_id,
  status,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

## Troubleshooting

### Issue: Cron Not Running

**Symptoms**: No new entries in `cron_execution_logs`

**Diagnosis**:
```sql
-- Check if jobs are scheduled
SELECT * FROM cron.job WHERE active = true;

-- Check recent job runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC LIMIT 5;
```

**Solutions**:
1. Verify job is active: `SELECT * FROM cron.job WHERE jobname = 'daily-assistant-report';`
2. Check service role key is correct
3. Verify edge function is deployed
4. Check Supabase logs for errors

### Issue: Email Not Sending

**Symptoms**: Alert emails not received, monitor-cron-health logs errors

**Diagnosis**:
```bash
# Verify secrets are set
supabase secrets list

# Test email manually
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "alertas@nautilus.ai",
    "to": "admin@nautilus.ai",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

**Solutions**:
1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for failed sends
3. Verify `ADMIN_EMAIL` is correct
4. Check sender domain is verified in Resend

### Issue: No Logs in Database

**Symptoms**: `cron_execution_logs` table is empty

**Diagnosis**:
```sql
-- Verify table exists
\d cron_execution_logs

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cron_execution_logs';

-- Test insert directly
INSERT INTO cron_execution_logs (function_name, status, message)
VALUES ('test', 'success', 'Test message');
```

**Solutions**:
1. Verify migrations were applied: `supabase db remote exec "\d cron_execution_logs"`
2. Check service role has insert permission
3. Verify edge functions are using service role key

### Issue: Performance Degradation

**Symptoms**: Queries taking >100ms

**Diagnosis**:
```sql
-- Check index usage
EXPLAIN ANALYZE 
SELECT * FROM cron_execution_logs 
ORDER BY executed_at DESC LIMIT 10;

-- Check table size
SELECT 
  pg_size_pretty(pg_total_relation_size('cron_execution_logs')) as total_size,
  COUNT(*) as row_count
FROM cron_execution_logs;
```

**Solutions**:
1. Verify indexes exist: `\di cron_execution_logs*`
2. Archive old data (>90 days): 
   ```sql
   DELETE FROM cron_execution_logs 
   WHERE executed_at < NOW() - INTERVAL '90 days';
   ```
3. Run VACUUM: `VACUUM ANALYZE cron_execution_logs;`

### Issue: False Positive Alerts

**Symptoms**: Getting warning emails when cron is running normally

**Diagnosis**:
```sql
-- Check last successful execution
SELECT MAX(executed_at) 
FROM cron_execution_logs 
WHERE function_name = 'send-daily-assistant-report' 
  AND status = 'success';

-- Check current time
SELECT NOW();

-- Calculate hours difference
SELECT EXTRACT(EPOCH FROM (NOW() - MAX(executed_at)))/3600 as hours_ago
FROM cron_execution_logs 
WHERE function_name = 'send-daily-assistant-report' 
  AND status = 'success';
```

**Solutions**:
1. Verify system clocks are synchronized
2. Check if executions are actually failing
3. Adjust 36-hour threshold if needed (edit SQL function)

## Best Practices

### 1. Regular Monitoring
- Check dashboard daily
- Review error logs weekly
- Analyze trends monthly

### 2. Data Retention
```sql
-- Archive old logs (recommended: keep 90 days)
CREATE TABLE cron_execution_logs_archive AS
SELECT * FROM cron_execution_logs 
WHERE executed_at < NOW() - INTERVAL '90 days';

DELETE FROM cron_execution_logs 
WHERE executed_at < NOW() - INTERVAL '90 days';
```

### 3. Alert Configuration
- Set up multiple admin emails for redundancy
- Configure Slack/Discord webhooks for critical alerts
- Test alert delivery monthly

### 4. Security
- Rotate API keys quarterly
- Review RLS policies regularly
- Audit admin access logs

### 5. Documentation
- Keep this guide updated with any customizations
- Document any schedule changes
- Track all configuration changes

## Maintenance

### Monthly Tasks
- [ ] Review success rates
- [ ] Check for recurring errors
- [ ] Archive old logs (>90 days)
- [ ] Test alert delivery
- [ ] Update documentation

### Quarterly Tasks
- [ ] Rotate API keys
- [ ] Review and optimize indexes
- [ ] Audit security policies
- [ ] Performance testing
- [ ] Backup configuration

### Annual Tasks
- [ ] System architecture review
- [ ] Cost-benefit analysis
- [ ] Upgrade dependencies
- [ ] Disaster recovery test

## Support Resources

- **Documentation**: [CRON_MONITORING_INDEX.md](./CRON_MONITORING_INDEX.md)
- **Quick Reference**: [CRON_MONITORING_QUICKREF.md](./CRON_MONITORING_QUICKREF.md)
- **Visual Guide**: [CRON_MONITORING_VISUAL.md](./CRON_MONITORING_VISUAL.md)
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs

---

**Last Updated**: October 13, 2024  
**Version**: 1.0.0  
**Maintenance**: Active
