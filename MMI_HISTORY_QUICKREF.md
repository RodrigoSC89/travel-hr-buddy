# MMI History Quick Reference

## 🚀 Quick Start

### Access Points
- **User View:** `/mmi/history`
- **Admin View:** `/admin/mmi/history`

### Service Import
```typescript
import { 
  fetchMMIHistory, 
  getMMIHistoryStats 
} from '@/services/mmi/historyService';
```

## 📊 Service Layer API

### Fetch Records
```typescript
// All records
const all = await fetchMMIHistory();

// Filter by status
const executed = await fetchMMIHistory({ status: 'executado' });
const pending = await fetchMMIHistory({ status: 'pendente' });
const overdue = await fetchMMIHistory({ status: 'atrasado' });

// Filter by vessel
const vessel = await fetchMMIHistory({ vesselId: 'uuid' });
```

### Get Statistics
```typescript
const stats = await getMMIHistoryStats();
// Returns: { total, executado, pendente, atrasado }
```

### Create Record
```typescript
await createMMIHistory({
  vessel_id: 'uuid',
  system_name: 'Engine System',
  task_description: 'Maintenance task',
  status: 'pendente',
});
```

### Update Record
```typescript
await updateMMIHistory('record-id', {
  status: 'executado',
  executed_at: new Date().toISOString(),
});
```

### Delete Record
```typescript
await deleteMMIHistory('record-id');
```

## 🎨 Status Values

| Status | Color | Meaning |
|--------|-------|---------|
| `executado` | 🟢 Green | Completed |
| `pendente` | 🟡 Yellow | Pending |
| `atrasado` | 🔴 Red | Overdue |

## 📁 File Structure

```
src/
├── services/mmi/
│   └── historyService.ts       # Service layer
├── pages/
│   ├── MMIHistory.tsx          # User page
│   └── admin/mmi/
│       └── history.tsx         # Admin page
├── components/mmi/
│   └── HistoryPanel.tsx        # Main component
└── tests/
    ├── mmi-history-service.test.ts   # Service tests (12)
    └── mmi-history-page.test.tsx     # Page tests (9)
```

## 🗄️ Database

### Table
```sql
mmi_history (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  system_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('executado', 'pendente', 'atrasado')),
  pdf_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Indexes
- `idx_mmi_history_vessel_id`
- `idx_mmi_history_status`
- `idx_mmi_history_executed_at`
- `idx_mmi_history_created_at`

## 🧪 Testing

### Run Tests
```bash
# All tests
npm run test

# Service tests only
npm run test src/tests/mmi-history-service.test.ts

# Page tests only
npm run test src/tests/mmi-history-page.test.tsx
```

### Coverage
- **Service Layer:** 12 tests
- **Page Component:** 9 tests
- **Total:** 21 tests ✅

## 🎯 Key Features

### Admin Page
✅ Statistics dashboard (4 cards)
✅ Status filter dropdown
✅ Records table with vessel info
✅ Status badges with color coding
✅ PDF export functionality
✅ Loading & error states
✅ Responsive design

### User Page
✅ History panel with records
✅ Status filtering
✅ Individual PDF export
✅ Batch PDF export (multi-select)
✅ Vessel information display

## 🔒 Security

### RLS Policies
All operations require authentication:
- SELECT ✅
- INSERT ✅
- UPDATE ✅
- DELETE ✅

## 📦 Build & Deploy

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build
npm run build

# Lint
npm run lint
```

### Status
- ✅ All tests passing (1874/1874)
- ✅ Build successful
- ✅ Linter clean
- ✅ TypeScript strict mode

## 🐛 Troubleshooting

### Common Errors

**"Failed to fetch MMI history"**
- Check Supabase connection
- Verify RLS policies
- Ensure user is authenticated

**Statistics showing zero**
- Verify records in database
- Check status values are valid
- Review filter parameters

**PDF not generating**
- Verify html2pdf.js installed
- Check browser console for errors
- Ensure data is loaded

## 💡 Tips

1. **Use service layer** - Don't query Supabase directly
2. **Handle errors** - All service methods throw on error
3. **Filter early** - Apply filters in service calls, not in UI
4. **Type safety** - Use provided TypeScript interfaces
5. **Test first** - Check test files for usage examples

## 🔗 Related Features

- MMI Jobs Panel (`/mmi/jobs`)
- MMI BI Dashboard (`/mmi/bi`)
- MMI Tasks (`/mmi/tasks`)
- SGSO History (`/admin/sgso/history`)

## 📚 Documentation

- **Full Guide:** `MMI_HISTORY_IMPLEMENTATION.md`
- **Visual Summary:** `MMI_HISTORY_VISUAL_SUMMARY.md`
- **Type Definitions:** `src/types/mmi.ts`

## 🎓 Example Usage

### Complete Example
```typescript
import { 
  fetchMMIHistory, 
  getMMIHistoryStats,
  createMMIHistory 
} from '@/services/mmi/historyService';

async function example() {
  // Get stats for dashboard
  const stats = await getMMIHistoryStats();
  console.log(`Total: ${stats.total}, Executed: ${stats.executado}`);
  
  // Get pending tasks
  const pending = await fetchMMIHistory({ status: 'pendente' });
  
  // Create new record
  const newRecord = await createMMIHistory({
    vessel_id: 'vessel-123',
    system_name: 'Navigation System',
    task_description: 'Software update required',
    status: 'pendente',
  });
  
  // Mark as executed
  await updateMMIHistory(newRecord.id, {
    status: 'executado',
    executed_at: new Date().toISOString(),
  });
}
```

---

**Quick Links:**
- [Full Implementation Guide](./MMI_HISTORY_IMPLEMENTATION.md)
- [Migration File](./supabase/migrations/20251019000000_create_mmi_history.sql)
- [Service Layer](./src/services/mmi/historyService.ts)
- [Admin Page](./src/pages/admin/mmi/history.tsx)

**Status:** ✅ Production Ready
**Version:** 1.0.0
