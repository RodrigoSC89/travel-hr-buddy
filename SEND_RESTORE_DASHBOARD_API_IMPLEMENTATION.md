# Send Restore Dashboard API Implementation

## Overview
This implementation adds an API endpoint to send restore dashboard reports via email with CSV/PDF attachment. The report includes data from the `get_restore_count_by_day_with_email` RPC function.

## Files Created

### 1. Supabase Edge Function (Active Implementation)
**File:** `supabase/functions/send-restore-dashboard/index.ts`

**Endpoint:** `POST /functions/v1/send-restore-dashboard`

**Features:**
- ✅ Accepts email parameter in request body
- ✅ Uses Supabase service role key for database access
- ✅ Calls `get_restore_count_by_day_with_email` RPC function
- ✅ Generates CSV report with restore count data
- ✅ Sends email via Resend or SendGrid API with attachment
- ✅ Supports optional authentication (uses authenticated user's email if no email provided)
- ✅ CORS enabled for frontend access
- ✅ Comprehensive error handling and logging

**Request Format:**
```json
POST /functions/v1/send-restore-dashboard
Content-Type: application/json

{
  "email": "user@example.com"  // Optional - uses authenticated user's email if not provided
}
```

**Response Format:**
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "user@example.com",
  "dataCount": 15
}
```

**Email Content:**
- Subject: "📊 Relatório Diário de Restaurações"
- HTML body with summary and detailed table
- CSV attachment with restore count by day

**Environment Variables Required:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `RESEND_API_KEY` or `SENDGRID_API_KEY` - Email service API key
- `EMAIL_FROM` (optional) - Sender email address (default: dash@empresa.com)

### 2. Next.js API Route (Reference Implementation)
**File:** `app/api/send-restore-dashboard/route.ts`

This is a reference implementation showing how the endpoint would work in a Next.js environment with actual PDF generation using jsPDF. The actual implementation uses the Supabase Edge Function above with CSV format.

**Key differences from Edge Function:**
- Uses jsPDF library for true PDF generation (not available in Deno)
- Uses Next.js server components with cookies for authentication
- Requires additional Node.js packages

## Usage Examples

### 1. Manual Call (Authenticated User)
```typescript
import { supabase } from "@/lib/supabase";

async function sendRestoreDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "recipient@example.com"  // Optional
      })
    }
  );

  const result = await response.json();
  console.log(result);
}
```

### 2. Admin Call with Email Filter
```typescript
async function sendRestoreDashboardFiltered() {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com"
      })
    }
  );

  const result = await response.json();
  console.log(result);
}
```

### 3. Cron Job / Scheduled Task
You can schedule this function to run automatically using Supabase's pg_cron extension:

```sql
-- Run daily at 7:00 AM
SELECT cron.schedule(
  'daily-restore-dashboard-report',
  '0 7 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-restore-dashboard',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY'
      ),
      body := jsonb_build_object(
        'email', 'admin@empresa.com'
      )
    ) as request_id;
  $$
);
```

## Security Features

### Authentication (Optional)
- If no email provided in request body, function attempts to get authenticated user's email
- Supports Authorization header for authenticated requests
- Functions without authentication if email is provided directly

### Data Access
- Uses Supabase service role key for database access
- Bypasses RLS policies for comprehensive data access
- RPC function `get_restore_count_by_day_with_email` filters data based on email parameter

### Email Sending
- Supports multiple email providers (Resend, SendGrid)
- Automatic fallback between providers
- Validates email format and recipients

## Email Report Format

### HTML Email
The email includes:
- Professional header with gradient background
- Summary box with key metrics
- Detailed table with restore count by day
- Footer with timestamp and branding

### CSV Attachment
Format:
```csv
"Data","Restaurações"
"13/10/2025","45"
"12/10/2025","38"
"11/10/2025","42"
...
```

## Error Handling

The function handles various error scenarios:
- Missing email configuration (no RESEND_API_KEY or SENDGRID_API_KEY)
- Database query errors
- Email sending failures
- Invalid request format
- No data found (returns success with message)

## Testing

### Manual Testing
```bash
# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/send-restore-dashboard \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Integration Testing
```typescript
import { describe, it, expect } from 'vitest';

describe('send-restore-dashboard', () => {
  it('should send email with restore data', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" })
      }
    );
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});
```

## Future Enhancements

### Potential Improvements:
1. **PDF Generation**: Use a Deno-compatible PDF library or external service for true PDF generation
2. **Multiple Recipients**: Support sending to multiple email addresses
3. **Custom Date Ranges**: Add start/end date parameters
4. **Report Customization**: Allow users to select which metrics to include
5. **Scheduling UI**: Build a UI for users to schedule their own reports
6. **Template System**: Support multiple email templates
7. **Localization**: Support multiple languages for reports

## Related Files

- RPC Function: `supabase/migrations/20251011172000_create_restore_dashboard_functions.sql`
- Email Configuration: `.env.example`
- Similar Implementation: `supabase/functions/send_daily_restore_report/index.ts`
- Similar Implementation: `supabase/functions/send-assistant-report/index.ts`

## Deployment

1. Set environment variables in Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=re_...
   supabase secrets set EMAIL_FROM=dash@empresa.com
   ```

2. Deploy the function:
   ```bash
   supabase functions deploy send-restore-dashboard
   ```

3. Test the function:
   ```bash
   supabase functions invoke send-restore-dashboard \
     --body '{"email":"test@example.com"}'
   ```

## Support

For issues or questions:
- Check Supabase logs: `supabase functions logs send-restore-dashboard`
- Verify environment variables are set correctly
- Ensure email service API keys are valid
- Check that RPC function `get_restore_count_by_day_with_email` exists and works

---

**Status:** ✅ Complete and ready for production use
**Last Updated:** October 2025
