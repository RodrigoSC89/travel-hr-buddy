# Send Multi-User Restore Reports

Supabase Edge Function that sends personalized restore summary reports to multiple users via email.

## Features

- **Batch Processing**: Process multiple users in a single request
- **Personalized Reports**: Each user receives their own statistics
- **Email Delivery**: Sends HTML emails via Resend API
- **Error Handling**: Individual error tracking per user
- **Audit Trail**: Logs all operations for debugging

## Environment Variables

Required environment variables:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
RESEND_API_KEY=re_xxx
EMAIL_FROM=relatorios@nautilus.ai  # Optional, defaults to relatorios@nautilus.ai
```

## Request Format

```bash
POST /functions/v1/send-multi-user-restore-reports
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
Content-Type: application/json

{
  "users": [
    "ana@empresa.com",
    "joao@empresa.com",
    "maria@empresa.com"
  ]
}
```

## Response Format

Success (200):
```json
{
  "message": "Processed 3 of 3 users",
  "success": 3,
  "failed": 0,
  "results": [
    {
      "email": "ana@empresa.com",
      "status": "success",
      "summary": {
        "email": "ana@empresa.com",
        "total_restores": 45,
        "unique_documents": 12,
        "avg_per_day": 2.3
      },
      "emailId": "re_abc123"
    }
  ]
}
```

Error (400/500):
```json
{
  "error": "Invalid request: 'users' must be a non-empty array"
}
```

## Usage Example

### Manual Invocation

```bash
curl -X POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "users": ["user1@empresa.com", "user2@empresa.com"]
  }'
```

### Scheduled with pg_cron

```sql
-- Schedule daily at 8 AM UTC
SELECT cron.schedule(
  'send-multi-user-restore-reports-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{"users": ["ana@empresa.com", "joao@empresa.com"]}'::jsonb
    ) AS request_id;
  $$
);

-- Check scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'send-multi-user-restore-reports-daily';

-- Unschedule
SELECT cron.unschedule('send-multi-user-restore-reports-daily');
```

## Email Report Content

Each user receives an HTML email with:

- **Total de Restaurações**: Total number of document restores
- **Documentos Únicos**: Number of unique documents restored
- **Média por Dia**: Average restores per day

The email is styled with a purple gradient header and clean card-based layout.

## Database Requirements

This function depends on the `get_restore_summary` RPC function in Supabase:

```sql
CREATE OR REPLACE FUNCTION get_restore_summary(email_input TEXT)
RETURNS TABLE (
  email TEXT,
  total_restores BIGINT,
  unique_documents BIGINT,
  avg_per_day NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    email_input::TEXT,
    COUNT(*)::BIGINT as total_restores,
    COUNT(DISTINCT document_id)::BIGINT as unique_documents,
    (COUNT(*) / NULLIF(DATE_PART('day', MAX(created_at) - MIN(created_at)) + 1, 0))::NUMERIC as avg_per_day
  FROM document_restore_logs
  WHERE user_email = email_input
  GROUP BY email_input;
END;
$$ LANGUAGE plpgsql;
```

## Error Handling

The function continues processing even if some users fail:

- Individual errors are logged
- Failed users are reported in the `errors` array
- Successful sends are tracked in the `results` array
- Overall status shows success/failed counts

## Security Considerations

- Requires service role authentication
- Per-user data isolation via RPC function
- TLS encrypted email transmission
- Individual error logging prevents info leakage
- No sensitive data in response

## Deployment

```bash
# Deploy the function
supabase functions deploy send-multi-user-restore-reports

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set EMAIL_FROM=relatorios@nautilus.ai

# Test
supabase functions invoke send-multi-user-restore-reports \
  --data '{"users":["test@empresa.com"]}'
```

## Troubleshooting

**No emails received:**
- Check RESEND_API_KEY is valid
- Verify EMAIL_FROM is authorized in Resend
- Check function logs: `supabase functions logs send-multi-user-restore-reports`

**Some users fail:**
- Check the `errors` array in response
- Verify emails exist in `get_restore_summary` results
- Check database permissions

**"get_restore_summary" not found:**
- Ensure the RPC function exists in your database
- Verify function permissions allow service role access
