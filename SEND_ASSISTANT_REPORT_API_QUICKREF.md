# 🚀 Send Assistant Report API - Quick Setup Guide

## ⚡ 3-Step Setup

### 1. Configure Email Service

Choose **Resend** (recommended) or **SendGrid**:

#### Option A: Resend
```bash
# Get API key from: https://resend.com/api-keys
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set EMAIL_FROM=relatorios@yourdomain.com
```

#### Option B: SendGrid
```bash
# Get API key from: https://app.sendgrid.com/settings/api_keys
supabase secrets set SENDGRID_API_KEY=SG.your_api_key
supabase secrets set EMAIL_FROM=relatorios@yourdomain.com
```

### 2. Deploy Edge Function

```bash
supabase functions deploy send-assistant-report
```

### 3. Test It

```bash
# From the application:
# 1. Login as authenticated user
# 2. Go to Admin → Assistant Logs
# 3. Click "Enviar E-mail" button
# 4. Check your email inbox
```

## 📋 Required Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=re_...        # OR
SENDGRID_API_KEY=SG....      # One of these is required
EMAIL_FROM=relatorios@nautilus.ai
```

## 🔍 Quick Verification

### Check if function is deployed
```bash
supabase functions list
```

### Check if secrets are set
```bash
supabase secrets list
```

### Test the endpoint
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-assistant-report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"logs":[{"id":"1","question":"Test?","answer":"Yes","created_at":"2025-10-12T18:00:00Z","user_email":"test@test.com"}]}'
```

## 🎯 Expected Response

**Success (200)**:
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "user@example.com",
  "logsCount": 25
}
```

**Error (401)**:
```json
{
  "error": "Não autenticado"
}
```

**Error (400)**:
```json
{
  "error": "Nenhum dado para enviar."
}
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Login required - use Authorization header with valid token |
| 400 Bad Request | Ensure logs array is not empty |
| 500 Server Error | Check if RESEND_API_KEY or SENDGRID_API_KEY is set |
| Email not received | Check spam folder, verify domain, check logs |

## 📊 Features

- ✅ Authentication required (Supabase Auth)
- ✅ CSV attachment with interaction logs
- ✅ Professional HTML email template
- ✅ Support for Resend & SendGrid
- ✅ Automatic fallback to SendGrid if Resend not configured
- ✅ Error handling and logging

## 📧 Email Service Comparison

| Feature | Resend | SendGrid |
|---------|--------|----------|
| Free Tier | 3,000/month | 100/day |
| Setup Complexity | Simple | Moderate |
| API | Modern REST | Traditional REST |
| Deliverability | Excellent | Excellent |
| Recommended | ✅ Yes | Fallback |

## 🔗 Quick Links

- [Full Documentation](SEND_ASSISTANT_REPORT_API_IMPLEMENTATION.md)
- [Resend Dashboard](https://resend.com/home)
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [Supabase Dashboard](https://app.supabase.com/)

## 💡 Pro Tips

1. **Use Resend** for simpler setup and better free tier
2. **Verify your domain** to avoid spam folder
3. **Check Edge Function logs** when debugging
4. **Set EMAIL_FROM** to a real domain you own
5. **Test with small data sets** first

## 📞 Support

- View logs: Supabase Dashboard → Functions → send-assistant-report → Logs
- Issue tracker: GitHub Issues
- Documentation: `SEND_ASSISTANT_REPORT_API_IMPLEMENTATION.md`
