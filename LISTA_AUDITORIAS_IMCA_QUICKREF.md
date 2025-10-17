# Lista Auditorias IMCA - Quick Reference

## 🚀 Quick Access

**URL**: `/admin/auditorias-imca`

**Component**: `src/components/auditorias/ListaAuditoriasIMCA.tsx`

## 📋 Key Features

### 1. View All Audits
- Displays all technical IMCA audits
- Shows ship name, date, norm, item, result, and comments
- Color-coded badges for results

### 2. Filter Audits
Use the search bar to filter by:
- Ship/vessel name
- IMCA norm
- Audited item
- Result status

### 3. Export Data
- **CSV**: Click "Exportar CSV" button
- **PDF**: Click "Exportar PDF" button

### 4. AI Analysis (Non-Compliant Only)
For audits marked "Não Conforme":
1. Click "🧠 Análise IA e Plano de Ação" button
2. Wait for AI to generate:
   - Technical explanation
   - Corrective action plan

## 🗄️ Database Schema

Table: `auditorias_imca`

Key fields added:
- `navio`: Ship name
- `norma`: IMCA standard
- `item_auditado`: Audited item
- `comentarios`: Comments
- `resultado`: Result status
- `data`: Audit date

## 🔌 API Endpoints

### List Audits
```
GET /functions/v1/auditorias-lista
```

### AI Explanation
```
POST /functions/v1/auditorias-explain
Body: { navio, item, norma }
```

### Action Plan
```
POST /functions/v1/auditorias-plano
Body: { navio, item, norma }
```

## 🎨 Result Status Colors

| Status | Color | Badge |
|--------|-------|-------|
| Conforme | Green | ✅ |
| Não Conforme | Red | ❌ |
| Parcialmente Conforme | Yellow | ⚠️ |
| Não Aplicável | Gray | ➖ |

## 💡 Usage Tips

1. **Fast Filtering**: Type in search bar for instant results
2. **AI Insights**: Only available for "Não Conforme" audits
3. **Export Before Filter**: Export reflects current filtered view
4. **Cron Status**: Check bottom status bar for audit job health
5. **Fleet Overview**: See all audited vessels in the info bar

## 🔧 Configuration

Required environment variables:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_OPENAI_API_KEY
```

## 📱 Responsive Design

- ✅ Desktop: Full layout with side-by-side elements
- ✅ Tablet: Responsive cards and buttons
- ✅ Mobile: Single column, touch-friendly

## 🧪 Testing

Run tests:
```bash
npm test
```

Build:
```bash
npm run build
```

Lint:
```bash
npm run lint
```

## 🔗 Related Pages

- `/admin` - Admin Dashboard
- `/admin/sgso` - SGSO Management
- `/admin/metricas-risco` - Risk Metrics
- `/admin/dashboard-auditorias` - Audit Dashboard

## 📞 Support

For issues or questions:
1. Check the full documentation: `LISTA_AUDITORIAS_IMCA_IMPLEMENTATION.md`
2. Review IMCA guidelines
3. Check Supabase function logs for API issues

---

**Last Updated**: October 16, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
