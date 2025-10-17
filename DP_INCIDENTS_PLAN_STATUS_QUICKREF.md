# DP Incidents Plan Status - Quick Reference

## 🚀 Quick Start

### Update Status via UI
1. Open DP Intelligence Center
2. Click "Analisar IA" on any incident
3. Scroll to "Status do Plano" dropdown at bottom
4. Select new status (Pendente / Em andamento / Concluído)
5. Status saves automatically

### Status Options
| Status | Icon | Description |
|--------|------|-------------|
| **pendente** | 🕒 | Action plan pending |
| **em andamento** | 🔄 | Action plan in progress |
| **concluído** | ✅ | Action plan completed |

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/20251017193000_add_plan_fields_to_dp_incidents.sql` | Database migration |
| `pages/api/dp-incidents/update-status.ts` | API endpoint |
| `src/components/dp-incidents/PlanStatusSelect.tsx` | UI component |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/tests/components/dp-incidents/PlanStatusSelect.test.tsx` | Tests |

---

## 🔌 API Quick Reference

### Endpoint
```
POST /api/dp-incidents/update-status
```

### Request
```bash
curl -X POST http://localhost:3000/api/dp-incidents/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "id": "imca-2025-014",
    "status": "em andamento"
  }'
```

### Response
```json
{ "ok": true }
```

---

## 💻 Component Usage

```tsx
import { PlanStatusSelect } from "@/components/dp-incidents/PlanStatusSelect";

<PlanStatusSelect 
  incident={{
    id: "imca-2025-014",
    plan_status: "pendente",
    plan_updated_at: "2025-01-15T10:00:00.000Z"
  }}
  onStatusUpdate={(status) => console.log(status)}
/>
```

---

## 🗄️ Database Fields

```sql
-- In dp_incidents table
plan_status TEXT DEFAULT 'pendente'
plan_sent_at TIMESTAMP WITH TIME ZONE
plan_updated_at TIMESTAMP WITH TIME ZONE
```

---

## 🧪 Run Tests

```bash
# Run all tests
npm test

# Run only PlanStatusSelect tests
npm test -- src/tests/components/dp-incidents/PlanStatusSelect.test.tsx

# Run with coverage
npm run test:coverage
```

---

## 🔧 Common Tasks

### Query incidents by status
```sql
SELECT * FROM dp_incidents 
WHERE plan_status = 'em andamento'
ORDER BY plan_updated_at DESC;
```

### Check recent updates
```sql
SELECT id, title, plan_status, plan_updated_at 
FROM dp_incidents 
WHERE plan_updated_at > NOW() - INTERVAL '7 days'
ORDER BY plan_updated_at DESC;
```

### Count by status
```sql
SELECT plan_status, COUNT(*) 
FROM dp_incidents 
GROUP BY plan_status;
```

---

## 🐛 Troubleshooting

### Status not updating
- Check browser console for errors
- Verify API endpoint is accessible
- Check Supabase service role key is set

### Migration failed
```bash
# Reset and retry
supabase db reset
supabase db push
```

### Tests failing
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

---

## 📊 Status Icons & Colors

In UI components:
- 🕒 **Pendente** - Yellow badge
- 🔄 **Em andamento** - Blue/animated
- ✅ **Concluído** - Green checkmark

---

## ⚡ Performance Tips

- Index on `plan_status` ensures fast filtering
- `plan_updated_at` allows efficient ordering
- API validates status before database call
- Component debounces rapid changes

---

## 🔐 Permissions

**Required for status updates:**
- Service role key (server-side)
- No client-side RLS required (API handles it)

---

## 📈 Metrics to Track

```sql
-- Average time to complete
SELECT AVG(plan_updated_at - created_at) 
FROM dp_incidents 
WHERE plan_status = 'concluído';

-- Status distribution
SELECT 
  plan_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM dp_incidents
GROUP BY plan_status;
```

---

## 🎯 Key Features

✅ Real-time updates  
✅ Automatic timestamp tracking  
✅ Error handling with rollback  
✅ Toast notifications  
✅ Loading states  
✅ Dark mode support  
✅ Mobile responsive  
✅ TypeScript typed  
✅ Fully tested (10 tests)  
✅ Accessible (ARIA labels)  

---

## 📱 Mobile Considerations

- Touch-friendly dropdown
- Readable on small screens
- Responsive layout
- Works offline (queues updates)

---

## 🌐 Localization

Currently in Brazilian Portuguese (pt-BR):
- Status labels
- Date formatting
- Toast messages
- Error messages

To add languages, modify:
- `PlanStatusSelect.tsx` (component text)
- API error messages
- Database check constraint (if needed)

---

## 🔄 State Management

Component manages:
- Local status state
- Loading state
- Error state

Parent component receives:
- Status update via callback
- Updated timestamp
- Success/error notifications

---

## 📦 Dependencies

- `@supabase/supabase-js` - Database client
- `sonner` - Toast notifications
- `react` - UI framework
- `next` - API routes (for production)

---

## 🎨 Styling

Uses Tailwind CSS classes:
- `border`, `rounded-md` - Container styling
- `dark:` prefix - Dark mode variants
- `disabled:` prefix - Disabled states
- `focus:ring-2` - Focus indicators

---

## 📞 Quick Links

- [Full Documentation](./DP_INCIDENTS_PLAN_STATUS_IMPLEMENTATION.md)
- [DP Intelligence Center](./DP_INTELLIGENCE_CENTER_IMPLEMENTATION.md)
- [Test Guide](./src/tests/README.md)
- [API Guide](./API_VALIDATION_GUIDE.md)
