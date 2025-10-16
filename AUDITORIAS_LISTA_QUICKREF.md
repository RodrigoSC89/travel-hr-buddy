# Auditorias Lista UI - Quick Reference

## 🚀 Quick Start

### Access the Page
```
URL: /admin/auditorias-lista
```

### API Endpoint
```
GET /api/auditorias/list
```

## 📋 Key Features

### 1. Dynamic Filtering
Filter auditorias by:
- Navio (ship name)
- Norma (standard)
- Item auditado (audited item)
- Resultado (result)

### 2. Export Options
- **CSV**: Compatible with Excel, includes UTF-8 BOM
- **PDF**: A4 formatted, ready for printing

### 3. Visual Indicators
- 🟢 **Conforme**: Green badge
- 🔴 **Não Conforme**: Red badge  
- 🟡 **Observação**: Yellow badge

## 🗂️ File Structure

```
├── pages/api/auditorias/
│   └── list.ts                              # API endpoint
├── src/
│   ├── components/sgso/
│   │   └── ListaAuditoriasIMCA.tsx         # Main component
│   ├── pages/admin/
│   │   └── auditorias-lista.tsx            # Admin page
│   └── tests/
│       ├── auditorias-lista-api.test.ts    # API tests
│       └── components/sgso/
│           └── ListaAuditoriasIMCA.test.tsx # Component tests
└── supabase/migrations/
    └── 20251016220000_add_auditorias_imca_lista_fields.sql
```

## 📊 Database Schema

### New Fields Added to `auditorias_imca`
```sql
navio TEXT              -- Ship/vessel name
data DATE               -- Audit date
norma TEXT              -- Standard or regulation
item_auditado TEXT      -- Specific item audited
resultado TEXT          -- Result: Conforme, Não Conforme, Observação
comentarios TEXT        -- Comments and observations
```

### Indexes Created
- `idx_auditorias_imca_navio`
- `idx_auditorias_imca_norma`
- `idx_auditorias_imca_resultado`
- `idx_auditorias_imca_data`

## 🔌 API Response Format

```typescript
[
  {
    id: "uuid",
    navio: "Ship Name",
    data: "2025-10-16",
    norma: "IMCA M 117",
    item_auditado: "Safety Equipment",
    resultado: "Conforme",
    comentarios: "All checks passed",
    created_at: "2025-10-16T00:00:00Z"
  }
]
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
# API tests only
npm test auditorias-lista-api

# Component tests only
npm test ListaAuditoriasIMCA
```

### Expected Results
- API Tests: 48 passing
- Component Tests: 19 passing
- Total: 1469 tests passing

## 🛠️ Common Tasks

### Add to Navigation
Edit your navigation component to include:
```tsx
<Link to="/admin/auditorias-lista">
  Auditorias Lista
</Link>
```

### Customize Export Filename
In `ListaAuditoriasIMCA.tsx`:
```typescript
// CSV
saveAs(blob, "my-custom-name.csv")

// PDF
filename: "my-custom-name.pdf"
```

### Modify Badge Colors
In `ListaAuditoriasIMCA.tsx`:
```typescript
const corResultado: Record<string, string> = {
  "Conforme": "bg-green-100 text-green-800",
  "Não Conforme": "bg-red-100 text-red-800",
  "Observação": "bg-yellow-100 text-yellow-800",
}
```

### Add More Filter Fields
Modify the filter function:
```typescript
const auditoriasFiltradas = auditorias.filter((a) =>
  [a.navio, a.norma, a.resultado, a.item_auditado, a.newField].some((v) => 
    v && v.toLowerCase().includes(filtro.toLowerCase())
  )
)
```

## 🐛 Troubleshooting

### Issue: API Returns Empty Array
**Check**:
1. Database migration executed?
2. Data exists in `auditorias_imca` table?
3. RLS policies allow access?

### Issue: Export Not Working
**CSV**: Check if `file-saver` is installed
```bash
npm install file-saver @types/file-saver
```

**PDF**: Check if `html2pdf.js` is installed
```bash
npm install html2pdf.js
```

### Issue: Build Fails
Run lint fix:
```bash
npm run lint:fix
```

### Issue: Tests Fail
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

## 📚 Related Documentation

- Main Implementation: `AUDITORIAS_LISTA_IMPLEMENTATION_SUMMARY.md`
- API Documentation: See inline comments in `pages/api/auditorias/list.ts`
- Component Props: See TypeScript interface in `ListaAuditoriasIMCA.tsx`

## 🔐 Security Notes

- Endpoint uses Supabase RLS
- No SQL injection vulnerabilities
- Authentication required (via Supabase)
- Error messages sanitized

## 📈 Performance Tips

1. **Pagination**: For large datasets, consider adding pagination
2. **Caching**: Add React Query for data caching
3. **Debouncing**: Add debounce to filter input for better performance
4. **Virtual Scrolling**: For 1000+ items, consider virtual scrolling

## 🎨 Customization Examples

### Change Card Style
```tsx
<Card className="hover:shadow-lg transition-shadow">
  ...
</Card>
```

### Add Icons to Buttons
```tsx
<Button>
  <Download className="w-4 h-4 mr-2" />
  Exportar CSV
</Button>
```

### Modify Date Format
```typescript
format(new Date(a.data), 'dd/MM/yyyy') // Current
format(new Date(a.data), 'yyyy-MM-dd') // ISO format
format(new Date(a.data), 'PPP')        // Long format
```

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review implementation summary
3. Check test files for examples
4. Review inline code comments

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-16  
**Maintained by**: GitHub Copilot
