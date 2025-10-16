# Auditorias Lista UI - Quick Reference 📋

## 🚀 Quick Start

### Access the List
```
Navigate to: /admin/auditorias-lista
```

### Import Component
```tsx
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";
```

### API Endpoint
```
GET /api/auditorias/list
```

## 📦 Files Created

```
✅ supabase/migrations/20251016201900_add_auditorias_imca_fields.sql
✅ pages/api/auditorias/list.ts
✅ src/components/auditorias/ListaAuditoriasIMCA.tsx
✅ src/pages/admin/auditorias-lista.tsx
✅ src/tests/auditorias-list-api.test.ts
✅ src/tests/lista-auditorias-imca.test.tsx
```

## 🔧 Database Schema

### New Fields in `auditorias_imca`
| Field | Type | Description |
|-------|------|-------------|
| `nome_navio` | TEXT | Vessel name |
| `norma` | TEXT | Standard (IMCA, ISO, etc.) |
| `item_auditado` | TEXT | Audited item |
| `resultado` | TEXT | Result: Conforme, Não Conforme, Observação |
| `comentarios` | TEXT | Comments |
| `data` | DATE | Audit date |

## 🎨 Features

### 🔍 Filtering
- **Search across:** navio, norma, item_auditado, resultado
- **Type:** Case-insensitive, real-time
- **UI:** Search input with 🔍 icon

### 📤 CSV Export
- **Button:** "Exportar CSV" (blue button)
- **Filename:** `auditorias_imca.csv`
- **Headers:** Navio, Data, Norma, Item, Resultado, Comentários
- **Encoding:** UTF-8

### 📄 PDF Export
- **Button:** "Exportar PDF" (dark button)
- **Filename:** `auditorias_imca.pdf`
- **Format:** A4 portrait
- **Content:** All visible cards with formatting

### 🎨 Result Badges
| Result | Color | Badge |
|--------|-------|-------|
| Conforme | Green | `bg-green-100 text-green-800` |
| Não Conforme | Red | `bg-red-100 text-red-800` |
| Observação | Yellow | `bg-yellow-100 text-yellow-800` |

## 🧪 Testing

### Run Tests
```bash
npm test src/tests/auditorias-list-api.test.ts
npm test src/tests/lista-auditorias-imca.test.tsx
```

### Test Coverage
- ✅ 19 API endpoint tests
- ✅ 25 component tests
- ✅ Total: 44 new tests

## 📊 API Response Format

```json
[
  {
    "id": "uuid-123",
    "navio": "Navio A",
    "data": "2025-10-01",
    "norma": "IMCA",
    "item_auditado": "Safety Equipment",
    "resultado": "Conforme",
    "comentarios": "All items checked"
  }
]
```

## 🔑 Key Code Snippets

### Fetch Auditorias
```typescript
const response = await fetch('/api/auditorias/list');
const auditorias = await response.json();
```

### Filter Data
```typescript
const filtered = auditorias.filter((a) =>
  [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
    v && v.toLowerCase().includes(filtro.toLowerCase())
  )
);
```

### Export CSV
```typescript
const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
const rows = data.map((a) => [a.navio, a.data, a.norma, a.item_auditado, a.resultado, a.comentarios]);
const csv = [header, ...rows].map((e) => e.join(",")).join("\n");
saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "auditorias_imca.csv");
```

### Export PDF
```typescript
html2pdf().from(pdfRef.current).set({
  margin: 0.5,
  filename: "auditorias_imca.pdf",
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
}).save();
```

## 🛠️ Dependencies

```json
{
  "file-saver": "^2.0.5",
  "@types/file-saver": "^2.0.7",
  "html2pdf.js": "^0.12.1" (already installed)
}
```

## 📝 Component Props

The `ListaAuditoriasIMCA` component accepts no props - it's self-contained.

```tsx
<ListaAuditoriasIMCA />
```

## 🎯 UI Structure

```
┌─────────────────────────────────────────────────┐
│  📋 Auditorias Técnicas Registradas             │
│                    [Exportar CSV] [Exportar PDF] │
├─────────────────────────────────────────────────┤
│  🔍 Filtrar por navio, norma, item ou resultado │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   │
│  │ 🚢 Navio A                    [Conforme] │   │
│  │ 01/10/2025 - Norma: IMCA               │   │
│  │ Item auditado: Safety Equipment        │   │
│  │ Comentários: All items checked         │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🔐 Permissions

Uses existing RLS policies:
- Users see their own auditorias
- Admins see all auditorias

## 🐛 Troubleshooting

### No data showing?
1. Check API is accessible: `GET /api/auditorias/list`
2. Check browser console for errors
3. Verify database has data
4. Check Supabase connection

### Export not working?
1. Ensure data is loaded first
2. Check browser console for errors
3. Verify `file-saver` is installed
4. Check popup blockers

### Filter not working?
1. Type in search input
2. Check data has values in filterable fields
3. Verify state is updating

## 📚 Related Documentation

- Full Implementation: `AUDITORIAS_LISTA_UI_IMPLEMENTATION.md`
- Database Schema: `supabase/migrations/20251016154800_create_auditorias_imca_rls.sql`
- Existing Dashboard: `src/pages/admin/dashboard-auditorias.tsx`

## ✅ Checklist

- [x] Database migration created and ready
- [x] API endpoint implemented
- [x] Component created with all features
- [x] Tests added (44 total)
- [x] Build successful
- [x] All tests passing
- [x] Documentation complete
- [x] No regressions

## 🚀 Deploy

```bash
# Build for production
npm run build

# Run tests
npm test

# Deploy (if using Vercel)
npm run deploy:vercel
```

## 📞 Support

For issues or questions:
1. Check `AUDITORIAS_LISTA_UI_IMPLEMENTATION.md` for details
2. Review test files for usage examples
3. Check console for error messages

---

**Status:** ✅ Complete and Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-10-16
