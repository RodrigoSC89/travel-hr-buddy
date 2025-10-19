# MMI History - Quick Reference

## 🚀 Quick Access
**URL**: `/admin/mmi/history`

## 📊 Features Overview

### Statistics Cards
- **Total**: All records
- **Executado** (Green): Completed tasks
- **Pendente** (Yellow): Pending tasks
- **Atrasado** (Red): Delayed tasks

### Filter Options
- **Todos**: Show all records
- **Executado**: Show only completed
- **Pendente**: Show only pending
- **Atrasado**: Show only delayed

### Export
- Click "Exportar PDF" to download current view
- Includes statistics + filtered records
- Filename format: `mmi-history-YYYY-MM-DD.pdf`

## 🗄️ Database Table

```sql
mmi_history
├── id (UUID)
├── vessel_name (TEXT)
├── system_name (TEXT)
├── task_description (TEXT)
├── executed_at (TIMESTAMP)
├── status (TEXT: executado|pendente|atrasado)
└── created_at (TIMESTAMP)
```

## 📝 Status Values
- `executado`: Task completed
- `pendente`: Task pending
- `atrasado`: Task delayed

## 🔧 Technical Files

### Core Files
- **Migration**: `supabase/migrations/20251019000000_create_mmi_history.sql`
- **Service**: `src/services/mmi/historyService.ts`
- **Page**: `src/pages/admin/mmi/history.tsx`
- **Route**: `src/App.tsx` (line 116, 238)

### Tests
- `src/tests/mmi-history-service.test.ts` (24 tests)
- `src/tests/mmi-history-page.test.tsx` (10 tests)

## 🎯 Service Functions

```typescript
// Fetch history with optional filter
fetchMMIHistory({ status?: string }): Promise<MMIHistory[]>

// Get statistics
getMMIHistoryStats(): Promise<{ 
  total: number, 
  executado: number, 
  pendente: number, 
  atrasado: number 
}>
```

## 🎨 UI Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Badge`
- Icons: `FileText`, `Download`, `AlertCircle`, `CheckCircle`, `Clock`

## ✅ Verification Commands

```bash
# Run tests
npm run test

# Build project
npm run build

# Run linter
npm run lint
```

## 📈 Sample Statistics
Based on included sample data:
- Total: 6 records
- Executado: 2 records
- Pendente: 2 records
- Atrasado: 2 records

## 🔐 Security
- Row Level Security (RLS) enabled
- Only authenticated users can access
- Policies for SELECT, INSERT, UPDATE

## 🎭 Sample Data Vessels
- Vessel A (2 records)
- Vessel B (2 records)
- Vessel C (2 records)
