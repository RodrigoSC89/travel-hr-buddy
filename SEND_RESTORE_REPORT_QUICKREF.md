# Send Restore Report - Quick Reference

## ⚡ Quick Start

### 1. Configure SendGrid
```bash
# Add to Supabase secrets
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key
```

### 2. Deploy Edge Function
```bash
supabase functions deploy send-restore-report
```

### 3. Verify Sender Email
In SendGrid dashboard:
- Verify `noreply@nautilusone.com`
- Or update sender email in the edge function

### 4. Test the Feature
1. Navigate to `/admin/documents/restore-logs`
2. View the restore chart
3. Click "📩 Enviar gráfico por e-mail"
4. Check your email at `admin@empresa.com`

## 📁 Files Modified

### Created
- `supabase/functions/send-restore-report/index.ts` - Edge function for email sending
- `SEND_RESTORE_REPORT_IMPLEMENTATION.md` - Full documentation

### Modified
- `src/pages/admin/documents/restore-logs.tsx` - Added chart and email functionality
- `.env.example` - Added SENDGRID_API_KEY
- `package.json` - Added @sendgrid/mail

## 🎯 Features

✅ **Chart Visualization**
- Bar chart showing restore count by date
- Last 10 days of activity
- Responsive design
- Filters work with chart

✅ **Email Functionality**
- Capture chart as PNG
- Send via SendGrid API
- Success/error notifications
- Configurable recipient

## 🔧 Configuration

### Environment Variables
```bash
# Supabase Secrets (required)
SENDGRID_API_KEY=SG.your-api-key-here
```

### Email Settings
Edit in `supabase/functions/send-restore-report/index.ts`:
```typescript
// Change default recipient
const { imageBase64, toEmail = "your-email@domain.com" } = await req.json();

// Change sender
from: {
  email: "your-verified-email@domain.com",
  name: "Your App Name",
}

// Change subject
subject: "Your Custom Subject",
```

## 📊 API Reference

### Endpoint
```
POST {SUPABASE_URL}/functions/v1/send-restore-report
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {SUPABASE_ANON_KEY}
```

### Request Body
```json
{
  "imageBase64": "data:image/png;base64,...",
  "toEmail": "recipient@example.com"  // Optional
}
```

### Response (Success)
```json
{
  "message": "Email enviado com sucesso.",
  "timestamp": "2025-10-11T17:33:42.495Z"
}
```

### Response (Error)
```json
{
  "error": "Error message",
  "timestamp": "2025-10-11T17:33:42.495Z"
}
```

## 🐛 Troubleshooting

### Chart not showing
- Check if there are restore logs in the database
- Verify filters are not hiding all data
- Check browser console for errors

### Email not sending
- Verify SENDGRID_API_KEY is set in Supabase secrets
- Check SendGrid API key has "Mail Send" permission
- Verify sender email is verified in SendGrid
- Check Supabase function logs: `supabase functions logs send-restore-report`

### Edge function not found
- Deploy function: `supabase functions deploy send-restore-report`
- Check deployment logs
- Verify Supabase project is linked

### Toast not appearing
- Check if toast component is imported
- Verify useToast hook is available
- Check browser console for errors

## 🧪 Testing Checklist

- [ ] Chart displays with restore data
- [ ] Chart updates when filters change
- [ ] Email button is visible
- [ ] Clicking button shows "Processando" toast
- [ ] Email is sent successfully
- [ ] Success toast appears
- [ ] Email is received with chart attachment
- [ ] Chart PNG is readable in email
- [ ] Error handling works (test with invalid API key)
- [ ] Edge function logs show no errors

## 🔐 Security Notes

- API key stored in Supabase secrets (secure)
- CORS configured for Supabase client
- No sensitive data in client code
- Consider adding rate limiting
- Consider adding authentication checks

## 📚 Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [Recharts Examples](https://recharts.org/en-US/examples)

## 💡 Pro Tips

1. **Custom Recipients**: Pass `toEmail` in request body to send to different addresses
2. **Scheduled Reports**: Use Supabase cron jobs to send reports automatically
3. **Multiple Charts**: Extend to capture and send multiple charts in one email
4. **PDF Export**: Combine with existing PDF export for comprehensive reports
5. **Chart Customization**: Modify chartData processing for different visualizations

## 🚀 Next Steps

1. Test email sending with real SendGrid account
2. Customize email template if needed
3. Add rate limiting for production
4. Consider adding email history/audit
5. Add scheduled report functionality
6. Implement multiple recipient support
