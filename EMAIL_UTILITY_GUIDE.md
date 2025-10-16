# Email Utility - Send Forecast Email

## 📧 Overview

This module provides a reusable email utility function using the Resend API for sending forecast reports and other email notifications in the Nautilus system.

## 📁 File Location

```
lib/email/sendForecastEmail.ts
```

## 🚀 Installation

The `resend` package has been added as a dependency:

```bash
npm install resend@4.0.1
```

## 🔐 Environment Variables

Add the following to your `.env.local` or configure via Supabase secrets:

```bash
RESEND_API_KEY=re_your_resend_api_key
```

The variable is already documented in `.env.example`.

## 📝 Function Signature

```typescript
export async function resendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ success: boolean; data?: any; error?: any }>
```

### Parameters

- **to** (string): Recipient email address
- **subject** (string): Email subject line
- **text** (string): Plain text email content

### Returns

```typescript
{
  success: boolean;  // true if email sent successfully
  data?: any;       // Response data from Resend API (if successful)
  error?: any;      // Error details (if failed)
}
```

## 💡 Usage Example

### Basic Usage (from Problem Statement)

```typescript
import { resendEmail } from '@/lib/email/sendForecastEmail';

// Send forecast report
const result = await resendEmail({
  to: 'engenharia@nautilus.system',
  subject: '📊 Previsão de Falhas (Produção)',
  text: summary,
});

if (result.success) {
  console.log('✅ Email sent successfully!');
} else {
  console.error('❌ Failed to send email:', result.error);
}
```

### Error Handling

```typescript
try {
  const result = await resendEmail({
    to: 'team@nautilus.system',
    subject: '🔧 Weekly Maintenance Report',
    text: reportContent,
  });

  if (!result.success) {
    // Handle Resend API errors
    console.error('Resend API error:', result.error);
  }
} catch (err) {
  // Handle unexpected errors
  console.error('Unexpected error:', err);
}
```

## 🔧 Configuration Details

### Sender Email

The function uses a predefined sender email:

```typescript
from: 'Nautilus One <no-reply@nautilus.system>'
```

### Email Format

Currently, the function sends plain text emails. To send HTML emails, you can extend the function or use the Resend API's `html` parameter directly.

## 🧪 Testing

Comprehensive tests are available at:

```
src/tests/lib/email/sendForecastEmail.test.ts
```

Run tests with:

```bash
npm test -- src/tests/lib/email/sendForecastEmail.test.ts
```

### Test Coverage

- ✅ Function signature validation
- ✅ Email parameter structure
- ✅ Sender email format validation
- ✅ Email recipient format validation
- ✅ Success response structure
- ✅ Error response structure
- ✅ Resend API error handling
- ✅ Unexpected error handling
- ✅ Environment variable requirements
- ✅ Example usage validation

## 🌐 Integration with Supabase Edge Functions

The email utility can be used in Supabase Edge Functions. Here's an example:

```typescript
// In a Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Note: For Deno/Edge Functions, you'll need to use the Resend API directly
// as this utility is designed for Node.js environments

serve(async (req) => {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Nautilus One <no-reply@nautilus.system>",
      to: "engenharia@nautilus.system",
      subject: "📊 Previsão de Falhas (Produção)",
      text: summary,
    }),
  });

  return new Response(JSON.stringify({ sent: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## 📊 Related Documentation

- [Send Forecast Report Implementation](./SEND_FORECAST_REPORT_IMPLEMENTATION.md)
- [Supabase Edge Functions](./supabase/functions/send-forecast-report/)
- [Email Configuration Guide](./.env.example)

## 🔄 Future Enhancements

Potential improvements for this utility:

1. **HTML Email Support**: Add support for HTML email templates
2. **Attachments**: Support for file attachments
3. **Multiple Recipients**: Enhanced support for CC and BCC
4. **Email Templates**: Integration with email template system
5. **Retry Logic**: Automatic retry on transient failures
6. **Rate Limiting**: Built-in rate limiting for bulk emails

## ✅ Checklist for Implementation

- [x] Resend package installed
- [x] Email utility function created
- [x] Environment variable documented
- [x] Tests created and passing
- [x] Linting passed
- [x] Build successful
- [x] Documentation complete

## 🤝 Contributing

When modifying this utility, ensure:

1. All tests pass
2. Code follows ESLint rules (double quotes, etc.)
3. Function signature remains backwards compatible
4. Environment variables are documented
5. Error handling is comprehensive

## 📞 Support

For issues or questions:

- Check existing tests for usage examples
- Review `.env.example` for configuration
- Consult Resend API documentation: https://resend.com/docs

---

**Last Updated**: 2025-10-16  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
