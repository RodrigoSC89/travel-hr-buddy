# MMI OS Generation - Quick Reference

## 🎯 Quick Start

### Function Usage

```typescript
import { createOSFromForecast } from "@/services/mmi/ordersService";

// Create OS from forecast
const success = await createOSFromForecast(
  forecastId,  // UUID of the forecast
  null,        // job_id (optional)
  "Gerado automaticamente com base no forecast IA de risco \"alta\""
);
```

### Button Integration

```tsx
<Button
  onClick={async () => {
    await createOSFromForecast(
      forecast.id,
      null,
      `Gerado automaticamente com base no forecast IA de risco "${riskLevel}"`
    );
    alert('✅ Ordem de Serviço criada com sucesso!');
  }}
>
  ➕ Gerar OS
</Button>
```

## 📊 Database Schema

```sql
-- mmi_os table with forecast support
CREATE TABLE mmi_os (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id uuid REFERENCES mmi_forecasts(id),  -- NEW
  job_id uuid REFERENCES mmi_jobs(id),           -- Now optional
  status text DEFAULT 'pendente',                 -- Updated
  descricao text,                                 -- NEW
  created_by uuid REFERENCES auth.users(id),     -- NEW
  notes text,
  opened_by uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## 🔑 Key Features

✅ **Direct Forecast Integration**
- Create OS directly from AI forecasts
- Automatic description generation
- Risk level tracking

✅ **Flexible Job Association**
- Optional job_id field
- Can create OS without existing jobs
- Perfect for forecast-driven maintenance

✅ **Status Tracking**
- `pendente` - Awaiting execution
- `open` - Open
- `in_progress` - In progress
- `completed` - Completed
- `cancelled` - Cancelled

## 📝 Examples

### Example 1: Create OS from High-Priority Forecast

```typescript
const forecast = {
  id: "forecast-uuid-123",
  priority: "high",
  vessel_name: "FPSO Alpha",
  system_name: "Sistema Hidráulico Principal"
};

const descricao = `Gerado automaticamente com base no forecast IA de risco "alta" - ${forecast.forecast_text}`;

await createOSFromForecast(forecast.id, null, descricao);
```

### Example 2: Create OS with Job Association

```typescript
await createOSFromForecast(
  forecastId,
  jobId,  // Link to existing job
  "Manutenção preventiva baseada em forecast IA"
);
```

### Example 3: Handle Errors

```typescript
try {
  const success = await createOSFromForecast(
    forecastId,
    null,
    description
  );
  
  if (success) {
    console.log("OS created successfully");
  } else {
    console.error("Failed to create OS");
  }
} catch (error) {
  console.error("Error:", error);
}
```

## 🧪 Testing

```bash
# Run tests
npm run test -- src/tests/mmi-create-os-from-forecast.test.ts

# Run all MMI tests
npm run test -- src/tests/mmi*.test.ts
```

## 📦 File Locations

| File | Purpose |
|------|---------|
| `src/services/mmi/ordersService.ts` | Service with createOSFromForecast function |
| `src/pages/admin/mmi/forecast/ForecastHistory.tsx` | UI integration |
| `src/types/mmi.ts` | Type definitions |
| `supabase/migrations/20251019220000_add_forecast_fields_to_mmi_os.sql` | Database migration |
| `src/tests/mmi-create-os-from-forecast.test.ts` | Test suite |

## 🚀 Deployment Checklist

- [x] Database migration created
- [x] Function implemented
- [x] UI integrated
- [x] Tests added (10 tests passing)
- [x] Types updated
- [x] Documentation created
- [x] Build passing
- [x] All tests passing (244/244)

## 💡 Tips

1. **Always check user authentication** before calling the function
2. **Include risk level** in the description for better tracking
3. **Use null for job_id** when creating OS directly from forecasts
4. **Toast notifications** provide better UX feedback

## 🔗 Related Documentation

- [Full Implementation Guide](./MMI_OS_GENERATION_IMPLEMENTATION.md)
- [MMI Dashboard](./MMI_DASHBOARD_IMPLEMENTATION.md)
- [MMI Forecast](./MMI_FORECAST_IMPLEMENTATION_SUMMARY.md)

---

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** 2025-10-19
