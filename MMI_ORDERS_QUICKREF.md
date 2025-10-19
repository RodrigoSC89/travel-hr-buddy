# MMI Orders Management Interface - Quick Reference

## 🚀 Quick Start

Access the orders interface at: `/admin/mmi/orders`

## 📋 API Endpoints

### List All Orders
```
GET /api/os/all
Authentication: Required
Response: Array of Order objects
```

### Update Order Status
```
POST /api/os/update
Authentication: Required
Body: { id: string, status: string }
Response: { success: boolean, order: Order }
```

## 🎨 UI Components

### Status Colors
- ✅ **Concluída**: Green
- 🔵 **Em Andamento**: Blue
- ⚪ **Pendente**: Gray
- 🔴 **Cancelada**: Red

### Priority Colors
- 🔴 **Crítica**: Red
- 🟠 **Alta**: Orange
- 🟡 **Normal**: Yellow
- 🟢 **Baixa**: Green

## 🔄 Status Workflow

```
pendente → em_andamento → concluido
         ↘ cancelado
```

## ⚡ Key Actions

### Start Order
- Button: "Iniciar"
- Changes status from `pendente` to `em_andamento`
- Disabled when order is already in progress or completed

### Complete Order
- Button: "Concluir"
- Changes status to `concluido`
- Disabled when order is already completed

### Export PDF
- Button: "Exportar PDF"
- Generates PDF with order details
- Filename: `OS-{order_id}.pdf`

## 📊 Database Schema

```sql
mmi_orders (
  id UUID PRIMARY KEY,
  forecast_id UUID,
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  priority TEXT CHECK (priority IN ('baixa', 'normal', 'alta', 'crítica')),
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## 🔒 Security

- **Authentication**: Required for all endpoints
- **RLS**: Row-level security enabled
- **Policies**: All authenticated users can view/update orders

## 🧪 Testing

Run tests:
```bash
npm run test -- src/tests/mmi-orders-page.test.tsx
```

Test coverage: **14 tests** covering:
- Rendering
- Status updates
- PDF export
- Error handling

## 📦 Files Modified/Created

### Created
- `pages/api/os/all.ts` - List orders API
- `pages/api/os/update.ts` - Update status API
- `src/pages/admin/mmi/orders.tsx` - Admin interface
- `src/tests/mmi-orders-page.test.tsx` - Test suite
- `MMI_ORDERS_IMPLEMENTATION.md` - Full documentation
- `MMI_ORDERS_QUICKREF.md` - This file
- `MMI_ORDERS_VISUAL_GUIDE.md` - Visual guide

### Modified
- `src/App.tsx` - Added route and lazy import

## 🎯 Requirements Fulfilled

- ✅ Interface de Listagem e Gestão de OS
- ✅ Atualização de status (em tempo real)
- ✅ Exportação de PDF da OS
- ✅ API: Listar e atualizar

## 💡 Usage Examples

### Fetch All Orders
```typescript
const response = await fetch('/api/os/all');
const orders = await response.json();
```

### Update Order Status
```typescript
const response = await fetch('/api/os/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    id: 'order-id', 
    status: 'em_andamento' 
  })
});
```

## 🐛 Troubleshooting

### Orders not loading
- Check authentication status
- Verify API endpoint is accessible
- Check browser console for errors

### Status update failing
- Ensure status value is valid: `pendente`, `em_andamento`, `concluido`, or `cancelado`
- Check authentication token is valid
- Verify order ID exists

### PDF export not working
- Check html2pdf.js is loaded
- Verify browser supports PDF generation
- Check for JavaScript errors in console

## 🔗 Related Files

- Database migration: `supabase/migrations/20251019180000_create_mmi_orders.sql`
- Create order API: `pages/api/os/create/route.ts`
- MMI History: `src/pages/admin/mmi/history.tsx`
- MMI Forecast: `src/pages/admin/mmi/forecast/page.tsx`

## 📞 Support

For issues or questions:
1. Check the full implementation guide: `MMI_ORDERS_IMPLEMENTATION.md`
2. Review the visual guide: `MMI_ORDERS_VISUAL_GUIDE.md`
3. Run tests to verify setup: `npm run test`
4. Check build: `npm run build`
