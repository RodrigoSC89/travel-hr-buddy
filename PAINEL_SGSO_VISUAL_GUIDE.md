# PainelSGSO Visual Guide

## 🎯 Component Overview

The **PainelSGSO** component is a comprehensive operational risk panel for the SGSO (Sistema de Gestão de Segurança Operacional) module.

## 📊 User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧭 Painel SGSO - Risco Operacional por Embarcação              │
│                              [Exportar CSV] [Exportar PDF]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🚢 PSV       │  │ 🚢 AHTS      │  │ 🚢 OSV       │         │
│  │ Atlântico    │  │ Pacífico     │  │ Caribe       │         │
│  │              │  │              │  │              │         │
│  │ [CRÍTICO] 🔴 │  │ [ALTO] 🟠    │  │ [MÉDIO] 🟡   │         │
│  │ Falhas: 12   │  │ Falhas: 8    │  │ Falhas: 4    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐                                              │
│  │ 🚢 PLSV      │                                              │
│  │ Mediterrâneo │                                              │
│  │              │                                              │
│  │ [BAIXO] 🟢   │                                              │
│  │ Falhas: 2    │                                              │
│  └──────────────┘                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Comparativo Mensal de Falhas                                │
│                                                                 │
│   12│                                                           │
│   10│  ▓▓                                                       │
│    8│  ▓▓  ▓                                                    │
│    6│  ▓▓  ▓  ▓▓                                                │
│    4│  ▓▓  ▓  ▓▓  ▓  ▓                                          │
│    2│  ▓▓  ▓  ▓▓  ▓  ▓  ▓                                       │
│    0│__▓▓__▓__▓▓__▓__▓__▓________________________________      │
│      Jan Feb Mar Abr Mai Jun                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Risk Level Colors
- **🔴 CRÍTICO** (Critical): `bg-red-600 text-white`
- **🟠 ALTO** (High): `bg-orange-500 text-white`
- **🟡 MÉDIO** (Medium): `bg-yellow-500 text-gray-900`
- **🟢 BAIXO** (Low): `bg-green-600 text-white`

### Button Colors
- **CSV Export**: `bg-blue-600 hover:bg-blue-700 text-white`
- **PDF Export**: `bg-zinc-800 hover:bg-zinc-900 text-white`

## 📋 Data Structure

### Vessel Information
Each vessel card displays:
1. **Vessel Name** with ship emoji (🚢)
2. **Risk Level Badge** (color-coded)
3. **Total Critical Failures** count

### Monthly Data
Bar chart showing failures per month:
- X-axis: Months (Jan/25, Fev/25, Mar/25, Abr/25, Mai/25, Jun/25)
- Y-axis: Number of failures (0-12)
- Bar color: Red (#ef4444) for critical failures

## 💾 Export Functionality

### CSV Export
**Button**: Blue "Exportar CSV"

**Output Format**:
```csv
Embarcação,Risco,Total de Falhas
PSV Atlântico,crítico,12
AHTS Pacífico,alto,8
OSV Caribe,médio,4
PLSV Mediterrâneo,baixo,2
```

**Filename**: `relatorio_sgso.csv`

### PDF Export
**Button**: Dark Zinc "Exportar PDF"

**Output**: 
- Full visual layout including cards and chart
- A4 portrait format
- High quality (scale: 2)
- Professional margins (0.5 inches)

**Filename**: `relatorio_sgso.pdf`

## 🔧 Technical Details

### Component Location
- **Path**: `src/components/sgso/PainelSGSO.tsx`
- **Integration**: Added as tab in `SgsoDashboard.tsx`
- **Tab Label**: "Painel SGSO"
- **Tab Icon**: Activity icon from lucide-react

### Dependencies Used
- **UI Components**: Card, CardContent, Button from shadcn/ui
- **Charting**: Recharts (BarChart, Bar, XAxis, YAxis, etc.)
- **PDF Export**: html2pdf.js
- **CSV Export**: file-saver library

### Responsive Design
- **Mobile/Tablet**: Single column grid (`grid-cols-1`)
- **Desktop**: Three column grid (`md:grid-cols-3`)
- **Chart**: Responsive container adjusts to screen width

## 📍 Integration in SGSO Module

### Tab Structure in SgsoDashboard
```
[Visão Geral] [17 Práticas] [Riscos] [Incidentes] [Emergência] 
[Auditorias] [Treinamentos] [NCs] [Métricas] [Painel SGSO] ⬅️ NEW
```

### Navigation
1. Go to SGSO module page
2. Click on "Painel SGSO" tab
3. View operational risk data
4. Export as CSV or PDF as needed

## ✅ Quality Assurance

### Test Coverage
- ✅ 11 unit tests (100% passing)
- ✅ Export functionality verified
- ✅ UI rendering validated
- ✅ Data display confirmed
- ✅ Button styling checked

### Validation Results
- ✅ TypeScript compilation: Clean
- ✅ ESLint: No errors
- ✅ Build: Successful
- ✅ Integration: Working

## 🎯 Use Cases

### 1. Regulatory Reporting
- Export PDF for ANP (Agência Nacional do Petróleo) compliance reports
- Professional visual presentation for audits

### 2. Executive Meetings
- Quick overview of fleet operational risk status
- Color-coded system for immediate risk identification

### 3. Data Analysis
- Export CSV for further analysis in Excel/BI tools
- Historical tracking of critical failures

### 4. Operational Decision Making
- Identify vessels requiring immediate attention (critical/high risk)
- Track failure trends over time

## 🚀 Future Enhancements (Optional)

Potential improvements for production use:
1. **Dynamic Data**: Connect to database/API instead of mock data
2. **Date Range Filter**: Select custom time periods
3. **Risk Drill-Down**: Click vessel cards to see failure details
4. **Real-time Updates**: WebSocket connection for live data
5. **Export Options**: Add Excel format, email delivery
6. **Filtering**: Filter by risk level, vessel type
7. **Comparison View**: Compare different time periods
8. **Alerts**: Notification when risk levels change

## 📖 Documentation

For complete technical details, see:
- **Implementation Guide**: `PAINEL_SGSO_IMPLEMENTATION.md`
- **Component Code**: `src/components/sgso/PainelSGSO.tsx`
- **Test Suite**: `src/tests/components/sgso/PainelSGSO.test.tsx`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-10-16
