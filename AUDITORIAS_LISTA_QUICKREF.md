# IMCA Auditorias Lista - Quick Reference

## Quick Start

### Access the UI
```
URL: /admin/auditorias-lista
```

### Features at a Glance
- 📋 View all IMCA auditorias
- 🔍 Real-time filtering
- 📊 Export to CSV/PDF
- 🧠 AI-powered explanations and action plans

## API Endpoints

### 1. List All Auditorias
```http
GET /api/auditorias/list
```

**Response:**
```json
{
  "auditorias": Array<Auditoria>,
  "frota": string[],
  "cronStatus": string
}
```

### 2. Get AI Explanation
```http
POST /api/auditorias/explain
Content-Type: application/json

{
  "navio": "Vessel Name",
  "item": "Audited Item",
  "norma": "IMCA M 179"
}
```

**Response:**
```json
{
  "resultado": "AI-generated technical explanation..."
}
```

### 3. Get Action Plan
```http
POST /api/auditorias/plano
Content-Type: application/json

{
  "navio": "Vessel Name",
  "item": "Audited Item",
  "norma": "IMCA M 179"
}
```

**Response:**
```json
{
  "plano": "AI-generated action plan..."
}
```

## Component Usage

```tsx
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditoriasPage() {
  return <ListaAuditoriasIMCA />;
}
```

## Status Badge Colors

| Status | Color | Description |
|--------|-------|-------------|
| Conforme | 🟢 Green | Item meets requirements |
| Não Conforme | 🔴 Red | Item does not meet requirements |
| Parcialmente Conforme | 🟡 Yellow | Item partially meets requirements |
| Não Aplicável | ⚪ Gray | Item not applicable |

## Testing

### Run Component Tests
```bash
npm test src/tests/components/auditorias/ListaAuditoriasIMCA.test.tsx
```

### Run API Tests
```bash
npm test src/tests/auditorias-api.test.ts
```

### Run All Tests
```bash
npm test
```

## Environment Variables

Required:
```env
OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## File Structure

```
pages/api/auditorias/
├── list.ts           # GET - List all auditorias
├── explain.ts        # POST - AI explanation
└── plano.ts          # POST - AI action plan

src/
├── components/auditorias/
│   └── ListaAuditoriasIMCA.tsx   # Main component
├── pages/admin/
│   └── auditorias-lista.tsx       # Page route
└── tests/
    ├── auditorias-api.test.ts                           # API tests (35)
    └── components/auditorias/ListaAuditoriasIMCA.test.tsx  # Component tests (11)
```

## Common Tasks

### Add New Auditoria (via database)
```sql
INSERT INTO auditorias_imca (navio, norma, item_auditado, comentarios, resultado, data)
VALUES ('Vessel Name', 'IMCA M 179', 'Safety Equipment', 'Comments', 'Conforme', CURRENT_DATE);
```

### Filter Auditorias (UI)
1. Click on the filter input
2. Type vessel name, norm, item, or result
3. Results update in real-time

### Export Data
- **CSV**: Click "Exportar CSV" button
- **PDF**: Click "Exportar PDF" button

### Get AI Analysis
1. Find a "Não Conforme" item
2. Click "🧠 Análise IA e Plano de Ação" button
3. Wait for AI to generate explanation and action plan
4. Review the analysis displayed below the button

## Troubleshooting

### "Erro ao carregar auditorias"
- Check Supabase connection
- Verify database permissions
- Check RLS policies

### "Serviço de IA temporariamente indisponível"
- Verify OPENAI_API_KEY is set
- Check API key validity
- Check OpenAI API status

### Tests failing
```bash
# Clean and reinstall dependencies
rm -rf node_modules
npm install

# Run tests again
npm test
```

## Performance Tips

1. **Filtering**: Use specific search terms for faster results
2. **Export**: Export filtered data instead of entire dataset
3. **AI Features**: Use AI analysis sparingly to minimize API costs
4. **Pagination**: Consider adding if dealing with >1000 auditorias

## Security Notes

- All endpoints respect Row Level Security (RLS)
- OpenAI API key is server-side only
- No sensitive data exposed to client
- CORS properly configured

## Support

For issues or questions:
1. Check implementation docs: `AUDITORIAS_LISTA_IMPLEMENTATION.md`
2. Review test files for examples
3. Check API endpoint documentation

## Version

- **Implementation Date**: October 2025
- **Version**: 1.0
- **Tests**: 46 passing
- **Status**: Production Ready ✅
