# ListaAuditoriasIMCA - Quick Reference Guide

## 🎯 Quick Access

**Route:** `/admin/auditorias-lista`  
**Component:** `ListaAuditoriasIMCA`  
**API:** `GET /api/auditorias/list`

## 📦 File Locations

```
travel-hr-buddy/
├── supabase/migrations/
│   └── 20251016220000_add_audit_fields_to_auditorias_imca.sql
├── pages/api/auditorias/
│   └── list.ts
├── src/
│   ├── components/auditorias/
│   │   └── ListaAuditoriasIMCA.tsx
│   ├── pages/admin/
│   │   └── auditorias-lista.tsx
│   ├── tests/
│   │   └── auditorias-list.test.ts
│   └── App.tsx (modified)
└── AUDITORIAS_LISTA_IMPLEMENTATION.md
```

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Auditorias Técnicas Registradas                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚢 Navio Alpha                      [🟢 Conforme]          │
│  ───────────────────────────────────────────────────────    │
│  16/10/2025 - Norma: IMCA                                   │
│                                                              │
│  Item auditado: Equipamento de Segurança                    │
│  Comentários: Todos os requisitos atendidos                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚢 Navio Beta                   [🔴 Não Conforme]          │
│  ───────────────────────────────────────────────────────    │
│  15/10/2025 - Norma: ISO 9001                               │
│                                                              │
│  Item auditado: Procedimentos de Emergência                 │
│  Comentários: Documentação incompleta                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚢 Navio Gamma                      [🟡 Observação]        │
│  ───────────────────────────────────────────────────────    │
│  14/10/2025 - Norma: IMCA                                   │
│                                                              │
│  Item auditado: Manutenção Preventiva                       │
│  Comentários: Melhorias sugeridas na documentação           │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Status Badge Colors

| Status | Color | Background | Text | Use Case |
|--------|-------|------------|------|----------|
| **Conforme** | 🟢 Green | `bg-green-100` | `text-green-800` | Requirements met |
| **Não Conforme** | 🔴 Red | `bg-red-100` | `text-red-800` | Non-compliant |
| **Observação** | 🟡 Yellow | `bg-yellow-100` | `text-yellow-800` | Needs attention |

## 🔌 API Usage

### Fetch All Audits

```typescript
// GET /api/auditorias/list
const response = await fetch("/api/auditorias/list");
const auditorias = await response.json();
```

### Response Example

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "navio": "Navio Alpha",
    "data": "2025-10-16",
    "norma": "IMCA",
    "resultado": "Conforme",
    "item_auditado": "Equipamento de Segurança",
    "comentarios": "Todos os requisitos atendidos",
    "created_at": "2025-10-16T21:00:00.000Z"
  }
]
```

## 💾 Database Operations

### Insert New Audit

```sql
INSERT INTO public.auditorias_imca (
  user_id, 
  navio, 
  data, 
  norma, 
  resultado, 
  item_auditado, 
  comentarios
) VALUES (
  auth.uid(),
  'Ship Name',
  '2025-10-16',
  'IMCA',
  'Conforme',
  'Safety Equipment',
  'All requirements met'
);
```

### Query Audits

```sql
SELECT 
  id, navio, data, norma, resultado, 
  item_auditado, comentarios, created_at
FROM public.auditorias_imca
ORDER BY data DESC;
```

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test auditorias-list.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview build
npm run preview
```

## 🎯 Component States

### Loading State
```
┌─────────────────────────────────┐
│  Carregando auditorias...      │
└─────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────┐
│  Nenhuma auditoria registrada   │
└─────────────────────────────────┘
```

### Loaded State
```
Multiple audit cards displayed
in descending date order
```

## 🔐 Security & Permissions

- ✅ Row Level Security (RLS) enabled
- ✅ Users see only their own audits
- ✅ Admins can see all audits
- ✅ Authenticated requests required
- ✅ Supabase JWT validation

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Test Files | 95 |
| Total Tests | 1,478 |
| Pass Rate | 100% |
| Build Time | ~54s |
| Bundle Size | 6,959 KB |

## 🚀 Quick Start

1. **Access the page:**
   ```
   Navigate to: http://localhost:5173/admin/auditorias-lista
   ```

2. **View audits:**
   - Automatically loads on page mount
   - Displays cards with color-coded badges
   - Sorted by date (newest first)

3. **Return to admin:**
   - Click "Voltar" button
   - Redirects to `/admin`

## 🛠️ Troubleshooting

### No audits showing?
- Check if `auditorias_imca` table has records
- Verify RLS policies allow access
- Check browser console for errors

### API not responding?
- Verify Supabase URL in `.env`
- Check Supabase anon key
- Ensure API route is accessible

### Build errors?
- Run `npm install` to ensure dependencies
- Check TypeScript errors with `npm run build`
- Verify all imports are correct

## 📚 Related Files

- **Dashboard:** `/admin/dashboard-auditorias`
- **Metrics:** `/admin/metricas-risco`
- **API Summary:** `/api/auditoria/resumo`
- **Migration:** `20251016154800_create_auditorias_imca_rls.sql`

## 🎓 Best Practices

1. **Always validate resultado field:**
   - Must be one of: 'Conforme', 'Não Conforme', 'Observação'

2. **Use proper date format:**
   - Store as DATE type in database
   - Display as dd/MM/yyyy to users

3. **Include meaningful comentarios:**
   - Helps explain context of audit results
   - Optional but recommended

4. **Follow RLS policies:**
   - Insert with correct user_id
   - Admins use proper role assignment

## 💡 Tips

- 📅 Dates are sorted newest-first automatically
- 🎨 Badge colors are semantic and consistent
- 📱 Component is responsive and mobile-friendly
- ♿ Uses accessible UI components from shadcn/ui
- 🔍 Easy to extend with filters/search if needed

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete
