# Assistant Report Logs - Quick Reference

## Overview
This feature tracks when assistant reports are sent via email and provides a dedicated page to view, filter, and export these logs.

## Components Created

### 1. Database Migration
**File:** `supabase/migrations/20251012190900_create_assistant_report_logs.sql`

Creates the `assistant_report_logs` table with the following schema:
- `id` (UUID, primary key)
- `sent_at` (timestamp with timezone)
- `status` (text: success/error/pending)
- `message` (text)
- `user_email` (text)
- `logs_count` (integer)
- `recipient_email` (text, optional)

Includes RLS policies for admins and users.

### 2. Supabase Function Update
**File:** `supabase/functions/send-assistant-report/index.ts`

Enhanced to:
- Extract user email from authorization token
- Log successful report sends to database
- Log errors to database
- Track number of interactions in each report

### 3. Frontend Page
**File:** `src/pages/admin/reports/assistant.tsx`

Features:
- 📊 Bar chart showing reports sent per day (using Chart.js)
- 🔍 Date range filters (start date, end date)
- 👤 User email filter
- 📤 CSV export with proper UTF-8 encoding
- 📄 PDF export with formatted tables
- 📋 Log cards showing:
  - Date/time of send
  - User email
  - Status (success/error/pending)
  - Message
  - Number of interactions

### 4. Navigation Updates
**File:** `src/App.tsx`
- Added lazy-loaded route: `/admin/reports/assistant`

**File:** `src/pages/admin/assistant-logs.tsx`
- Added "Logs de Envio" button to navigate to the new page

## Usage

### Accessing the Page
1. Navigate to `/admin/reports/assistant`
2. Or click "Logs de Envio" button from the Assistant Logs page

### Filtering Logs
- **Date Range:** Set start and/or end date to filter by time period
- **Email:** Enter user email to filter by specific user
- Click "🔍 Buscar" to apply filters

### Exporting Data
- **CSV Export:** Click "📤 Exportar CSV" to download logs as CSV file
- **PDF Export:** Click "📄 Exportar PDF" to download logs as formatted PDF

### Viewing Charts
The bar chart automatically displays the number of reports sent per day based on current filters.

## Database Table Structure

```sql
CREATE TABLE assistant_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  user_email TEXT NOT NULL,
  logs_count INTEGER NOT NULL DEFAULT 0,
  recipient_email TEXT
);
```

## API Integration

The `send-assistant-report` Supabase function now automatically logs each report send attempt to the `assistant_report_logs` table.

**Success Log:**
```typescript
{
  status: "success",
  message: "Relatório preparado com sucesso",
  user_email: "user@example.com",
  logs_count: 25,
  recipient_email: "admin@example.com"
}
```

**Error Log:**
```typescript
{
  status: "error",
  message: "Error message here",
  user_email: "user@example.com",
  logs_count: 0
}
```

## Security

- RLS (Row Level Security) enabled on the table
- Admins can view all logs
- Users can view only their own logs
- Service role can insert logs

## Dependencies

- `chart.js` - For bar chart visualization
- `react-chartjs-2` - React wrapper for Chart.js
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF table formatting
- `date-fns` - Date formatting

## File Sizes

- Migration: ~1.5 KB
- Page component: ~9.9 KB
- Function update: ~6.2 KB

## Testing

To test the feature:
1. Go to Assistant Logs page (`/admin/assistant-logs`)
2. Click "Enviar E-mail" to send a report
3. Navigate to `/admin/reports/assistant`
4. Verify the log appears with status "success"
5. Test filters and export functionality

## Notes

- The email sending is currently simulated (returns success without actually sending)
- To enable real email sending, integrate with SendGrid, Mailgun, or AWS SES
- Chart data is grouped by day using locale date format (dd/MM/yyyy)
- CSV exports include UTF-8 BOM for Excel compatibility
