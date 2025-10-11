# Daily Restore Report - Architecture Diagram

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DAILY RESTORE REPORT SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │   Cron/     │
                                    │  Scheduler  │
                                    │  (Daily 8AM)│
                                    └──────┬──────┘
                                           │ Trigger
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE EDGE FUNCTION                               │
│                   daily-restore-report/index.ts                           │
│                                                                           │
│  1. Fetch restore data from Supabase                                     │
│     ├─ get_restore_count_by_day_with_email()                            │
│     └─ get_restore_summary()                                             │
│                                                                           │
│  2. Generate email HTML with summary                                     │
│                                                                           │
│  3. Call email API endpoint                                              │
│     └─ POST /api/send-restore-report                                     │
└──────────────────────┬────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      EMAIL API ENDPOINT                                   │
│                   /pages/api/send-restore-report.ts                       │
│                                                                           │
│  1. Receive email request (HTML + optional image)                        │
│  2. Configure nodemailer with SMTP settings                              │
│  3. Format email with:                                                   │
│     ├─ Professional HTML template                                        │
│     ├─ Summary statistics                                                │
│     ├─ Daily breakdown data                                              │
│     └─ Optional: PNG chart attachment                                    │
│  4. Send email via SMTP                                                  │
└──────────────────────┬────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  SMTP Server   │
              │  (Gmail, etc)  │
              └────────┬───────┘
                       │ Delivers to
                       ▼
              ┌────────────────┐
              │  Admin Email   │
              │ 📧 Inbox       │
              └────────────────┘
```

## 🔄 Data Flow

```
┌──────────────┐
│  Supabase DB │
│  restore_logs│
└──────┬───────┘
       │ Query
       ▼
┌──────────────────────────┐
│  RPC Functions           │
│  ├─ get_restore_count... │
│  └─ get_restore_summary  │
└──────┬───────────────────┘
       │ Returns data
       ▼
┌──────────────────────────┐
│  Edge Function           │
│  Processes & formats     │
└──────┬───────────────────┘
       │ Sends to
       ▼
┌──────────────────────────┐
│  Email API               │
│  Sends via SMTP          │
└──────┬───────────────────┘
       │ Delivers
       ▼
┌──────────────────────────┐
│  📧 Recipient Inbox      │
└──────────────────────────┘
```

## 📈 Optional: Chart Screenshot Flow

```
┌────────────────────────────────────────────────────────────────┐
│              CHART IMAGE GENERATION (Optional)                  │
└────────────────────────────────────────────────────────────────┘

Option A: Client-side with Puppeteer
────────────────────────────────────

  /embed-restore-chart.html  →  Puppeteer/API  →  PNG Image
            ↓                      ↓
    Renders chart             Screenshots       Attached to email


Option B: Screenshot Service
─────────────────────────────

  Embed URL  →  API Flash/URL2PNG  →  PNG Image  →  Email attachment
                     ↓
              External service


Option C: Server-side Canvas
─────────────────────────────

  Chart Data  →  node-canvas/chartjs-node  →  PNG Image  →  Email
```

## 🗂️ File Organization

```
travel-hr-buddy/
│
├── supabase/
│   └── functions/
│       └── daily-restore-report/
│           ├── index.ts          ← Main Edge Function
│           └── README.md         ← Function documentation
│
├── pages/
│   └── api/
│       ├── send-restore-report.ts      ← Email API (nodemailer)
│       └── generate-chart-image.ts     ← Chart generation API (optional)
│
├── public/
│   └── embed-restore-chart.html        ← Standalone chart page
│
├── src/pages/admin/documents/
│   └── restore-dashboard.tsx           ← Full dashboard (reference)
│
└── Documentation/
    ├── DAILY_RESTORE_REPORT_DEPLOYMENT.md   ← Full guide
    └── DAILY_RESTORE_REPORT_QUICKREF.md     ← Quick reference
```

## 🔌 Integration Points

### 1. Database Layer
```
restore_logs table
    ↓
RPC Functions
    ├─ get_restore_count_by_day_with_email(email_input)
    └─ get_restore_summary(email_input)
```

### 2. Edge Function Layer
```
Cron Trigger → Edge Function → Fetch Data → Generate HTML → Call API
```

### 3. API Layer
```
Email API ← Edge Function
    ↓
SMTP Server (Gmail/SendGrid)
    ↓
Recipient
```

### 4. Frontend Layer (for reference)
```
/embed-restore-chart.html
    ├─ Fetches data from Supabase
    ├─ Renders chart with Chart.js
    └─ Can be screenshot for email attachment
```

## 🔧 Configuration Points

### Environment Variables

**Supabase (Edge Function):**
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- VITE_APP_URL
- ADMIN_EMAIL

**Application (Email API):**
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM

## 🚀 Deployment Sequence

```
1. Set environment variables
   ├─ Supabase: Project Settings → Edge Functions → Secrets
   └─ App: Vercel/Netlify environment variables

2. Deploy application
   └─ Contains: /api/send-restore-report and /embed-restore-chart.html

3. Deploy Edge Function
   └─ supabase functions deploy daily-restore-report

4. Schedule execution
   └─ supabase functions schedule daily-restore-report --cron "0 8 * * *"

5. Test
   ├─ Test embed page
   ├─ Test email API
   └─ Test Edge Function
```

## 🎯 Execution Flow (Step by Step)

```
Time: 08:00 AM (Daily)
│
├─ 1. Cron triggers Edge Function
│      └─ POST /functions/v1/daily-restore-report
│
├─ 2. Edge Function executes
│      ├─ Connects to Supabase
│      ├─ Calls get_restore_count_by_day_with_email()
│      ├─ Calls get_restore_summary()
│      ├─ Processes data (formats dates, calculates stats)
│      └─ Generates HTML email content
│
├─ 3. Edge Function calls Email API
│      └─ POST https://your-app.vercel.app/api/send-restore-report
│         └─ Body: { html, toEmail, summary }
│
├─ 4. Email API processes request
│      ├─ Configures nodemailer transport (SMTP)
│      ├─ Creates email with HTML content
│      ├─ Adds attachments (if provided)
│      └─ Sends via SMTP server
│
├─ 5. SMTP server delivers email
│      └─ Sends to ADMIN_EMAIL
│
└─ 6. Admin receives email
       ├─ Opens email
       ├─ Views summary statistics
       ├─ Sees daily breakdown
       └─ Can click link to full dashboard
```

## 📊 Email Structure

```
┌─────────────────────────────────────────────┐
│  📊 Relatório Diário - Restauração         │ ← Header
│  Nautilus One - Travel HR Buddy            │
│  11/10/2025                                 │
├─────────────────────────────────────────────┤
│                                             │
│  📈 Resumo Executivo                        │ ← Summary Box
│  • Total de Restaurações: 156              │
│  • Documentos Únicos: 89                    │
│  • Média Diária: 15.6                       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Dados dos Últimos Dias                  │ ← Daily Data
│  • 07/10: 12 restaurações                   │
│  • 08/10: 15 restaurações                   │
│  • 09/10: 18 restaurações                   │
│  • 10/10: 14 restaurações                   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [📈 Ver Gráfico Completo]                  │ ← Link to Dashboard
│                                             │
├─────────────────────────────────────────────┤
│  Este é um email automático.                │ ← Footer
│  © 2025 Nautilus One                        │
└─────────────────────────────────────────────┘

📎 Attachment: restore-chart-2025-10-11.png (optional)
```

## 🔒 Security Considerations

```
✅ Environment Variables
   └─ All sensitive data in env vars, never in code

✅ Authentication
   └─ Service role key used securely in Edge Function

✅ Email Validation
   └─ Recipient email validated before sending

✅ HTTPS Only
   └─ All API calls over secure connections

✅ Rate Limiting
   └─ Consider implementing on email API endpoint

✅ Access Control
   └─ Edge Function access can be restricted
```

## 🎨 Technologies Used

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Edge Function | Deno (Supabase) | Serverless orchestration |
| Email API | Node.js (Vercel/Netlify) | SMTP email sending |
| Email Library | nodemailer | Email transport |
| Chart | Chart.js | Data visualization |
| Database | Supabase PostgreSQL | Data storage |
| Scheduler | Cron / pg_cron | Daily execution |
| Frontend | Vite + React | Web application |

## 📱 Monitoring & Logs

```
View Edge Function logs:
└─ supabase functions logs daily-restore-report --follow

View Email API logs:
└─ Check Vercel/Netlify dashboard

Check cron execution:
└─ SELECT * FROM cron.job_run_details;

Email delivery status:
└─ Check SMTP service logs (Gmail, SendGrid, etc.)
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-10-11  
**Status**: ✅ Ready for deployment
