# MMI OS System - Quick Reference

## Quick Start

### 1. Apply Migrations
```bash
supabase db push
```

### 2. Create Supabase Storage Bucket
Create a bucket named `mmi-orders` in Supabase Dashboard for PDF storage.

### 3. Configure Environment Variables
```bash
VITE_RESEND_API_KEY=re_xxx          # For email notifications
VITE_OPENAI_API_KEY=sk-xxx          # For AI diagnostics
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 4. Access Features
- **Forecast History:** `/admin/mmi/forecast/history`
- **Audit Panel:** `/admin/mmi/auditoria`

---

## Core Services

### Email Service
**File:** `src/lib/email/sendOrderEmail.ts`

```typescript
import { sendOrderEmail, generateOrderEmailHTML } from '@/lib/email/sendOrderEmail';

// Send email
await sendOrderEmail({
  to: 'engineer@company.com',
  subject: 'New Service Order',
  html: generateOrderEmailHTML(order),
});
```

### PDF Storage Service
**File:** `src/lib/storage/saveOrderPDF.ts`

```typescript
import { saveOrderPDF, getOrderPDFUrl, deleteOrderPDF } from '@/lib/storage/saveOrderPDF';

// Save PDF
const result = await saveOrderPDF(orderId, pdfBlob);

// Get public URL
const url = getOrderPDFUrl(result.path);

// Delete PDF
await deleteOrderPDF(orderId);
```

### AI Diagnostics Service
**File:** `src/lib/ia/diagnoseOrder.ts`

```typescript
import { diagnoseOrder, formatDiagnosisReport } from '@/lib/ia/diagnoseOrder';

// Get AI diagnosis
const { success, diagnosis } = await diagnoseOrder({
  system_name: 'Sistema Hidráulico',
  description: 'Vazamento detectado',
  technician_comment: 'Pressão anormal',
});

// Format report
const report = formatDiagnosisReport(diagnosis);
```

### Orders Service
**File:** `src/services/mmi/ordersService.ts`

```typescript
import { 
  fetchAllOrders, 
  getOrderStats,
  createOrder,
  updateOrder,
  deleteOrder 
} from '@/services/mmi/ordersService';

// Fetch all orders
const orders = await fetchAllOrders();

// Get statistics
const stats = await getOrderStats();

// Create order
const { success, data } = await createOrder({
  vessel_name: 'FPSO Alpha',
  system_name: 'Sistema Hidráulico',
  description: 'Manutenção preventiva',
  priority: 'alta',
  status: 'pendente',
});

// Update order
await updateOrder(orderId, { status: 'em_andamento' });

// Delete order
await deleteOrder(orderId);
```

---

## Database

### Tables
- **mmi_forecasts** - AI-generated maintenance forecasts
- **mmi_orders** - Work orders created from forecasts

### Key Fields (mmi_orders)
```sql
id UUID PRIMARY KEY
forecast_id UUID -- links to mmi_forecasts
vessel_name TEXT
system_name TEXT
description TEXT
status TEXT -- pendente | em_andamento | concluido | cancelado
priority TEXT -- baixa | normal | alta | crítica
technician_comment TEXT -- NEW
pdf_path TEXT -- NEW
ai_diagnosis TEXT -- NEW
created_by UUID
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## API Endpoints

### Create Order
```bash
POST /api/os/create
Content-Type: application/json
Authorization: Bearer <token>

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

### Audit Panel
**Path:** `/admin/mmi/auditoria`

**Features:**
- Statistics dashboard (5 metrics)
- Interactive data table with search
- Sortable columns
- Pagination (10 items/page)
- CSV export functionality
- Real-time refresh

**Priority Mapping:**
- English DB → Portuguese UI
- critical → Crítica 🔴
- high → Alta 🟠
- medium → Normal 🟡
- low → Baixa 🟢

---

## Complete Workflow

### 1. Create Order from Forecast
```typescript
// User clicks "Gerar OS" button
const order = await createOrder({
  forecast_id: forecastId,
  vessel_name: forecast.vessel_name,
  system_name: forecast.system_name,
  description: forecast.forecast_text,
  priority: getPriorityValue(forecast.priority),
});
```

### 2. Get AI Diagnosis
```typescript
const { diagnosis } = await diagnoseOrder({
  system_name: order.system_name,
  description: order.description,
  technician_comment: order.technician_comment,
});

// Update order with diagnosis
await updateOrder(order.id, {
  ai_diagnosis: JSON.stringify(diagnosis),
});
```

### 3. Generate and Save PDF
```typescript
// Generate PDF (using your preferred library)
const pdfBlob = generateOrderPDF(order, diagnosis);

// Save to Supabase Storage
const { success, path } = await saveOrderPDF(order.id, pdfBlob);

// Update order with PDF path
if (success) {
  await updateOrder(order.id, { pdf_path: path });
}
```

### 4. Send Email Notification
```typescript
const html = generateOrderEmailHTML({
  vessel_name: order.vessel_name,
  system_name: order.system_name,
  description: order.description,
  priority: order.priority,
});

await sendOrderEmail({
  to: 'maintenance@company.com',
  subject: `New Service Order: ${order.system_name}`,
  html,
});
```

---

## Common Queries

### View Recent Orders
```sql
SELECT * FROM mmi_orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
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

### Orders with AI Diagnosis
```sql
SELECT * FROM mmi_orders
WHERE ai_diagnosis IS NOT NULL
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Order not created
- Check authentication token
- Verify forecast_id exists in database
- Check browser console for errors
- Validate priority value (use Portuguese)

### Email not sending
- Verify `VITE_RESEND_API_KEY` is set
- Check Resend API dashboard for errors
- Ensure email address is valid

### PDF not saving
- Verify Supabase Storage bucket `mmi-orders` exists
- Check storage permissions
- Ensure PDF blob is valid

### AI diagnosis failing
- Verify `VITE_OPENAI_API_KEY` is set
- Check OpenAI API quota
- Ensure API key has GPT-4 access

---

## File Locations

```
Database:
  supabase/migrations/20251019180000_create_mmi_orders.sql

API:
  pages/api/os/create/route.ts

Services:
  src/services/mmi/ordersService.ts
  src/lib/email/sendOrderEmail.ts
  src/lib/storage/saveOrderPDF.ts
  src/lib/ia/diagnoseOrder.ts

UI:
  src/pages/admin/mmi/forecast/ForecastHistory.tsx
  src/pages/admin/mmi/auditoria.tsx

Routes:
  src/App.tsx (lines 123, 252)

Docs:
  MMI_OS_IMPLEMENTATION_COMPLETE.md (detailed)
  MMI_OS_QUICKREF.md (this file)
```

---

## Version
**v2.0.0** - Complete Refactoring (2025-10-19)

**Changes from v1.0.0:**
- Added email service with Resend API
- Implemented PDF storage in Supabase
- Integrated AI diagnostics with GPT-4
- Created administrative audit panel
- Enhanced service layer with complete CRUD
- Added statistics dashboard
