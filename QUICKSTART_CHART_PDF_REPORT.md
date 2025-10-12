# Quick Start Guide: Daily Restore Report with Chart PDF

## ⚡ Quick Setup (5 Minutes)

### 1. Set Environment Variables in Supabase

```bash
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set VITE_APP_URL=https://your-deployed-app-url.com
```

### 2. Deploy the Edge Function

```bash
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

### 3. Test Manually

```bash
supabase functions invoke send_daily_restore_report
```

### 4. Schedule Daily Execution (8 AM UTC)

```sql
SELECT cron.schedule(
  'daily-restore-report-with-chart',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/send_daily_restore_report',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
```

## 📧 What You'll Get

**Email Subject**: `📈 Restore Report with Chart - YYYY-MM-DD`

**Attachment**: `restore_report_YYYY-MM-DD.pdf` (A4 format with chart)

**Content**: Professional HTML email with:
- Nautilus One branding
- Date stamp
- Description of the report
- PDF attachment with restore metrics chart

## 🔍 Verify Setup

### Check the Embed Route
Visit: `https://your-app.com/embed/restore-chart`

Should see:
- Clean chart view (no navigation)
- Bar chart with restore metrics
- No authentication required

### Check Function Logs
```bash
supabase functions logs send_daily_restore_report
```

### Check Email Logs
```sql
SELECT * FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 5;
```

## 🚨 Troubleshooting

### "SENDGRID_API_KEY is required"
→ Set the API key: `supabase secrets set SENDGRID_API_KEY=your-key`

### "Navigation timeout"
→ Check that VITE_APP_URL is correctly set to your deployed app URL

### "Chart not ready"
→ Verify the Supabase database has the RPC function: `get_restore_count_by_day_with_email`

## 📚 Full Documentation

- **Complete Guide**: `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
- **Function Docs**: `supabase/functions/send_daily_restore_report/README.md`
- **Embed Chart**: `EMBED_CHART_IMPLEMENTATION.md`

## ✅ Requirements Met

From the problem statement:

- ✅ Rota `/embed/restore-chart` renderiza o gráfico de forma pública
- ✅ Supabase Edge com Puppeteer compatível (Deno 1.35+)
- ✅ Screenshot do gráfico convertido em PDF
- ✅ Envio via SendGrid com PDF anexado
- ✅ Log de execução na tabela `report_email_logs`
- ✅ Variáveis de ambiente configuráveis

## 🎯 Next Steps

1. Deploy your frontend application to get the production URL
2. Set the environment variables in Supabase
3. Deploy the edge function
4. Test with manual invocation
5. Configure cron schedule for daily execution

**Done!** You'll receive daily restore reports with charts at 8 AM UTC.
