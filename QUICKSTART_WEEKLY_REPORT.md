# 🚀 Quick Start Guide - Weekly Report System

## ⚡ Quick Setup (3 steps)

### 1. Configure Environment

Create `.env` file with:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key

# Email (Example: Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=reports@yourcompany.com
EMAIL_TO=team@yourcompany.com
```

### 2. Run Manual Test

```bash
npm run weekly-report
```

### 3. Automate with GitHub Actions

Copy the workflow file:
```bash
cp .github/workflows/weekly-report.yml.example .github/workflows/weekly-report.yml
```

Add secrets in GitHub repository settings:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`

## 📧 Email Provider Quick Configs

### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  # Get from: https://myaccount.google.com/apppasswords
```

### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_api_key
```

### Amazon SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
```

## 🔄 Cron Schedules

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Weekly Monday 8am | `0 8 * * 1` | Default |
| Daily 9am | `0 9 * * *` | Every day |
| Weekly Friday 5pm | `0 17 * * 5` | End of week |
| Monthly 1st 10am | `0 10 1 * *` | First of month |

## 🆘 Common Issues

### "SUPABASE_KEY não está configurado"
→ Add `SUPABASE_KEY` to your `.env` file

### "EMAIL_USER e EMAIL_PASS devem estar configurados"
→ Add email credentials to `.env` file

### Gmail: "Invalid credentials"
→ Use App Password instead of regular password
→ Get it from: https://myaccount.google.com/apppasswords

### Email not received
1. Check spam folder
2. Verify EMAIL_TO address is correct
3. Test SMTP connection: https://www.smtper.net/

## 📚 Full Documentation

For detailed documentation, see:
- `scripts/README_WEEKLY_REPORT.md` - Complete guide
- `PR165_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `.github/workflows/weekly-report.yml.example` - Automation example

## ✅ Verification Checklist

Before deploying:
- [ ] `.env` configured with all required variables
- [ ] Test run successful: `npm run weekly-report`
- [ ] Email received in inbox
- [ ] PDF attachment opens correctly
- [ ] GitHub secrets configured (if using Actions)
- [ ] Workflow file renamed and committed

## 🎯 Quick Test

Test with dummy data:
```bash
# Set minimal config
export SUPABASE_URL="https://test.supabase.co"
export SUPABASE_KEY="dummy_key_for_testing"
export EMAIL_HOST="smtp.mailtrap.io"  # Use Mailtrap for testing
export EMAIL_PORT="587"
export EMAIL_USER="your_mailtrap_user"
export EMAIL_PASS="your_mailtrap_pass"
export EMAIL_FROM="test@test.com"
export EMAIL_TO="test@test.com"

# Run
npm run weekly-report
```

## 💡 Pro Tips

1. **Use Mailtrap** for testing without sending real emails
2. **Start with manual runs** before automating
3. **Check GitHub Actions logs** for debugging
4. **Use multiple recipients** by separating with commas
5. **Customize the HTML template** in `scripts/weekly-report-cron.js`

---

**Need help?** See `scripts/README_WEEKLY_REPORT.md` for troubleshooting guide.
