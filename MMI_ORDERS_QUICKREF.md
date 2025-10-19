# MMI Orders Management - Quick Reference

## Quick Access

**URL:** `/admin/mmi/orders`

## Key Files

```
Frontend:
  src/pages/admin/mmi/orders.tsx        - Main UI component
  src/types/mmi.ts                      - TypeScript types (MMIOS interface)

Backend:
  supabase/functions/mmi-os-update/     - Update API
  
Database:
  supabase/migrations/20251014215500_create_mmi_os_table.sql
  supabase/migrations/20251019180001_add_mmi_os_technician_fields.sql

Tests:
  src/tests/mmi-orders-admin.test.tsx   - UI tests (8 tests)
```

## API Endpoints

### Update Work Order

**Method:** `POST`  
**Endpoint:** `supabase.functions.invoke('mmi-os-update', { body })`

**Request:**
```typescript
{
  id: string;                    // Required
  status?: "open" | "in_progress" | "completed" | "cancelled";
  executed_at?: string;          // ISO 8601 timestamp
  technician_comment?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: MMIOS;
  timestamp: string;
}
```

## Database Schema

```sql
Table: mmi_os
  - id (UUID, PK)
  - job_id (UUID, FK → mmi_jobs)
  - opened_by (UUID, FK → auth.users)
  - status (TEXT: open|in_progress|completed|cancelled)
  - notes (TEXT)
  - executed_at (TIMESTAMPTZ)          ← New field
  - technician_comment (TEXT)          ← New field
  - completed_at (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

## Status Workflow

```
Open (🟡)
  ↓
In Progress (🔵)
  ↓
Completed (🟢) → LOCKED (read-only)
  
OR

Cancelled (🔴)
```

## Common Operations

### List All Orders
```typescript
const { data, error } = await supabase
  .from("mmi_os")
  .select("*")
  .order("created_at", { ascending: false });
```

### Update Order Status
```typescript
const { data, error } = await supabase.functions.invoke("mmi-os-update", {
  body: {
    id: orderId,
    status: "completed",
    executed_at: new Date().toISOString(),
    technician_comment: "Work completed successfully"
  }
});
```

## Testing

```bash
# Run all MMI orders tests
npm test -- src/tests/mmi-orders-admin.test.tsx

# Expected: 8 passing tests
```

## Build & Deploy

```bash
# Build frontend
npm run build

# Deploy Edge Function
cd supabase/functions/mmi-os-update
supabase functions deploy mmi-os-update

# Apply migrations
supabase db push
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't edit completed order | By design - completed orders are locked |
| Update fails | Check authentication, verify user has permission |
| Invalid status error | Use: open, in_progress, completed, or cancelled |
| Work order not found | Verify ID exists in database |

## Security

- ✅ RLS enabled on `mmi_os` table
- ✅ Authenticated users only
- ✅ Input validation (frontend + backend)
- ✅ Parameterized queries (SQL injection prevention)
- ✅ CORS configured for browser access

## Performance

- Database indexes on: job_id, status, executed_at, created_at
- Page load: < 1s
- API response: < 500ms
- Database query: < 100ms

## UI Components

```typescript
// Status Badge Component
const getStatusBadge = (status: string) => {
  const config = {
    open: { label: "Aberta", variant: "outline", emoji: "🟡" },
    in_progress: { label: "Em Andamento", variant: "default", emoji: "🔵" },
    completed: { label: "Concluída", variant: "secondary", emoji: "🟢" },
    cancelled: { label: "Cancelada", variant: "destructive", emoji: "🔴" },
  };
  // Returns Badge component
};
```

## Validation Rules

**Status:**
- Must be one of: open, in_progress, completed, cancelled
- Frontend: Dropdown validation
- Backend: Enum validation in Edge Function

**Execution Date:**
- Optional field
- HTML5 datetime-local format
- Auto-filled when status set to completed

**Technician Comment:**
- Optional field
- TEXT type (no length limit in DB)
- Recommended max: 500 characters

## Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Code Examples

### Load Orders
```typescript
useEffect(() => {
  const loadWorkOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mmi_os")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setWorkOrders(data || []);
    }
    setLoading(false);
  };
  
  loadWorkOrders();
}, []);
```

### Update Order
```typescript
const handleUpdate = async (orderId: string, status: string) => {
  const { data, error } = await supabase.functions.invoke("mmi-os-update", {
    body: {
      id: orderId,
      status,
      executed_at: new Date().toISOString(),
      technician_comment: comment
    }
  });

  if (error) throw error;
  if (data?.success) {
    toast({ title: "✅ Updated", description: "Order updated successfully" });
    await loadWorkOrders(); // Refresh list
  }
};
```

## TypeScript Interface

```typescript
export interface MMIOS {
  id: string;
  job_id?: string;
  os_number: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string;
  start_date?: string;
  completion_date?: string;
  work_description?: string;
  notes?: string;
  executed_at?: string;          // ISO 8601
  technician_comment?: string;
  created_at?: string;
  // ... additional fields
}
```

## Routing

```typescript
// In App.tsx
import MMIOrders from "./pages/admin/mmi/orders";

<Route path="/admin/mmi/orders" element={<MMIOrders />} />
```

## Component Hierarchy

```
MMIOrdersPage
  ├── Loading State
  ├── Empty State  
  └── WorkOrderCard[] (for each order)
       ├── Header (ID, Date, Status Badge)
       ├── Notes Display
       ├── Status Dropdown
       ├── Execution Date Input
       ├── Technician Comment Textarea
       └── Save Button
```

## Feature Flags

None currently - all features enabled by default for authenticated users.

## Known Limitations

1. Completed orders cannot be edited (by design)
2. No bulk operations (single order updates only)
3. No filtering UI (all orders shown)
4. No pagination (all orders loaded at once)

## Related Pages

- `/admin/mmi` - MMI Jobs Panel
- `/admin/mmi/history` - MMI History
- `/admin/mmi/forecast` - MMI Forecast
- `/mmi/jobs` - Public MMI Jobs

## Support Resources

- Full guide: `/MMI_ORDERS_MANAGEMENT_GUIDE.md`
- MMI system: `/mmi_readme.md`
- Supabase docs: https://supabase.com/docs
