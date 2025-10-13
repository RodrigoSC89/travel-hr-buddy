# Send Restore Dashboard - Edge Function

## Overview
Supabase Edge Function that sends restore dashboard reports via email with CSV attachments.

## Endpoint
```
POST /functions/v1/send-restore-dashboard
```

## Authentication
Requires valid JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Request Body
```json
{
  "email": "user@example.com"  // Optional: filter by email, null for all data
}
```

## Response

### Success (200)
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "user@example.com",
  "dataCount": 15
}
```

### No Data (200)
```json
{
  "status": "ok",
  "message": "No restore data found for the specified criteria",
  "recipient": "user@example.com",
  "dataCount": 0
}
```

### Error (400/500)
```json
{
  "error": "Error message"
}
```

## Environment Variables

Required:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `SUPABASE_ANON_KEY` - Anonymous key for authentication

Email service (at least one required):
- `RESEND_API_KEY` - Resend API key (primary)
- `SENDGRID_API_KEY` - SendGrid API key (fallback)

Optional:
- `EMAIL_FROM` - Sender email (default: "dash@empresa.com")

## Email Service

The function supports two email services:
1. **Resend** (primary) - Used if `RESEND_API_KEY` is configured
2. **SendGrid** (fallback) - Used if `SENDGRID_API_KEY` is configured

## Features

1. **Authentication**
   - Validates JWT token from Authorization header
   - Falls back to user email from authenticated session
   - Requires email parameter or authenticated user

2. **Data Fetching**
   - Calls RPC function `get_restore_count_by_day_with_email`
   - Supports email filtering
   - Returns last 15 days of data

3. **Report Generation**
   - CSV format with headers: "Data", "Restaurações"
   - Portuguese date format (dd/MM/yyyy)
   - Proper CSV escaping for special characters

4. **Email Sending**
   - Professional HTML template
   - CSV attachment with date-stamped filename
   - Summary statistics in email body
   - Responsive email design

## Usage Example

### From Frontend (React)
```typescript
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user@example.com", // Optional
    }),
  }
);

const result = await response.json();
```

### From cURL
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-restore-dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Database Functions

This edge function depends on the following RPC functions:
- `get_restore_count_by_day_with_email(email_input TEXT)` - Returns daily restore counts

## Testing

1. **Local Testing**
```bash
supabase functions serve send-restore-dashboard --env-file .env.local
```

2. **Deploy to Supabase**
```bash
supabase functions deploy send-restore-dashboard
```

3. **Set Environment Variables**
```bash
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

## Error Handling

The function handles the following error cases:
- Missing authentication
- Missing email service configuration
- Database query errors
- Email sending failures
- Invalid request format

All errors are logged to console and returned with appropriate HTTP status codes.

## Integration

This edge function integrates with:
- Frontend: `src/pages/admin/documents/restore-dashboard.tsx`
- Database: `get_restore_count_by_day_with_email` RPC function
- Email Services: Resend or SendGrid

## Security

- Requires authentication for all requests
- Uses service role key for database access (internal only)
- Validates session tokens
- CORS headers configured for allowed origins
- Email filtering prevents SQL injection (parameterized queries)
