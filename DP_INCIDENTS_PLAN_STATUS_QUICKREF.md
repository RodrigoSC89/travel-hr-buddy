# DP Incidents Plan Status - Quick Reference

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
cd supabase
supabase db push
```

### 2. Verify Environment Variable
Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file.

### 3. Build & Test
```bash
npm run build
npm test
```

## 📊 Status Values

| Status | Emoji | Description |
|--------|-------|-------------|
| `pendente` | 🕒 | Initial state, awaiting action |
| `em andamento` | 🔄 | Work in progress |
| `concluído` | ✅ | Work completed |

## 🔌 API Endpoint

**URL**: `/api/dp-incidents/update-status`

**Method**: `POST`

**Request Body**:
```json
{
  "id": "incident-id",
  "status": "em andamento"
}
```

**Success Response**:
```json
{
  "ok": true,
  "incident": { /* updated incident */ }
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

## 💻 Component Usage

```tsx
import { PlanStatusSelect } from "@/components/dp-incidents/PlanStatusSelect";

<PlanStatusSelect 
  incident={incident}
  onStatusChange={(newStatus) => {
    // Handle status change
    console.log(`Status changed to: ${newStatus}`);
  }}
/>
```

## 🗄️ Database Schema

```sql
-- Fields added to dp_incidents table
plan_status TEXT DEFAULT 'pendente'
plan_sent_at TIMESTAMP WITH TIME ZONE
plan_updated_at TIMESTAMP WITH TIME ZONE
```

## 🧪 Testing

Run component tests:
```bash
npm test -- src/tests/components/dp-incidents/PlanStatusSelect.test.tsx
```

## 🐛 Common Issues

### Issue: API returns 404
**Solution**: Ensure the incident ID is correct and exists in the database

### Issue: Status not updating in UI
**Solution**: Check browser console for errors, verify `onStatusChange` callback is implemented

### Issue: Migration fails
**Solution**: Check if columns already exist, or if there are data type conflicts

## 📱 UI Locations

The PlanStatusSelect component is integrated in:

1. **DP Intelligence Center Modal**
   - Path: `src/components/dp-intelligence/dp-intelligence-center.tsx`
   - Location: Below the AI analysis tabs
   - Trigger: Click "Analisar IA" button on any incident

## 🔍 Useful SQL Queries

### View all incident statuses
```sql
SELECT id, title, plan_status, plan_updated_at 
FROM dp_incidents 
ORDER BY plan_updated_at DESC NULLS LAST;
```

### Count by status
```sql
SELECT plan_status, COUNT(*) as count
FROM dp_incidents 
GROUP BY plan_status;
```

### Find recently updated
```sql
SELECT * FROM dp_incidents 
WHERE plan_updated_at > NOW() - INTERVAL '7 days'
ORDER BY plan_updated_at DESC;
```

## 📈 Performance Tips

1. **Indexed field**: `plan_status` is indexed for fast filtering
2. **Timestamp tracking**: Use `plan_updated_at` for sorting/filtering
3. **Local state**: Component maintains local state to avoid unnecessary re-renders

## 🎨 Customization

### Change status options
Edit `src/components/dp-incidents/PlanStatusSelect.tsx`:
```tsx
<SelectItem value="your-status">
  🆕 Your Status Label
</SelectItem>
```

### Add new status to database
Update migration constraint:
```sql
ALTER TABLE dp_incidents 
DROP CONSTRAINT IF EXISTS dp_incidents_plan_status_check;

ALTER TABLE dp_incidents 
ADD CONSTRAINT dp_incidents_plan_status_check 
CHECK (plan_status IN ('pendente', 'em andamento', 'concluído', 'your-new-status'));
```

## 🔐 Security Notes

- API uses server-side authentication
- No sensitive data in client-side state
- All updates logged with timestamp
- RLS policies applied at database level

## 📞 Quick Debug

```bash
# Check if migration is applied
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='dp_incidents' AND column_name LIKE 'plan_%';"

# Test API endpoint
curl -X POST http://localhost:5173/api/dp-incidents/update-status \
  -H "Content-Type: application/json" \
  -d '{"id":"test-id","status":"em andamento"}'

# View recent errors in Supabase
# Check Supabase Dashboard > Database > Logs
```

## ✅ Deployment Checklist

- [ ] Migration applied to production database
- [ ] Environment variables set
- [ ] Build passes (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] API endpoint tested manually
- [ ] UI tested in browser (light & dark mode)
- [ ] Error handling verified
- [ ] Toast notifications working
- [ ] Timestamp displays correctly

## 📚 Related Files

- `supabase/migrations/20251018000000_add_plan_status_fields_to_dp_incidents.sql`
- `pages/api/dp-incidents/update-status.ts`
- `src/components/dp-incidents/PlanStatusSelect.tsx`
- `src/tests/components/dp-incidents/PlanStatusSelect.test.tsx`
- `src/components/dp-intelligence/dp-intelligence-center.tsx`

---

For detailed documentation, see [DP_INCIDENTS_PLAN_STATUS_IMPLEMENTATION.md](./DP_INCIDENTS_PLAN_STATUS_IMPLEMENTATION.md)
