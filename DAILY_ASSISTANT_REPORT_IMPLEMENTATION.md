# 📊 Daily Assistant Report - Implementation Summary

## 🎯 Overview

This PR adds a cron job for automatically sending daily assistant report emails. The implementation follows the same pattern as the existing `daily-restore-report` feature.

## ✨ What Was Added

### 1. Edge Function: `send-daily-assistant-report`

**Location:** `supabase/functions/send-daily-assistant-report/index.ts`

**Purpose:** Fetches assistant logs from the last 24 hours and sends them via email as a CSV attachment.

**Key Features:**
- ✅ Fetches logs from `assistant_logs` table (last 24h)
- ✅ Generates CSV with columns: Date/Time, User, Question, Answer
- ✅ Sends email via Resend API (primary) or SendGrid API (fallback)
- ✅ Professional HTML email template
- ✅ Comprehensive error handling

**Code Structure:**
```typescript
// Interface for assistant logs
interface AssistantLog {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user_email: string;
  user_id?: string;
}

// Main functions:
- generateCSV(logs) → Creates CSV content
- generateEmailHtml(logsCount, csvAttached) → Creates HTML email
- sendEmailViaResend(params) → Sends via Resend API
- sendEmailViaSendGrid(params) → Sends via SendGrid API
- serve() → Main handler
```

### 2. Cron Configuration

**Location:** `supabase/config.toml`

**Changes:**
```toml
# New function configuration (no JWT verification for cron)
[functions.send-daily-assistant-report]
verify_jwt = false

# New cron job (runs daily at 8 AM UTC)
[[edge_runtime.cron]]
name = "daily-assistant-report"
function_name = "send-daily-assistant-report"
schedule = "0 8 * * *"
description = "Send daily assistant report via email with CSV attachment"
```

### 3. Setup Script

**Location:** `scripts/setup-daily-assistant-report.js`

**Purpose:** Automates deployment and configuration of the edge function.

**Features:**
- ✅ Validates Supabase CLI installation
- ✅ Checks function files exist
- ✅ Validates environment variables
- ✅ Deploys edge function
- ✅ Configures cron schedule
- ✅ Runs test invocation
- ✅ Color-coded progress tracking

**Usage:**
```bash
npm run setup:daily-assistant-report
```

### 4. NPM Script

**Location:** `package.json`

**Addition:**
```json
{
  "scripts": {
    "setup:daily-assistant-report": "node scripts/setup-daily-assistant-report.js"
  }
}
```

### 5. Documentation

**Location:** `DAILY_ASSISTANT_REPORT_QUICKREF.md`

**Contents:**
- Quick setup guide (3 steps)
- Manual setup instructions
- Environment variables reference
- CSV format documentation
- Troubleshooting guide
- Email service comparison
- Pro tips and best practices

## 🔧 How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cron Scheduler                   │
│               (Triggers daily at 8:00 AM UTC)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Edge Function: send-daily-assistant-report          │
│                                                              │
│  1. Fetch assistant_logs from last 24h                      │
│  2. Generate CSV content                                     │
│  3. Generate HTML email                                      │
│  4. Send via Resend or SendGrid                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Email Service                             │
│          (Resend API or SendGrid API)                       │
│                                                              │
│  Delivers email with CSV attachment to ADMIN_EMAIL          │
└─────────────────────────────────────────────────────────────┘
```

### Execution Timeline

```
Day 1: 08:00 UTC → Function executes → Fetches logs from Day 0 08:00 to Day 1 08:00
Day 2: 08:00 UTC → Function executes → Fetches logs from Day 1 08:00 to Day 2 08:00
Day 3: 08:00 UTC → Function executes → Fetches logs from Day 2 08:00 to Day 3 08:00
```

## 📋 Environment Variables Required

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ADMIN_EMAIL` | ✅ Yes | Recipient email for reports | `admin@yourdomain.com` |
| `EMAIL_FROM` | ✅ Yes | Sender email address | `reports@yourdomain.com` |
| `RESEND_API_KEY` | ⚠️ One required | Resend API key | `re_xxxxx` |
| `SENDGRID_API_KEY` | ⚠️ One required | SendGrid API key | `SG.xxxxx` |
| `SUPABASE_URL` | 🔧 Auto | Supabase project URL | Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔧 Auto | Service role key | Auto-configured |

## 🚀 Setup Instructions

### Quick Setup (Recommended)

```bash
# 1. Set email service secrets
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set EMAIL_FROM=reports@yourdomain.com
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com

# 2. Run automated setup
npm run setup:daily-assistant-report
```

### Manual Setup (Alternative)

```bash
# 1. Deploy function
supabase functions deploy send-daily-assistant-report --no-verify-jwt

# 2. Configure cron (or use Dashboard)
supabase functions schedule send-daily-assistant-report --cron "0 8 * * *"

# 3. Test function
supabase functions invoke send-daily-assistant-report --no-verify-jwt
```

## 📊 CSV Report Format

**Filename:** `relatorio-assistente-YYYY-MM-DD.csv`

**Columns:**
1. **Data/Hora** - Interaction timestamp in pt-BR format
2. **Usuário** - User email (or "Anônimo" if not available)
3. **Pergunta** - Question asked (truncated to 200 chars)
4. **Resposta** - Assistant's answer (HTML stripped, truncated to 300 chars)

**Example:**
```csv
Data/Hora,Usuário,Pergunta,Resposta
"12/10/2025 18:30:15","user@example.com","Como faço para criar um documento?","Para criar um documento, você deve..."
"12/10/2025 19:45:22","admin@example.com","Qual é o status do projeto?","O projeto está em andamento..."
```

## 📧 Email Template

**Subject:** `📊 Relatório Diário - Assistente IA DD/MM/YYYY`

**Content:**
- Professional header with gradient background (purple)
- Summary box showing:
  - Total interactions count
  - Report generation date
  - Attachment status
- Description of CSV columns
- Footer with automatic generation notice

## 🔍 Testing

### Manual Test
```bash
supabase functions invoke send-daily-assistant-report --no-verify-jwt
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

### View Logs
```bash
supabase functions logs send-daily-assistant-report
```

## 🔄 Comparison with Daily Restore Report

| Feature | Daily Restore Report | Daily Assistant Report |
|---------|---------------------|----------------------|
| **Cron Schedule** | 7:00 AM UTC | 8:00 AM UTC |
| **Data Source** | `restore_report_logs` | `assistant_logs` |
| **Columns** | Date, Status, Message, Error | Date/Time, User, Question, Answer |
| **Email Service** | SendGrid only | Resend + SendGrid |
| **Function Name** | `send_daily_restore_report` | `send-daily-assistant-report` |
| **Setup Script** | `setup:daily-report` | `setup:daily-assistant-report` |

## ✅ Validation Checklist

- [x] Edge function created and follows Deno/Supabase patterns
- [x] Cron configuration added to `config.toml`
- [x] Function config added (verify_jwt = false)
- [x] Setup script created with color-coded output
- [x] NPM script added to `package.json`
- [x] Documentation created with troubleshooting guide
- [x] CSV generation function implemented
- [x] Email HTML template created
- [x] Resend API integration added
- [x] SendGrid API integration added (fallback)
- [x] Error handling implemented
- [x] Script syntax validated

## 📚 Files Created/Modified

### Created
- `supabase/functions/send-daily-assistant-report/index.ts` (254 lines)
- `scripts/setup-daily-assistant-report.js` (230 lines)
- `DAILY_ASSISTANT_REPORT_QUICKREF.md` (300+ lines)

### Modified
- `supabase/config.toml` - Added function config and cron job
- `package.json` - Added setup script

**Total:** 3 new files, 2 modified files

## 🎓 Learning Points

This implementation demonstrates:
1. **Edge Function Development** - Deno-based serverless functions
2. **Cron Job Configuration** - Supabase scheduling
3. **Email Integration** - Multiple email service providers
4. **CSV Generation** - Data export functionality
5. **Error Handling** - Comprehensive error management
6. **Documentation** - User-friendly guides and references

## 🚨 Important Notes

1. **Email Service Required:** Either RESEND_API_KEY or SENDGRID_API_KEY must be configured
2. **Cron Limitations:** Some Supabase plans may not support CLI-based cron configuration
3. **Time Zone:** Cron runs in UTC (8:00 AM UTC = adjust for your timezone)
4. **Data Retention:** Function only fetches logs from last 24 hours
5. **CSV Size:** Very large datasets may need pagination (not implemented)

## 🔮 Future Enhancements

Possible improvements for future versions:
- [ ] Weekly/Monthly report options
- [ ] PDF generation (instead of CSV)
- [ ] Custom date range selection
- [ ] Multiple recipient support
- [ ] Report customization (filters, columns)
- [ ] Logging table for execution history
- [ ] Attachment size limits
- [ ] Compression for large reports

## 📞 Support

- **Documentation:** `DAILY_ASSISTANT_REPORT_QUICKREF.md`
- **Logs:** `supabase functions logs send-daily-assistant-report`
- **Issues:** GitHub Issues
- **Dashboard:** Supabase Dashboard → Edge Functions

---

**Version:** 1.0  
**Date:** October 2025  
**Status:** ✅ Complete and Ready for Production
