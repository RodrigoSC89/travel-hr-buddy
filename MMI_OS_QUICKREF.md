# MMI OS Generation - Quick Reference

## Quick Start

### 1. Apply Migrations
```bash
supabase db push
```

### 2. View Forecasts
Navigate to: `/admin/mmi/forecast/history`

### 3. Generate Work Order
Click "📄 Gerar Ordem de Serviço" on any forecast

---

## Database

### Tables
- **mmi_forecasts** - AI-generated maintenance forecasts
- **mmi_orders** - Work orders created from forecasts

### Key Fields
```
mmi_orders:
  - forecast_id → links to mmi_forecasts(id)
  - status: pendente | em_andamento | concluido | cancelado
  - priority: baixa | normal | alta | crítica
```

---

## API Endpoint

### Create Order
```bash
POST /api/os/create
Content-Type: application/json

{
  "forecast_id": "uuid",
  "vessel_name": "FPSO Alpha",
  "system_name": "Sistema Hidráulico",
  "description": "Manutenção preventiva",
  "priority": "alta"
}
```

**Priority Values:**
- `baixa` 🟢 - Low
- `normal` 🟡 - Normal (default)
- `alta` 🟠 - High
- `crítica` 🔴 - Critical

---

## UI Components

### Forecast History Page
**Path:** `/admin/mmi/forecast/history`

**Features:**
- Lists all AI forecasts
- Shows priority badges
- "Gerar OS" button per forecast
- Toast notifications

**Priority Mapping:**
- English DB → Portuguese UI
- critical → Crítica 🔴
- high → Alta 🟠
- medium → Normal 🟡
- low → Baixa 🟢

---

## Testing

### Sample Data
4 forecasts included:
1. FPSO Alpha - Sistema Hidráulico (High)
2. FPSO Beta - Compressão de Gás (Critical)
3. FPSO Gamma - Bomba de Resfriamento (Low)
4. FPSO Delta - Controle Automático (Medium)

### Verify Order Creation
```sql
SELECT * FROM mmi_orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## Common Issues

### Order not created
- Check authentication
- Verify forecast_id exists
- Check browser console for errors

### Priority validation error
- Use Portuguese values: baixa, normal, alta, crítica
- NOT English values: low, medium, high, critical

### Toast not showing
- Import: `import { useToast } from '@/hooks/use-toast'`
- Component must be inside proper context

---

## File Locations

```
Database:
  supabase/migrations/20251019180000_create_mmi_orders.sql
  supabase/migrations/20251019180001_insert_sample_forecasts.sql

API:
  pages/api/os/create/route.ts

UI:
  src/pages/admin/mmi/forecast/ForecastHistory.tsx

Docs:
  MMI_OS_GENERATION_GUIDE.md (detailed)
  MMI_OS_QUICKREF.md (this file)
```

---

## Next Steps

1. ✅ Orders Dashboard - View all created orders
2. ✅ Status Management - Update order status
3. ✅ Technician Assignment - Assign orders to users
4. ✅ Notifications - Email/Slack alerts
5. ✅ Analytics - Track completion metrics

---

## Support Commands

### View Recent Orders
```sql
SELECT 
  o.id,
  o.vessel_name,
  o.system_name,
  o.priority,
  o.status,
  f.forecast_text,
  o.created_at
FROM mmi_orders o
LEFT JOIN mmi_forecasts f ON o.forecast_id = f.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Count Orders by Priority
```sql
SELECT priority, COUNT(*) 
FROM mmi_orders 
GROUP BY priority;
```

### Orders by Status
```sql
SELECT status, COUNT(*) 
FROM mmi_orders 
GROUP BY status;
```

---

## Version
**v1.0.0** - Initial Release (2025-10-19)
