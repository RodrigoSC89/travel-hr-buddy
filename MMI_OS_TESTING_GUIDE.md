# Testing MMI OS Generation Feature - Step by Step Guide

## Prerequisites

1. Supabase project configured
2. Database migrations applied
3. User authenticated in the application

## Step 1: Apply Database Migrations

Run the migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase SQL Editor:
# 1. supabase/migrations/20251019170000_create_mmi_forecasts.sql
# 2. supabase/migrations/20251019170100_create_mmi_orders.sql
# 3. supabase/migrations/20251019170200_insert_sample_forecasts.sql (optional - sample data)
```

## Step 2: Verify Tables Created

In Supabase SQL Editor, run:

```sql
-- Check mmi_forecasts table
SELECT * FROM mmi_forecasts;

-- Check mmi_orders table
SELECT * FROM mmi_orders;
```

## Step 3: Insert Sample Forecast (if not using migration)

```sql
INSERT INTO public.mmi_forecasts (
  vessel_name,
  system_name,
  forecast_text,
  priority,
  suggested_date
) VALUES (
  'FPSO Alpha',
  'Sistema hidráulico do guindaste',
  'Recomenda-se manutenção preventiva do sistema hidráulico com troca de óleo e inspeção de mangueiras',
  'alta',
  CURRENT_DATE + INTERVAL '15 days'
);
```

## Step 4: Access the Forecast History Page

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/mmi/forecast-history`

3. You should see a list of forecasts with details:
   - Vessel name
   - System name
   - Priority badge (with color coding)
   - Suggested date
   - Forecast text
   - "📄 Gerar Ordem de Serviço" button

## Step 5: Generate Work Order

1. Click the "📄 Gerar Ordem de Serviço" button on any forecast
2. The button will show a loading state: "Gerando..."
3. Wait for the API call to complete
4. You should see one of these messages:
   - ✅ "Ordem de Serviço gerada com sucesso!" (success)
   - ❌ "Falha ao gerar OS" (error)

## Step 6: Verify Work Order Created

In Supabase SQL Editor, run:

```sql
-- Check the created work order
SELECT 
  o.*,
  f.system_name as forecast_system,
  f.priority as forecast_priority
FROM mmi_orders o
LEFT JOIN mmi_forecasts f ON o.forecast_id = f.id
ORDER BY o.created_at DESC
LIMIT 10;
```

You should see:
- A new record in `mmi_orders`
- `forecast_id` linked to the original forecast
- Same `vessel_name` and `system_name` as the forecast
- `status` = 'pendente'
- `priority` copied from forecast
- `created_by` = your user UUID

## Step 7: Test API Directly (Optional)

Using curl or Postman:

```bash
# Get your access token from Supabase
# Replace <YOUR_ACCESS_TOKEN> with actual token

curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "forecast_id": "<FORECAST_UUID>",
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema hidráulico",
    "description": "Manutenção preventiva",
    "priority": "alta"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "forecast_id": "...",
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema hidráulico",
    "description": "Manutenção preventiva",
    "status": "pendente",
    "priority": "alta",
    "created_by": "...",
    "created_at": "2025-10-19T..."
  }
}
```

## Step 8: Test Different Priority Levels

Test with different priority values:

```sql
-- Insert forecasts with different priorities
INSERT INTO mmi_forecasts (vessel_name, system_name, forecast_text, priority)
VALUES 
  ('FPSO Test', 'System A', 'Low priority test', 'baixa'),
  ('FPSO Test', 'System B', 'Normal priority test', 'normal'),
  ('FPSO Test', 'System C', 'High priority test', 'alta'),
  ('FPSO Test', 'System D', 'Critical priority test', 'critica');
```

Verify each displays with correct color coding:
- 🟢 Baixa (green)
- 🟡 Normal (yellow)
- 🟠 Alta (orange)
- 🔴 Crítica (red)

## Step 9: Test Error Scenarios

### Test without authentication:
1. Log out of the application
2. Try to access `/mmi/forecast-history`
3. Should be redirected to login

### Test with invalid data:
```bash
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "vessel_name": "",
    "system_name": ""
  }'
```

Expected error:
```json
{
  "error": "Campos obrigatórios: vessel_name, system_name"
}
```

### Test with invalid priority:
```bash
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "vessel_name": "Test",
    "system_name": "Test",
    "priority": "urgent"
  }'
```

Expected error:
```json
{
  "error": "Prioridade inválida. Use: baixa, normal, alta, critica"
}
```

## Step 10: Verify RLS Policies

Test that RLS policies are working:

```sql
-- As authenticated user, should work
SELECT * FROM mmi_forecasts;

-- As authenticated user, should work
SELECT * FROM mmi_orders;

-- Try to access as anonymous (should fail)
-- This needs to be tested by logging out
```

## Troubleshooting

### Issue: Button doesn't show loading state
- Check browser console for errors
- Verify API endpoint is accessible
- Check authentication token is valid

### Issue: API returns 401 Unauthorized
- Verify user is logged in
- Check Supabase session is active
- Verify bearer token is included in request

### Issue: API returns 500 Internal Server Error
- Check Supabase logs
- Verify tables exist and RLS policies are correct
- Check environment variables are set

### Issue: Forecasts don't display
- Verify data exists in `mmi_forecasts` table
- Check RLS policies allow SELECT
- Verify component is mounted correctly

## Success Criteria

✅ All tables created successfully
✅ Sample data inserted
✅ Forecast history page displays forecasts
✅ "Gerar OS" button works and creates orders
✅ Orders are linked to forecasts
✅ Status and priority are correctly set
✅ Authentication and authorization work
✅ Error handling provides clear feedback

## Next Steps

After successful testing:
1. Deploy migrations to production
2. Create dashboard for managing work orders
3. Add status transitions workflow
4. Implement notifications
5. Add reports and analytics
