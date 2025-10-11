# 📧 Email Chart Reports - Quick Setup Guide

## 🚀 Quick Start

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-chart-report
```

### 2. Configure Environment Variables

Set these secrets in Supabase:

```bash
supabase secrets set EMAIL_HOST=smtp.gmail.com
supabase secrets set EMAIL_PORT=587
supabase secrets set EMAIL_USER=your@email.com
supabase secrets set EMAIL_PASS=your_app_password
supabase secrets set EMAIL_FROM=noreply@nautilusone.com
supabase secrets set EMAIL_TO=admin@empresa.com
```

**For Gmail users**: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

### 3. Test the Feature

1. Start the app: `npm run dev`
2. Navigate to: **Admin → Analytics**
3. Click: **"📩 Enviar por E-mail"**
4. Check toast notification for success/error

## 📋 Checklist

- [ ] Supabase CLI installed
- [ ] Logged into Supabase
- [ ] Edge function deployed
- [ ] Email secrets configured
- [ ] Test email sent successfully
- [ ] Production email service integrated (optional)

## 🔌 Production Email Integration

### Current Status
The edge function is ready but needs an email service provider for actual sending.

### Option 1: SendGrid (Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com/)
2. Get API key from Settings → API Keys
3. Set secret:
```bash
supabase secrets set SENDGRID_API_KEY=SG.your_api_key_here
```
4. Update edge function code (see EMAIL_CHART_REPORT_IMPLEMENTATION.md)

### Option 2: Mailgun

1. Sign up at [mailgun.com](https://www.mailgun.com/)
2. Verify your domain
3. Get API key and domain
4. Set secrets and update code

### Option 3: AWS SES

1. Set up AWS SES
2. Verify email/domain
3. Configure credentials
4. Integrate with Deno AWS SDK

## 🧪 Testing

### Test Locally

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve send-chart-report

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-chart-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"imageBase64":"data:image/png;base64,iVBORw0K...","chartType":"Test"}'
```

### Test in Production

1. Open browser console (F12)
2. Navigate to Analytics page
3. Click "Enviar por E-mail"
4. Check console for request/response
5. Check Supabase logs: **Dashboard → Edge Functions → Logs**

## 🐛 Common Issues

### "EMAIL_USER and EMAIL_PASS must be configured"
```bash
# Solution: Set the secrets
supabase secrets set EMAIL_USER=your@email.com
supabase secrets set EMAIL_PASS=your_password
```

### "Usuário não autenticado"
```
Solution: User must be logged in. Check auth state.
```

### Function not found (404)
```bash
# Solution: Deploy the function
supabase functions deploy send-chart-report
```

### Email not actually sent
```
Solution: Integrate with SendGrid/Mailgun (see Production Email Integration above)
```

## 📱 User Guide

### For End Users

1. **Navigate**: Go to Admin → Analytics
2. **View**: See the dashboard with charts
3. **Filter** (optional): Use date filters
4. **Send**: Click "📩 Enviar por E-mail"
5. **Wait**: See "📤 Enviando..." status
6. **Confirm**: Check for success toast
7. **Check Email**: Look for email in inbox

### Email Content

You'll receive:
- **Subject**: "📊 CI Analytics Report - Nautilus One"
- **Body**: Professional HTML template with report details
- **Attachment**: PNG image of the dashboard charts

## 🔒 Security Notes

✅ **What's Secure**:
- Auth token required for API calls
- Email credentials in environment (not code)
- CORS configured properly
- User must be authenticated

⚠️ **Consider Adding**:
- Rate limiting for production
- Email recipient whitelist
- Image size validation
- Audit logging

## 📚 Documentation

- **Full Implementation**: [EMAIL_CHART_REPORT_IMPLEMENTATION.md](./EMAIL_CHART_REPORT_IMPLEMENTATION.md)
- **Edge Function Details**: [supabase/functions/send-chart-report/README.md](./supabase/functions/send-chart-report/README.md)
- **Supabase Docs**: https://supabase.com/docs/guides/functions

## 💡 Tips

1. **Gmail**: Always use App Password, not regular password
2. **Testing**: Use a test email account initially  
3. **Monitoring**: Check Supabase Edge Function logs regularly
4. **Production**: Use SendGrid/Mailgun for reliability
5. **Performance**: Large dashboards create large images

## 🎯 Next Steps

1. ✅ Deploy edge function
2. ✅ Configure email secrets
3. ✅ Test in development
4. ⏳ Integrate production email service
5. ⏳ Test in production
6. ⏳ Monitor usage and errors
7. ⏳ Consider scheduled reports (cron)

## 🆘 Need Help?

- Check [EMAIL_CHART_REPORT_IMPLEMENTATION.md](./EMAIL_CHART_REPORT_IMPLEMENTATION.md) for detailed docs
- Check Supabase logs: Dashboard → Edge Functions → send-chart-report → Logs
- Review edge function code: `supabase/functions/send-chart-report/index.ts`
- Check browser console for frontend errors

---

**Quick Command Reference**:

```bash
# Deploy function
supabase functions deploy send-chart-report

# View logs
supabase functions logs send-chart-report

# List secrets
supabase secrets list

# Set a secret
supabase secrets set KEY=value

# Delete function (if needed)
supabase functions delete send-chart-report
```
