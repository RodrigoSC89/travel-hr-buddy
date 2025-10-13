# 🚀 PR #463 Quick Reference Guide

## TL;DR - What This PR Does

✅ **Email Notifications**: Automatically sends email alerts when daily restore reports fail  
✅ **Public View Mode**: Share logs in read-only mode via URL parameter (`?public=1`)

---

## Quick Start

### 1. Enable Email Notifications

```bash
# Set environment variables
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set REPORT_ADMIN_EMAIL=admin@example.com
supabase secrets set EMAIL_FROM=alerta@empresa.com  # optional

# Deploy edge function
supabase functions deploy send-restore-dashboard-daily
```

### 2. Use Public View Mode

```bash
# Normal mode (admin access)
https://your-app.com/admin/reports/logs

# Public mode (read-only)
https://your-app.com/admin/reports/logs?public=1
```

---

## Email Notification

### When It Triggers
- Daily restore dashboard report fails
- Any error in the send-restore-dashboard-daily function

### What It Sends
- **Subject**: 🚨 Falha no Envio de Relatório Diário
- **To**: REPORT_ADMIN_EMAIL or ADMIN_EMAIL
- **Content**: Error message + timestamp (pt-BR format)

### Email Preview
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 Falha no Envio de Relatório Diário
Nautilus One - Travel HR Buddy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Detalhes do Erro
Erro: [error message]
Data/Hora: [timestamp]

O relatório diário falhou ao ser enviado.
Por favor, verifique os logs do sistema.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Public View Mode

### How to Activate
Add `?public=1` to the logs URL:
```
/admin/reports/logs?public=1
```

### What Changes

| Element | Normal Mode | Public Mode |
|---------|-------------|-------------|
| Back Button | ✅ Shown | ❌ Hidden |
| Export (CSV/PDF) | ✅ Shown | ❌ Hidden |
| Refresh Button | ✅ Shown | ❌ Hidden |
| Filters | ✅ Shown | ❌ Hidden |
| Summary Cards | ✅ Shown | ✅ Shown |
| Logs List | ✅ Shown | ✅ Shown |
| Public Indicator | ❌ Hidden | ✅ Shown |
| Eye Icon | ❌ Hidden | ✅ Shown |

### Use Cases
1. **TV Monitors**: Display on office screens safely
2. **Stakeholder Sharing**: Share with non-admin users
3. **Public Dashboards**: Embed in status pages
4. **Transparent Monitoring**: Show system health publicly

---

## Testing

### Run Tests
```bash
# All tests
npm test

# Specific test file
npm test -- src/tests/pages/admin/reports/logs.test.tsx

# With coverage
npm run test:coverage
```

### Test Results
- ✅ 17 tests for logs page (9 original + 8 new)
- ✅ 240 total tests passing
- ✅ Build successful
- ✅ Linting clean

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes | - | Resend API key for sending emails |
| `REPORT_ADMIN_EMAIL` | Yes* | - | Primary admin email for alerts |
| `ADMIN_EMAIL` | No* | - | Fallback admin email |
| `EMAIL_FROM` | No | `relatorio@empresa.com` | Sender email address |

*Either `REPORT_ADMIN_EMAIL` or `ADMIN_EMAIL` must be set.

---

## Troubleshooting

### Email Not Received?

**Check 1**: Environment variables
```bash
supabase secrets list
```

**Check 2**: Resend API key
- Verify key is valid in Resend dashboard
- Check delivery logs

**Check 3**: Edge function logs
```bash
supabase functions logs send-restore-dashboard-daily
```
Look for: `"📧 Failure notification email sent to:"`

### Public Mode Not Working?

**Check 1**: URL parameter (case-sensitive)
```
❌ ?Public=1  (wrong)
✅ ?public=1  (correct)
```

**Check 2**: Browser cache
- Clear cache
- Try incognito mode
- Hard refresh (Ctrl+Shift+R)

**Check 3**: Build deployed
```bash
npm run build
# Verify latest build is deployed
```

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/send-restore-dashboard-daily/index.ts` | Added email notification in catch block |
| `src/pages/admin/reports/logs.tsx` | Added public mode detection & conditional rendering |
| `src/tests/pages/admin/reports/logs.test.tsx` | Added 8 comprehensive public mode tests |

---

## Verification Checklist

### Before Deployment
- [ ] Environment variables set
- [ ] Tests passing (240/240)
- [ ] Build successful
- [ ] Linting clean

### After Deployment
- [ ] Edge function deployed
- [ ] Frontend deployed
- [ ] Test email notification (trigger error)
- [ ] Test public mode URL
- [ ] Verify logs are visible
- [ ] Verify controls hidden in public mode

---

## Code Snippets

### Public Mode Detection (Frontend)
```typescript
const [searchParams] = useSearchParams();
const isPublic = searchParams.get("public") === "1";

// Conditional rendering
{!isPublic && <BackButton />}
{isPublic && <PublicIndicator />}
```

### Email Notification (Backend)
```typescript
catch (error) {
  await logExecution(supabase, "error", "Falha ao enviar...", error);
  
  try {
    await sendEmailViaResend(adminEmail, subject, html, "", apiKey);
  } catch (emailError) {
    console.error("Failed to send notification:", emailError);
  }
}
```

---

## API Endpoints

### Edge Function
```
POST https://{project}.supabase.co/functions/v1/send-restore-dashboard-daily
Authorization: Bearer {anon_key}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Daily restore dashboard report sent successfully",
  "dataPoints": 30,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Key Metrics

```
Files Modified:       3
Tests Added:          8
Total Tests:        240
All Passing:         ✅
Build Time:       ~44s
Breaking Changes:     0
New Dependencies:     0
```

---

## Links

- [Full Documentation](./PR463_REFACTORING_COMPLETE.md)
- [Visual Summary](./PR463_VISUAL_SUMMARY.md)
- [Implementation Guide](./ASSISTANT_LOGS_API_ENHANCEMENTS.md)
- [Resend API Docs](https://resend.com/docs)
- [React Router Docs](https://reactrouter.com/en/main/hooks/use-search-params)

---

## Support

**Issues?**
1. Check troubleshooting section above
2. Review edge function logs
3. Verify environment variables
4. Check browser console for errors

**Need Help?**
- Review full documentation
- Check test files for examples
- Inspect implementation in source files

---

**Status**: ✅ Complete and Ready for Deployment  
**Version**: 1.0.0  
**Last Updated**: 2025-10-13
