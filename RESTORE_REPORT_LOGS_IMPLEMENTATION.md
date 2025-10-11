# Restore Report Logs Implementation

## 📋 Overview

This implementation adds comprehensive logging to the `daily-restore-report` Supabase Edge Function, tracking all execution attempts in the `restore_report_logs` table.

## ✅ Implementation Summary

### 1. Database Table: `restore_report_logs`

**Migration File**: `supabase/migrations/20251011185116_create_restore_report_logs.sql`

**Table Schema**:
```sql
create table restore_report_logs (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz default now(),
  status text not null,
  message text,
  error_details text,
  triggered_by text default 'automated'
);
```

**Features**:
- ✅ UUID primary key with automatic generation
- ✅ Automatic timestamp on execution
- ✅ Status tracking (success/error/critical)
- ✅ Human-readable message field
- ✅ JSON error details for debugging
- ✅ Trigger source tracking (automated/manual)
- ✅ Indexes for performance (executed_at, status)
- ✅ Row-Level Security (RLS) enabled
- ✅ Service role can insert logs
- ✅ Admin users can view logs

### 2. Logging Function

**Location**: `supabase/functions/daily-restore-report/index.ts`

**Function**: `logExecution(supabase, status, message, error)`

```typescript
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
) {
  try {
    await supabase.from("restore_report_logs").insert({
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    });
  } catch (logError) {
    console.error("Failed to log execution:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}
```

**Key Features**:
- Accepts supabase client, status, message, and optional error
- Serializes error objects to JSON
- Graceful error handling (doesn't break main flow)
- Always sets `triggered_by` to "automated"

### 3. Logging Points

The Edge Function now logs at these critical points:

#### ✅ Success
- **When**: Email report sent successfully
- **Status**: `success`
- **Message**: "Relatório enviado com sucesso."
- **Location**: After successful email sending

#### ❌ Data Fetch Error
- **When**: Failed to fetch restore data from Supabase
- **Status**: `error`
- **Message**: "Failed to fetch restore data"
- **Error Details**: Full Supabase error object
- **Location**: In data fetching error handler

#### ❌ Email Sending Error
- **When**: Email API returns non-OK status
- **Status**: `error`
- **Message**: "Falha no envio do e-mail"
- **Error Details**: API error response text
- **Location**: In sendEmailViaAPI function

#### 🔴 Critical Error
- **When**: Unhandled exception in main try-catch
- **Status**: `critical`
- **Message**: "Erro crítico na função"
- **Error Details**: Full error object
- **Location**: Main catch block

## 📊 Usage Examples

### View Recent Executions
```sql
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

### Count by Status
```sql
SELECT status, COUNT(*) 
FROM restore_report_logs 
GROUP BY status;
```

### View Errors Only
```sql
SELECT 
  executed_at,
  status,
  message,
  error_details
FROM restore_report_logs 
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

### Success Rate Last 30 Days
```sql
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status IN ('error', 'critical')) as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

## 🔒 Security

### Row-Level Security (RLS)
- **Insert**: Service role only (Edge Function can write logs)
- **Select**: Admin users only (via profiles.role = 'admin')

### Policies
1. **Service role can insert logs**: Allows the Edge Function to write logs
2. **Admin users can view logs**: Restricts viewing to authenticated admin users

## 📁 Files Changed

1. **`supabase/migrations/20251011185116_create_restore_report_logs.sql`** (NEW)
   - Creates the restore_report_logs table
   - Adds indexes for performance
   - Sets up RLS policies

2. **`supabase/functions/daily-restore-report/index.ts`** (MODIFIED)
   - Added logExecution helper function
   - Added logging at success point
   - Added logging at error points (data fetch, email send)
   - Added logging at critical error point
   - Updated sendEmailViaAPI to accept supabase client

3. **`supabase/functions/daily-restore-report/README.md`** (MODIFIED)
   - Added execution logging section
   - Added monitoring queries
   - Documented log statuses and fields

## 🧪 Testing

### Manual Test of Edge Function
```bash
# Test the function
curl -X POST \
  https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Verify Logs Were Created
```sql
-- Should show a log entry for the test run
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 1;
```

## 🚀 Deployment

### 1. Run Migration
```bash
# Apply the migration to create the table
supabase db push

# Or if using Supabase Studio:
# Go to SQL Editor and run the migration file
```

### 2. Deploy Edge Function
```bash
# Deploy the updated function
supabase functions deploy daily-restore-report
```

### 3. Verify Deployment
```bash
# Check function is deployed
supabase functions list

# View function logs
supabase functions logs daily-restore-report
```

## 📈 Expected Results

After implementation, the `restore_report_logs` table will contain:

| Column | Example Value |
|--------|--------------|
| id | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| executed_at | `2025-10-11 18:51:16.820+00` |
| status | `success` |
| message | `Relatório enviado com sucesso.` |
| error_details | `null` |
| triggered_by | `automated` |

For errors:

| Column | Example Value |
|--------|--------------|
| status | `error` |
| message | `Falha no envio do e-mail` |
| error_details | `{"statusCode": 500, "message": "SMTP connection failed"}` |

## ✨ Benefits

1. **Observability**: Full visibility into function execution history
2. **Debugging**: Error details captured for troubleshooting
3. **Reliability Tracking**: Success rate monitoring over time
4. **Alerting**: Can build alerts based on error logs
5. **Audit Trail**: Complete history of automated report generation
6. **Performance**: Indexed for fast queries on common patterns

## 🎯 Compliance with Requirements

This implementation fully satisfies the problem statement requirements:

- ✅ Created `restore_report_logs` table with all required columns
- ✅ Added `logExecution` helper function
- ✅ Logs success when report is sent
- ✅ Logs error when email sending fails
- ✅ Logs critical error for general failures
- ✅ Uses Portuguese messages as specified
- ✅ Stores error details as JSON
- ✅ Sets `triggered_by` to "automated"
