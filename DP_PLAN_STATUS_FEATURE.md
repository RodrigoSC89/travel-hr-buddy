# DP Incidents Plan Status Update Feature

## 📋 Overview

This feature allows responsible parties and auditors to update the status of action plans for DP (Dynamic Positioning) incidents, with automatic tracking of update dates and email reminders for pending plans.

## ✨ Features

### 1. Plan Status Management
- **Three Status Options:**
  - 🕒 **Pendente** (Pending)
  - 🔄 **Em andamento** (In Progress)
  - ✅ **Concluído** (Completed)

### 2. Automatic Timestamp Tracking
- `plan_sent_at`: Timestamp when the plan was sent
- `plan_updated_at`: Timestamp when the status was last updated

### 3. Automated Email Reminders
- Cron job runs daily at 08:00 UTC (05:00 BRT)
- Automatically resends plans that have been pending for 7+ days
- Updates `plan_sent_at` timestamp after resending

## 🗄️ Database Schema

### New Fields in `dp_incidents` Table

```sql
ALTER TABLE public.dp_incidents
  ADD COLUMN plan_of_action TEXT,
  ADD COLUMN plan_status TEXT DEFAULT 'pendente' CHECK (plan_status IN ('pendente', 'em andamento', 'concluído')),
  ADD COLUMN plan_sent_to TEXT,
  ADD COLUMN plan_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN plan_updated_at TIMESTAMP WITH TIME ZONE;
```

### Indexes
- `idx_dp_incidents_plan_status`: For efficient status filtering
- `idx_dp_incidents_plan_sent_at`: For cron job optimization

## 🔌 API Endpoints

### Update Plan Status
**POST** `/api/dp-incidents/update-status`

#### Request Body
```json
{
  "id": "incident-id",
  "status": "pendente" | "em andamento" | "concluído"
}
```

#### Response
```json
{
  "ok": true,
  "message": "Status atualizado com sucesso.",
  "data": {
    "id": "incident-id",
    "plan_status": "em andamento",
    "plan_updated_at": "2025-10-17T19:00:00Z"
  }
}
```

#### Error Responses
- `400`: Invalid status or missing required fields
- `404`: Incident not found
- `500`: Internal server error

## 🎨 UI Components

### PlanStatusSelect Component

**Location:** `src/components/dp/PlanStatusSelect.tsx`

**Usage:**
```tsx
import { PlanStatusSelect } from "@/components/dp/PlanStatusSelect";

<PlanStatusSelect 
  incident={incident} 
  onUpdate={(status) => handleStatusUpdate(incident.id, status)}
/>
```

**Props:**
- `incident`: Incident object with at least `id`, `plan_status`, and optionally `plan_updated_at`
- `onUpdate`: Optional callback function called when status is successfully updated

**Features:**
- Dropdown selector with emoji indicators
- Loading state during API calls
- Toast notifications for success/error
- Displays last update timestamp
- Automatic error recovery

## ⚙️ Supabase Edge Function

### Function: `resend_pending_plans`

**Location:** `supabase/functions/resend_pending_plans/index.ts`

**Purpose:** Automatically resend pending action plans that are 7+ days old

**Schedule:** Daily at 08:00 UTC (configured in `supabase/config.toml`)

**Logic:**
1. Fetch all incidents with:
   - `plan_status = "pendente"`
   - `plan_sent_to` is not null
   - `plan_of_action` is not null
2. Filter incidents where `plan_sent_at` is >= 7 days old
3. Send reminder email to `plan_sent_to` address
4. Update `plan_sent_at` to current timestamp

**Environment Variables Required:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `RESEND_API_KEY`: Resend API key for email sending (optional)

**Response:**
```json
{
  "message": "Processados 3 planos pendentes",
  "resent_count": 3,
  "failed_count": 0,
  "results": [...]
}
```

## 🧪 Testing

### Component Tests
**Location:** `src/tests/components/dp/PlanStatusSelect.test.tsx`

Tests cover:
- Initial rendering with correct status
- Display of all status options
- Timestamp display
- API calls on status change
- Callback invocation
- Loading state behavior

### API Tests
**Location:** `src/tests/dp-incidents-status-api.test.ts`

Tests cover:
- Valid status values
- Invalid status rejection
- Request structure validation
- Update payload validation

**Run Tests:**
```bash
npm run test
```

## 📦 Cron Job Configuration

The cron job is configured in `supabase/config.toml`:

```toml
[functions.resend_pending_plans]
verify_jwt = false

[[edge_runtime.cron]]
name = "resend-pending-plans"
function_name = "resend_pending_plans"
schedule = "0 8 * * *"  # Every day at 08:00 UTC
description = "DP: Resend pending action plans older than 7 days via email"
```

## 🔄 Integration

### In DP Intelligence Center

The feature is integrated into the existing DP Incidents page (`/dp-incidents`):

1. Incidents with action plans show the PlanStatusSelect dropdown
2. Status changes are reflected in real-time
3. Updated timestamps are displayed below the selector
4. Email reminders are sent automatically for overdue plans

## 🚀 Deployment

### Database Migration
```bash
# Run migration to add new fields
supabase db push
```

### Deploy Edge Function
```bash
# Deploy the cron function
supabase functions deploy resend_pending_plans
```

### Environment Variables
Ensure the following are set in your Supabase project:
- `RESEND_API_KEY` (for email functionality)

## 📝 Usage Example

### For Responsible Party/Auditor:

1. Navigate to `/dp-incidents`
2. View incident cards with action plans
3. Use the dropdown to update status:
   - Select "Em andamento" when work begins
   - Select "Concluído" when finished
4. Status and timestamp update automatically
5. If pending for 7+ days, receive automatic email reminder

### For System Administrator:

1. Monitor cron job execution in Supabase dashboard
2. Check execution logs for email sending status
3. View `plan_updated_at` timestamps in database

## 🔍 Monitoring

### Check Cron Job Health
- View execution logs in Supabase Dashboard > Edge Functions > resend_pending_plans
- Monitor email delivery via Resend dashboard
- Query incidents by status for reporting:

```sql
SELECT 
  plan_status,
  COUNT(*) as count,
  AVG(EXTRACT(DAY FROM NOW() - plan_sent_at)) as avg_days_pending
FROM dp_incidents
WHERE plan_of_action IS NOT NULL
GROUP BY plan_status;
```

## 🐛 Troubleshooting

### Status Not Updating
- Check browser console for API errors
- Verify incident ID is correct
- Ensure user has necessary permissions

### Emails Not Sending
- Verify `RESEND_API_KEY` is set in Supabase
- Check Resend dashboard for delivery status
- Review edge function logs for errors

### Cron Job Not Running
- Verify cron configuration in `config.toml`
- Check Supabase project settings
- Review edge function execution logs

## 🎯 Future Enhancements

Potential improvements to consider:
- Dashboard showing completion rates by vessel
- Automated escalation for overdue plans
- Bulk status updates
- Export plan status reports
- Integration with notification systems
- Custom reminder intervals

## 📚 References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Resend API Documentation](https://resend.com/docs)
