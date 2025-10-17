# DP Incidents Action Plan Status Update - Implementation Guide

## 📋 Overview

This feature allows responsible personnel (or auditors) to update the action plan status for DP (Dynamic Positioning) incidents with three states:
- 🕒 **Pendente** (Pending)
- 🔄 **Em andamento** (In Progress)  
- ✅ **Concluído** (Completed)

The system automatically tracks the date/time of status updates.

---

## 🗄️ Database Schema

### New Fields Added to `dp_incidents` Table

```sql
-- Status field with check constraint
plan_status TEXT DEFAULT 'pendente' 
  CHECK (plan_status IN ('pendente', 'em andamento', 'concluído'))

-- Timestamps for tracking
plan_sent_at TIMESTAMP WITH TIME ZONE
plan_updated_at TIMESTAMP WITH TIME ZONE
```

**Migration File:** `supabase/migrations/20251017193000_add_plan_fields_to_dp_incidents.sql`

### Index Added
```sql
CREATE INDEX idx_dp_incidents_plan_status ON dp_incidents(plan_status);
```

---

## 🔌 API Endpoint

### POST `/api/dp-incidents/update-status`

Updates the action plan status for a specific incident.

**Request Body:**
```json
{
  "id": "imca-2025-014",
  "status": "em andamento"
}
```

**Valid Status Values:**
- `"pendente"`
- `"em andamento"`
- `"concluído"`

**Success Response:**
```json
{
  "ok": true
}
```

**Error Responses:**

*Missing required fields (400):*
```json
{
  "error": "ID e status são obrigatórios."
}
```

*Invalid status (400):*
```json
{
  "error": "Status inválido."
}
```

*Server error (500):*
```json
{
  "error": "Error message from database"
}
```

**Implementation:** `pages/api/dp-incidents/update-status.ts`

---

## 🎨 UI Component

### PlanStatusSelect Component

A dropdown component for selecting and updating the action plan status.

**Location:** `src/components/dp-incidents/PlanStatusSelect.tsx`

**Usage:**
```tsx
import { PlanStatusSelect } from "@/components/dp-incidents/PlanStatusSelect";

<PlanStatusSelect 
  incident={incidentData}
  onStatusUpdate={(newStatus) => {
    console.log("Status updated to:", newStatus);
  }}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `incident` | `Incident` | Yes | Incident object with id, plan_status, plan_updated_at |
| `onStatusUpdate` | `(status: string) => void` | No | Callback function called after successful status update |

**Features:**
- ✨ Real-time status updates via API
- 🔄 Loading state with disabled select during updates
- ✅ Success toast notification
- ❌ Error handling with status reversion on failure
- 📅 Displays last updated timestamp in Brazilian Portuguese format
- 🎨 Dark mode support
- 🚫 Disabled state management

---

## 🔧 Integration

### DP Intelligence Center

The component is integrated into the DP Intelligence Center modal, displayed below the AI analysis tabs.

**File:** `src/components/dp-intelligence/dp-intelligence-center.tsx`

**Integration Point:**
```tsx
{/* Action Plan Status */}
{selectedIncident && (
  <div className="mt-6 pt-6 border-t">
    <PlanStatusSelect 
      incident={selectedIncident}
      onStatusUpdate={(newStatus) => {
        // Update incidents list
        setIncidents(prevIncidents => 
          prevIncidents.map(inc => 
            inc.id === selectedIncident.id 
              ? { ...inc, plan_status: newStatus, plan_updated_at: new Date().toISOString() }
              : inc
          )
        );
        // Update selected incident
        setSelectedIncident(prev => 
          prev ? { ...prev, plan_status: newStatus, plan_updated_at: new Date().toISOString() } : null
        );
      }}
    />
  </div>
)}
```

---

## 🧪 Testing

### Test Coverage

**File:** `src/tests/components/dp-incidents/PlanStatusSelect.test.tsx`

**Test Cases:**
1. ✅ Renders with initial status
2. ✅ Displays all status options (3 options)
3. ✅ Displays updated date when available
4. ✅ Hides updated date when not available
5. ✅ Calls API when status changes
6. ✅ Shows success toast on successful update
7. ✅ Shows error toast on failed update
8. ✅ Reverts status on error
9. ✅ Disables select while loading
10. ✅ Calls onStatusUpdate callback when provided

**Run tests:**
```bash
npm test -- src/tests/components/dp-incidents/PlanStatusSelect.test.tsx
```

---

## 🚀 Deployment

### Prerequisites

1. **Database Migration:**
   - Run the migration to add new fields to `dp_incidents` table
   ```bash
   # Via Supabase CLI
   supabase db push

   # Or via Supabase Dashboard
   # SQL Editor > Run migration file
   ```

2. **Environment Variables:**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for API routes
   - Verify `NEXT_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL` is configured

### Build & Deploy

```bash
# Build project
npm run build

# Deploy to Vercel
npm run deploy:vercel

# Or deploy to Netlify
npm run deploy:netlify
```

---

## 📊 User Flow

1. **View Incident:** User opens incident details in DP Intelligence Center
2. **AI Analysis:** User can analyze incident with AI (optional)
3. **Update Status:** User selects new status from dropdown below analysis
4. **Auto-Save:** Status is automatically saved to database
5. **Feedback:** User sees success toast and updated timestamp
6. **State Sync:** Incident list is updated without page reload

---

## 🔐 Security

### Server-Side Client

The API uses a server-side Supabase client with service role key for secure database operations.

**File:** `src/lib/supabase/server.ts`

**Features:**
- Service role key authentication
- No session persistence
- No automatic token refresh (server-side only)

### Row Level Security (RLS)

The `dp_incidents` table has RLS enabled with policy:
- **Read:** Authenticated users only
- **Update:** Via API with service role key

---

## 🎯 Future Enhancements

Potential improvements for future releases:

1. **Email Notifications:**
   - Send email when status changes to "concluído"
   - Notify assigned personnel on status updates

2. **Status History:**
   - Track all status changes with timestamps and users
   - Display timeline of status changes

3. **Bulk Operations:**
   - Update multiple incidents at once
   - Filter by status and bulk update

4. **Permissions:**
   - Role-based access control for status updates
   - Restrict certain statuses to specific user roles

5. **Analytics:**
   - Dashboard showing status distribution
   - Average time to completion metrics

---

## 📝 Changelog

### Version 1.0.0 (2025-10-17)

**Added:**
- Database fields: `plan_status`, `plan_sent_at`, `plan_updated_at`
- API endpoint: `/api/dp-incidents/update-status`
- UI Component: `PlanStatusSelect`
- Integration with DP Intelligence Center
- Comprehensive test suite (10 tests)
- Server-side Supabase client utility

**Testing:**
- ✅ All 1470 tests passing
- ✅ Build successful
- ✅ TypeScript compilation successful

---

## 🤝 Contributing

When extending this feature:

1. Maintain backward compatibility with existing incidents
2. Follow the established error handling patterns
3. Add tests for new functionality
4. Update this documentation

---

## 📞 Support

For issues or questions:
- Check existing issues in GitHub repository
- Review test cases for usage examples
- Consult this documentation for API details

---

## 📚 Related Documentation

- [DP Intelligence Center Guide](./DP_INTELLIGENCE_CENTER_IMPLEMENTATION.md)
- [Supabase Integration](./src/integrations/supabase/README.md)
- [API Testing Guide](./API_VALIDATION_GUIDE.md)
