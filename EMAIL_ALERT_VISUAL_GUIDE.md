# 📧 Email Alert Cron - Visual Guide

## 🎯 What This System Does

This automated system generates and sends weekly CI/CD reports via email. Here's what users will receive:

---

## 📧 Email Preview

### Subject Line
```
📊 Relatório Semanal de Cobertura CI - Nautilus One
```

### Email Body (HTML)

```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│      📊 Relatório Semanal de CI/CD                         │
│      Nautilus One - Travel HR Buddy                        │
│                                                             │
└────────────────────────────────────────────────────────────┘

Olá,

Segue anexo o relatório semanal de builds e cobertura de testes.

┌─────────────────────────────────────────────────────────────┐
│                    📈 Resumo Executivo                       │
│                                                              │
│  Total de Testes: 45    ✅ Sucessos: 38    ❌ Falhas: 7     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Para mais detalhes, consulte o PDF anexo ou acesse o dashboard do sistema.

────────────────────────────────────────────────────────────────
Este é um email automático. Por favor, não responda.
© 2025 Nautilus One - Travel HR Buddy
```

### Attachment
```
📎 ci-analytics-2025-10-10.pdf (256 KB)
```

---

## 📄 PDF Report Preview

### Page Layout

```
┌────────────────────────────────────────────────────────────┐
│                         HEADER                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  📊 Relatório Semanal de CI/CD                     │   │
│  │  Nautilus One - Travel HR Buddy                    │   │
│  │  Período: 10/10/2025                               │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│                     SUMMARY CARDS                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │  45  │  │  38  │  │   7  │  │ 84%  │                  │
│  │Total │  │✅ OK │  │❌Fail│  │Cover │                  │
│  └──────┘  └──────┘  └──────┘  └──────┘                  │
│                                                             │
│                 📋 Histórico de Builds                      │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Commit  │Branch │Status│Coverage│User│Date/Time   │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ abc1234 │ main  │ ✅   │  85%   │ GHA│10/10 14:30 │   │
│  │ def5678 │develop│ ✅   │  82%   │ Dev│10/10 12:15 │   │
│  │ ghi9012 │feature│ ❌   │  75%   │ Dev│10/09 18:45 │   │
│  │ jkl3456 │ main  │ ✅   │  87%   │ GHA│10/09 14:30 │   │
│  │ ...     │  ...  │ ...  │  ...   │... │  ...       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│                        FOOTER                               │
│  Relatório gerado automaticamente em 10/10/2025 14:35:22  │
│  © 2025 Nautilus One - Travel HR Buddy                     │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Styling Details

### Colors
- **Header Background**: Linear gradient (#667eea → #764ba2)
- **Header Text**: White
- **Summary Cards**: White background, blue accents
- **Table Header**: Blue (#667eea)
- **Success Indicators**: Green ✅
- **Failure Indicators**: Red ❌

### Typography
- **Font Family**: Arial, sans-serif
- **Header**: 28px bold
- **Body**: 14px regular
- **Table**: 12px regular

### Layout
- **Page Size**: A4 (210mm × 297mm)
- **Orientation**: Portrait
- **Margins**: Responsive
- **Grid**: Flexbox for summary cards

---

## 🔄 Workflow Diagram

```
┌─────────────────┐
│   GitHub Actions │
│   (Every Monday) │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ weekly-report-cron.js   │
└────────┬────────────────┘
         │
         ├──► Fetch from Supabase
         │    (test_results table)
         │
         ├──► Generate HTML
         │    (with statistics)
         │
         ├──► Convert to PDF
         │    (jsPDF + html2canvas)
         │
         └──► Send Email
              (nodemailer + SMTP)
```

---

## 📊 Data Flow

```
Supabase DB
    ↓
┌───────────────────┐
│  test_results     │
│  ├─ id            │
│  ├─ commit_hash   │
│  ├─ branch        │
│  ├─ status        │
│  ├─ coverage_%    │
│  ├─ triggered_by  │
│  └─ created_at    │
└───────────────────┘
    ↓
Script Processes
    ↓
┌───────────────────┐
│ Statistics        │
│  ├─ Total: 45     │
│  ├─ Success: 38   │
│  ├─ Failures: 7   │
│  └─ Avg Cov: 84%  │
└───────────────────┘
    ↓
HTML Template
    ↓
PDF File
    ↓
Email Delivery
```

---

## 🚀 Execution Flow

1. **Trigger**: Cron schedule or manual run
2. **Validation**: Check environment variables
3. **Connection**: Connect to Supabase
4. **Fetch**: Retrieve last 100 test results
5. **Process**: Calculate statistics
6. **Generate**: Create HTML with data
7. **Convert**: Transform HTML to PDF
8. **Send**: Email PDF via SMTP
9. **Report**: Log success/failure

---

## 📈 Sample Statistics

### Typical Report Contains:

```yaml
Metrics:
  - Total Tests: 30-100 entries
  - Time Range: Last 7 days
  - Branches: main, develop, feature/*
  - Coverage: 75-90% average
  - Success Rate: 80-95%

Details:
  - Commit SHAs (7 chars)
  - Branch names
  - Pass/Fail status
  - Coverage percentages
  - Executor names
  - Timestamps (BR timezone)
```

---

## 🔧 Customization Options

Users can customize:

1. **Email Frequency**: Modify cron schedule
2. **Recipients**: Add multiple emails
3. **Styling**: Edit CSS in script
4. **Data Range**: Adjust Supabase query limit
5. **Statistics**: Add/remove metrics
6. **Branding**: Update colors, logo, footer

---

## 📱 Responsive Design

The HTML email is designed to work on:
- ✅ Gmail (web, mobile)
- ✅ Outlook (web, desktop)
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ Mobile email clients

---

## 🎁 What Users Get

1. **Automated Reports**: No manual work needed
2. **Professional PDFs**: Print-ready documents
3. **HTML Emails**: Beautiful, responsive design
4. **Historical Data**: Track progress over time
5. **Actionable Insights**: Identify trends quickly
6. **Team Updates**: Keep everyone informed

---

## 📌 Key Benefits

- **Time Saving**: Automated weekly generation
- **Visibility**: Team-wide awareness of CI/CD health
- **Accountability**: Track who ran what tests
- **Trend Analysis**: See patterns over time
- **Professional**: Client-ready reports
- **Flexible**: Easy to customize and extend

---

This visual guide shows exactly what users will receive when the system is running!
