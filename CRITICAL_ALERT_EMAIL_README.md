# Critical Alert Email Functionality

## Overview

This module provides critical alert email functionality that sends automatic emails to the security team (`seguranca@empresa.com`) when the AI detects critical failures in audits.

## Features

✅ **Automatic Email Alerts**: Sends emails when critical failures are detected
✅ **Critical Information**: Includes auditoria ID and failure description
✅ **Direct Link**: Provides a link to the alerts panel for quick action
✅ **Error Handling**: Comprehensive error handling for reliable operation
✅ **Portuguese Support**: Fully localized in Portuguese

## Installation

The functionality is already installed with the project dependencies. It uses the `resend` package which is included in `package.json`.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (defaults to alertas@nautilus.one)
EMAIL_FROM=alertas@nautilus.one
```

## Usage

### Basic Usage

```typescript
import { sendCriticalAlertEmail } from "@/lib/email/sendCriticalAlertEmail";

// Send a critical alert
const result = await sendCriticalAlertEmail({
  auditoriaId: "AUD-12345",
  descricao: "Falha crítica detectada no sistema de auditoria"
});

if (result.success) {
  console.log("Email sent successfully:", result.data);
} else {
  console.error("Failed to send email:", result.error);
}
```

### Integration with AI Detection

Example integration with AI audit detection:

```typescript
import { sendCriticalAlertEmail } from "@/lib/email/sendCriticalAlertEmail";

async function processAuditWithAI(auditoriaId: string) {
  // AI analysis logic here...
  const aiAnalysis = await analyzeAudit(auditoriaId);
  
  if (aiAnalysis.isCritical) {
    // Send critical alert email
    await sendCriticalAlertEmail({
      auditoriaId: auditoriaId,
      descricao: aiAnalysis.description
    });
  }
}
```

### Integration with Supabase Edge Functions

You can also use this in Supabase Edge Functions:

```typescript
import { sendCriticalAlertEmail } from "../../../lib/email/sendCriticalAlertEmail.ts";

Deno.serve(async (req) => {
  const { auditoriaId, descricao } = await req.json();
  
  const result = await sendCriticalAlertEmail({
    auditoriaId,
    descricao
  });
  
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## Email Content

### Subject Format
```
⚠️ Alerta Crítico - Auditoria ${auditoriaId}
```

### HTML Body Format
```html
<h3>⚠️ Falha crítica detectada</h3>
<p><strong>Auditoria:</strong> ${auditoriaId}</p>
<pre>${descricao}</pre>
<p>Ver painel de alertas: <a href="https://nautilus.one/admin/alerts">Acessar</a></p>
```

## API Reference

### `sendCriticalAlertEmail(params: CriticalAlertEmailParams): Promise<CriticalAlertEmailResult>`

Send a critical alert email to the security team.

#### Parameters

- `params.auditoriaId` (string): The ID of the audit that failed
- `params.descricao` (string): Description of the critical failure

#### Returns

Returns a `Promise<CriticalAlertEmailResult>` with:

- `success` (boolean): Whether the email was sent successfully
- `data` (optional): Object containing the email ID if successful
- `error` (optional): Error message or object if failed

#### Example

```typescript
const result = await sendCriticalAlertEmail({
  auditoriaId: "AUD-12345",
  descricao: "Sistema de validação falhou ao processar dados críticos"
});

if (result.success) {
  console.log("✅ Alert sent with ID:", result.data?.id);
} else {
  console.error("❌ Failed to send alert:", result.error);
}
```

## Error Handling

The function handles various error scenarios:

1. **Missing API Key**: Returns error if `RESEND_API_KEY` is not configured
2. **API Errors**: Catches and returns Resend API errors
3. **Unexpected Errors**: Handles any unexpected errors gracefully

Example error handling:

```typescript
try {
  const result = await sendCriticalAlertEmail({
    auditoriaId: "AUD-12345",
    descricao: "Falha crítica"
  });
  
  if (!result.success) {
    // Log error to monitoring system
    console.error("Email alert failed:", result.error);
    
    // Optionally, try alternative notification method
    await sendSlackAlert(params);
  }
} catch (err) {
  console.error("Unexpected error:", err);
}
```

## Testing

The module includes comprehensive tests. Run them with:

```bash
npm run test -- send-critical-alert-email.test.ts
```

All 64 tests should pass, covering:

- Function interface and parameters
- Email configuration
- Subject and HTML content
- Error handling
- Success scenarios
- TypeScript interfaces
- Security considerations
- Portuguese language support

## Security Considerations

1. **API Key Protection**: Never commit `RESEND_API_KEY` to version control
2. **Authorized Recipients**: Emails are only sent to `seguranca@empresa.com`
3. **Input Validation**: While the function accepts any string inputs, ensure proper validation in your calling code
4. **XSS Prevention**: Be cautious with `descricao` content if it includes user input

## Monitoring and Logs

The function logs all operations:

- **Success**: `✅ Email de alerta crítico enviado com sucesso:`
- **API Key Missing**: `❌ RESEND_API_KEY is not configured in environment variables`
- **Send Error**: `❌ Erro ao enviar alerta crítico por email:`

Monitor these logs in your application's logging system (e.g., Sentry).

## Integration Points

This functionality can be integrated with:

1. **AI Audit System**: Trigger alerts when AI detects critical issues
2. **Manual Reviews**: Allow admins to send alerts manually
3. **Automated Checks**: Send alerts based on automated audit checks
4. **Webhooks**: Trigger from external systems via API

## Future Enhancements

Possible improvements:

- [ ] Support for multiple recipient lists based on severity
- [ ] Template customization via configuration
- [ ] Integration with SMS/Slack for redundancy
- [ ] Alert rate limiting to prevent spam
- [ ] Dashboard for tracking sent alerts

## Related Files

- Implementation: `lib/email/sendCriticalAlertEmail.ts`
- Tests: `src/tests/send-critical-alert-email.test.ts`
- Similar functionality: `lib/email/sendForecastEmail.ts`
- API example: `pages/api/auditoria/resumo.ts`

## Support

For issues or questions:

1. Check the test file for usage examples
2. Review existing email functions in `lib/email/`
3. Verify environment variables are set correctly
4. Check Resend API status at https://resend.com/status

## License

Part of the Travel HR Buddy project.
