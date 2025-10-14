# Unified Admin Dashboard - Implementation Guide

## Overview
This guide documents the implementation of the unified admin dashboard with monthly restore summary by department, PDF export functionality, QR code sharing, and automated email reports via cron scheduling.

## Features Implemented

### 1. Monthly Department Summary Chart
**Location:** `/src/pages/admin/dashboard.tsx`

**Visual Display:**
- Horizontal bar chart showing restore counts by department
- Green color scheme (rgba(34, 197, 94, 0.8))
- Sorted by count (descending)
- Handles missing departments ("Sem Departamento")

**Data Source:**
```typescript
// RPC Function: get_monthly_restore_summary_by_department()
interface MonthlySummaryDataPoint {
  department: string;
  count: number;
}
```

**Implementation:**
```typescript
const { data, error } = await supabase
  .rpc("get_monthly_restore_summary_by_department");
```

### 2. PDF Export Functionality
**Location:** `/src/pages/admin/dashboard.tsx`

**Features:**
- Exports dashboard summary as PDF
- Includes monthly department summary
- Includes 15-day trend data
- Uses jsPDF library (already in dependencies)
- Only available in authenticated mode (not public mode)

**Usage:**
```typescript
const exportPDF = async () => {
  // Generates PDF with:
  // - Title and date
  // - Monthly department summary with visual bars
  // - 15-day activity trend
  // - Auto-downloads to user device
}
```

### 3. QR Code for Public Access
**Location:** `/src/pages/admin/dashboard.tsx`

**Features:**
- Generates QR code for public dashboard URL
- URL format: `${window.location.origin}/admin/dashboard?public=1`
- Public mode provides read-only access
- Suitable for TV wall displays

### 4. Public/Private Mode
**Features:**
- Public mode activated via URL parameter: `?public=1`
- Public mode hides:
  - QR code section
  - PDF export button
  - Sensitive user-specific data
- Public mode shows:
  - Monthly department summary chart
  - Dashboard statistics
  - Read-only indicator badge

### 5. Automated Email Reports
**Location:** `/supabase/functions/send-dashboard-report/index.ts`

**Features:**
- Sends automated dashboard reports via email
- Uses Resend API for email delivery
- Sends to all users with email addresses
- Includes dashboard statistics and public URL
- Can be triggered manually or via cron

## Database Layer

### RPC Function: `get_monthly_restore_summary_by_department()`
**File:** `/supabase/migrations/20251014000000_add_monthly_restore_summary_by_department.sql`

```sql
CREATE OR REPLACE FUNCTION public.get_monthly_restore_summary_by_department()
RETURNS TABLE(department text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(p.department, 'Sem Departamento') as department,
    count(*)::bigint as count
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  WHERE r.restored_at >= date_trunc('month', CURRENT_DATE)
  GROUP BY p.department
  ORDER BY count DESC
$$;
```

**Purpose:** Returns monthly restore summary grouped by department for current month

**Permissions:** Granted to authenticated users

## Cron Scheduling Setup

### Using PostgreSQL pg_cron Extension

**Step 1: Enable pg_cron**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Step 2: Schedule Daily Report**
```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',  -- 9:00 AM daily (adjust timezone as needed)
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY","Content-Type":"application/json"}',
    body := '{}'
  );$$
);
```

**Important:** Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key

**Step 3: Verify Schedule**
```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

### Alternative: Using cron.yaml (Not applicable for Supabase)

**Note:** The problem statement mentions creating a `cron.yaml` file, but Supabase uses PostgreSQL's `pg_cron` extension instead. The syntax mentioned in the problem statement is more suitable for Google Cloud Platform App Engine.

**Example cron.yaml (for reference only):**
```yaml
cron:
  - name: send-dashboard-report
    schedule: "0 8 * * *"
    endpoint: "/functions/v1/send-dashboard-report"
```

This syntax is **NOT applicable** for Supabase deployments. Use the SQL-based `pg_cron` method documented above.

## Environment Variables

### Required for Edge Function
Set these in Supabase Dashboard → Settings → Edge Functions → Environment Variables:

```bash
RESEND_API_KEY=re_xxxxx...          # Required: Resend API key for email
BASE_URL=https://your-app.com       # Required: Base URL for public dashboard link
EMAIL_FROM=dashboard@empresa.com    # Optional: Email sender address (default: dashboard@empresa.com)
SUPABASE_URL=https://xxx.supabase.co    # Auto-configured
SUPABASE_SERVICE_ROLE_KEY=xxx           # Auto-configured
```

## Deployment Steps

### 1. Database Migration
The RPC function is already created via migration file:
```bash
# No action needed - migration already exists
# File: supabase/migrations/20251014000000_add_monthly_restore_summary_by_department.sql
```

### 2. Deploy Edge Function
```bash
# Deploy send-dashboard-report function
supabase functions deploy send-dashboard-report
```

### 3. Configure Environment Variables
Set the required environment variables in Supabase Dashboard (see section above)

### 4. Set Up Cron Schedule
Run the SQL commands in Supabase SQL Editor (see Cron Scheduling Setup section)

### 5. Deploy Frontend
```bash
# Build and deploy
npm run build
# Deploy dist/ to hosting provider (Vercel, Netlify, etc.)
```

## Testing

### Manual Testing

**Test PDF Export:**
1. Navigate to `/admin/dashboard`
2. Click "Baixar relatório em PDF"
3. Verify PDF downloads with correct data

**Test Monthly Summary Chart:**
1. Navigate to `/admin/dashboard`
2. Verify chart displays with department data
3. Check horizontal bar orientation and green colors

**Test Public Mode:**
1. Navigate to `/admin/dashboard?public=1`
2. Verify QR code and PDF export are hidden
3. Verify public mode indicator badge is shown

**Test Edge Function:**
```bash
# Manual trigger via curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-dashboard-report \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Automated Tests
```bash
# Run existing tests
npm test -- src/tests/pages/admin/dashboard.test.tsx

# All tests should pass
```

## Monitoring

### Check Cron Job Status
```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC 
LIMIT 10;
```

### Check Edge Function Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → send-dashboard-report
3. View Logs tab for execution history

## Troubleshooting

### Monthly Summary Chart Not Displaying
**Problem:** Chart is empty or not loading

**Solutions:**
1. Check if RPC function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'get_monthly_restore_summary_by_department';
   ```
2. Verify data exists:
   ```sql
   SELECT * FROM get_monthly_restore_summary_by_department();
   ```
3. Check browser console for errors

### PDF Export Fails
**Problem:** PDF generation or download fails

**Solutions:**
1. Verify jsPDF is installed: `npm list jspdf`
2. Check browser console for errors
3. Ensure data is loaded before export

### Email Reports Not Sending
**Problem:** Cron job runs but emails not received

**Solutions:**
1. Verify RESEND_API_KEY is set correctly
2. Check users have email addresses in profiles table
3. Review Resend API dashboard for errors
4. Check edge function logs for execution errors

### Cron Job Not Running
**Problem:** Scheduled job doesn't execute

**Solutions:**
1. Verify pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
2. Check job is active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
   ```
3. Review job run history for errors:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

## Related Documentation

- `DASHBOARD_REPORT_IMPLEMENTATION_COMPLETE.md` - Complete implementation guide
- `CRON_DASHBOARD_REPORT.md` - Detailed cron scheduling guide
- `VISUAL_SUMMARY_RESTORE_DASHBOARD.md` - Visual implementation summary
- `src/pages/admin/dashboard.tsx` - Frontend implementation
- `supabase/functions/send-dashboard-report/index.ts` - Backend implementation

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (Frontend)                   │
│  /src/pages/admin/dashboard.tsx                                 │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Monthly Chart  │  │  PDF Export     │  │   QR Code       │ │
│  │ (Recharts)     │  │  (jsPDF)        │  │  (QRCodeSVG)    │ │
│  └────────────────┘  └─────────────────┘  └─────────────────┘ │
│           ↓                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            ↓
    ┌───────────────────┐
    │   Supabase API    │
    │                   │
    │  RPC: get_monthly_│
    │  restore_summary_ │
    │  by_department()  │
    └───────────────────┘
            ↓
    ┌───────────────────┐
    │    Database       │
    │                   │
    │ • document_restore│
    │   _logs           │
    │ • profiles        │
    └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Automated Email Reports (Backend)                   │
│                                                                  │
│  ┌──────────────┐        ┌────────────────┐                    │
│  │  pg_cron     │───────>│ send-dashboard │                    │
│  │  (Scheduler) │        │ -report        │                    │
│  │              │        │ (Edge Function)│                    │
│  │ Daily 9 AM   │        └────────────────┘                    │
│  └──────────────┘               ↓                               │
│                        ┌──────────────────┐                     │
│                        │   Resend API     │                     │
│                        │  (Email Service) │                     │
│                        └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

**Status:** ✅ COMPLETE AND READY FOR DEPLOYMENT

**Files Modified:**
- `/src/pages/admin/dashboard.tsx` - Added monthly chart, PDF export

**Files Existing (No Changes Needed):**
- `/supabase/migrations/20251014000000_add_monthly_restore_summary_by_department.sql` - RPC function
- `/supabase/functions/send-dashboard-report/index.ts` - Email functionality
- `CRON_DASHBOARD_REPORT.md` - Cron setup documentation

**Dependencies:**
- ✅ jsPDF (already installed)
- ✅ qrcode.react (already installed)
- ✅ recharts (already installed)

**Tests:**
- ✅ All existing tests pass (11/11)
- ✅ Build successful
- ✅ Lint passed (no new errors)

**Next Steps:**
1. Deploy the updated frontend
2. Ensure edge function is deployed
3. Configure environment variables in Supabase
4. Set up cron schedule using pg_cron SQL commands
5. Test email reports manually before relying on cron
