# 📸 Visual Guide - Automated Reports & TV Wall Features

## 🎯 Overview

This guide provides visual documentation for the two new features:
1. **Automated Daily CSV Reports** - Email reports with restore logs
2. **TV Wall Dashboard** - Real-time monitoring display

---

## 📧 Feature 1: Automated Daily CSV Report

### Email Report Example

```
From: Nautilus One Reports <noreply@nautilusone.com>
To: admin@example.com
Subject: 📊 Relatório Diário - Restore Logs 11/10/2025

┌─────────────────────────────────────────────────────┐
│   📊 Relatório Diário - Logs de Restauração        │
│   Nautilus One - Travel HR Buddy                   │
│   11/10/2025                                        │
└─────────────────────────────────────────────────────┘

📈 Resumo do Relatório
─────────────────────────
Total de Logs (últimas 24h): 12
Arquivo Anexo: ✅ CSV incluído

O relatório em formato CSV está anexado a este email com 
os logs de execução das últimas 24 horas.

Colunas do relatório:
• Date: Data e hora da execução
• Status: Status da execução (success, error, critical)
• Message: Mensagem descritiva
• Error: Detalhes do erro (se houver)

──────────────────────────────────────────────────────
Este é um email automático gerado diariamente às 7:00 AM.
© 2025 Nautilus One - Travel HR Buddy
```

### CSV Attachment Format

```csv
Date,Status,Message,Error
"11/10/2025 18:30:15","success","Relatório enviado com sucesso","-"
"11/10/2025 07:00:12","success","Relatório enviado com sucesso para admin@empresa.com","-"
"10/10/2025 07:00:08","error","Falha no envio do e-mail","{\"statusCode\": 500, \"message\": \"SMTP connection failed\"}"
"09/10/2025 07:00:05","success","Relatório enviado com sucesso","-"
```

### Execution Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  Supabase Cron (Daily at 7:00 AM UTC)              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Edge Function: send_daily_restore_report           │
│  ┌──────────────────────────────────────────────┐  │
│  │  1. Fetch logs from last 24h                 │  │
│  │  2. Generate CSV with data                   │  │
│  │  3. Generate HTML email                      │  │
│  │  4. Send via SendGrid/SMTP                   │  │
│  │  5. Log execution result                     │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────────┐
│ SendGrid API │      │ restore_report_  │
│ (Email Send) │      │ logs (Database)  │
└──────────────┘      └──────────────────┘
```

### Configuration Overview

```
Environment Variables:
├── SUPABASE_URL ........................... Supabase project URL
├── SUPABASE_SERVICE_ROLE_KEY ............. Service role key
├── ADMIN_EMAIL ........................... Report recipient
├── SENDGRID_API_KEY (Option 1) ........... SendGrid API key
└── EMAIL_FROM ............................ Sender email address

OR (Option 2 - SMTP):
├── VITE_APP_URL .......................... App URL with SMTP endpoint
├── EMAIL_HOST ............................ SMTP server
├── EMAIL_PORT ............................ SMTP port (587)
├── EMAIL_USER ............................ SMTP username
├── EMAIL_PASS ............................ SMTP password
└── EMAIL_FROM ............................ Sender email address
```

---

## 📺 Feature 2: TV Wall Dashboard

### Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📺 Restore Logs - Real Time          Última atualização: 18:30:45        │
│                                        Atualização automática a cada 60s    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Total de        │  │ Documentos      │  │ Média por Dia   │          │
│  │ Restaurações    │  │ Únicos          │  │                 │          │
│  │                 │  │                 │  │                 │          │
│  │      245        │  │      198        │  │      8.2        │          │
│  │                 │  │                 │  │                 │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐    │
│  │ 📊 Restaurações por Dia      │  │ 📈 Status dos Relatórios      │    │
│  │                               │  │                               │    │
│  │    █████                      │  │         ◉ Success: 75%       │    │
│  │    ████████                   │  │         ◉ Error: 15%         │    │
│  │    ██████                     │  │         ◉ Warning: 8%        │    │
│  │    ████                       │  │         ◉ Info: 2%           │    │
│  │    ████████                   │  │                               │    │
│  │    ███████                    │  │                               │    │
│  │    █████                      │  │                               │    │
│  │ ──┬──┬──┬──┬──┬──┬──┬──┬─── │  │                               │    │
│  │   5  6  7  8  9 10 11 12     │  │                               │    │
│  │          Outubro              │  │                               │    │
│  └───────────────────────────────┘  └───────────────────────────────┘    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Nautilus One - Travel HR Buddy © 2025                                    │
│  Dashboard de Monitoramento em Tempo Real                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Color Scheme

```
Background Colors:
├── Primary Background ............... #000000 (Black)
├── Card Background .................. #1F2937 (Dark Gray)
├── Border Color ..................... #374151 (Gray)
└── Text Color ....................... #FFFFFF (White)

Chart Colors:
├── Bar Chart ........................ #3B82F6 (Blue)
├── Pie - Success .................... #10B981 (Green)
├── Pie - Error ...................... #EF4444 (Red)
├── Pie - Warning .................... #F59E0B (Orange)
└── Pie - Info ....................... #3B82F6 (Blue)

Accent Colors:
├── Total Restaurações ............... #3B82F6 (Blue)
├── Documentos Únicos ................ #10B981 (Green)
└── Média por Dia .................... #A855F7 (Purple)
```

### Component Structure

```
TVWallLogs Component
├── Header Section
│   ├── Title: "📺 Restore Logs - Real Time"
│   └── Timestamp: Last update time + auto-refresh indicator
│
├── Summary Cards (3 columns)
│   ├── Card 1: Total de Restaurações
│   ├── Card 2: Documentos Únicos
│   └── Card 3: Média por Dia
│
├── Charts Section (2 columns)
│   ├── Bar Chart: Restaurações por Dia
│   │   ├── Data: Last 15 days from get_restore_count_by_day_with_email
│   │   ├── X-Axis: Date (short format)
│   │   └── Y-Axis: Count
│   │
│   └── Pie Chart: Status dos Relatórios
│       ├── Data: Last 100 logs from restore_report_logs
│       ├── Success: Green
│       ├── Error: Red
│       ├── Warning: Orange
│       └── Info: Blue
│
└── Footer Section
    ├── Copyright: "Nautilus One - Travel HR Buddy © 2025"
    └── Subtitle: "Dashboard de Monitoramento em Tempo Real"
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│  Browser @ /tv/logs                                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Every 60 seconds (auto-refresh)
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  TVWallLogs Component                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  fetchData() function:                       │  │
│  │                                               │  │
│  │  1. Call get_restore_count_by_day_with_email │  │
│  │     → Bar chart data                         │  │
│  │                                               │  │
│  │  2. Call get_restore_summary                 │  │
│  │     → Summary metrics                        │  │
│  │                                               │  │
│  │  3. Query restore_report_logs table          │  │
│  │     → Pie chart data                         │  │
│  │                                               │  │
│  │  4. Update lastUpdate timestamp              │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Supabase Database                                  │
│  ├── RPC: get_restore_count_by_day_with_email      │
│  ├── RPC: get_restore_summary                      │
│  └── Table: restore_report_logs                    │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```
Desktop (1920x1080+):
├── Header: Full width
├── Summary Cards: 3 columns (grid-cols-3)
├── Charts: 2 columns (grid-cols-2)
└── Full height available

Laptop (1366x768):
├── Header: Full width
├── Summary Cards: 3 columns (grid-cols-3)
├── Charts: 2 columns (grid-cols-2)
└── Scrollable if needed

Tablet (768px):
├── Header: Full width
├── Summary Cards: 1 column (grid-cols-1)
├── Charts: 1 column (grid-cols-1)
└── Vertically stacked

Mobile (< 768px):
├── Header: Full width, smaller text
├── Summary Cards: 1 column
├── Charts: 1 column, smaller height
└── Touch-friendly spacing
```

---

## 🚀 Quick Setup Checklists

### Daily Report Setup Checklist

```
Prerequisites:
☐ Supabase CLI installed
☐ Project linked to Supabase
☐ SendGrid account OR SMTP server access

Deployment Steps:
☐ Deploy edge function: supabase functions deploy send_daily_restore_report
☐ Set ADMIN_EMAIL secret
☐ Set SENDGRID_API_KEY or EMAIL_* secrets
☐ Verify config.toml has cron schedule
☐ Test manually: supabase functions invoke send_daily_restore_report
☐ Check email received
☐ Verify CSV attachment opens
☐ Confirm execution logged in database

Verification:
☐ Email arrives at scheduled time (7:00 AM UTC)
☐ CSV contains correct data
☐ No errors in function logs
☐ Database logs show "success" status
```

### TV Wall Setup Checklist

```
Prerequisites:
☐ Application deployed (includes TV Wall route)
☐ TV or monitor available
☐ Browser installed on display device
☐ Network access to application

Display Configuration:
☐ Open browser on TV/monitor
☐ Navigate to https://your-app-url/tv/logs
☐ Enable fullscreen mode (F11)
☐ Adjust zoom if needed (Ctrl/Cmd + +/-)
☐ Set up kiosk mode (optional)
☐ Verify auto-refresh works (60 seconds)

Verification:
☐ Dashboard loads without errors
☐ All charts display correctly
☐ Summary metrics show data
☐ Timestamp updates every 60 seconds
☐ Dark mode renders properly
☐ Layout looks good on screen
```

---

## 📊 Monitoring Dashboard

### Key Metrics to Track

```
Daily Report Metrics:
├── Success Rate ........................ % of successful sends
├── Average Execution Time .............. Seconds per execution
├── Email Delivery Rate ................. % delivered to inbox
└── Data Completeness ................... % of expected logs

TV Wall Metrics:
├── Uptime ............................. % time dashboard accessible
├── Refresh Success Rate ............... % successful data fetches
├── Average Load Time .................. Seconds to render
└── Chart Render Success ............... % charts displaying
```

---

## 🎨 Customization Examples

### Change Report Time

```toml
# In supabase/config.toml
[[edge_runtime.cron]]
schedule = "0 9 * * *"  # Change to 9:00 AM
```

### Change Refresh Interval

```typescript
// In src/pages/tv/LogsPage.tsx
const interval = setInterval(fetchData, 30000); // 30 seconds
```

### Change Chart Colors

```typescript
// In src/pages/tv/LogsPage.tsx
const COLORS = {
  success: "#your-color",
  error: "#your-color",
  warning: "#your-color",
  info: "#your-color",
};
```

---

## 📸 Screenshots

### TV Wall Dashboard
```
URL: /tv/logs
Resolution: 1920x1080
Browser: Chrome (Fullscreen)
Features visible:
- Dark theme with black background
- 3 metric cards at top
- Bar chart showing daily trends
- Pie chart showing status distribution
- Real-time timestamp
- Professional footer
```

### Email Report
```
Client: Gmail
Attachments: 1 CSV file
Format: HTML with inline CSS
Preview: Shows summary metrics
Attachment name: restore-logs-2025-10-11.csv
File size: ~2-5 KB (varies with data)
```

---

## 🔍 Troubleshooting Guide

### Common Issues - Daily Reports

```
Issue: Email not received
→ Check SendGrid API key
→ Verify ADMIN_EMAIL is correct
→ Check spam folder
→ Review function logs

Issue: CSV empty
→ Check if logs exist in database
→ Verify time range (last 24h)
→ Check database permissions

Issue: Function timeout
→ Increase timeout setting
→ Check database query performance
→ Verify network connectivity
```

### Common Issues - TV Wall

```
Issue: Charts not loading
→ Check browser console
→ Verify Supabase connection
→ Test RPC functions manually
→ Check RLS policies

Issue: Not auto-refreshing
→ Check interval code
→ Look for JavaScript errors
→ Verify useEffect cleanup
→ Test in different browser

Issue: Display formatting issues
→ Adjust zoom level
→ Check screen resolution
→ Try different browser
→ Review responsive CSS
```

---

## ✅ Success Indicators

### Daily Reports Working Correctly

```
✓ Email received at 7:00 AM UTC daily
✓ CSV attachment present and opens
✓ Data matches database records
✓ No errors in function logs
✓ Database shows "success" status
✓ Email formatting looks professional
```

### TV Wall Working Correctly

```
✓ Dashboard loads in < 3 seconds
✓ All charts render without errors
✓ Auto-refresh occurs every 60 seconds
✓ Timestamp updates correctly
✓ Dark theme displays properly
✓ Data is current and accurate
✓ No console errors
```

---

**Last Updated**: 2025-10-11  
**Version**: 1.0  
**Status**: ✅ Production Ready
