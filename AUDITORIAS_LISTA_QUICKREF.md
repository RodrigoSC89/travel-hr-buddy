# Lista Auditorias IMCA - Quick Reference

## 🚀 Quick Start

### Access the Component
```
URL: /admin/auditorias-lista
```

### Component Usage
```tsx
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";

<ListaAuditoriasIMCA />
```

## 📊 Data Structure

### Auditoria Object
```typescript
interface Auditoria {
  id: string;
  navio: string;              // Vessel name
  data: string;               // Audit date (ISO format)
  norma: string;              // IMCA standard/norm
  item_auditado: string;      // Audited item
  resultado: "Conforme" | "Não Conforme" | "Observação";
  comentarios: string;        // Comments
}
```

## 🔌 API Endpoints

### List Auditorias
```
GET /api/auditorias/list
Response: Auditoria[]
```

### AI Explanation
```
POST /api/auditorias/explain
Body: { navio: string, item: string, norma: string }
Response: { resultado: string }
```

## 🎨 Features

### 1. Filtering
- Type in search box
- Filters: navio, norma, item_auditado, resultado
- Real-time results

### 2. Export CSV
```javascript
Click: "Exportar CSV" button
Output: auditorias_imca.csv
```

### 3. Export PDF
```javascript
Click: "Exportar PDF" button
Output: auditorias_imca.pdf
Uses: html2pdf.js
```

### 4. AI Explanations
```javascript
Available: Only for "Não Conforme" results
Click: "🧠 Explicar com IA" button
Uses: OpenAI GPT-4
```

## 🎨 Result Colors

| Result | Color | CSS Class |
|--------|-------|-----------|
| Conforme | Green | `bg-green-100 text-green-800` |
| Não Conforme | Red | `bg-red-100 text-red-800` |
| Observação | Yellow | `bg-yellow-100 text-yellow-800` |

## 🗄️ Database Schema

### Table: auditorias_imca
```sql
-- New fields added:
navio TEXT
norma TEXT
item_auditado TEXT
resultado TEXT CHECK IN ('Conforme', 'Não Conforme', 'Observação')
comentarios TEXT
data DATE

-- Indexes:
idx_auditorias_imca_navio
idx_auditorias_imca_norma
idx_auditorias_imca_resultado
idx_auditorias_imca_data
```

### Migration File
```
supabase/migrations/20251016214900_add_auditorias_imca_fields.sql
```

## 📦 Dependencies

### New
```json
{
  "file-saver": "^latest",
  "@types/file-saver": "^latest"
}
```

### Used
```json
{
  "html2pdf.js": "existing",
  "date-fns": "existing",
  "openai": "existing"
}
```

## 🧪 Testing

### Run Tests
```bash
npm run test -- src/tests/components/auditorias/ListaAuditoriasIMCA.test.tsx
```

### Test Coverage
- ✅ Component rendering
- ✅ Filter input
- ✅ Export buttons
- ✅ Empty state
- ✅ API fetching
- ✅ Data display

## 🔒 Security

### RLS Policies
```sql
-- Users see their own auditorias
WHERE auth.uid() = user_id

-- Admins see all
WHERE role = 'admin'
```

## 🛠️ Development

### Component Location
```
src/components/auditorias/ListaAuditoriasIMCA.tsx
```

### Page Location
```
src/pages/admin/auditorias-lista.tsx
```

### API Location
```
pages/api/auditorias/list.ts
pages/api/auditorias/explain.ts
```

### Test Location
```
src/tests/components/auditorias/ListaAuditoriasIMCA.test.tsx
```

## 🔧 Configuration

### Environment Variables
```env
OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## 📝 Example Usage

### Creating Sample Data
```sql
INSERT INTO auditorias_imca (
  user_id, title, navio, norma, item_auditado, 
  resultado, comentarios, data
) VALUES (
  auth.uid(),
  'Auditoria de Teste',
  'Navio Exemplo',
  'IMCA M 179',
  'Sistema de posicionamento dinâmico',
  'Não Conforme',
  'Sistema apresentou falha durante teste',
  '2024-10-16'
);
```

### Fetching Data
```typescript
// In component
useEffect(() => {
  fetch("/api/auditorias/list")
    .then(res => res.json())
    .then(data => setAuditorias(data));
}, []);
```

### AI Explanation Request
```typescript
const response = await fetch("/api/auditorias/explain", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    navio: "Navio Exemplo",
    item: "Sistema de posicionamento",
    norma: "IMCA M 179"
  })
});
const { resultado } = await response.json();
```

## 🚦 Status
✅ Implementation Complete
✅ Tests Passing (6/6)
✅ Build Passing
✅ Lint Passing

## 📚 References
- IMCA Standards: https://www.imca-int.com/
- Component: `/admin/auditorias-lista`
- Documentation: `AUDITORIAS_LISTA_IMPLEMENTATION.md`
