# 🔧 Cron Monitoring - Technical Implementation Details

## API Reference

### SQL Function: check_daily_cron_execution()

**Purpose**: Checks if send-daily-assistant-report has executed successfully within the last 36 hours

**Signature**:
```sql
check_daily_cron_execution() RETURNS TABLE(status TEXT, message TEXT)
```

**Parameters**: None

**Returns**:
| Field | Type | Description |
|-------|------|-------------|
| status | TEXT | Either 'ok' or 'warning' |
| message | TEXT | Human-readable status message |

**Examples**:

Success case:
```sql
SELECT * FROM check_daily_cron_execution();
-- Returns:
-- status | message
-- -------+------------------------------------------------------
-- ok     | Cron executado normalmente. Última execução há 2.5 horas
```

Warning case:
```sql
SELECT * FROM check_daily_cron_execution();
-- Returns:
-- status  | message
-- --------+------------------------------------------------------
-- warning | Última execução há 48.0 horas. Última execução: 11/10/2024 08:00:00
```

**Logic**:
1. Query `cron_execution_logs` for most recent successful execution
2. If no executions found → return 'warning'
3. Calculate hours since last execution
4. If >36 hours → return 'warning' with details
5. Otherwise → return 'ok' with hours since last execution

**Performance**: <5ms (uses optimized index on function_name and executed_at)

**Security**: 
- SECURITY DEFINER (runs with creator's privileges)
- Granted to authenticated and service_role
- RLS still applies to underlying table access

---

### Edge Function: send-daily-assistant-report

**Endpoint**: `POST /functions/v1/send-daily-assistant-report`

**Authentication**: Requires valid Supabase JWT (anon or service role key)

**Request**: No body required

**Response** (Success):
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@nautilus.ai",
  "emailSent": true
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Failed to fetch logs: <error message>"
}
```

**Environment Variables**:
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| ADMIN_EMAIL | Yes | - | Email address for reports |
| RESEND_API_KEY | Yes* | - | Resend API key for sending emails |
| SENDGRID_API_KEY | Yes* | - | SendGrid API key (alternative) |
| EMAIL_FROM | No | noreply@nautilusone.com | From email address |
| SUPABASE_URL | Auto | - | Project URL |
| SUPABASE_SERVICE_ROLE_KEY | Auto | - | Service role key |

*Either RESEND_API_KEY or SENDGRID_API_KEY required

**Logging Points**:

1. **Success** - After email sent successfully
```typescript
await logCronExecution(
  supabase, 
  "success", 
  `Report sent successfully to ${ADMIN_EMAIL}`
);
```

2. **Error** - On log fetch failure
```typescript
await logCronExecution(
  supabase, 
  "error", 
  "Failed to fetch assistant logs", 
  logsError
);
```

3. **Error** - On email send failure
```typescript
await logCronExecution(
  supabase, 
  "error", 
  "Failed to send email", 
  emailError
);
```

4. **Critical** - On general exception
```typescript
await logCronExecution(
  supabase, 
  "critical", 
  "Critical error in function", 
  error
);
```

**Email Attachments**: CSV file with assistant logs from last 24 hours

---

### Edge Function: monitor-cron-health

**Endpoint**: `POST /functions/v1/monitor-cron-health`

**Authentication**: Requires valid Supabase JWT (anon or service role key)

**Request**: No body required

**Response** (Cron OK):
```
✅ Cron executado normalmente.
```
HTTP Status: 200

**Response** (Cron Warning - Alert Sent):
```
⚠️ Alerta enviado com sucesso
```
HTTP Status: 200

**Response** (Error):
```
Erro na verificação.
```
HTTP Status: 500

**Environment Variables**:
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| ADMIN_EMAIL | Yes | admin@nautilus.ai | Email for alerts |
| RESEND_API_KEY | Yes | - | Resend API key |
| EMAIL_FROM | No | alertas@nautilus.ai | From email address |
| SUPABASE_URL | Auto | - | Project URL |
| SUPABASE_SERVICE_ROLE_KEY | Auto | - | Service role key |

**Alert Email Template**:
```html
<h2>⚠️ Alerta de Monitoramento</h2>
<p>O cron <strong>send-assistant-report-daily</strong> não foi executado nas últimas 36 horas.</p>
<p><strong>Detalhes:</strong> [message from SQL function]</p>
<p><strong>Ação requerida:</strong> Revisar logs no painel <code>/admin/reports/assistant</code></p>
<hr>
<p style="color: #666; font-size: 12px;">
  Este é um alerta automático do sistema de monitoramento.<br>
  Função: monitor-cron-health<br>
  Timestamp: [current timestamp]
</p>
```

**Flow**:
1. Call `check_daily_cron_execution()` SQL function
2. If status='ok' → Return success message
3. If status='warning' → Send alert email via Resend
4. Return appropriate response

---

## Database Schema Details

### Table: cron_execution_logs

**Purpose**: Stores all cron job execution records for monitoring and analysis

**Schema**:
```sql
CREATE TABLE public.cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning', 'critical')),
  message TEXT,
  error_details JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Constraints**:
- PRIMARY KEY on `id` (UUID, auto-generated)
- CHECK constraint on `status` (enum: success, error, warning, critical)
- NOT NULL on `function_name`, `status`, `executed_at`, `created_at`

**Indexes**:

1. **idx_cron_execution_logs_executed_at**
   - Columns: `executed_at DESC`
   - Purpose: Fast queries for recent executions
   - Performance: <2ms for LIMIT 10

2. **idx_cron_execution_logs_function_name**
   - Columns: `function_name, executed_at DESC`
   - Purpose: Fast queries for specific function's history
   - Performance: <5ms for function-specific queries

3. **idx_cron_execution_logs_status**
   - Columns: `status, executed_at DESC`
   - Purpose: Fast queries for errors/warnings
   - Performance: <10ms for error analysis

**Row Level Security**:

INSERT Policy:
```sql
CREATE POLICY "Service role can insert cron execution logs"
  ON public.cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

SELECT Policy:
```sql
CREATE POLICY "Admins can view cron execution logs"
  ON public.cron_execution_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
```

**Permissions**:
- `service_role`: Can INSERT (edge functions)
- `authenticated` (admins only): Can SELECT
- `anon`: No access

**Storage Estimates**:

Average row size: ~200 bytes
- 2 executions per day = 730 executions per year
- Storage per year: 730 × 200 bytes = ~146 KB
- Storage for 5 years: ~730 KB

With indexes:
- Total storage (5 years): ~2-3 MB

---

## Helper Functions

### logCronExecution()

**Location**: `supabase/functions/send-daily-assistant-report/index.ts`

**Purpose**: Log cron execution to cron_execution_logs table

**Signature**:
```typescript
async function logCronExecution(
  supabase: any,
  status: 'success' | 'error' | 'warning' | 'critical',
  message: string,
  error: any = null
): Promise<void>
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| supabase | SupabaseClient | Supabase client instance |
| status | enum | Execution status |
| message | string | Human-readable message |
| error | any | Error object (optional) |

**Behavior**:
- Inserts row into `cron_execution_logs` table
- Sets `function_name` to 'send-daily-assistant-report'
- Serializes error to JSON if provided
- Catches and logs any insertion errors (non-blocking)
- Returns void (doesn't throw)

**Example Usage**:
```typescript
// Success logging
await logCronExecution(
  supabase, 
  "success", 
  `Report sent successfully to ${ADMIN_EMAIL}`
);

// Error logging
await logCronExecution(
  supabase, 
  "error", 
  "Failed to send email", 
  emailError
);
```

**Error Handling**: 
- Never throws errors
- Logs to console if insert fails
- Designed to be non-blocking

### logExecution() (Legacy)

**Location**: `supabase/functions/send-daily-assistant-report/index.ts`

**Purpose**: Legacy logging to assistant_report_logs table

**Note**: Maintained for backward compatibility. New code should use both `logCronExecution()` and `logExecution()`.

---

## Scheduling Configuration

### pg_cron Integration

**Extension**: `pg_cron`

**Installation**:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Job Configuration Table**: `cron.job`

**Job Execution Log**: `cron.job_run_details`

### Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, both 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples**:
- `0 8 * * *` - Daily at 8:00 AM
- `0 */12 * * *` - Every 12 hours (00:00, 12:00)
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on 1st at midnight

### Network Extensions

Required for HTTP calls from pg_cron:
```sql
CREATE EXTENSION IF NOT EXISTS http;
-- OR use Supabase's net.http_post wrapper
```

---

## Performance Optimization

### Query Optimization

**Index Strategy**:
1. Primary access pattern: Recent executions → Index on `executed_at DESC`
2. Secondary pattern: Function-specific history → Composite index
3. Tertiary pattern: Error analysis → Status-based index

**Query Performance Benchmarks**:
| Query Type | Expected Time | Index Used |
|------------|---------------|------------|
| Recent 10 executions | <2ms | executed_at |
| Function history (30d) | <5ms | function_name |
| Error rate calculation | <10ms | status |
| check_daily_cron_execution() | <5ms | function_name |

### Scaling Considerations

**Current Scale** (2 executions/day):
- Table size: Minimal (<1 MB/year)
- Query performance: Excellent (<5ms)
- No optimization needed

**High Scale** (100+ executions/day):
- Table size: ~7 MB/year
- Query performance: Still good (<20ms)
- Recommendations:
  - Partition by month: `CREATE TABLE cron_execution_logs_202410 PARTITION OF ...`
  - Archive old data (>90 days)
  - Consider materialized views for analytics

### Data Retention

**Recommended Strategy**:
```sql
-- Archive old data (keep 90 days)
CREATE TABLE cron_execution_logs_archive AS
SELECT * FROM cron_execution_logs 
WHERE executed_at < NOW() - INTERVAL '90 days';

DELETE FROM cron_execution_logs 
WHERE executed_at < NOW() - INTERVAL '90 days';

-- Run monthly via cron
SELECT cron.schedule(
  'archive-cron-logs',
  '0 0 1 * *',  -- Monthly on 1st
  $$ ... archive logic ... $$
);
```

---

## Security Details

### Authentication Flow

```
Edge Function Request
  │
  ├─ With JWT (Authorization header)
  │  ├─ Supabase validates JWT
  │  ├─ Creates client with user context
  │  └─ Service role key bypasses RLS for inserts
  │
  └─ Cron Scheduler (pg_cron)
     ├─ Uses service role key
     └─ Full database access (by design)
```

### RLS Policy Evaluation

**INSERT Operation** (from edge function):
1. Edge function uses service role key
2. RLS policy checks role: `TO service_role`
3. WITH CHECK clause: `true` (always allowed)
4. Result: ✅ INSERT allowed

**SELECT Operation** (from admin dashboard):
1. User authenticated (JWT with user ID)
2. RLS policy checks role: `TO authenticated`
3. USING clause checks: User is admin?
4. Result: ✅ SELECT allowed (if admin), ❌ denied (if not)

### API Key Storage

**Never Hardcode**:
```typescript
// ❌ WRONG
const RESEND_API_KEY = "re_abc123...";

// ✅ CORRECT
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
```

**Setting Secrets**:
```bash
# Local development
echo "RESEND_API_KEY=re_abc123" >> .env

# Production (Supabase)
supabase secrets set RESEND_API_KEY=re_abc123
```

### Error Details Sanitization

**Safe Logging**:
```typescript
// Error object is serialized to JSON
error_details: error ? JSON.stringify(error) : null

// Sensitive data should be stripped before logging
const safeError = {
  message: error.message,
  code: error.code,
  // Don't include: passwords, tokens, full stack traces
};
```

---

## Testing Strategy

### Unit Tests

Location: `src/tests/monitor-cron-health.test.ts`, `src/tests/daily-assistant-report.test.ts`

**Coverage**:
- SQL function return structure
- Status enum validation
- Threshold logic (36 hours)
- CORS headers
- Email content validation

**Example**:
```typescript
it("should return correct status structure", () => {
  const mockOkResponse = {
    status: "ok",
    message: "Cron executado normalmente..."
  };
  
  expect(mockOkResponse.status).toBe("ok");
  expect(mockOkResponse.message).toBeDefined();
});
```

### Integration Tests

**Manual Testing**:
```bash
# Test complete flow
curl -X POST https://PROJECT.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer KEY"

# Verify log was created
psql -c "SELECT * FROM cron_execution_logs ORDER BY executed_at DESC LIMIT 1;"

# Trigger health check
curl -X POST https://PROJECT.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer KEY"
```

### Load Testing

Not required for current scale (2 executions/day), but recommended approach for high-traffic scenarios:

```bash
# Using Apache Bench
ab -n 100 -c 10 https://PROJECT.supabase.co/functions/v1/monitor-cron-health

# Expected results:
# - Requests per second: >50
# - Mean time per request: <200ms
# - No failed requests
```

---

## Monitoring Metrics

### Key Metrics to Track

1. **Execution Success Rate**
   - Target: >99%
   - Alert if: <95% over 7 days

2. **Alert Response Time**
   - Target: <12 hours (detection)
   - Target: <5 minutes (email delivery)

3. **Query Performance**
   - Target: <10ms for all dashboard queries
   - Alert if: >100ms

4. **Storage Growth**
   - Expected: ~146 KB/year
   - Alert if: >10 MB (indicates excessive logging)

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Success Rate | <98% | <95% | Review error logs |
| Detection Time | >24h | >48h | Check monitor schedule |
| Query Time | >50ms | >200ms | Optimize indexes |
| Table Size | >5MB | >50MB | Archive old data |

---

## Disaster Recovery

### Backup Strategy

**Database**:
- Supabase automatic backups (daily)
- Point-in-time recovery available
- `cron_execution_logs` included in backups

**Configuration**:
```bash
# Export secrets (encrypted backup)
supabase secrets list > secrets-backup.txt.gpg

# Export cron jobs
pg_dump -t cron.job -t cron.job_run_details > cron-jobs-backup.sql
```

### Recovery Procedures

**If logs table corrupted**:
```sql
-- Drop and recreate
DROP TABLE IF EXISTS cron_execution_logs CASCADE;
-- Re-run migration
\i supabase/migrations/20251013000000_create_cron_execution_logs.sql
```

**If cron jobs lost**:
```sql
-- Re-run scheduling commands
\i cron-jobs-backup.sql
-- Or manually reschedule using guide
```

**If edge functions down**:
```bash
# Redeploy functions
supabase functions deploy send-daily-assistant-report
supabase functions deploy monitor-cron-health
```

---

## Version History

### v1.0.0 (October 13, 2024)
- Initial implementation
- `cron_execution_logs` table
- `check_daily_cron_execution()` SQL function
- Edge function logging integration
- Email alerting system
- Comprehensive documentation

### Future Enhancements
- [ ] Slack/Discord webhook integration
- [ ] Admin dashboard UI component
- [ ] Automatic retry logic
- [ ] SMS alerts for critical failures
- [ ] Multi-function monitoring support
- [ ] Custom alert thresholds per function

---

**Last Updated**: October 13, 2024  
**Version**: 1.0.0  
**Maintained By**: Development Team
