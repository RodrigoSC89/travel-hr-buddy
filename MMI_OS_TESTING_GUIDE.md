# MMI OS Testing Guide

## Overview

This guide provides step-by-step instructions for testing the MMI OS (Work Order) generation feature.

## Prerequisites

1. Development environment set up
2. Node.js and npm installed
3. Supabase project configured
4. Repository cloned and dependencies installed

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Database Migrations
```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase SQL Editor:
# - 20251019170000_create_mmi_forecasts.sql (should already exist)
# - 20251019180000_create_mmi_orders.sql
# - 20251019180001_insert_sample_forecasts.sql
```

### 3. Start Development Server
```bash
npm run dev
```

## Test Scenarios

### Test 1: View Forecast History

**Steps:**
1. Navigate to `http://localhost:5173/admin/mmi/forecast/history`
2. Wait for forecasts to load

**Expected Results:**
- ✅ Page displays "📚 Histórico de Forecasts" header
- ✅ 4 forecast cards are displayed
- ✅ Each card shows:
  - 🚢 Embarcação (vessel name)
  - ⚙️ Sistema (system name)
  - ⏱ Horímetro (hourmeter)
  - 📊 Prioridade with color-coded badge
  - 📅 Manutenções (maintenance history)
  - Forecast text in formatted box
  - "📄 Gerar Ordem de Serviço" button

**Priority Display Check:**
- FPSO Alpha → 🟠 Alta (High)
- FPSO Beta → 🔴 Crítica (Critical)
- FPSO Gamma → 🟢 Baixa (Low)
- FPSO Delta → 🟡 Normal (Medium)

### Test 2: Generate Work Order (Success Case)

**Steps:**
1. On forecast history page, click "📄 Gerar Ordem de Serviço" on any forecast
2. Observe button changes to "⏳ Gerando..."
3. Wait for operation to complete

**Expected Results:**
- ✅ Button shows loading state during operation
- ✅ Success toast notification appears:
  - Title: "✅ Ordem de Serviço gerada com sucesso!"
  - Description: "OS criada para [System] - [Vessel]"
- ✅ Button returns to original state
- ✅ Button is re-enabled

**Database Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM mmi_orders 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected database record:
- `forecast_id` matches the forecast you clicked
- `vessel_name` matches forecast
- `system_name` matches forecast
- `description` contains forecast_text
- `status` = 'pendente'
- `priority` matches forecast (Portuguese)
- `created_by` has user UUID
- `created_at` is recent timestamp

### Test 3: Generate Multiple Orders

**Steps:**
1. Click "Gerar OS" on FPSO Alpha forecast
2. Wait for success notification
3. Click "Gerar OS" on FPSO Beta forecast
4. Wait for success notification

**Expected Results:**
- ✅ Both orders created successfully
- ✅ Two separate toast notifications appear
- ✅ No errors in browser console

**Database Verification:**
```sql
SELECT 
  id,
  vessel_name,
  system_name,
  priority,
  status,
  created_at
FROM mmi_orders 
ORDER BY created_at DESC 
LIMIT 5;
```

Should show multiple orders with different vessels.

### Test 4: Priority Mapping

**Objective:** Verify that English database priorities are correctly mapped to Portuguese in API calls.

**Steps:**
1. Open browser DevTools → Network tab
2. Click "Gerar OS" on each forecast
3. Inspect the API request payload

**Expected API Payloads:**
- FPSO Alpha (high) → priority: "alta"
- FPSO Beta (critical) → priority: "crítica"
- FPSO Gamma (low) → priority: "baixa"
- FPSO Delta (medium) → priority: "normal"

### Test 5: Authentication Check

**Steps:**
1. Open browser DevTools → Application → Cookies
2. Delete Supabase cookies (sb-access-token, etc.)
3. Try to click "Gerar OS" button

**Expected Results:**
- ✅ API returns 401 Unauthorized
- ✅ Error toast notification appears:
  - Title: "❌ Erro ao gerar OS"
  - Description: "Não foi possível conectar ao servidor"
- ✅ No order created in database

### Test 6: Empty State

**Steps:**
1. Open Supabase SQL Editor
2. Delete all forecasts:
   ```sql
   DELETE FROM mmi_forecasts;
   ```
3. Refresh forecast history page

**Expected Results:**
- ✅ Page shows empty state card
- ✅ Message: "Nenhum forecast encontrado. Gere um forecast na página de MMI para ver o histórico aqui."
- ✅ No forecast cards displayed

**Cleanup:**
```sql
-- Restore sample data
INSERT INTO mmi_forecasts ... (rerun migration)
```

### Test 7: Loading State

**Steps:**
1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G"
3. Refresh forecast history page

**Expected Results:**
- ✅ Loading state appears: "Carregando forecasts..."
- ✅ No errors during load
- ✅ Forecasts appear when loaded

### Test 8: API Validation

**Test with Postman or cURL:**

```bash
# Valid request
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "forecast_id": "valid-uuid",
    "vessel_name": "Test Vessel",
    "system_name": "Test System",
    "description": "Test description",
    "priority": "alta"
  }'
```

**Expected:** 200 OK with order data

```bash
# Missing required field
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "forecast_id": "valid-uuid",
    "vessel_name": "Test Vessel"
  }'
```

**Expected:** 400 Bad Request with error message

```bash
# Invalid priority
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "forecast_id": "valid-uuid",
    "vessel_name": "Test Vessel",
    "system_name": "Test System",
    "description": "Test",
    "priority": "invalid"
  }'
```

**Expected:** 400 Bad Request with priority validation error

### Test 9: Database Constraints

**Test foreign key constraint:**
```sql
-- Try to insert order with invalid forecast_id
INSERT INTO mmi_orders (
  forecast_id, 
  vessel_name, 
  system_name, 
  description
) VALUES (
  'invalid-uuid-that-does-not-exist',
  'Test',
  'Test',
  'Test'
);
```

**Expected:** Foreign key constraint error (should fail)

**Test status constraint:**
```sql
-- Try to insert order with invalid status
INSERT INTO mmi_orders (
  vessel_name, 
  system_name, 
  description,
  status
) VALUES (
  'Test',
  'Test',
  'Test',
  'invalid_status'
);
```

**Expected:** Check constraint error (should fail)

### Test 10: Concurrent Requests

**Steps:**
1. Open forecast history page
2. Rapidly click "Gerar OS" on same forecast 3 times

**Expected Results:**
- ✅ Only one request processes at a time (button disabled)
- ✅ Either 1 or 3 orders created (depending on implementation)
- ✅ No race condition errors
- ✅ UI remains responsive

## Performance Tests

### Test 11: Large Dataset

**Setup:**
```sql
-- Insert 100 test forecasts
INSERT INTO mmi_forecasts (
  vessel_name, 
  system_name, 
  hourmeter, 
  forecast_text, 
  priority
)
SELECT 
  'FPSO Test ' || n,
  'System ' || (n % 10),
  (n * 100),
  'Test forecast #' || n,
  CASE (n % 4)
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    WHEN 2 THEN 'high'
    ELSE 'critical'
  END
FROM generate_series(1, 100) n;
```

**Steps:**
1. Navigate to forecast history page
2. Measure page load time

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ All forecasts displayed
- ✅ Scrolling is smooth
- ✅ No performance degradation

## Security Tests

### Test 12: SQL Injection Prevention

**Attempt SQL injection in vessel_name:**
```bash
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "forecast_id": "valid-uuid",
    "vessel_name": "'; DROP TABLE mmi_orders; --",
    "system_name": "Test",
    "description": "Test",
    "priority": "alta"
  }'
```

**Expected Results:**
- ✅ Order created with literal SQL string in vessel_name
- ✅ No tables dropped
- ✅ No SQL executed
- ✅ Parameterized queries prevent injection

### Test 13: XSS Prevention

**Test with malicious content:**
```bash
curl -X POST http://localhost:5173/api/os/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "forecast_id": "valid-uuid",
    "vessel_name": "<script>alert('xss')</script>",
    "system_name": "Test",
    "description": "Test",
    "priority": "alta"
  }'
```

**Expected Results:**
- ✅ Content stored as plain text
- ✅ No script execution when displayed
- ✅ React escapes HTML by default

## Regression Tests

### Test 14: Existing Forecast Functionality

**Verify that new features don't break existing ones:**

1. Navigate to `/mmi/forecast`
2. Generate a new forecast
3. Verify it appears in `/admin/mmi/forecast/history`

**Expected Results:**
- ✅ Forecast generation still works
- ✅ New forecast appears in history
- ✅ Can generate OS from new forecast

## Browser Compatibility

### Test 15: Cross-Browser Testing

**Test in:**
- Chrome/Chromium
- Firefox
- Safari
- Edge

**Expected Results:**
- ✅ All features work in all browsers
- ✅ UI displays correctly
- ✅ Toasts appear properly
- ✅ No console errors

## Cleanup

After testing, clean up test data:

```sql
-- Remove test orders
DELETE FROM mmi_orders WHERE description LIKE 'Test%';

-- Remove extra test forecasts (keep sample data)
DELETE FROM mmi_forecasts 
WHERE vessel_name LIKE 'FPSO Test %';
```

## Test Checklist

Use this checklist during testing:

- [ ] Dependencies installed
- [ ] Migrations applied
- [ ] Dev server running
- [ ] Forecast history page accessible
- [ ] Sample forecasts displayed correctly
- [ ] Priority badges show correct colors
- [ ] Can generate work order successfully
- [ ] Success toast appears
- [ ] Order saved in database
- [ ] Multiple orders can be created
- [ ] Priority mapping correct (EN → PT)
- [ ] Authentication required
- [ ] Empty state works
- [ ] Loading state works
- [ ] API validation works
- [ ] Database constraints enforced
- [ ] No SQL injection vulnerability
- [ ] No XSS vulnerability
- [ ] Performance acceptable
- [ ] Works in multiple browsers

## Reporting Issues

If you find issues during testing:

1. Note the test scenario number
2. Document steps to reproduce
3. Include:
   - Browser and version
   - Error messages (console and network)
   - Screenshots if applicable
   - Database state
4. Check if issue is consistent or intermittent

## Success Criteria

All tests pass when:
- ✅ All 15 test scenarios pass
- ✅ No errors in browser console
- ✅ No failed network requests (except intentional ones)
- ✅ Database integrity maintained
- ✅ Security measures effective
- ✅ Performance acceptable
- ✅ UI responsive and user-friendly

## Version

**v1.0.0** - Initial Testing Guide (2025-10-19)
