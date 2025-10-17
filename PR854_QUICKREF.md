# PR #854 - Lista Auditorias IMCA - Quick Reference

## 🚀 Quick Start

### Access the Feature
```
URL: /admin/auditorias-imca
```

### API Endpoints
```
GET  {SUPABASE_URL}/functions/v1/auditorias-lista
POST {SUPABASE_URL}/functions/v1/auditorias-explain
POST {SUPABASE_URL}/functions/v1/auditorias-plano
```

## 📁 File Structure

```
src/
├── components/auditorias/
│   └── ListaAuditoriasIMCA.tsx          # Main component (250 lines)
├── pages/admin/
│   └── auditorias-imca.tsx              # Page wrapper (24 lines)
└── App.tsx                               # Route config (line 98, 239)

supabase/
├── migrations/
│   ├── 20251016154800_create_auditorias_imca_rls.sql
│   └── 20251016223000_add_audit_fields_to_auditorias_imca.sql
└── functions/
    ├── auditorias-lista/index.ts        # Fetch audits (95 lines)
    ├── auditorias-explain/index.ts      # AI explanation (101 lines)
    └── auditorias-plano/index.ts        # Action plan (104 lines)
```

## 🗄️ Database Schema

### Table: `auditorias_imca`
```sql
-- Core fields (from first migration)
id              UUID PRIMARY KEY
user_id         UUID (FK to auth.users)
title           TEXT
description     TEXT
status          TEXT ('draft', 'in_progress', 'completed', 'approved')
audit_date      DATE
score           NUMERIC (0-100)
findings        JSONB
recommendations TEXT[]
metadata        JSONB
created_at      TIMESTAMP
updated_at      TIMESTAMP

-- Technical fields (from second migration)
navio           TEXT        -- Ship name
norma           TEXT        -- IMCA standard (e.g., IMCA M 103)
item_auditado   TEXT        -- Audited item
comentarios     TEXT        -- Comments
resultado       TEXT        -- 'Conforme', 'Não Conforme', 'Parcialmente Conforme', 'Não Aplicável'
data            DATE        -- Audit date
```

### Indexes
- `idx_auditorias_imca_user_id`
- `idx_auditorias_imca_created_at`
- `idx_auditorias_imca_audit_date`
- `idx_auditorias_imca_status`
- `idx_auditorias_imca_navio`
- `idx_auditorias_imca_resultado`
- `idx_auditorias_imca_data`

## 🎨 UI Components

### Status Badges
```tsx
"Conforme"              → 🟢 Green
"Não Conforme"          → 🔴 Red
"Parcialmente Conforme" → 🟡 Yellow
"Não Aplicável"         → ⚫ Gray
```

### Features
- ✅ Real-time filtering (navio, norma, item, resultado)
- ✅ CSV export
- ✅ PDF export (html2canvas + jsPDF)
- ✅ Fleet overview
- ✅ Cron status
- ✅ AI analysis (GPT-4)
- ✅ Action plans

## 🔧 Component Props

### ListaAuditoriasIMCA
```tsx
// No props - fully self-contained
<ListaAuditoriasIMCA />
```

### State Management
```tsx
const [auditorias, setAuditorias] = useState<Auditoria[]>([])
const [frota, setFrota] = useState<string[]>([])
const [cronStatus, setCronStatus] = useState<string>("Carregando...")
const [filtro, setFiltro] = useState("")
const [loadingIA, setLoadingIA] = useState<string | null>(null)
const [explicacao, setExplicacao] = useState<Record<string, string>>({})
const [plano, setPlano] = useState<Record<string, string>>({})
```

## 📡 API Requests

### Fetch Audits
```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/auditorias-lista`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
  }
);
```

### AI Explanation
```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/auditorias-explain`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ navio, item, norma }),
  }
);
```

### Action Plan
```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/auditorias-plano`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ navio, item, norma }),
  }
);
```

## 🔒 Security (RLS Policies)

### User Policies
```sql
-- Users see only their audits
FOR SELECT USING (auth.uid() = user_id)

-- Users can insert their audits
FOR INSERT WITH CHECK (auth.uid() = user_id)

-- Users can update their audits
FOR UPDATE USING (auth.uid() = user_id)

-- Users can delete their audits
FOR DELETE USING (auth.uid() = user_id)
```

### Admin Policies
```sql
-- Admins see all audits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)

-- Admins can update all
FOR UPDATE USING (profile.role = 'admin')

-- Admins can delete all
FOR DELETE USING (profile.role = 'admin')

-- Admins can insert for any user
FOR INSERT WITH CHECK (profile.role = 'admin')
```

## 🧪 Testing Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚢 Deployment

### 1. Deploy Edge Functions
```bash
supabase functions deploy auditorias-lista
supabase functions deploy auditorias-explain
supabase functions deploy auditorias-plano
```

### 2. Run Migrations
```bash
supabase migration up
```

### 3. Set Environment Variables
```bash
# In Supabase Dashboard → Settings → Edge Functions
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 4. Deploy Frontend
```bash
npm run build
npm run deploy:vercel
# or
npm run deploy:netlify
```

## 📊 Data Flow

```mermaid
User → Component → auditorias-lista → Database
                                    ↓
                              Render Audits
                                    ↓
User Clicks AI ━━━━━━━━━━━━━┳━━━━━ auditorias-explain → GPT-4
                            ┃
                            ┗━━━━━ auditorias-plano → GPT-4
                                    ↓
                              Display Results
```

## 🎯 Key Features by Priority

### Must Have ✅
1. Audit list display with filtering
2. CSV/PDF export
3. Fleet overview
4. Authentication/RLS

### Should Have ✅
5. AI explanation for non-compliant items
6. Action plan generation
7. Cron status monitoring

### Nice to Have (Future)
8. Pagination
9. Charts and analytics
10. Email notifications

## 📝 Common Tasks

### Add New Audit (Manual - via SQL)
```sql
INSERT INTO auditorias_imca (
  user_id, navio, norma, item_auditado, 
  resultado, comentarios, data
) VALUES (
  auth.uid(),
  'MV Seaquest',
  'IMCA M 103',
  'Sistema DP',
  'Não Conforme',
  'Redundância inadequada',
  CURRENT_DATE
);
```

### Filter Audits (Component)
```tsx
// Automatic - just type in the search box
// Filters: navio, norma, item_auditado, resultado
```

### Export to CSV
```tsx
// Click "Exportar CSV" button
// Downloads: auditorias-imca-YYYY-MM-DD.csv
```

### Export to PDF
```tsx
// Click "Exportar PDF" button
// Downloads: auditorias-imca-YYYY-MM-DD.pdf
```

### Generate AI Analysis
```tsx
// Only visible for "Não Conforme" results
// Click "🧠 Análise IA e Plano de Ação"
// Generates both explanation and action plan
```

## 🐛 Troubleshooting

### Issue: Audits not loading
- ✅ Check Supabase URL and Anon Key in `.env`
- ✅ Verify user is authenticated
- ✅ Check RLS policies are enabled
- ✅ Verify `auditorias-lista` function is deployed

### Issue: AI features not working
- ✅ Check `OPENAI_API_KEY` is set in Supabase secrets
- ✅ Verify OpenAI API quota/billing
- ✅ Check function logs in Supabase dashboard
- ✅ Ensure `auditorias-explain` and `auditorias-plano` are deployed

### Issue: PDF export fails
- ✅ Check browser console for errors
- ✅ Verify `html2canvas` and `jspdf` are installed
- ✅ Ensure element `pdfRef` is properly rendered
- ✅ Try reducing data volume (filter first)

### Issue: CSV export encoding issues
- ✅ UTF-8 BOM is included by default
- ✅ Open with compatible editor (VS Code, Excel with UTF-8)
- ✅ Check blob type is `text/csv;charset=utf-8`

## 📖 References

- IMCA Guidelines: https://www.imca-int.com/
- Supabase Docs: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
- shadcn/ui: https://ui.shadcn.com/
- React Router: https://reactrouter.com/

## 🔗 Related PRs/Issues

- PR #854: Current implementation (this PR)
- PR #842: Previous draft (had conflicts)
- Issue #833: Original feature request
- PR #849: Lista Auditorias component base

---

**Last Updated**: October 17, 2025  
**Status**: ✅ Production Ready  
**Maintainer**: Copilot AI / RodrigoSC89  
