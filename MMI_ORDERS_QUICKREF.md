# MMI Orders Management - Quick Reference

## 🚀 Quick Start

### Access the Interface
Navigate to: `/admin/mmi/orders`

### Features at a Glance
- 📋 **List Orders**: View all work orders sorted by date
- 🔄 **Update Status**: One-click status updates
- 📄 **Export PDF**: Download individual order details
- 🎨 **Visual Indicators**: Color-coded priorities and statuses

## 📊 Order Statuses

| Status | Label | Color | Description |
|--------|-------|-------|-------------|
| `pendente` | Pendente | Gray | Awaiting action |
| `em_andamento` | Em Andamento | Blue | Currently in progress |
| `concluido` | Concluída | Green | Completed |
| `cancelado` | Cancelada | Red | Cancelled |

## 🎯 Priority Levels

| Priority | Label | Color | Use When |
|----------|-------|-------|----------|
| `baixa` | Baixa | Green | Low urgency |
| `normal` | Média | Yellow | Standard maintenance |
| `alta` | Alta | Orange | Important, needs attention |
| `crítica` | Crítica | Red | Critical, immediate action |

## 🔌 API Endpoints

### List All Orders
**GET** `/api/os/all`

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "vessel_name": "Navio Exemplo",
      "system_name": "Sistema Hidráulico",
      "description": "Manutenção preventiva",
      "status": "pendente",
      "priority": "alta",
      "created_at": "2025-10-19T10:00:00Z",
      "updated_at": "2025-10-19T10:00:00Z"
    }
  ]
}
```

### Update Order Status
**POST** `/api/os/update`

**Request Body:**
```json
{
  "id": "order-uuid",
  "status": "em_andamento"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "status": "em_andamento",
    ...
  }
}
```

## 🎬 User Actions

### Pending Orders (Pendente)
- **Action Available**: "Iniciar" button
- **Result**: Changes status to `em_andamento`

### In Progress Orders (Em Andamento)
- **Action Available**: "Concluir" button
- **Result**: Changes status to `concluido`

### Completed/Cancelled Orders
- **Action Available**: None (view-only)
- **Export**: PDF button always available

## 🧪 Testing

### Run Tests
```bash
# Run all MMI orders tests
npm run test -- src/tests/mmi-orders-page.test.tsx src/tests/api-os-all.test.ts src/tests/api-os-update.test.ts

# Run specific test file
npm run test -- src/tests/mmi-orders-page.test.tsx

# Watch mode
npm run test:watch
```

### Test Coverage
- **40 tests** total
- **14 tests** for UI/UX
- **26 tests** for API endpoints
- **100%** pass rate

## 🏗️ Development

### File Structure
```
pages/api/os/
├── all/route.ts          # List orders endpoint
├── create/route.ts       # Create order endpoint
└── update/route.ts       # Update order endpoint

src/pages/admin/mmi/
└── orders.tsx            # Orders management interface

src/tests/
├── mmi-orders-page.test.tsx  # UI tests
├── api-os-all.test.ts        # List API tests
└── api-os-update.test.ts     # Update API tests
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy (automatic via CI/CD)
git push origin main
```

## 🐛 Troubleshooting

### Orders Not Loading
1. Check authentication token
2. Verify Supabase connection
3. Check browser console for errors
4. Verify RLS policies are enabled

### Status Update Fails
1. Ensure valid status value
2. Check order ID exists
3. Verify user has update permissions
4. Check API endpoint logs

### PDF Export Not Working
1. Clear browser cache
2. Check html2pdf.js is loaded
3. Verify order data is complete
4. Try different browser

## 📚 Related Documentation
- [MMI Orders Implementation Summary](./MMI_ORDERS_IMPLEMENTATION_SUMMARY.md)
- [Database Migration](./supabase/migrations/20251019180000_create_mmi_orders.sql)
- [API Create Endpoint](./pages/api/os/create/route.ts)

## 🔐 Security Notes
- All endpoints require authentication
- RLS policies enforce data access control
- Input validation on all API endpoints
- No sensitive data in error messages

## 💡 Tips
- Orders auto-sort by newest first
- Use filters for specific statuses
- Export to PDF for record-keeping
- Status changes are immediate (no page reload)
- Empty state shows when no orders exist

## 🆘 Support
For issues or questions:
1. Check this quick reference
2. Review implementation summary
3. Run tests to verify functionality
4. Check workflow logs in GitHub Actions
