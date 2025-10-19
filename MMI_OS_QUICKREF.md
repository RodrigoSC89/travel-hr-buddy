# MMI OS Generation - Quick Reference

## 🚀 Quick Start

```bash
# 1. Apply migrations
supabase db push

# 2. Start development
npm run dev

# 3. Navigate to
http://localhost:5173/mmi/forecast-history
```

## 📍 Key Locations

| Item | Location |
|------|----------|
| API Endpoint | `/api/os/create` |
| UI Component | `src/components/mmi/ForecastHistoryPanel.tsx` |
| Page Route | `/mmi/forecast-history` |
| Tests | `src/tests/mmi-os-create-api.test.ts` |
| Forecasts Table | `mmi_forecasts` |
| Orders Table | `mmi_orders` |

## 🎯 Priority Values

| Portuguese | English | Color | Use Case |
|------------|---------|-------|----------|
| `baixa` | Low | 🟢 Green | Routine maintenance |
| `normal` | Normal | 🟡 Yellow | Scheduled maintenance |
| `alta` | High | 🟠 Orange | Urgent maintenance |
| `critica` | Critical | 🔴 Red | Safety-critical issues |

## 📝 API Quick Reference

### Request
```bash
POST /api/os/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "forecast_id": "uuid (optional)",
  "vessel_name": "string (required)",
  "system_name": "string (required)", 
  "description": "string (optional)",
  "priority": "baixa|normal|alta|critica"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pendente",
    ...
  }
}
```

## 🗃️ Database Schema

### mmi_forecasts
```sql
id, vessel_name, system_name, forecast_text,
priority, suggested_date, component_id,
created_by, created_at, updated_at
```

### mmi_orders
```sql
id, forecast_id (FK), vessel_name, system_name,
description, status, priority, created_by,
created_at, updated_at
```

## 🔑 Status Values

| Status | Description |
|--------|-------------|
| `pendente` | Order created, not started |
| `em_andamento` | Work in progress |
| `concluido` | Work completed |
| `cancelado` | Order cancelled |

## 🧪 Test Commands

```bash
# Run specific test
npm run test -- src/tests/mmi-os-create-api.test.ts

# Run all tests
npm run test

# Build project
npm run build

# Lint code
npm run lint
```

## 📊 SQL Queries

### View all forecasts
```sql
SELECT * FROM mmi_forecasts ORDER BY created_at DESC;
```

### View all orders with forecasts
```sql
SELECT o.*, f.system_name as forecast_system
FROM mmi_orders o
LEFT JOIN mmi_forecasts f ON o.forecast_id = f.id
ORDER BY o.created_at DESC;
```

### Count orders by status
```sql
SELECT status, COUNT(*) 
FROM mmi_orders 
GROUP BY status;
```

### Orders by priority
```sql
SELECT priority, COUNT(*) 
FROM mmi_orders 
GROUP BY priority 
ORDER BY 
  CASE priority
    WHEN 'critica' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'baixa' THEN 4
  END;
```

## 🔒 Security Checklist

- ✅ Bearer token authentication
- ✅ RLS policies enabled
- ✅ User ID tracking (created_by)
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if user is logged in, verify token |
| 400 Bad Request | Check required fields: vessel_name, system_name |
| 500 Server Error | Check Supabase logs, verify table exists |
| Button not working | Check browser console, verify API endpoint |
| No forecasts shown | Insert sample data, check RLS policies |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `MMI_OS_GENERATION_GUIDE.md` | Complete feature documentation |
| `MMI_OS_TESTING_GUIDE.md` | Step-by-step testing instructions |
| `MMI_OS_VISUAL_SUMMARY.md` | Architecture diagrams and flows |
| `MMI_OS_QUICKREF.md` | This quick reference |

## 🎨 UI Elements

### Forecast Card
- Header: System name + Priority badge
- Subheader: Vessel name + Suggested date
- Body: Forecast text (from AI)
- Footer: Created date + Action button

### Button States
- Default: "📄 Gerar Ordem de Serviço"
- Loading: "Gerando..." (with spinner)
- Success: Toast "✅ Ordem de Serviço gerada com sucesso!"
- Error: Toast "❌ Falha ao gerar OS"

## 🔄 Development Workflow

1. Make changes to code
2. Run tests: `npm run test`
3. Run lint: `npm run lint`
4. Build: `npm run build`
5. Commit and push
6. Create/update PR

## 📞 Support

- Check documentation in repo root
- Review Supabase logs for backend errors
- Check browser console for frontend errors
- Verify authentication status

## 🎉 Success Indicators

- ✅ Forecasts display on `/mmi/forecast-history`
- ✅ Button click creates order in database
- ✅ Success toast appears
- ✅ Order linked to forecast via `forecast_id`
- ✅ Status is `pendente`
- ✅ Priority matches forecast priority
- ✅ User ID captured in `created_by`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-19  
**Repository:** github.com/RodrigoSC89/travel-hr-buddy
