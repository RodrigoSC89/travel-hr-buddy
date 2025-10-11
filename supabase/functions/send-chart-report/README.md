# Send Chart Report Edge Function

## Overview

This Supabase Edge Function enables sending chart reports via email. It accepts a base64-encoded image of a chart and sends it as an email attachment to configured recipients.

## Features

- ✅ Accepts base64-encoded chart images
- ✅ Configurable email recipients
- ✅ Professional HTML email template
- ✅ Automatic filename generation with timestamps
- ✅ CORS-enabled for frontend integration
- ✅ Environment-based configuration

## API Endpoint

```
POST /functions/v1/send-chart-report
```

## Request Body

```typescript
{
  imageBase64: string;      // Required: Base64-encoded PNG image (with or without data URI prefix)
  toEmail?: string;          // Optional: Recipient email (defaults to EMAIL_TO env var)
  subject?: string;          // Optional: Email subject (defaults to "📊 Chart Report - Nautilus One")
  chartType?: string;        // Optional: Type of chart for better email context
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "message": "Email prepared successfully...",
  "recipient": "user@example.com",
  "subject": "📊 Analytics Report - Nautilus One",
  "timestamp": "2025-10-11T17:30:00.000Z",
  "note": "To complete this feature, integrate with SendGrid, Mailgun, AWS SES, or configure SMTP in production"
}
```

### Error (500)
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Environment Variables

Required in Supabase Dashboard → Project Settings → Edge Functions → Environment Variables:

```bash
EMAIL_HOST=smtp.gmail.com        # SMTP host
EMAIL_PORT=587                    # SMTP port
EMAIL_USER=your@email.com         # SMTP username
EMAIL_PASS=your_password          # SMTP password
EMAIL_FROM=noreply@nautilusone.com # Sender email
EMAIL_TO=admin@empresa.com        # Default recipient
```

## Email Service Integration

### Current Implementation
The current implementation prepares the email message but requires integration with an actual email service for sending.

### Production Integration Options

#### Option 1: SendGrid (Recommended)
```typescript
// Add to index.ts
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: recipientEmail }] }],
    from: { email: emailFrom },
    subject: emailSubject,
    content: [{ type: "text/html", value: emailMessage.html }],
    attachments: emailMessage.attachments,
  }),
});
```

#### Option 2: Mailgun
```typescript
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");

const formData = new FormData();
formData.append("from", emailFrom);
formData.append("to", recipientEmail);
formData.append("subject", emailSubject);
formData.append("html", emailMessage.html);
formData.append("attachment", new Blob([atob(cleanBase64)]), emailMessage.attachments[0].filename);

const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
  },
  body: formData,
});
```

#### Option 3: AWS SES
Use AWS SDK for Deno to send emails via SES.

## Frontend Usage

### Example: Send Chart from Analytics Page

```typescript
import html2canvas from "html2canvas";

async function sendEmailWithChart() {
  const chartElement = document.getElementById("analytics-pdf");
  if (!chartElement) return;

  try {
    // Capture chart as image
    const canvas = await html2canvas(chartElement);
    const imageBase64 = canvas.toDataURL("image/png");

    // Send to backend
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-chart-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          imageBase64,
          chartType: "CI Analytics",
          // Optional: toEmail: "specific@user.com"
        }),
      }
    );

    const result = await response.json();
    
    if (result.success) {
      alert("📩 Gráfico enviado por e-mail com sucesso!");
    } else {
      alert("❌ Erro ao enviar e-mail: " + result.error);
    }
  } catch (error) {
    console.error("Error sending chart:", error);
    alert("❌ Erro ao enviar gráfico");
  }
}
```

## Testing

### Local Testing with Supabase CLI

```bash
# Start Supabase locally
supabase start

# Deploy function
supabase functions deploy send-chart-report

# Test with curl
curl -X POST \
  http://localhost:54321/functions/v1/send-chart-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "chartType": "Test Chart"
  }'
```

## Security Considerations

- ✅ CORS configured for frontend access
- ✅ Requires valid Supabase authentication token
- ✅ Email credentials stored in environment variables (never in code)
- ⚠️ Consider rate limiting for production use
- ⚠️ Validate email addresses before sending
- ⚠️ Implement size limits for base64 images

## Limitations

- Maximum image size depends on Supabase Edge Function limits (typically 6MB payload)
- Email service integration required for actual sending
- Requires SMTP or email API credentials

## Next Steps

1. Configure email service credentials in Supabase environment variables
2. Choose and integrate an email service provider (SendGrid, Mailgun, AWS SES)
3. Test email delivery with real SMTP/API credentials
4. Add rate limiting and abuse prevention
5. Monitor email delivery success rates

## Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [SendGrid API](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Mailgun API](https://documentation.mailgun.com/en/latest/api-sending.html)
- [AWS SES](https://docs.aws.amazon.com/ses/)
