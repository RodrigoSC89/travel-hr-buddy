# Assistant Report Logs - Quick Reference

## 📊 Table: `assistant_report_logs`

Tracks all attempts to send assistant AI report emails.

### Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | User who triggered the report (FK to auth.users) |
| `user_email` | TEXT | Email of the user |
| `status` | TEXT | `success` or `error` |
| `sent_at` | TIMESTAMPTZ | When the attempt was made (auto-generated) |
| `message` | TEXT | Human-readable status message |

### Indexes

- `idx_assistant_report_logs_user_id` on `user_id`
- `idx_assistant_report_logs_sent_at` on `sent_at DESC`
- `idx_assistant_report_logs_status` on `status`

### RLS Policies

- ✅ Users can insert their own logs
- ✅ Users can view their own logs
- ✅ Admin users can view all logs

## 🔌 API: `/functions/v1/send-assistant-report`

### Request

**Method**: `POST`

**Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "question": "User question",
      "answer": "AI response",
      "created_at": "2025-10-12T18:56:00Z",
      "user_email": "user@example.com"
    }
  ],
  "toEmail": "recipient@example.com",  // optional
  "subject": "Custom Subject"          // optional
}
```

### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Relatório preparado com sucesso. Configure um serviço de email para envio real.",
  "recipient": "recipient@example.com",
  "subject": "📜 Relatório do Assistente IA - 12/10/2025",
  "logsCount": 5,
  "timestamp": "2025-10-12T18:56:00Z",
  "note": "Para completar esta funcionalidade, integre com SendGrid, Mailgun, AWS SES, ou configure SMTP em produção"
}
```

**Error - Not Authenticated (401)**:
```json
{
  "error": "Não autenticado"
}
```

**Error - No Data (400)**:
```json
{
  "error": "Nenhum dado para enviar."
}
```

**Error - Server Error (500)**:
```json
{
  "error": "An error occurred while sending the report",
  "details": "Error: ..."
}
```

## 📝 Logging Behavior

### Success Case
When a report is successfully prepared:
```sql
INSERT INTO assistant_report_logs (
  user_id, 
  user_email, 
  status, 
  message
) VALUES (
  'user-uuid',
  'user@example.com',
  'success',
  'Enviado com sucesso'
);
```

### Error Cases

#### No Data to Send
```sql
INSERT INTO assistant_report_logs (
  user_id, 
  user_email, 
  status, 
  message
) VALUES (
  'user-uuid',
  'user@example.com',
  'error',
  'Nenhum dado para enviar.'
);
```

#### Unexpected Error
```sql
INSERT INTO assistant_report_logs (
  user_id, 
  user_email, 
  status, 
  message
) VALUES (
  'user-uuid',
  'user@example.com',
  'error',
  'An error occurred while sending the report'
);
```

## 📊 Monitoring Queries

### View Recent Activity
```sql
SELECT 
  user_email,
  status,
  message,
  sent_at
FROM assistant_report_logs
ORDER BY sent_at DESC
LIMIT 50;
```

### Success Rate by User
```sql
SELECT 
  user_email,
  COUNT(*) FILTER (WHERE status = 'success') as success_count,
  COUNT(*) FILTER (WHERE status = 'error') as error_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM assistant_report_logs
GROUP BY user_email
ORDER BY COUNT(*) DESC;
```

### Daily Activity
```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'error') as errors
FROM assistant_report_logs
WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

### Error Analysis
```sql
SELECT 
  message,
  COUNT(*) as occurrences,
  MAX(sent_at) as last_occurrence
FROM assistant_report_logs
WHERE status = 'error'
GROUP BY message
ORDER BY occurrences DESC;
```

## 🔧 Frontend Usage Example

```typescript
import { supabase } from "@/lib/supabase";

async function sendAssistantReport(logs: AssistantLog[]) {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Not authenticated");
    }

    // Call edge function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-assistant-report`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logs,
          toEmail: "admin@example.com", // optional
          subject: "Monthly AI Report",  // optional
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send report");
    }

    const result = await response.json();
    console.log("Report sent:", result);
    return result;
    
  } catch (error) {
    console.error("Error sending report:", error);
    throw error;
  }
}
```

## 🎯 Admin Dashboard Query

View logs for all users (admin only):
```typescript
const { data: logs, error } = await supabase
  .from("assistant_report_logs")
  .select("*")
  .order("sent_at", { ascending: false })
  .limit(100);
```

View logs for current user:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: logs, error } = await supabase
  .from("assistant_report_logs")
  .select("*")
  .eq("user_id", user.id)
  .order("sent_at", { ascending: false })
  .limit(50);
```

## 🚀 Deployment Checklist

- [x] Migration applied: `20251012185605_create_assistant_report_logs.sql`
- [x] Edge function updated: `send-assistant-report/index.ts`
- [x] RLS policies configured
- [x] Indexes created for performance
- [ ] Email service integration (optional - for actual email sending)
- [ ] Frontend UI for viewing logs (optional)
- [ ] Monitoring dashboard (optional)

## 📚 Related Documentation

- [RESTORE_REPORT_LOGS_IMPLEMENTATION.md](./RESTORE_REPORT_LOGS_IMPLEMENTATION.md) - Similar implementation for restore reports
- [ASSISTANT_LOGS_API_IMPLEMENTATION.md](./ASSISTANT_LOGS_API_IMPLEMENTATION.md) - Assistant logs API documentation
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
