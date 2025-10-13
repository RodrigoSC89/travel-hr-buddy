# Send Multi-User Restore Reports

## Overview
This Supabase Edge Function sends automated restore summary reports to multiple users individually.

## Features
- ✅ Loops through multiple user emails
- ✅ Calls `get_restore_summary(email_input)` RPC function for each user
- ✅ Generates personalized HTML email with restore statistics
- ✅ Sends individual reports via Resend API

## Usage

### Manual Invocation
```bash
curl -X POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "users": ["ana@empresa.com", "joao@empresa.com", "maria@empresa.com"]
  }'
```

### Response Format
```json
{
  "success": true,
  "message": "Multi-user reports processed",
  "results": [
    {
      "email": "ana@empresa.com",
      "success": true,
      "summary": {
        "total": 150,
        "unique_docs": 45,
        "avg_per_day": 12.5
      }
    },
    {
      "email": "joao@empresa.com",
      "success": true,
      "summary": {
        "total": 89,
        "unique_docs": 32,
        "avg_per_day": 7.4
      }
    }
  ],
  "total_users": 2,
  "successful": 2,
  "failed": 0
}
```

## Scheduled Execution (pg_cron)

To schedule this function to run daily at 8 AM UTC:

```sql
-- Schedule multi-user restore reports
SELECT cron.schedule(
  'send-multi-user-restore-reports',
  '0 8 * * *',  -- 8:00 AM UTC daily
  $$
    SELECT
      net.http_post(
        url := 'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := jsonb_build_object(
          'users', ARRAY['ana@empresa.com', 'joao@empresa.com', 'maria@empresa.com']
        )
      ) AS request_id;
  $$
);
```

## Environment Variables Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `RESEND_API_KEY` - Resend API key for sending emails
- `EMAIL_FROM` - (Optional) Sender email address (default: relatorios@nautilus.ai)

## Email Template
The function sends a beautifully formatted HTML email with:
- Header with gradient background
- User's email greeting
- Three main statistics:
  - Total de Restaurações
  - Documentos Únicos
  - Média por Dia
- Footer with timestamp

## Integration with get_restore_summary
This function uses the existing Supabase RPC function:
```sql
SELECT * FROM get_restore_summary('user@example.com');
```

Returns:
- `total` - Total number of restore operations
- `unique_docs` - Number of unique documents restored
- `avg_per_day` - Average restores per day

## Error Handling
- If a user's summary fails to fetch, the error is logged and the function continues with other users
- Final response includes both successful and failed attempts
- Each user result includes success status and error details if applicable
