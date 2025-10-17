# Auditorias Lista IMCA - Quick Reference Guide

## 🚀 Quick Start

### Access the Feature
```
URL: /admin/auditorias-lista
```

### Basic Usage
1. Open the admin interface
2. Navigate to Auditorias Lista
3. View, filter, and export auditorias

## 📋 Component API

### ListaAuditoriasIMCA

```tsx
import { ListaAuditoriasIMCA } from "@/components/sgso/ListaAuditoriasIMCA";

// Basic usage
<ListaAuditoriasIMCA />
```

**Props**: None (self-contained component)

## 🔌 API Endpoint

### GET /api/auditorias/list

**Request**:
```bash
curl http://localhost:5173/api/auditorias/list
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "navio": "PSV Atlântico",
      "data": "2024-10-15",
      "norma": "IMCA M 179",
      "item_auditado": "Sistema de Propulsão",
      "resultado": "Conforme",
      "comentarios": "Sistema operando dentro dos parâmetros",
      "created_at": "2024-10-15T10:00:00Z",
      "updated_at": "2024-10-15T10:00:00Z"
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🗄️ Database Schema

### Table: auditorias_imca

```sql
-- New fields added
navio TEXT                  -- Ship/vessel name
data DATE                   -- Audit date
norma TEXT                  -- Standard/regulation
item_auditado TEXT          -- Audited item
resultado TEXT              -- Result (Conforme, Não Conforme, Observação)
comentarios TEXT            -- Comments

-- Indexes
idx_auditorias_imca_navio
idx_auditorias_imca_data
idx_auditorias_imca_norma
idx_auditorias_imca_resultado
```

### Query Example

```sql
-- Get all auditorias for a specific ship
SELECT * FROM auditorias_imca 
WHERE navio = 'PSV Atlântico' 
ORDER BY data DESC;

-- Get all non-conforming auditorias
SELECT * FROM auditorias_imca 
WHERE resultado = 'Não Conforme' 
ORDER BY data DESC;
```

## 🎨 Component Features

### Filtering

```tsx
// The component filters by:
// - navio (ship name)
// - norma (standard)
// - item_auditado (audited item)
// - resultado (result)

// Example: Type "Atlântico" to see all audits for PSV Atlântico
```

### Export CSV

```tsx
// Exports filtered data to CSV
// File: auditorias_imca.csv
// Format: UTF-8 with BOM (Excel compatible)
// Columns: Navio, Data, Norma, Item, Resultado, Comentários
```

### Export PDF

```tsx
// Exports filtered data to PDF
// File: auditorias_imca.pdf
// Format: A4, Portrait orientation
// Includes all visible auditorias
```

## 🎨 Result Badge Colors

```tsx
const resultColors = {
  "Conforme": "bg-green-100 text-green-800",        // Green
  "Não Conforme": "bg-red-100 text-red-800",        // Red
  "Observação": "bg-yellow-100 text-yellow-800",    // Yellow
};
```

## 🧪 Testing

### Run Component Tests
```bash
npm test -- src/tests/components/sgso/ListaAuditoriasIMCA.test.tsx
```

### Run API Tests
```bash
npm test -- src/tests/api/auditorias-list.test.ts
```

### Run All Tests
```bash
npm test
```

## 🔧 Common Tasks

### Add New Auditoria (via Supabase)

```sql
INSERT INTO auditorias_imca (
  user_id, 
  title, 
  navio, 
  data, 
  norma, 
  item_auditado, 
  resultado, 
  comentarios
) VALUES (
  'user-uuid',
  'Auditoria Sistema Propulsão',
  'PSV Atlântico',
  '2024-10-15',
  'IMCA M 179',
  'Sistema de Propulsão',
  'Conforme',
  'Sistema operando dentro dos parâmetros'
);
```

### Update Result

```sql
UPDATE auditorias_imca 
SET resultado = 'Não Conforme',
    comentarios = 'Necessita manutenção'
WHERE id = 'auditoria-uuid';
```

### Delete Auditoria

```sql
DELETE FROM auditorias_imca 
WHERE id = 'auditoria-uuid';
```

## 🐛 Troubleshooting

### Error: "Erro ao carregar auditorias"

**Cause**: API connection failed or Supabase error

**Solution**:
1. Check Supabase environment variables
2. Verify database connection
3. Check browser console for details

### Error: "Nenhuma auditoria encontrada"

**Cause**: No data in database or all filtered out

**Solution**:
1. Check if data exists: `SELECT COUNT(*) FROM auditorias_imca WHERE navio IS NOT NULL`
2. Clear filter input
3. Add test data to database

### Export Buttons Not Working

**Cause**: Browser blocking downloads or library issue

**Solution**:
1. Check browser allows downloads
2. Open browser console for errors
3. Verify `html2pdf.js` and `file-saver` are installed

## 📦 Dependencies

```json
{
  "html2pdf.js": "^0.12.1",
  "file-saver": "^2.0.5",
  "date-fns": "latest",
  "@supabase/supabase-js": "latest"
}
```

## 🔒 Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Alternative (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Routes

```tsx
// App.tsx
const AuditoriasLista = React.lazy(() => import("./pages/admin/auditorias-lista"));

// Route configuration
<Route path="/admin/auditorias-lista" element={<AuditoriasLista />} />
```

## 🎯 Best Practices

1. **Always filter by navio** when displaying ship-specific audits
2. **Use date ranges** for better performance on large datasets
3. **Export before major changes** to keep backup records
4. **Regular audits** - Schedule audits to maintain compliance
5. **Update comentarios** - Add detailed notes for future reference

## 📊 Data Model

```typescript
type AuditoriaIMCA = {
  id: string;
  navio: string;
  data: string;
  norma: string;
  item_auditado: string;
  resultado: 'Conforme' | 'Não Conforme' | 'Observação';
  comentarios: string;
  created_at: string;
  updated_at: string;
};
```

## 🔗 Related Files

- Component: `src/components/sgso/ListaAuditoriasIMCA.tsx`
- API: `pages/api/auditorias/list.ts`
- Page: `src/pages/admin/auditorias-lista.tsx`
- Migration: `supabase/migrations/20251016220000_add_auditorias_imca_lista_fields.sql`
- Tests: `src/tests/components/sgso/ListaAuditoriasIMCA.test.tsx`
- Tests: `src/tests/api/auditorias-list.test.ts`

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review implementation summary
3. Check test files for examples
4. Review console logs for errors

---

**Last Updated**: October 17, 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
