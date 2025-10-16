# Admin Alertas - Quick Reference

## Quick Commands

### Deploy Edge Function
```bash
supabase functions deploy admin-alertas
```

### Apply Database Migration
```bash
supabase db push
```

### Test Edge Function Locally
```bash
supabase functions serve admin-alertas
```

## Access URLs

- **Panel URL**: `/admin/alerts`
- **API Endpoint**: `${SUPABASE_URL}/functions/v1/admin-alertas`

## File Locations

```
Component:  src/components/admin/PainelAlertasCriticos.tsx
Page:       src/pages/admin/alerts.tsx
Function:   supabase/functions/admin-alertas/index.ts
Migration:  supabase/migrations/20251016162500_create_auditoria_alertas.sql
Route:      src/App.tsx (line ~96, ~234)
```

## Quick Test Data

```sql
-- Insert test alert
INSERT INTO public.auditoria_comentarios (auditoria_id, user_id, comentario)
VALUES (
  (SELECT id FROM public.auditorias_imca ORDER BY created_at DESC LIMIT 1),
  'ia-auto-responder',
  '⚠️ Atenção: Test critical alert'
);
```

## Common SQL Queries

### View all alerts
```sql
SELECT * FROM auditoria_alertas ORDER BY criado_em DESC;
```

### Count alerts by type
```sql
SELECT tipo, COUNT(*) as total 
FROM auditoria_alertas 
GROUP BY tipo;
```

### Find alerts for specific audit
```sql
SELECT * FROM auditoria_alertas 
WHERE auditoria_id = 'your-audit-id-here';
```

### Delete all test alerts
```sql
DELETE FROM auditoria_alertas 
WHERE descricao LIKE '%Test%';
```

## Environment Variables

Required in `.env` or Supabase dashboard:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Component Props

### PainelAlertasCriticos
No props required - fetches data automatically on mount.

```tsx
<PainelAlertasCriticos />
```

## API Response Format

### Success
```json
{
  "success": true,
  "alertas": [
    {
      "id": "uuid",
      "auditoria_id": "uuid", 
      "comentario_id": "uuid",
      "tipo": "Falha Crítica",
      "descricao": "Alert text",
      "criado_em": "2025-10-16T16:23:45.000Z"
    }
  ]
}
```

### Error
```json
{
  "error": "Error message"
}
```

## Troubleshooting Quick Checks

| Issue | Quick Fix |
|-------|-----------|
| 401 Unauthorized | Check if logged in and JWT token is valid |
| 403 Forbidden | Verify user has 'admin' role |
| 404 Not Found | Deploy edge function |
| Empty alerts | Insert test data |
| Build error | Run `npm install` and `npm run build` |

## Key Features

- ✅ Real-time alert fetching
- ✅ Admin-only access
- ✅ Red visual emphasis
- ✅ Responsive design
- ✅ Loading/error states
- ✅ Portuguese locale formatting

## Testing Checklist

- [ ] Login as admin user
- [ ] Navigate to `/admin/alerts`
- [ ] Verify loading spinner appears
- [ ] Confirm alerts display correctly
- [ ] Check date formatting (pt-BR)
- [ ] Test empty state (no alerts)
- [ ] Test error handling (disconnect network)
- [ ] Verify red styling on alert cards

## Build & Deploy

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Deploy edge function
supabase functions deploy admin-alertas

# Apply migrations
supabase db push
```

## Important Notes

⚠️ **Admin Access Only**: This panel requires admin role
🔒 **Security**: RLS policies enforce data access
📱 **Responsive**: Works on all screen sizes
🌐 **Portuguese**: All text in Brazilian Portuguese
