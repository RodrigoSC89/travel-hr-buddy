# Assistant Report Logs API

## Overview
This API endpoint provides access to logs of AI Assistant report sending events. It tracks when the assistant sends reports to users via email or other channels.

## Database Table

### `assistant_report_logs`
```sql
CREATE TABLE assistant_report_logs (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  report_type TEXT,
  metadata JSONB
);
```

## API Endpoints

### 1. Next.js App Router (Reference Implementation)
**Endpoint:** `GET /api/report/assistant-logs`

This is a reference implementation for Next.js 13+ App Router projects.

**Query Parameters:**
- `start` (optional): Start date filter (YYYY-MM-DD)
- `end` (optional): End date filter (YYYY-MM-DD)
- `email` (optional, admin only): Filter by user email (partial match)

**Authentication:** Via cookies (automatic with @supabase/ssr)

### 2. Supabase Edge Function (Active Implementation)
**Endpoint:** `GET /functions/v1/assistant-report-logs`

This is the active implementation used in the Vite + React application.

**Query Parameters:**
- `start` (optional): Start date filter (YYYY-MM-DD)
- `end` (optional): End date filter (YYYY-MM-DD)
- `email` (optional, admin only): Filter by user email (partial match)

**Authentication:** Via Authorization header (`Bearer <token>`)

**Example Request:**
```typescript
const { data: { session } } = await supabase.auth.getSession();

const params = new URLSearchParams();
params.append('start', '2025-10-01');
params.append('end', '2025-10-12');
params.append('email', 'user@example.com');

const response = await fetch(
  `${SUPABASE_URL}/functions/v1/assistant-report-logs?${params}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  }
);

const logs = await response.json();
```

## Response Format

```json
[
  {
    "id": "uuid",
    "user_email": "user@example.com",
    "status": "success",
    "message": "Report sent successfully",
    "sent_at": "2025-10-12T19:00:00Z",
    "user_id": "uuid",
    "report_type": "daily_summary"
  }
]
```

## Security

### Row Level Security (RLS)
- **Users:** Can only view their own report logs
- **Admins:** Can view all logs and filter by email
- **System:** Can insert logs for automated processes

### Policies
1. `Users can view their own report logs`
2. `Admins can view all report logs by role`
3. `Users can insert their own report logs`
4. `System can insert report logs` (for automated reports)
5. `Admins can update all report logs`
6. `Admins can delete all report logs`

## Admin Page

The admin page is located at `/admin/reports/assistant` and provides:

- 📅 Date range filtering (start and end dates)
- 📧 Email filtering (admin only)
- 📊 Visual display of logs with status indicators
- 📤 CSV export functionality
- 📄 PDF export functionality with jsPDF and autotable

### Features

1. **Filtering**
   - Filter by date range (start/end)
   - Filter by user email (admins only)
   - Real-time search updates

2. **Export Options**
   - CSV: Downloads a CSV file with all filtered logs
   - PDF: Generates a formatted PDF report with jsPDF

3. **Status Indicators**
   - ✅ Success (green badge)
   - ❌ Error (red badge)
   - ⏳ Pending (yellow badge)

4. **Display Format**
   - Date/time in local format
   - User email
   - Status with color coding
   - Message (if available)
   - Report type (if available)

## Usage Example

### Frontend (Admin Page)
```typescript
import { supabase } from "@/integrations/supabase/client";

async function fetchLogs() {
  const params = new URLSearchParams();
  params.append("start", "2025-10-01");
  params.append("end", "2025-10-12");
  
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-report-logs?${params}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );
  
  const logs = await response.json();
  return logs;
}
```

### Backend (Logging Reports)
```typescript
// Insert a new log entry when sending a report
const { error } = await supabase
  .from('assistant_report_logs')
  .insert({
    user_email: 'recipient@example.com',
    status: 'success',
    message: 'Daily report sent successfully',
    report_type: 'daily_summary',
    user_id: userId,
    metadata: {
      recipients: ['user1@example.com', 'user2@example.com'],
      subject: 'Daily Summary Report',
    }
  });
```

## Migration

The database table is created via migration file:
`supabase/migrations/20251012190000_create_assistant_report_logs.sql`

To apply:
```bash
supabase db push
```

## Dependencies

- `@supabase/supabase-js` - Database client
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF table formatting
- React Router - Page routing
- Shadcn UI - UI components

## Future Enhancements

- [ ] Real-time updates with Supabase realtime subscriptions
- [ ] Advanced filtering (status, report type)
- [ ] Pagination for large datasets
- [ ] Email notification settings
- [ ] Retry failed reports
- [ ] Detailed error logs viewer
