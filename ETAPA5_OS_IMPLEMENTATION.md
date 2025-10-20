# Etapa 5 - OS Implementation Guide

## Overview
This document provides technical implementation details for Etapa 5, the simplified work orders (Ordens de Serviço - OS) management interface for the MMI (Manutenção e Manutenibilidade Industrial) module.

## Technical Stack
- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui (Button, Badge)
- **Database**: Supabase (mmi_os table)
- **Date Formatting**: date-fns library
- **Routing**: React Router (lazy-loaded)

## Implementation Details

### 1. Component Location
- **File**: `src/pages/admin/mmi/os.tsx`
- **Route**: `/admin/mmi/os`
- **Load Strategy**: Lazy-loaded via React.lazy()

### 2. Database Schema

#### Table: `mmi_os`
The work orders table with extended status support:

```sql
-- Status constraint includes Etapa 5 statuses
ALTER TABLE public.mmi_os 
ADD CONSTRAINT mmi_os_status_check 
CHECK (status IN (
  'open', 'in_progress', 'completed', 'cancelled',  -- Legacy statuses
  'pendente', 'executado', 'atrasado'                -- Etapa 5 statuses
));
```

#### Key Fields
- `id` (UUID): Primary key
- `descricao` (TEXT): Work order description
- `status` (TEXT): Status with constraint (pendente, executado, atrasado)
- `forecast_id` (UUID): Reference to mmi_forecasts
- `job_id` (UUID): Optional reference to mmi_jobs
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### 3. TypeScript Interface

```typescript
export interface MMIOS {
  id: string;
  job_id?: string;
  forecast_id?: string;
  descricao?: string;
  status: "open" | "in_progress" | "completed" | "cancelled" 
        | "pendente" | "executado" | "atrasado";
  created_at?: string;
  updated_at?: string;
  // ... other fields
}
```

### 4. Component Features

#### Data Fetching
```typescript
const fetchOS = async () => {
  const { data, error } = await supabase
    .from("mmi_os")
    .select("*")
    .order("created_at", { ascending: false });
  // Handle data/error
};
```

#### Status Update
```typescript
const updateStatus = async (id: string, newStatus: MMIOS["status"]) => {
  const { error } = await supabase
    .from("mmi_os")
    .update({ status: newStatus })
    .eq("id", id);
  // Handle error and refresh data
};
```

#### Status Badge Mapping
- **pendente**: Gray badge (secondary variant)
- **executado**: Primary badge (default variant)
- **atrasado**: Red badge (destructive variant)

### 5. UI Structure

#### Table Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Ordens de Serviço (MMI)                                   │
├──────────────┬──────────┬──────────────┬────────────────────┤
│ Descrição    │ Status   │ Criado em    │ Ações              │
├──────────────┼──────────┼──────────────┼────────────────────┤
│ Description  │ [Badge]  │ dd/MM/yyyy   │ [Btn][Btn][Btn]    │
│ ...          │ ...      │ ...          │ ...                │
└──────────────┴──────────┴──────────────┴────────────────────┘
```

#### Action Buttons
Three buttons per row for quick status changes:
- **pendente**: Mark as pending
- **executado**: Mark as executed
- **atrasado**: Mark as late/delayed

### 6. Date Formatting
Uses Brazilian date format (dd/MM/yyyy) via date-fns:
```typescript
format(new Date(os.created_at), "dd/MM/yyyy")
```

### 7. Error Handling
- Console logging for debugging
- Alert dialogs for user feedback
- Graceful error states

### 8. Loading States
- Initial loading message
- Empty state message when no work orders exist

## Migration Files

### Status Constraint Migration
**File**: `supabase/migrations/20251019230000_update_mmi_os_for_etapa5.sql`

Updates the status constraint to include new values:
- pendente
- executado
- atrasado

### Sample Data Migration
**File**: `supabase/migrations/20251019230001_insert_sample_mmi_os_data.sql`

Inserts 5 sample work orders for testing with realistic scenarios:
1. Generator maintenance (pendente)
2. Hydraulic system inspection (executado)
3. Water pump repair (atrasado)
4. Temperature sensor calibration (pendente)
5. AC system repair (executado)

## Testing

### Test File
**Location**: `src/tests/pages/admin/mmi/os.test.tsx`

### Test Coverage
1. ✅ Page title rendering
2. ✅ Loading state behavior
3. ✅ Data fetching from database
4. ✅ Status badge display
5. ✅ Action button rendering
6. ✅ Date formatting accuracy
7. ✅ Table header structure

## API Integration

### Supabase Client
Direct usage of Supabase client for:
- SELECT queries with ordering
- UPDATE operations for status changes
- Automatic real-time synchronization potential

### No Backend Functions Required
Simple CRUD operations handled directly through Supabase client, reducing complexity.

## Performance Considerations

1. **Lazy Loading**: Component loaded only when route is accessed
2. **Efficient Queries**: Ordered by created_at descending for newest first
3. **Minimal Re-renders**: State updates trigger focused refreshes
4. **No Pagination**: Simple table for moderate data volumes

## Security

### Row Level Security (RLS)
Existing RLS policies from mmi_os table:
- Users can view all work orders
- Authenticated users can insert
- Users can update their own work orders

## Future Enhancements

While not in current scope, the implementation supports:
- CSV/PDF export functionality
- Advanced filtering and search
- Pagination for large datasets
- Bulk status updates
- Detailed view modals
- Change history tracking
- Real-time updates via Supabase subscriptions

## Browser Compatibility
Standard React with modern browser support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment Notes

1. **Database Migrations**: Run migrations in order:
   - 20251019230000_update_mmi_os_for_etapa5.sql (constraint)
   - 20251019230001_insert_sample_mmi_os_data.sql (sample data)

2. **Build**: Standard Vite build process

3. **Route**: Automatically registered via App.tsx lazy loading

## Troubleshooting

### Issue: Status Update Fails
**Solution**: Check RLS policies and user authentication

### Issue: Dates Not Formatting
**Solution**: Verify date-fns is installed and date strings are valid ISO format

### Issue: Page Not Loading
**Solution**: Check React.lazy() import path and route configuration

## Related Files
- `src/types/mmi.ts` - TypeScript interfaces
- `src/App.tsx` - Route configuration
- `src/pages/admin/mmi/orders.tsx` - Related full-featured orders page
- `supabase/migrations/20251014215500_create_mmi_os_table.sql` - Initial table

## Status
✅ **Production Ready**

- Route: `/admin/mmi/os`
- Tests: 7/7 Passing
- Documentation: Complete
- Database: Migrations included
