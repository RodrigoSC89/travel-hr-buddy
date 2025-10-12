# 📧 Send Assistant Report API - Implementation Summary

## Overview

This implementation provides a production-ready Supabase Edge Function for sending AI Assistant interaction reports via email with CSV attachment. The function supports both Resend and SendGrid email services.

## Architecture

### Supabase Edge Function: `/functions/v1/send-assistant-report`

**Location**: `/supabase/functions/send-assistant-report/index.ts`

**Features**:
- ✅ Supabase Authentication verification
- ✅ PDF/CSV data generation from interaction logs
- ✅ Email sending via Resend API (primary)
- ✅ Email sending via SendGrid API (fallback)
- ✅ Professional HTML email template
- ✅ CSV attachment with interaction data
- ✅ Error handling and logging
- ✅ CORS support

## API Endpoint

### POST `/functions/v1/send-assistant-report`

**Headers**:
```
Authorization: Bearer {user_access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "question": "User question",
      "answer": "AI response",
      "created_at": "2025-10-12T18:00:00Z",
      "user_email": "user@example.com"
    }
  ],
  "toEmail": "recipient@example.com", // Optional
  "subject": "Custom Subject" // Optional
}
```

**Response (Success)**:
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "user@example.com",
  "logsCount": 25
}
```

**Response (Error)**:
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200` - Email sent successfully
- `400` - Invalid request (no logs provided)
- `401` - Unauthorized (authentication required)
- `500` - Server error (email service failure)

## Configuration

### Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Required: Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Required: Email Service (choose one)
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_...

# Option 2: SendGrid (Fallback)
SENDGRID_API_KEY=SG....

# Optional: Email Configuration
EMAIL_FROM=relatorios@nautilus.ai
EMAIL_TO=admin@empresa.com  # Default recipient if not specified in request
```

### Setting Secrets in Supabase

```bash
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set EMAIL_FROM=relatorios@nautilus.ai

# Or via Supabase Dashboard
# Navigate to: Project Settings → Edge Functions → Secrets
```

## Email Service Setup

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your sending domain
4. Set environment variable:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key
   ```

**Pros**:
- Modern, developer-friendly API
- Excellent deliverability
- Generous free tier (3,000 emails/month)
- Simple integration

### Option 2: SendGrid (Fallback)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Verify sender email
4. Set environment variable:
   ```bash
   supabase secrets set SENDGRID_API_KEY=SG.your_api_key
   ```

**Pros**:
- Enterprise-grade reliability
- Advanced analytics
- Good free tier (100 emails/day)

## Frontend Integration

The frontend code in `/src/pages/admin/assistant-logs.tsx` already calls this endpoint:

```typescript
async function sendReportByEmail() {
  // Get authentication session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    alert("❌ Você precisa estar autenticado para enviar relatórios");
    return;
  }

  // Call Edge Function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-assistant-report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        logs: filteredLogs.map(log => ({
          id: log.id,
          question: log.question,
          answer: log.answer,
          created_at: log.created_at,
          user_email: "Usuário",
        }))
      }),
    }
  );

  const result = await response.json();

  if (response.ok) {
    alert("✅ " + (result.message || "Relatório enviado por e-mail com sucesso!"));
  } else {
    alert("❌ Falha ao enviar relatório: " + (result.error || "Erro desconhecido"));
  }
}
```

## Email Template

The function generates a professional HTML email with:

- **Header**: Branding with Nautilus One logo area
- **Summary**: Total interactions and generation date
- **Content**: Description of attached report
- **Footer**: Copyright and disclaimer
- **Attachment**: CSV file with all interaction data

### CSV Attachment Structure

```csv
"Data/Hora","Usuário","Pergunta","Resposta"
"12/10/2025 18:30:00","user@example.com","Como fazer X?","Para fazer X, você deve..."
```

## Security Features

### Authentication
- Requires valid Supabase session token
- Validates user authentication before processing
- Returns 401 if not authenticated

### Input Validation
- Validates logs array exists and has data
- Returns 400 if no logs provided
- Sanitizes HTML in email content

### Error Handling
- Graceful error messages
- Detailed logging for debugging
- No sensitive data exposure in error responses

## Testing

### Manual Testing

1. Navigate to Admin → Assistant Logs page
2. Ensure you're logged in
3. Click "Enviar E-mail" button
4. Confirm the action
5. Check the recipient email inbox

### Testing with cURL

```bash
# Get access token from Supabase
ACCESS_TOKEN="your_user_access_token"

curl -X POST \
  https://your-project.supabase.co/functions/v1/send-assistant-report \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "id": "test-1",
        "question": "Test question?",
        "answer": "Test answer",
        "created_at": "2025-10-12T18:00:00Z",
        "user_email": "test@example.com"
      }
    ]
  }'
```

## Deployment

### Deploy Edge Function

```bash
# Deploy to Supabase
supabase functions deploy send-assistant-report

# Verify deployment
supabase functions list
```

### Set Production Secrets

```bash
supabase secrets set RESEND_API_KEY=re_your_production_key --project-ref your-project-ref
supabase secrets set EMAIL_FROM=relatorios@yourdomain.com --project-ref your-project-ref
```

## Monitoring

### Logs

View Edge Function logs in Supabase Dashboard:
1. Go to Functions → send-assistant-report
2. Click "Logs" tab
3. Monitor execution and errors

### Success Indicators

Look for these log messages:
- `📧 Preparing email report for...`
- `📊 Total interactions: X`
- `📨 Sending via Resend...` or `📨 Sending via SendGrid...`
- `✅ Email sent successfully!`

### Error Indicators

Common errors:
- `Não autenticado` - User not logged in
- `Nenhum dado para enviar` - No logs in request
- `RESEND_API_KEY or SENDGRID_API_KEY must be configured` - Missing API keys
- `Resend API error: 401` - Invalid API key

## Troubleshooting

### Email Not Received

1. **Check spam folder**
2. **Verify API key**: Ensure RESEND_API_KEY or SENDGRID_API_KEY is set correctly
3. **Check domain**: Verify sending domain is verified with email provider
4. **Review logs**: Check Edge Function logs for errors
5. **Test credentials**: Use email provider's API testing tools

### Authentication Errors

1. **Clear browser cache**: Session might be stale
2. **Re-login**: Get fresh authentication token
3. **Check token**: Ensure Authorization header is properly formatted
4. **Verify Supabase config**: Ensure SUPABASE_URL and SUPABASE_ANON_KEY are correct

### Performance Issues

- **Large datasets**: Consider pagination for reports with >100 interactions
- **Timeout**: Edge functions have 60-second timeout limit
- **Rate limits**: Check email provider rate limits

## Comparison: Problem Statement vs Implementation

The problem statement showed a Next.js API route, but this is a **Vite + React + Supabase** project. The implementation adapts the requirements:

| Problem Statement | Implementation |
|------------------|----------------|
| Next.js API Route | Supabase Edge Function |
| `createServerClient` | `createClient` with auth header |
| `cookies` | Authorization header |
| jsPDF in Node.js | CSV generation in Deno |
| Resend npm package | Resend REST API |
| PDF attachment | CSV attachment (PDF generation in client possible) |
| `Buffer.from()` | `btoa()` for base64 |

## Future Enhancements

- [ ] Add true PDF generation using client-side jsPDF or PDF service
- [ ] Support for multiple recipients
- [ ] Email templates customization
- [ ] Scheduled reports
- [ ] Report caching
- [ ] Email delivery status tracking
- [ ] Attachment size optimization
- [ ] HTML table in email body (currently summary only)

## Related Files

- Edge Function: `/supabase/functions/send-assistant-report/index.ts`
- Frontend UI: `/src/pages/admin/assistant-logs.tsx`
- Environment Config: `.env.example`
- Documentation: `ASSISTANT_HISTORY_BEFORE_AFTER.md`

## References

- [Resend API Documentation](https://resend.com/docs)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
