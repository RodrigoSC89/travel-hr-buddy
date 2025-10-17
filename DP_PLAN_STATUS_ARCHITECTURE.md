# DP Plan Status Update - Architecture Overview

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                             │
│  /dp-incidents Page (src/pages/DPIncidents.tsx)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              IncidentCards Component                             │
│  (src/components/dp/IncidentCards.tsx)                          │
│  • Displays incident cards                                       │
│  • Conditionally renders PlanStatusSelect                        │
│  • Manages local state updates                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            PlanStatusSelect Component                            │
│  (src/components/dp/PlanStatusSelect.tsx)                       │
│  • Dropdown with 3 status options                               │
│  • Loading states & toast notifications                          │
│  • Displays last update timestamp                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ POST /api/dp-incidents/update-status
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Endpoint                                  │
│  (pages/api/dp-incidents/update-status.ts)                      │
│  • Validates request (id, status)                               │
│  • Updates plan_status & plan_updated_at                        │
│  • Returns updated incident data                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Database                              │
│  Table: dp_incidents                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Columns:                                                   │  │
│  │ • id (TEXT) PRIMARY KEY                                   │  │
│  │ • title, date, vessel, location                           │  │
│  │ • plan_of_action (TEXT)                                   │  │
│  │ • plan_status (TEXT) ← Updated here                       │  │
│  │ • plan_sent_to (TEXT)                                     │  │
│  │ • plan_sent_at (TIMESTAMP)                                │  │
│  │ • plan_updated_at (TIMESTAMP) ← Updated here              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Automated Email System (Async)                      │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Cron: Daily @ 08:00 UTC
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           Supabase Edge Function                                 │
│  (supabase/functions/resend_pending_plans/index.ts)             │
│  1. Query pending plans (status='pendente')                     │
│  2. Filter: plan_sent_at >= 7 days ago                          │
│  3. Send email reminder via Resend API                          │
│  4. Update plan_sent_at to current timestamp                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Resend Email API                              │
│  • Sends email to plan_sent_to address                          │
│  • Subject: "⏰ Lembrete: Plano de Ação Pendente"               │
│  • Body: Incident details + full action plan                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### User Updates Status

```
User selects status in dropdown
        ↓
PlanStatusSelect.handleChange()
        ↓
POST /api/dp-incidents/update-status
        ↓
API validates status value
        ↓
Supabase client updates database:
  - plan_status = new status
  - plan_updated_at = NOW()
        ↓
Response sent to frontend
        ↓
Toast notification shown
        ↓
onUpdate callback triggers
        ↓
Local state updated in IncidentCards
        ↓
UI reflects new status
```

### Automated Email Reminder

```
Cron triggers @ 08:00 UTC daily
        ↓
Edge Function: resend_pending_plans
        ↓
Query database:
  WHERE plan_status = 'pendente'
    AND plan_sent_to IS NOT NULL
    AND plan_sent_at <= NOW() - 7 days
        ↓
For each matching incident:
        ↓
Send email via Resend API
        ↓
Update plan_sent_at = NOW()
        ↓
Log result (success/failure)
        ↓
Return summary report
```

## 📁 File Structure

```
travel-hr-buddy/
│
├── pages/api/
│   └── dp-incidents/
│       └── update-status.ts          ← API endpoint
│
├── src/
│   ├── components/dp/
│   │   ├── IncidentCards.tsx         ← Updated with integration
│   │   └── PlanStatusSelect.tsx      ← New status selector
│   │
│   └── tests/
│       ├── dp-incidents-status-api.test.ts         ← API tests
│       └── components/dp/
│           └── PlanStatusSelect.test.tsx           ← Component tests
│
├── supabase/
│   ├── config.toml                   ← Updated with cron config
│   │
│   ├── functions/
│   │   └── resend_pending_plans/
│   │       └── index.ts              ← Email automation
│   │
│   └── migrations/
│       └── 20251017193400_add_plan_fields_to_dp_incidents.sql
│
└── Documentation/
    ├── DP_PLAN_STATUS_FEATURE.md                  ← Feature guide
    ├── DP_PLAN_STATUS_IMPLEMENTATION_SUMMARY.md   ← Technical summary
    └── DP_PLAN_STATUS_ARCHITECTURE.md             ← This file
```

## 🔐 Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Layer                         │
│  • User authenticated via Supabase Auth                         │
│  • RLS policies on dp_incidents table                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Authorization Layer                           │
│  • API validates user has access                                │
│  • Service role for Edge Functions                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Validation Layer                             │
│  • Input validation (id, status)                                │
│  • Status enum check                                            │
│  • SQL injection protection (parameterized queries)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
│  • CHECK constraint on plan_status column                       │
│  • Timestamp constraints                                        │
│  • Foreign key integrity (if applicable)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Component Interaction Matrix

| Component | Depends On | Provides To |
|-----------|-----------|-------------|
| DPIncidents Page | IncidentCards | Page layout |
| IncidentCards | PlanStatusSelect, API | Incident list |
| PlanStatusSelect | API, Sonner toast | Status UI |
| API Endpoint | Supabase client | CRUD operations |
| Edge Function | Supabase client, Resend | Email automation |
| Database | Migrations | Data persistence |

## 📊 State Management

### Frontend State
```typescript
// IncidentCards Component
const [incidents, setIncidents] = useState<Incident[]>([]);

// PlanStatusSelect Component
const [status, setStatus] = useState(incident.plan_status || "pendente");
const [loading, setLoading] = useState(false);
```

### Backend State
```sql
-- Database columns track state
plan_status         -- Current status
plan_sent_at        -- When plan was sent/resent
plan_updated_at     -- Last status change
```

## 🔍 Monitoring Points

1. **API Endpoint**
   - Request rate
   - Success/error ratio
   - Response time

2. **Edge Function**
   - Execution frequency (should be daily)
   - Number of emails sent
   - Failed email count
   - Execution duration

3. **Database**
   - Number of pending plans
   - Average days pending
   - Status distribution

4. **User Interface**
   - Status change frequency
   - User engagement metrics
   - Error rates

## 🚦 Error Handling Flow

```
Error occurs
    ↓
Is it a network error? ──Yes──→ Retry with exponential backoff
    ↓ No                              ↓
    │                            Max retries reached?
    ↓                                  ↓ Yes
Is it a validation error? ──Yes──→ Show user-friendly message
    ↓ No                              ↓
    │                            Log error to console
    ↓                                  ↓
Is it a server error? ──Yes──→ Show generic error + log details
    ↓ No                              ↓
    │                            Revert UI to previous state
    ↓                                  ↓
Unknown error ──→ Log + Show generic message
    ↓
Restore previous state
    ↓
Allow user to retry
```

## 🔄 Update Workflow

### Manual Status Update
1. User sees incident with action plan
2. User opens status dropdown
3. User selects new status
4. Component shows loading state
5. API call made
6. Database updated
7. Success response
8. Toast notification shown
9. UI updated with new status
10. Timestamp refreshed

### Automatic Reminder
1. Cron triggers daily
2. Function queries database
3. Filters old pending plans
4. Iterates through matches
5. Sends email for each
6. Updates sent timestamp
7. Logs results
8. Returns summary

## 📈 Performance Considerations

### Indexes
```sql
-- Fast status filtering
CREATE INDEX idx_dp_incidents_plan_status 
ON dp_incidents(plan_status);

-- Optimize cron queries
CREATE INDEX idx_dp_incidents_plan_sent_at 
ON dp_incidents(plan_sent_at);
```

### Optimization Strategies
- Conditional rendering (only show when plan exists)
- Debounced API calls (prevent double-clicks)
- Indexed database columns
- Efficient cron queries with filters
- Batch email sending in Edge Function

## 🧩 Integration Points

### Existing Systems
- **DP Intelligence Center** (`/dp-incidents`): Main UI
- **Supabase Auth**: User authentication
- **Resend API**: Email delivery
- **Sonner**: Toast notifications

### Future Integration Opportunities
- Analytics dashboard
- Reporting system
- Audit log
- Notification center
- Mobile app

## 🎓 Key Design Decisions

1. **Status as CHECK constraint**: Ensures data integrity at DB level
2. **Separate timestamps**: Tracks both initial send and updates
3. **Conditional rendering**: Clean UI, only shows when relevant
4. **Optimistic updates**: Better UX with error recovery
5. **Edge Function for cron**: Scalable, serverless automation
6. **7-day threshold**: Balances reminder frequency with spam prevention

---

**Architecture Version:** 1.0  
**Last Updated:** 2025-10-17  
**Status:** ✅ Production Ready
