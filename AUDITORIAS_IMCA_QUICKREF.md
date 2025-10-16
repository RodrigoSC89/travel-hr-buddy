# 🚀 Auditorias IMCA List - Quick Reference

## Access the Feature
**URL:** `/admin/lista-auditorias-imca`

## Quick Actions

### View Audits
Just navigate to the page - audits load automatically

### Filter
Type in the search box:
- By vessel: "Navio A"
- By norm: "IMCA"
- By item: "Safety"
- By result: "Não Conforme"

### Export CSV
1. Click "Exportar CSV"
2. File downloads as `auditorias_imca.csv`

### Export PDF
1. Click "Exportar PDF"
2. File downloads as `auditorias_imca.pdf`

### Get AI Analysis (Non-Conforming Items)
1. Find a "Não Conforme" (red badge) audit
2. Click "🧠 Análise IA e Plano de Ação"
3. Wait ~5 seconds for AI to generate
4. Read explanation and action plan

## Color Codes
- 🟢 **Green** = Conforme (Passed)
- 🔴 **Red** = Não Conforme (Failed - AI analysis available)
- ⚫ **Gray** = Não Aplicável (Not applicable)

## Files Created
```
src/components/auditorias/ListaAuditoriasIMCA.tsx
src/pages/admin/lista-auditorias-imca.tsx
supabase/functions/auditorias-explain/index.ts
supabase/functions/auditorias-plano/index.ts
supabase/migrations/20251016215000_add_auditorias_imca_technical_fields.sql
src/tests/lista-auditorias-imca.test.ts
```

## Database Fields Added
- `navio` - Vessel name
- `norma` - Standard (e.g., IMCA M103)
- `item_auditado` - Audited item
- `resultado` - Result (Conforme/Não Conforme/Não Aplicável)
- `comentarios` - Comments
- `data` - Audit date

## Dependencies Added
- `file-saver` - CSV downloads
- `@types/file-saver` - TypeScript types

## Test Coverage
✅ 74 tests, all passing

## Build Status
✅ Build successful
✅ No TypeScript errors
✅ No linting errors

## Environment Variables Needed
For AI features to work, ensure these are set in Supabase Edge Functions:
- `OPENAI_API_KEY` - Your OpenAI API key

## Support & Troubleshooting

### Issue: Audits not loading
**Check:**
1. Supabase connection configured
2. User has proper RLS permissions
3. Database table exists

### Issue: AI analysis not working
**Check:**
1. OPENAI_API_KEY set in Supabase
2. Edge functions deployed
3. Network connection to Supabase

### Issue: Export not working
**Check:**
1. Browser allows downloads
2. Check browser console for errors
3. Ensure data is loaded

## Next Steps
1. Deploy Supabase Edge Functions
2. Run database migration
3. Configure OPENAI_API_KEY
4. Test the UI
5. Create some sample audits
6. Try filtering, exporting, and AI analysis

## Documentation
- Full Implementation: `AUDITORIAS_IMCA_LIST_IMPLEMENTATION.md`
- Visual Guide: `AUDITORIAS_IMCA_VISUAL_GUIDE.md`
- This Quick Ref: `AUDITORIAS_IMCA_QUICKREF.md`
