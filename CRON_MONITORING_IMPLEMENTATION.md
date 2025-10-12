# 🔧 Cron Monitoring - Implementation Details

Technical specification and implementation details for developers.

## 📋 Table of Contents

1. [Database Schema](#database-schema)
2. [SQL Functions](#sql-functions)
3. [Edge Functions](#edge-functions)
4. [Code Examples](#code-examples)
5. [API Reference](#api-reference)

---

## 🗄️ Database Schema

### Table: cron_execution_logs

Complete schema definition:

```sql
CREATE TABLE cron_execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  message TEXT,
  error_details JSONB,
  executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### Column Specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for each log entry |
| `function_name` | TEXT | NOT NULL | Name of the cron function (e.g., 'send-assistant-report-daily') |
| `status` | TEXT | NOT NULL, CHECK | Execution status: 'success', 'error', or 'warning' |
| `message` | TEXT | NULL | Human-readable status message |
| `error_details` | JSONB | NULL | JSON object with error information |
| `executed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the function executed |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the log entry was created |

#### Indexes

```sql
-- Fast time-based queries
CREATE INDEX idx_cron_execution_logs_executed_at 
  ON cron_execution_logs(executed_at DESC);

-- Fast function filtering
CREATE INDEX idx_cron_execution_logs_function_name 
  ON cron_execution_logs(function_name);

-- Fast status filtering
CREATE INDEX idx_cron_execution_logs_status 
  ON cron_execution_logs(status);
```

**Index Benefits:**
- `executed_at DESC`: O(log n) for recent logs queries
- `function_name`: O(log n) for per-function queries
- `status`: O(log n) for error filtering

#### Row Level Security Policies

```sql
-- Policy 1: Service role can insert
CREATE POLICY "Service role can insert execution logs"
  ON cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 2: Admins can view
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

---

## 🔍 SQL Functions

### Function: check_daily_cron_execution()

Complete function definition:

```sql
CREATE OR REPLACE FUNCTION check_daily_cron_execution()
RETURNS TABLE (
  status TEXT,
  message TEXT,
  last_execution TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_exec_time TIMESTAMPTZ;
  hours_since_exec NUMERIC;
BEGIN
  -- Get the last successful execution
  SELECT executed_at INTO last_exec_time
  FROM cron_execution_logs
  WHERE function_name = 'send-assistant-report-daily'
    AND status = 'success'
  ORDER BY executed_at DESC
  LIMIT 1;

  -- If no execution found, return warning
  IF last_exec_time IS NULL THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      'No successful execution found for send-assistant-report-daily'::TEXT,
      NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Calculate hours since last execution
  hours_since_exec := EXTRACT(EPOCH FROM (NOW() - last_exec_time)) / 3600;

  -- Check if execution is overdue (more than 36 hours)
  IF hours_since_exec > 36 THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      format('Last execution was %s hours ago at %s', 
        ROUND(hours_since_exec::NUMERIC, 2), 
        last_exec_time::TEXT
      )::TEXT,
      last_exec_time;
  ELSE
    RETURN QUERY SELECT 
      'ok'::TEXT,
      format('Last execution was %s hours ago at %s', 
        ROUND(hours_since_exec::NUMERIC, 2), 
        last_exec_time::TEXT
      )::TEXT,
      last_exec_time;
  END IF;
END;
$$;
```

#### Return Type

```typescript
interface HealthCheckResult {
  status: 'ok' | 'warning';
  message: string;
  last_execution: string | null;  // ISO 8601 timestamp
}
```

#### Usage Example

```sql
-- Call function
SELECT * FROM check_daily_cron_execution();

-- Example output when healthy:
-- status | message                                    | last_execution
-- -------|--------------------------------------------|-----------------------
-- ok     | Last execution was 5.23 hours ago at ...  | 2025-10-12 08:00:00+00

-- Example output when overdue:
-- status  | message                                    | last_execution
-- --------|--------------------------------------------|-----------------------
-- warning | Last execution was 48.76 hours ago at ...  | 2025-10-10 08:00:00+00
```

---

## ⚡ Edge Functions

### Function: send-daily-assistant-report

Modified to add cron execution logging.

#### New Helper Function

```typescript
/**
 * Log execution to cron_execution_logs table for monitoring
 */
async function logCronExecution(
  supabase: any,
  functionName: string,
  status: 'success' | 'error' | 'warning',
  message: string,
  error: any = null
) {
  try {
    await supabase.from("cron_execution_logs").insert({
      function_name: functionName,
      status,
      message,
      error_details: error ? {
        error: error.message || String(error),
        stack: error.stack
      } : null,
    });
  } catch (logError) {
    console.error("Failed to log cron execution:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}
```

#### Logging Points

**1. Success - After Email Sent**
```typescript
await logCronExecution(
  supabase,
  "send-assistant-report-daily",
  "success",
  `Report sent successfully to ${ADMIN_EMAIL} with ${logs?.length || 0} logs`
);
```

**2. Error - Log Fetch Failure**
```typescript
if (logsError) {
  await logCronExecution(
    supabase, 
    "send-assistant-report-daily", 
    "error", 
    "Failed to fetch assistant logs", 
    logsError
  );
  throw new Error(`Failed to fetch logs: ${logsError.message}`);
}
```

**3. Error - Email Send Failure**
```typescript
catch (emailError) {
  await logCronExecution(
    supabase, 
    "send-assistant-report-daily", 
    "error", 
    "Failed to send email", 
    emailError
  );
  throw emailError;
}
```

**4. Error - General Exception**
```typescript
catch (error) {
  await logCronExecution(
    supabase, 
    "send-assistant-report-daily", 
    "error", 
    "Critical error in function", 
    error
  );
  // ... error response
}
```

### Function: monitor-cron-health

New function for health monitoring and alerting.

#### Function Structure

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Call health check function
    const { data: healthCheck, error: checkError } = await supabase
      .rpc("check_daily_cron_execution");

    // 2. Extract status
    const status = healthCheck?.[0]?.status || 'error';
    const message = healthCheck?.[0]?.message || 'No data returned';
    const lastExecution = healthCheck?.[0]?.last_execution || null;

    // 3. Send alert if warning
    if (status === 'warning') {
      await sendAlertEmail(...);
    }

    // 4. Return response
    return new Response(JSON.stringify({
      success: true,
      status,
      message,
      lastExecution,
      alertSent: status === 'warning'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    // Error handling
  }
});
```

#### Alert Email Function

```typescript
async function sendAlertEmail(
  toEmail: string,
  functionName: string,
  lastExecution: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "alertas@nautilus.ai",
      to: toEmail,
      subject: "⚠️ Falha na execução do CRON diário",
      html: generateAlertEmailHtml(functionName, lastExecution),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }
}
```

---

## 💻 Code Examples

### Example 1: Query Recent Executions

```typescript
// TypeScript/JavaScript
const { data: logs, error } = await supabase
  .from('cron_execution_logs')
  .select('*')
  .order('executed_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error fetching logs:', error);
} else {
  console.log('Recent executions:', logs);
}
```

### Example 2: Calculate Success Rate

```typescript
// TypeScript/JavaScript
const { data, error } = await supabase
  .rpc('calculate_success_rate', {
    days: 30,
    function_name: 'send-assistant-report-daily'
  });

// Custom SQL function (to be created):
/*
CREATE FUNCTION calculate_success_rate(
  days INTEGER,
  function_name TEXT
)
RETURNS TABLE (
  total BIGINT,
  successful BIGINT,
  failed BIGINT,
  rate NUMERIC
) AS $$
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status='success') as successful,
    COUNT(*) FILTER (WHERE status='error') as failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status='success') / COUNT(*), 2) as rate
  FROM cron_execution_logs
  WHERE executed_at >= NOW() - (days || ' days')::INTERVAL
    AND function_name = function_name;
$$ LANGUAGE SQL;
*/
```

### Example 3: Manual Health Check

```typescript
// TypeScript/JavaScript
const { data, error } = await supabase
  .rpc('check_daily_cron_execution');

if (error) {
  console.error('Health check failed:', error);
} else {
  const { status, message, last_execution } = data[0];
  console.log(`Status: ${status}`);
  console.log(`Message: ${message}`);
  console.log(`Last execution: ${last_execution}`);
}
```

### Example 4: Add Logging to Custom Cron Function

```typescript
// In your custom cron function
async function myCustomCronFunction() {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Your cron logic here
    await doSomething();

    // Log success
    await supabase.from("cron_execution_logs").insert({
      function_name: "my-custom-cron",
      status: "success",
      message: "Custom cron executed successfully",
    });
  } catch (error) {
    // Log error
    await supabase.from("cron_execution_logs").insert({
      function_name: "my-custom-cron",
      status: "error",
      message: "Custom cron failed",
      error_details: {
        error: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
}
```

---

## 📡 API Reference

### POST /functions/v1/monitor-cron-health

Checks cron job health and sends alerts if needed.

#### Request

```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Response (Healthy)

```json
{
  "success": true,
  "status": "ok",
  "message": "Last execution was 5.23 hours ago at 2025-10-12 08:00:00",
  "lastExecution": "2025-10-12T08:00:00.000Z",
  "alertSent": false
}
```

#### Response (Warning)

```json
{
  "success": true,
  "status": "warning",
  "message": "Last execution was 48.76 hours ago at 2025-10-10 08:00:00",
  "lastExecution": "2025-10-10T08:00:00.000Z",
  "alertSent": true
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": "Failed to check cron health: permission denied"
}
```

### POST /functions/v1/send-daily-assistant-report

Sends daily assistant report and logs execution.

#### Request

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Response (Success)

```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 15,
  "recipient": "admin@nautilus.ai",
  "emailSent": true
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": "Failed to fetch logs: permission denied"
}
```

---

## 🔬 Testing

### Unit Test Example (Deno)

```typescript
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("logCronExecution creates log entry", async () => {
  const mockSupabase = {
    from: (table: string) => ({
      insert: async (data: any) => {
        assertEquals(table, "cron_execution_logs");
        assertEquals(data.function_name, "test-function");
        assertEquals(data.status, "success");
        return { data: null, error: null };
      }
    })
  };

  await logCronExecution(
    mockSupabase,
    "test-function",
    "success",
    "Test message"
  );
});
```

### Integration Test Example

```bash
# Test full flow
./test-cron-monitoring.sh

# Contents of test-cron-monitoring.sh:
#!/bin/bash

# 1. Trigger daily report
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer $ANON_KEY"

# 2. Wait a moment
sleep 2

# 3. Check health
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer $ANON_KEY"

# 4. Query logs
psql $DATABASE_URL -c "SELECT * FROM cron_execution_logs ORDER BY executed_at DESC LIMIT 1;"
```

---

## 📊 Performance Considerations

### Query Performance

```sql
-- Optimized query using index
EXPLAIN ANALYZE
SELECT * FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;

-- Expected plan:
-- Index Scan using idx_cron_execution_logs_executed_at
-- Planning time: < 1ms
-- Execution time: < 5ms
```

### Storage Estimates

```sql
-- Estimate storage per row
SELECT pg_column_size(row(
  gen_random_uuid(),
  'send-assistant-report-daily',
  'success',
  'Report sent successfully',
  NULL::JSONB,
  NOW(),
  NOW()
)) as bytes_per_row;

-- Typical result: ~200-300 bytes per row

-- Daily storage: 1 row * 300 bytes = 300 bytes
-- Monthly storage: 30 rows * 300 bytes = 9 KB
-- Yearly storage: 365 rows * 300 bytes = 110 KB
```

---

## 🎯 Best Practices

1. **Always use try-catch** around logging calls
2. **Don't throw errors** from logging functions
3. **Keep messages concise** but informative
4. **Include relevant context** in error_details
5. **Use consistent function_name** values
6. **Monitor storage growth** and implement retention
7. **Test alert emails** before production
8. **Rotate API keys** regularly

---

**Implementation Version:** 1.0.0  
**Last Updated:** October 12, 2025
