# MMI Orders Management - Quick Reference

## 🔗 URLs
- **Admin Interface**: `/admin/mmi/orders`
- **API List**: `GET /api/os/all`
- **API Update**: `POST /api/os/update`

## 📋 Database Table: mmi_orders

### Schema
```sql
id              UUID PRIMARY KEY
vessel_name     TEXT NOT NULL
system_name     TEXT NOT NULL
priority        TEXT NOT NULL (Crítica | Alta | Média | Baixa)
status          TEXT NOT NULL (pendente | em andamento | concluída | cancelada)
description     TEXT NOT NULL
created_at      TIMESTAMPTZ NOT NULL
updated_at      TIMESTAMPTZ NOT NULL
completed_at    TIMESTAMPTZ (nullable)
```

## 🔌 API Endpoints

### GET /api/os/all
**Response**: Array of orders
```typescript
{
  id: string
  vessel_name: string
  system_name: string
  status: string
  priority: string
  description: string
  created_at: string
  updated_at: string
  completed_at?: string
}[]
```

### POST /api/os/update
**Request Body**:
```json
{
  "id": "order-uuid",
  "status": "em andamento" | "concluída" | "pendente" | "cancelada"
}
```

**Response**:
```json
{ "success": true }
```

## 🎨 Priority Colors
- **Crítica**: 🔴 Red
- **Alta**: 🟠 Orange
- **Média**: 🟡 Yellow
- **Baixa**: 🟢 Green

## 📊 Status Colors & Icons
- **Concluída**: 🟢 Green + CheckCircle
- **Em Andamento**: 🔵 Blue + Clock
- **Pendente**: ⚪ Gray + AlertTriangle
- **Cancelada**: 🔴 Red + XCircle

## ⚡ Button States

### "Em Andamento" Button
- **Enabled**: When status is "pendente" or "cancelada"
- **Disabled**: When status is "em andamento" or "concluída"

### "Concluir" Button
- **Enabled**: When status is not "concluída"
- **Disabled**: When status is "concluída"

## 🧪 Tests
**File**: `src/tests/mmi-orders-page.test.tsx`
**Count**: 11 tests
**Status**: ✅ All passing

## 📦 Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout
- `Button` - Actions
- `Badge` - Priority and status indicators
- Toast notifications via `sonner`

## 🔐 Security
- RLS enabled on `mmi_orders` table
- Authenticated users can read/write
- Status validation at API level
- SQL injection prevention via Supabase client

## 🚀 Quick Start

### 1. Access the Interface
Navigate to: `https://your-domain.com/admin/mmi/orders`

### 2. View Orders
All orders are displayed in cards, sorted by newest first

### 3. Update Status
Click "Em Andamento" or "Concluir" buttons

### 4. Export Order
Click "Exportar PDF" to download order details

## 📝 Common Tasks

### Create a New Order (via database)
```sql
INSERT INTO mmi_orders (vessel_name, system_name, priority, status, description)
VALUES ('Vessel Name', 'System', 'Alta', 'pendente', 'Description');
```

### Query Orders by Status
```sql
SELECT * FROM mmi_orders WHERE status = 'pendente' ORDER BY created_at DESC;
```

### Update Order Status
```sql
UPDATE mmi_orders SET status = 'concluída', completed_at = NOW() WHERE id = 'order-id';
```

## 🐛 Troubleshooting

### Orders not loading
- Check Supabase connection
- Verify RLS policies
- Check browser console for errors

### Status update fails
- Verify valid status value
- Check user authentication
- Review API error response

### Export not working
- Check browser's download permissions
- Verify order data is loaded

## 📚 Related Files
- Migration: `supabase/migrations/20251019173000_create_mmi_orders.sql`
- Page Component: `src/pages/admin/mmi/orders.tsx`
- API List: `pages/api/os/all.ts`
- API Update: `pages/api/os/update.ts`
- Tests: `src/tests/mmi-orders-page.test.tsx`
- Route: `src/App.tsx` (line ~97, ~250)

## 🎯 Key Features
✅ Real-time status updates
✅ Color-coded priorities and statuses
✅ Smart button states
✅ PDF export
✅ Loading & error states
✅ Toast notifications
✅ Responsive design
✅ Full test coverage

---
**Version**: 1.0.0
**Last Updated**: 2025-10-19
**Status**: Production Ready ✅
