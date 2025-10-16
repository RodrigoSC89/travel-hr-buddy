# SGSO Metrics Panel - Quick Reference

## 🚀 Quick Access
- **URL**: `/admin/sgso`
- **Tab**: Métricas Operacionais

## 📊 What's Available

### Summary Cards (Top Row)
1. **Total Auditorias** - All audits in system
2. **Falhas Críticas** - Total critical failures
3. **Score Médio** - Average audit score
4. **Embarcações** - Total vessels tracked

### Charts
1. **Pie Chart** - Risk distribution (Crítico, Alto, Médio, Baixo, Negligenciável)
2. **Line Chart** - 12-month evolution (Audits vs Critical Failures)

### Tables
1. **Métricas por Risco** - Grouped by risk level
2. **Métricas por Embarcação** - Grouped by vessel

## 🎯 Common Tasks

### View All Metrics
1. Go to `/admin/sgso`
2. Click "Métricas Operacionais" tab
3. All data displays automatically

### Filter by Vessel
1. Click vessel dropdown (top left)
2. Select vessel name
3. Tables update automatically

### Export to CSV
1. Click "Exportar CSV" button (top right)
2. File downloads: `metricas-sgso-YYYY-MM-DD.csv`
3. Contains: Vessel, Audits, Failures, Score, Last Audit

## 🔌 API Endpoints

### Get Risk Metrics
```bash
GET /api/admin/metrics
```
Response:
```json
[
  {
    "risco_nivel": "Crítico",
    "total_auditorias": 5,
    "falhas_criticas": 15,
    "score_medio": 45.5
  }
]
```

### Get Monthly Evolution
```bash
GET /api/admin/metrics/evolucao-mensal
```
Response:
```json
[
  {
    "mes": "2024-10",
    "total_auditorias": 12,
    "falhas_criticas": 5
  }
]
```

### Get Vessel Metrics
```bash
GET /api/admin/metrics/por-embarcacao?nome_navio=Vessel%20A
# Or all vessels (omit query param):
GET /api/admin/metrics/por-embarcacao
```
Response:
```json
[
  {
    "nome_navio": "Vessel A",
    "total_auditorias": 20,
    "falhas_criticas": 5,
    "score_medio": 75.5,
    "ultima_auditoria": "2024-10-15T10:00:00Z"
  }
]
```

## 🎨 Risk Color Codes

| Risk Level | Color | Hex |
|------------|-------|-----|
| Crítico | 🔴 Red | #ef4444 |
| Alto | 🟠 Orange | #f97316 |
| Médio | 🟡 Yellow | #eab308 |
| Baixo | 🟢 Green | #22c55e |
| Negligenciável | 🔵 Cyan | #06b6d4 |
| Não Classificado | ⚪ Gray | #6b7280 |

## 📦 Database Functions

### auditoria_metricas_risco()
```sql
-- Get all risk-based metrics
SELECT * FROM auditoria_metricas_risco();
```

### auditoria_evolucao_mensal()
```sql
-- Get 12-month evolution
SELECT * FROM auditoria_evolucao_mensal();
```

### auditoria_metricas_por_embarcacao()
```sql
-- All vessels
SELECT * FROM auditoria_metricas_por_embarcacao(NULL);

-- Specific vessel
SELECT * FROM auditoria_metricas_por_embarcacao('Vessel A');
```

## 🧪 Testing

Run all tests:
```bash
npm run test
```

Run specific test:
```bash
npm run test -- src/tests/metrics-api.test.ts
```

## 🔐 Security

- ✅ RLS enabled on auditorias_imca
- ✅ Admin policies configured
- ✅ Service Role Key required for APIs
- ✅ Authenticated users only

## 📱 Responsive Design

- Desktop: Full layout with side-by-side charts
- Tablet: Stacked charts
- Mobile: Single column, scrollable tables

## 🚧 Planned Features

1. 📄 PDF Export - jsPDF integration
2. 📧 Email Reports - Automated monthly sends
3. 📊 BI Integration - Power BI/Tableau
4. 📅 Date Filtering - Custom date ranges

## 🐛 Troubleshooting

### No data showing
- Check database has auditorias_imca records
- Verify migration ran successfully
- Check browser console for API errors

### CSV export not working
- Verify data is loaded in tables
- Check browser allows downloads
- Try different browser

### Charts not rendering
- Clear browser cache
- Check Chart.js is loaded
- Verify data format matches expected structure

## 📞 Support

- GitHub: RodrigoSC89/travel-hr-buddy
- PR: #814
- Branch: copilot/integrate-metrics-panel-sgso
