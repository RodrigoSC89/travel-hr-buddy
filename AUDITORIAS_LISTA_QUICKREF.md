# Auditorias Lista - Quick Reference

## 🚀 Quick Start

### Access the Feature
Navigate to: `/admin/auditorias-lista`

### API Endpoint
```
GET /api/auditorias/list
```

## 📦 Files

### Core Implementation
- `src/components/auditorias/ListaAuditoriasIMCA.tsx` - Main component
- `src/pages/admin/auditorias-lista.tsx` - Page wrapper
- `pages/api/auditorias/list.ts` - API endpoint
- `supabase/migrations/20251016220000_add_audit_fields_to_auditorias_imca.sql` - Database migration

### Testing
- `src/tests/auditorias-list.test.ts` - 280+ test cases

## 🎨 Badge Colors

| Status | Color | Classes |
|--------|-------|---------|
| Conforme | 🟢 Green | `bg-green-100 text-green-800` |
| Não Conforme | 🔴 Red | `bg-red-100 text-red-800` |
| Observação | 🟡 Yellow | `bg-yellow-100 text-yellow-800` |

## 📊 Database Schema

### New Fields in auditorias_imca
```sql
navio TEXT                    -- Ship name
data DATE                     -- Audit date
norma TEXT                    -- Standard/norm (IMCA, ISO 9001)
resultado TEXT                -- Conforme | Não Conforme | Observação
item_auditado TEXT            -- Item/area audited
comentarios TEXT              -- Additional comments
```

### Indexes
- `idx_auditorias_imca_navio`
- `idx_auditorias_imca_data`
- `idx_auditorias_imca_resultado`

## 🔌 API Usage

### JavaScript/TypeScript
```typescript
const response = await fetch("/api/auditorias/list");
const audits = await response.json();
```

### Response Format
```json
[
  {
    "id": "uuid",
    "navio": "Navio Alpha",
    "data": "2025-10-15",
    "norma": "IMCA",
    "resultado": "Conforme",
    "item_auditado": "Sistema DP",
    "comentarios": "Tudo OK"
  }
]
```

## 🧩 Component Usage

### Import
```tsx
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";
```

### Usage
```tsx
<ListaAuditoriasIMCA />
```

## 📝 Key Features

✅ Card-based layout  
✅ Color-coded status badges  
✅ Date formatting (dd/MM/yyyy)  
✅ Loading state  
✅ Empty state  
✅ Hover effects  
✅ Responsive design  

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Request handling
- Database queries
- Response validation
- Error handling
- Component rendering
- Badge color mapping
- Date formatting

## 🔧 Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## 📍 Route Configuration

### App.tsx Addition
```tsx
const AuditoriasLista = React.lazy(() => import("./pages/admin/auditorias-lista"));

// In Routes:
<Route path="/admin/auditorias-lista" element={<AuditoriasLista />} />
```

## 🎯 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 405 | Method not allowed |
| 500 | Server error |

## 📚 Dependencies

- React 18.3.1
- date-fns 3.6.0
- @supabase/supabase-js 2.57.4
- shadcn/ui (Card, Badge components)

## ⚡ Performance

- Lazy-loaded route
- Database indexes
- Single query fetch
- Efficient state management

## 🔗 Related Files

- `src/pages/admin/dashboard-auditorias.tsx` - Dashboard view
- `supabase/migrations/20251016154800_create_auditorias_imca_rls.sql` - Base table

## 💡 Tips

1. Run database migration before using
2. Ensure user authentication for API access
3. Check RLS policies if permissions issues occur
4. Use browser DevTools to inspect API responses

## 📞 Support

For issues or questions:
- Check AUDITORIAS_LISTA_IMPLEMENTATION.md for detailed documentation
- Review test files for expected behavior
- Consult repository issue tracker
