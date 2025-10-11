# 📧 Daily Restore Report - Quick Setup Guide

## 🎯 Overview

Automated daily email report showing document restoration metrics, sent every day at 08:00 UTC (05:00 BRT).

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Deploy the Edge Function

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy daily-restore-report
```

### 2️⃣ Schedule the Cron Job

```bash
# Configure automatic daily execution
supabase functions schedule daily-restore-report
```

This reads the `cron.yaml` configuration and sets up the daily schedule at 08:00 UTC.

### 3️⃣ Configure Email Service

```bash
# Set SendGrid API key (required)
supabase secrets set SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Optional: Set custom email addresses
supabase secrets set EMAIL_FROM=reports@yourcompany.com
supabase secrets set EMAIL_TO=team@yourcompany.com
```

**Get SendGrid API Key**:
1. Sign up at [sendgrid.com](https://sendgrid.com/)
2. Go to Settings → API Keys → Create API Key
3. Select "Mail Send" permission
4. Copy the key

## ✅ That's It!

The function will now run automatically every day at 08:00 UTC and send an email with:

- 📊 Bar chart of restores per day (last 15 days)
- 📈 Summary statistics (total, unique docs, daily average)
- 🎨 Professional HTML email template

## 📧 Email Example

```
📊 Relatório Diário de Restauração
Nautilus One - Travel HR Buddy
Data: 11/10/2025

📈 Resumo Estatístico
─────────────────────
Total de Restaurações: 42
Documentos Únicos: 15
Média Diária: 2.80

📊 Restaurações por Dia (Últimos 15 dias)
─────────────────────────────────────────
11/10: ████████ (8)
10/10: ██████ (6)
09/10: ████ (4)
08/10: ██ (2)
...
```

## 🧪 Test Manually

```bash
# Test the function manually
curl -X POST \
  "https://your-project.supabase.co/functions/v1/daily-restore-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# View logs
supabase functions logs daily-restore-report
```

## 🔧 Configuration

### Change Schedule

Edit `supabase/functions/daily-restore-report/cron.yaml`:

```yaml
schedule: "0 11 * * *"  # 08:00 BRT instead of 05:00
```

Then redeploy:
```bash
supabase functions deploy daily-restore-report
supabase functions schedule daily-restore-report
```

### Common Schedules

| Time (UTC) | Time (BRT) | Cron Expression |
|------------|------------|-----------------|
| 08:00      | 05:00      | `0 8 * * *`    |
| 11:00      | 08:00      | `0 11 * * *`   |
| 14:00      | 11:00      | `0 14 * * *`   |

## 📁 Files Created

```
supabase/functions/daily-restore-report/
├── cron.yaml          # ⏰ Cron schedule configuration
├── index.ts           # 🚀 Edge Function implementation
└── README.md          # 📖 Detailed documentation
```

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | ✅ Yes | - | SendGrid API key for sending emails |
| `EMAIL_FROM` | ⚪ Optional | `noreply@nautilusone.com` | Sender email address |
| `EMAIL_TO` | ⚪ Optional | `admin@empresa.com` | Recipient email address |
| `SUPABASE_URL` | ✅ Auto | - | Automatically provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto | - | Automatically provided by Supabase |

## 🐛 Troubleshooting

### Email not received?

1. **Check SendGrid API key**: `supabase secrets list`
2. **View logs**: `supabase functions logs daily-restore-report`
3. **Check spam folder**: Email might be filtered
4. **Verify SendGrid status**: Check SendGrid dashboard for delivery status

### Cron not running?

1. **Verify schedule**: `supabase functions list`
2. **Check deployment**: Ensure function is deployed successfully
3. **Review logs**: Look for execution logs in Supabase dashboard

### "SENDGRID_API_KEY not configured"

```bash
# Set the API key
supabase secrets set SENDGRID_API_KEY=SG.your_key_here
```

## 📊 Database Requirements

This function uses two RPC functions that must exist in your database:

1. **`get_restore_count_by_day_with_email`** - Returns restore count per day
2. **`get_restore_summary`** - Returns summary statistics

These are created by migration: `20251011172000_create_restore_dashboard_functions.sql`

## 📚 Documentation

- **Detailed Guide**: [supabase/functions/daily-restore-report/README.md](supabase/functions/daily-restore-report/README.md)
- **Restore Dashboard**: [RESTORE_DASHBOARD_QUICKREF.md](RESTORE_DASHBOARD_QUICKREF.md)
- **Email Charts**: [EMAIL_CHART_QUICK_SETUP.md](EMAIL_CHART_QUICK_SETUP.md)

## 🎯 Features

- ✅ Automatic daily execution at 08:00 UTC
- ✅ Fetches data from last 15 days
- ✅ Professional HTML email template
- ✅ Summary statistics included
- ✅ Text-based chart visualization
- ✅ SendGrid integration for reliability
- ✅ Error handling and logging
- ✅ CORS-enabled for manual testing

## 🚀 Next Steps

After setup:

1. ✅ Wait for 08:00 UTC tomorrow (or test manually)
2. ✅ Check email inbox for report
3. ✅ Monitor SendGrid dashboard for delivery status
4. ✅ Review Supabase logs for execution details

## 💡 Pro Tips

- **Test First**: Run manually before waiting for scheduled execution
- **Monitor Logs**: Check logs after first scheduled run
- **Verify Sender**: Ensure sender email is verified in SendGrid
- **Check Quotas**: SendGrid free tier has 100 emails/day limit
- **Backup Recipient**: Add multiple recipients for redundancy

## 📞 Support

For issues:
1. Check function logs: `supabase functions logs daily-restore-report`
2. Review SendGrid activity dashboard
3. Refer to detailed README in function directory

---

**Status**: ✅ Ready to Deploy
**Effort**: ~5 minutes setup time
**Cost**: Free (with SendGrid free tier)
