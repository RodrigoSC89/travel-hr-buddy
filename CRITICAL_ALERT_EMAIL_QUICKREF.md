# Critical Alert Email - Quick Reference

## 🚀 Quick Start

### 1. Configuration
```bash
# Add to .env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=alertas@nautilus.one  # Optional
```

### 2. Import
```typescript
import { sendCriticalAlertEmail } from "@/lib/email/sendCriticalAlertEmail";
```

### 3. Use
```typescript
await sendCriticalAlertEmail({
  auditoriaId: "AUD-12345",
  descricao: "Falha crítica detectada"
});
```

## 📧 Email Details

| Property | Value |
|----------|-------|
| **From** | `alertas@nautilus.one` |
| **To** | `seguranca@empresa.com` |
| **Subject** | `⚠️ Alerta Crítico - Auditoria ${auditoriaId}` |
| **Format** | HTML |

## 🔧 Function Signature

```typescript
sendCriticalAlertEmail(params: CriticalAlertEmailParams): Promise<CriticalAlertEmailResult>

// Parameters
interface CriticalAlertEmailParams {
  auditoriaId: string;  // ID of the audit
  descricao: string;    // Description of the failure
}

// Return Value
interface CriticalAlertEmailResult {
  success: boolean;     // Was the email sent?
  data?: { id: string }; // Email ID if successful
  error?: unknown;      // Error if failed
}
```

## 📋 Common Use Cases

### AI Detection Integration
```typescript
if (aiAnalysis.isCritical) {
  await sendCriticalAlertEmail({
    auditoriaId: audit.id,
    descricao: aiAnalysis.description
  });
}
```

### Manual Alert Trigger
```typescript
const triggerAlert = async (auditId: string, description: string) => {
  const result = await sendCriticalAlertEmail({
    auditoriaId: auditId,
    descricao: description
  });
  
  if (!result.success) {
    console.error("Failed to send alert:", result.error);
  }
};
```

### API Route
```typescript
// pages/api/alerts/send.ts
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { auditoriaId, descricao } = req.body;
  const result = await sendCriticalAlertEmail({ auditoriaId, descricao });
  
  return res.status(result.success ? 200 : 500).json(result);
}
```

## ✅ Checklist Before Using

- [ ] `RESEND_API_KEY` configured in environment
- [ ] Resend package installed (`resend` in package.json)
- [ ] Import statement added
- [ ] Error handling implemented
- [ ] Logging configured for monitoring

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `RESEND_API_KEY is not configured` | Add `RESEND_API_KEY` to your `.env` file |
| Email not received | Check spam folder, verify `seguranca@empresa.com` |
| API error | Check Resend API status, verify API key |
| TypeScript errors | Ensure proper imports and types |

## 📊 Testing

```bash
# Run tests
npm run test -- send-critical-alert-email.test.ts

# Expected: ✓ 64 tests pass
```

## 🔗 Related Files

- Implementation: `lib/email/sendCriticalAlertEmail.ts`
- Tests: `src/tests/send-critical-alert-email.test.ts`
- Documentation: `CRITICAL_ALERT_EMAIL_README.md`
- Summary: `CRITICAL_ALERT_EMAIL_IMPLEMENTATION_SUMMARY.md`

## 🎯 Key Features

✅ Portuguese language support  
✅ Direct link to alerts panel  
✅ Comprehensive error handling  
✅ TypeScript type safety  
✅ Production-ready code  
✅ Full test coverage  

## 📬 Email Preview

**Subject:** ⚠️ Alerta Crítico - Auditoria AUD-12345

**Body:**
```
⚠️ Falha crítica detectada

Auditoria: AUD-12345

[Description of failure]

Ver painel de alertas: [Acessar]
```

## 🔐 Security Notes

- API key stored in environment variables only
- Emails sent only to `seguranca@empresa.com`
- No sensitive data logged
- Input validation via TypeScript

## 📞 Support

For issues or questions, check:
1. Full documentation: `CRITICAL_ALERT_EMAIL_README.md`
2. Test file examples: `src/tests/send-critical-alert-email.test.ts`
3. Existing email functions: `lib/email/sendForecastEmail.ts`
