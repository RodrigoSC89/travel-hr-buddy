# ⚡ SGSO Metrics Panel - Quick Reference

## 🚀 Quick Start

### Access the Dashboard
```
URL: /admin/sgso
Click: Métricas Operacionais tab
```

### Test APIs
```bash
# Main metrics by risk level
curl http://localhost:5173/api/admin/metrics

# Monthly evolution
curl http://localhost:5173/api/admin/metrics/evolucao-mensal

# Vessel metrics
curl http://localhost:5173/api/admin/metrics/por-embarcacao
```

## 📊 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| 🔍 Vessel Filter | ✅ | Dropdown to filter by specific vessel |
| 📈 Line Chart | ✅ | 12-month trend of critical failures |
| 📊 Pie Chart | ✅ | Risk level distribution |
| 📋 Tables | ✅ | Detailed metrics by risk and vessel |
| 💾 CSV Export | ✅ | Download metrics as CSV |
| 📄 PDF Export | 🔧 | Structure ready |
| 📧 Auto Email | 🔧 | Structure ready |

**Legend:** ✅ Implemented | 🔧 Prepared for future

## 🗄️ Database Structure

### New Fields in `auditorias_imca`
```sql
nome_navio TEXT          -- Vessel name
risco_nivel TEXT         -- Risk level (critico, alto, medio, baixo, negligivel)
falhas_criticas INTEGER  -- Critical failures count
```

### RPC Functions
```sql
auditoria_metricas_risco()           -- Metrics by risk level
auditoria_evolucao_mensal()          -- Monthly evolution
auditoria_metricas_por_embarcacao()  -- Metrics by vessel
```

## 🎨 Color Coding

| Risk Level | Color | Hex Code |
|------------|-------|----------|
| Crítico | 🔴 Red | #dc2626 |
| Alto | 🟠 Orange | #ea580c |
| Médio | 🟡 Yellow | #f59e0b |
| Baixo | 🟢 Green | #10b981 |
| Negligível | ⚪ Gray | #6b7280 |

## 📝 API Response Examples

### Metrics by Risk
```json
{
  "risco_nivel": "critico",
  "total_auditorias": 15,
  "total_falhas_criticas": 42,
  "embarcacoes": ["Navio A", "Navio B"],
  "media_score": 65.5
}
```

### Monthly Evolution
```json
{
  "mes": "10",
  "ano": 2024,
  "total_auditorias": 8,
  "total_falhas_criticas": 12,
  "media_score": 72.3
}
```

### Vessel Metrics
```json
{
  "nome_navio": "Navio Alpha",
  "total_auditorias": 5,
  "total_falhas_criticas": 8,
  "media_score": 68.2,
  "ultima_auditoria": "2024-10-15T10:30:00Z"
}
```

## 🔧 File Locations

```
project/
├── supabase/migrations/
│   └── 20251016194300_add_metrics_fields_and_rpc.sql
├── pages/api/admin/
│   ├── metrics.ts
│   └── metrics/
│       ├── evolucao-mensal.ts
│       └── por-embarcacao.ts
├── src/
│   ├── components/sgso/
│   │   └── MetricasPanel.tsx
│   ├── pages/admin/
│   │   └── sgso.tsx
│   └── tests/
│       └── metrics-api.test.ts
├── METRICAS_SGSO_IMPLEMENTACAO.md
└── METRICAS_SGSO_VISUAL_SUMMARY.md
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run metrics tests only
npm run test src/tests/metrics-api.test.ts

# Lint check
npm run lint
```

**Test Results:** 8/8 passing ✅

## 📦 Components Used

### UI Components
- Card, CardContent, CardHeader, CardTitle
- Badge
- Button
- Select, SelectContent, SelectItem, SelectTrigger
- Tabs, TabsContent, TabsList, TabsTrigger

### Charts (Recharts)
- LineChart, Line
- PieChart, Pie, Cell
- XAxis, YAxis
- CartesianGrid, Tooltip, Legend
- ResponsiveContainer

### Icons (Lucide)
- TrendingUp, AlertTriangle, Ship, Activity
- Download, RefreshCw, Shield, FileText

## 🔐 Security

- Row Level Security (RLS) enabled
- Admin policies configured
- Service Role Key for APIs
- Authenticated user policies

## 🚦 Status Checks

✅ Build passing  
✅ Lint passing  
✅ Tests passing (8/8)  
✅ TypeScript types correct  
✅ APIs functional  
✅ Components rendering  
✅ Documentation complete

## 📞 Support

**Documentation:**
- Technical Guide: `METRICAS_SGSO_IMPLEMENTACAO.md`
- Visual Summary: `METRICAS_SGSO_VISUAL_SUMMARY.md`
- Quick Ref: `METRICAS_SGSO_QUICKREF.md` (this file)

**Troubleshooting:**
- Check Supabase connection
- Verify environment variables
- Run migrations
- Clear cache if needed

## 🎯 Next Steps

### To Enable PDF Export
1. Import jsPDF and html2canvas
2. Implement PDF generation in MetricasPanel
3. Style PDF template
4. Test download functionality

### To Enable Email Reports
1. Set up cron job (Vercel or Supabase)
2. Create email template
3. Configure SMTP or email service
4. Set up recipient list
5. Schedule monthly execution

### To Integrate with BI
1. Document API endpoints
2. Provide authentication method
3. Set up CORS if needed
4. Create Power BI / Tableau connectors

---

**Version:** 1.0.0  
**Last Updated:** October 16, 2024  
**Status:** ✅ Production Ready
