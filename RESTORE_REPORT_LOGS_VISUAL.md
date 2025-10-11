# Restore Report Logs - Visual Flow Diagram

## 🔄 Execution Flow with Logging Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Daily Restore Report                      │
│                   Supabase Edge Function                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Function Start │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Create Supabase │
                    │     Client      │
                    └─────────────────┘
                              │
                              ▼
        ╔═════════════════════════════════════════╗
        ║         TRY BLOCK (Main Logic)          ║
        ╚═════════════════════════════════════════╝
                              │
                              ▼
                    ┌─────────────────┐
                    │  Fetch Restore  │
                    │      Data       │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────┐        ┌──────────┐
            │ Success  │        │  Error   │
            └──────────┘        └──────────┘
                    │                   │
                    │                   ▼
                    │           ╔═══════════════════╗
                    │           ║ 📝 LOG: "error"   ║
                    │           ║ Message:          ║
                    │           ║ "Failed to fetch  ║
                    │           ║  restore data"    ║
                    │           ╚═══════════════════╝
                    │                   │
                    │                   ▼
                    │           ┌──────────┐
                    │           │  Throw   │
                    │           │  Error   │
                    │           └──────────┘
                    │                   │
                    ▼                   │
            ┌──────────────┐            │
            │ Fetch Summary│            │
            │     Data     │            │
            └──────────────┘            │
                    │                   │
                    ▼                   │
            ┌──────────────┐            │
            │  Generate    │            │
            │  Email HTML  │            │
            └──────────────┘            │
                    │                   │
                    ▼                   │
            ┌──────────────┐            │
            │ Send Email   │            │
            │   via API    │            │
            └──────────────┘            │
                    │                   │
        ┌───────────┴───────────┐       │
        │                       │       │
        ▼                       ▼       │
  ┌──────────┐          ┌──────────┐   │
  │ Success  │          │  Error   │   │
  └──────────┘          └──────────┘   │
        │                       │       │
        │                       ▼       │
        │               ╔═══════════════════╗
        │               ║ 📝 LOG: "error"   ║
        │               ║ Message:          ║
        │               ║ "Falha no envio   ║
        │               ║  do e-mail"       ║
        │               ╚═══════════════════╝
        │                       │       │
        │                       ▼       │
        │               ┌──────────┐   │
        │               │  Throw   │   │
        │               │  Error   │   │
        │               └──────────┘   │
        │                       │       │
        ▼                       │       │
╔═══════════════════╗           │       │
║ 📝 LOG: "success" ║           │       │
║ Message:          ║           │       │
║ "Relatório        ║           │       │
║  enviado com      ║           │       │
║  sucesso."        ║           │       │
╚═══════════════════╝           │       │
        │                       │       │
        ▼                       │       │
┌──────────────┐                │       │
│Return Success│                │       │
│   Response   │                │       │
└──────────────┘                │       │
        │                       │       │
        │                       │       │
        └───────────────────────┼───────┘
                                │
                                ▼
        ╔═══════════════════════════════════════╗
        ║       CATCH BLOCK (Error Handler)     ║
        ╚═══════════════════════════════════════╝
                                │
                                ▼
                        ╔═══════════════════╗
                        ║ 📝 LOG: "error"   ║
                        ║ Message:          ║
                        ║ "Erro crítico     ║
                        ║  na função"       ║
                        ╚═══════════════════╝
                                │
                                ▼
                        ┌──────────────┐
                        │Return Error  │
                        │   Response   │
                        └──────────────┘
```

## 📊 Log Status Breakdown

### ✅ Success (status: "success")
**Trigger**: Email report sent successfully  
**Message**: "Relatório enviado com sucesso."  
**Error Details**: null  
**Triggered By**: automated  

**When This Happens**:
- Data fetched successfully from Supabase
- Email API call returned OK status
- Report was successfully delivered

---

### ❌ Error (status: "error")

#### Error Type 1: Data Fetch Failure
**Trigger**: Failed to fetch restore data from Supabase  
**Message**: "Failed to fetch restore data"  
**Error Details**: JSON with Supabase error object  
**Triggered By**: automated  

**When This Happens**:
- Database connection issues
- RPC function doesn't exist
- Permission issues
- Invalid query

#### Error Type 2: Email Send Failure
**Trigger**: Email API returned non-OK status  
**Message**: "Falha no envio do e-mail"  
**Error Details**: Text from email API error response  
**Triggered By**: automated  

**When This Happens**:
- SMTP connection failed
- Invalid email address
- Email service down
- Authentication failed
- Rate limit exceeded

---

### ⚪ Pending (status: "pending")
**Note**: This status is included in the schema but not currently used by the Edge Function. It's reserved for future enhancements like queued or scheduled reports.

---

## 🗄️ Database Table Structure

```sql
restore_report_logs
├── id              (uuid, primary key)
├── executed_at     (timestamptz, default: now())
├── status          (text, not null, check in ('success', 'error', 'pending'))
│   ├── "success"
│   ├── "error"
│   └── "pending"
├── message         (text, nullable)
├── error_details   (text, nullable, JSON string)
└── triggered_by    (text, default: 'automated')
```

**Indexes**:
- `idx_restore_report_logs_executed_at` on `executed_at DESC`
- `idx_restore_report_logs_status` on `status`

**Row-Level Security (RLS)**:
- ✅ Enabled
- Insert: Service role only
- Select: Admin users only

---

## 📈 Monitoring Queries

### Recent Activity (Last 10 runs)
```sql
SELECT 
  executed_at,
  status,
  message,
  CASE 
    WHEN error_details IS NOT NULL 
    THEN LEFT(error_details, 100) || '...'
    ELSE NULL
  END as error_summary
FROM restore_report_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Success Rate (Last 30 days)
```sql
SELECT 
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate_pct
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '30 days';
```

### Daily Success Rate
```sql
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success,
  COUNT(*) FILTER (WHERE status = 'error') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_pct
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

### Error Patterns
```sql
SELECT 
  message,
  COUNT(*) as occurrences,
  MAX(executed_at) as last_occurrence
FROM restore_report_logs
WHERE status = 'error'
GROUP BY message
ORDER BY occurrences DESC;
```

### Latest Error Details
```sql
SELECT 
  executed_at,
  status,
  message,
  error_details
FROM restore_report_logs
WHERE status = 'error'
ORDER BY executed_at DESC
LIMIT 5;
```

---

## 🚀 Deployment Checklist

- [x] Migration file created: `20251011185116_create_restore_report_logs.sql`
- [x] Edge Function updated with logging
- [x] README documentation updated
- [ ] Migration applied to Supabase database (`supabase db push`)
- [ ] Edge Function deployed (`supabase functions deploy daily-restore-report`)
- [ ] Test execution verified
- [ ] Check first log entry in database
- [ ] Set up monitoring dashboard (optional)
- [ ] Configure alerts for critical errors (optional)

---

## 🎯 Key Benefits

1. **🔍 Full Observability**: Track every execution attempt
2. **🐛 Easy Debugging**: Error details captured in JSON format
3. **📊 Performance Metrics**: Success rate tracking over time
4. **🔔 Alerting Ready**: Can build alerts based on error patterns
5. **📝 Audit Trail**: Complete history of all automated reports
6. **🏃 Non-Blocking**: Logging failures don't break main flow
7. **🔒 Secure**: RLS ensures only admins can view logs
8. **⚡ Fast**: Indexed for quick queries on common patterns

---

## 📱 Example Log Entries

### Success Log
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "executed_at": "2025-10-11T18:51:16.820Z",
  "status": "success",
  "message": "Relatório enviado com sucesso.",
  "error_details": null,
  "triggered_by": "automated"
}
```

### Error Log (Email Failure)
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "executed_at": "2025-10-11T19:15:30.123Z",
  "status": "error",
  "message": "Falha no envio do e-mail",
  "error_details": "{\"statusCode\":500,\"message\":\"SMTP connection timeout\"}",
  "triggered_by": "automated"
}
```

### Error Log (Critical/Unhandled)
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "executed_at": "2025-10-11T20:05:45.789Z",
  "status": "error",
  "message": "Erro crítico na função",
  "error_details": "{\"name\":\"TypeError\",\"message\":\"Cannot read property 'length' of undefined\"}",
  "triggered_by": "automated"
}
```
