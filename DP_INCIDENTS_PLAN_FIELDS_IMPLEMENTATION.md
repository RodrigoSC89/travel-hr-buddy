# DP Incidents Action Plan Management - Implementation Guide

## 📋 Overview

This implementation adds action plan email management capabilities to the DP Intelligence Center, enabling automated email distribution and status tracking of AI-generated action plans for Dynamic Positioning incidents.

## 🎯 Problem Solved

The DP Intelligence Center needed:
- ✅ Store AI-generated action plans
- ✅ Send plans to responsible parties via email
- ✅ Track plan delivery status and progress
- ✅ Display plan status visually in the interface

## 🔧 Changes Made

### 1. Database Schema Enhancement

**Migration File:** `supabase/migrations/20251017193448_add_plan_fields_to_dp_incidents.sql`

Added three new fields to the `dp_incidents` table:

| Field | Type | Description | Constraint |
|-------|------|-------------|------------|
| `plan_sent_to` | TEXT | Email address of the recipient | - |
| `plan_status` | TEXT | Plan status | CHECK: "pendente" \| "em andamento" \| "concluído" |
| `plan_sent_at` | TIMESTAMP WITH TIME ZONE | Date and time when the plan was sent | - |

**SQL:**
```sql
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS plan_sent_to TEXT,
  ADD COLUMN IF NOT EXISTS plan_status TEXT CHECK (plan_status IN ('pendente', 'em andamento', 'concluído')),
  ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE;
```

**Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_sent_at ON public.dp_incidents(plan_sent_at DESC);
```

### 2. Email API Endpoint

**File:** `pages/api/dp-incidents/send-plan.ts`

Created new API endpoint: **POST /api/dp-incidents/send-plan**

#### Request Format

```json
{
  "id": "imca-2025-014",
  "email": "safety@company.com"
}
```

#### Response Format

**Success (200):**
```json
{
  "ok": true,
  "emailId": "re_abc123xyz",
  "message": "Plano de ação enviado com sucesso"
}
```

**Error (400/404/500):**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

#### Features

- ✅ Validates incident exists and has a generated action plan
- ✅ Sends formatted HTML email via Resend with incident details
- ✅ Automatically updates database with send timestamp and sets status to "pendente"
- ✅ Returns confirmation with email ID
- ✅ Comprehensive error handling

#### Email Template

The email includes:
- **Header:** Incident title, vessel, and date
- **Diagnosis:** Technical diagnosis from AI
- **Root Cause:** Probable root cause analysis
- **Corrective Actions:** Bulleted list of actions
- **Preventive Actions:** Bulleted list of preventive measures
- **Responsibility & Timeline:** Assigned responsible party and deadline
- **Standards Referenced:** Referenced IMCA/IMO standards
- **Call-to-Action:** Link to update status in platform

### 3. UI Enhancements

**File:** `src/components/dp-intelligence/dp-intelligence-center.tsx`

#### Incident Cards Updates

**New "Send Email" Button:**
- Appears only when `plan_of_action` exists
- Shows loading state while sending ("Enviando...")
- Prompts user for recipient email address
- Validates email format before sending

**Status Display:**
- **Sent:** Shows "✓ Enviado em DD/MM/YYYY" in green
- **Not Sent:** Shows "Não enviado" in gray
- **Plan Status:** Displays current status badge ("pendente" | "em andamento" | "concluído")

#### Interface Elements

```tsx
// Send Email Button (only visible when plan exists)
{incident.plan_of_action && (
  <Button 
    size="sm" 
    variant="secondary"
    onClick={() => handleSendPlan(incident.id)}
    disabled={sendingEmail === incident.id}
  >
    <Mail className="h-4 w-4 mr-1" />
    {sendingEmail === incident.id ? "Enviando..." : "📩 Enviar por E-mail"}
  </Button>
)}

// Status Display
{incident.plan_sent_at && (
  <div className="mt-2 text-xs text-muted-foreground">
    <span className="text-green-600">
      ✓ Enviado em {new Date(incident.plan_sent_at).toLocaleDateString("pt-BR")}
    </span>
    {incident.plan_status && (
      <Badge variant="outline">{incident.plan_status}</Badge>
    )}
  </div>
)}
```

## 🔄 Complete Workflow

1. **User analyzes incident with AI** → Generates action plan
2. **Plan automatically saved** to `plan_of_action` field
3. **"📩 Enviar por E-mail" button** becomes visible
4. **User clicks button** and enters recipient email
5. **System sends formatted email** via Resend API
6. **Database updated** with send info and status set to "pendente"
7. **Card displays** send date and current status

## 🔒 Security & Configuration

### Required Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RESEND_API_KEY` | Resend API key for email sending | - | ✅ Yes |
| `EMAIL_FROM` | Sender email address | `noreply@nautilus.system` | ❌ No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | - | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | ✅ Yes |

### Security Features

- ✅ Service role authentication for database operations
- ✅ Input validation for incident ID and email
- ✅ Email format validation
- ✅ Checks for plan availability before sending
- ✅ Error handling and logging

## 📦 Files Changed

| File | Type | Description |
|------|------|-------------|
| `supabase/migrations/20251017193448_add_plan_fields_to_dp_incidents.sql` | Migration | Database schema changes |
| `pages/api/dp-incidents/send-plan.ts` | API | New email sending endpoint |
| `src/components/dp-intelligence/dp-intelligence-center.tsx` | UI | Updated component with email functionality |

## ✅ Testing Results

### Build Status
```bash
npm run build
# ✅ Built successfully in 1m
```

### Lint Status
```bash
npm run lint
# ✅ No errors in modified files
```

### Test Status
```bash
npm test
# ✅ All 1515 tests passed
```

## 🚀 Deployment Steps

1. **Run database migration:**
   ```bash
   supabase migration up
   ```

2. **Set environment variables** in deployment platform:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (optional)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy application:**
   ```bash
   npm run build
   npm run deploy:vercel
   # or
   npm run deploy:netlify
   ```

4. **Verify functionality:**
   - Navigate to DP Intelligence Center
   - Generate an action plan
   - Test email sending functionality

## 📚 API Usage Examples

### Example 1: Send Action Plan

```javascript
// Send action plan to safety department
const response = await fetch('/api/dp-incidents/send-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'imca-2025-014',
    email: 'safety@company.com'
  })
});

const result = await response.json();
console.log(result);
// { ok: true, emailId: "re_abc123", message: "Plano de ação enviado com sucesso" }
```

### Example 2: Handle Errors

```javascript
try {
  const response = await fetch('/api/dp-incidents/send-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'imca-2025-014', email: 'invalid@email' })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const result = await response.json();
  console.log('Success:', result);
} catch (error) {
  console.error('Error sending plan:', error.message);
}
```

## 🐛 Troubleshooting

### Issue: Email not sending

**Possible causes:**
1. Missing or invalid `RESEND_API_KEY`
2. Invalid email address format
3. Action plan not yet generated

**Solution:**
- Verify environment variables are set
- Check email format validation
- Ensure action plan exists in database

### Issue: Database update fails

**Possible causes:**
1. Missing migration
2. Invalid `SUPABASE_SERVICE_ROLE_KEY`
3. RLS policies blocking update

**Solution:**
- Run migration: `supabase migration up`
- Verify service role key is correct
- Check RLS policies allow authenticated updates

### Issue: UI not showing send button

**Possible causes:**
1. `plan_of_action` field is null or empty
2. Component state not updated after generating plan

**Solution:**
- Generate action plan first
- Refresh incidents list
- Check console for errors

## 🎨 UI Screenshots

### Before Implementation
- Incident cards showed only basic information
- No way to send action plans via email
- No status tracking visible

### After Implementation
- **Email Send Button:** Visible on cards with generated plans
- **Status Display:** Shows send date and current status
- **Status Badges:** Color-coded status indicators
- **Loading States:** Visual feedback during email sending

## 📝 Additional Notes

### Email HTML Template
The email uses inline CSS for maximum compatibility across email clients:
- Responsive design
- Professional formatting
- Clear section headers with emojis
- Highlighted responsibility and timeline section
- Footer with disclaimer about AI-generated content

### Future Enhancements
- [ ] Add ability to resend emails
- [ ] Support multiple recipients (CC/BCC)
- [ ] Email templates customization
- [ ] Status update via email link
- [ ] Email delivery tracking and notifications
- [ ] Bulk email sending for multiple incidents

### Performance Considerations
- Database indexes added for `plan_status` and `plan_sent_at`
- Email sending is asynchronous (doesn't block UI)
- Efficient status queries with indexed fields

## 🤝 Contributing

When modifying this feature:
1. Update migration files for schema changes
2. Maintain backward compatibility
3. Update tests for new functionality
4. Document API changes
5. Update this documentation

## 📄 License

This implementation is part of the Nautilus One platform and follows the project's license terms.

---

**Last Updated:** October 18, 2025
**Version:** 1.0.0
**Implemented by:** GitHub Copilot AI Agent
