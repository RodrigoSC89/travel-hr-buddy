# SGSO PDF Report - Quick Reference

## 🚀 Quick Start

### Access Report
```
SGSO Module → Module Actions → Relatório PDF
```
or navigate to: `/sgso/report`

### Generate PDF
1. Click "🧾 Exportar PDF"
2. PDF downloads automatically as `relatorio-sgso-{vessel}-{date}.pdf`

## 📊 Report Contents

### 1. Report Header
- 📄 Title: "Relatório SGSO"
- 🚢 Vessel Name
- 📅 Generation Date
- ⚖️ ANP Compliance Info

### 2. Statistical Summary
- 🔵 **Total** - All incidents
- 🔴 **Crítico** - Critical risk
- 🟠 **Alto** - High risk
- 🟡 **Médio** - Medium risk
- 🟢 **Baixo** - Low risk

### 3. Incidents List
Each incident shows:
- 📅 Date
- 📝 Description
- 🏷️ SGSO Category
- ⚠️ Risk Level (color-coded)
- 🧠 Root Cause
- 📋 Action Plan

### 4. Risk Trend Chart
- 📈 6-month visualization
- 4 risk level lines
- Monthly aggregation

### 5. Signature Section
- ✍️ Responsible for Emission
- ✅ Approved By

## 🔧 For Developers

### Component Usage
```typescript
import SGSOReportPage from "@/pages/SGSOReportPage";

// With defaults
<SGSOReportPage />

// With custom data
<SGSOReportPage 
  vesselName="FPSO Custom"
  incidents={myIncidents}
/>
```

### Incident Data Structure
```typescript
{
  date: "DD/MM/YYYY",
  description: "string",
  sgso_category: "string",
  sgso_risk_level: "Crítico" | "Alto" | "Médio" | "Baixo",
  sgso_root_cause: "string",
  action_plan: "string"
}
```

### Trend Chart with Custom Data
```typescript
import { SGSOTrendChart } from "@/components/sgso/SGSOTrendChart";

<SGSOTrendChart data={[
  { mes: "2025-10", risco: "baixo", total: 8 },
  { mes: "2025-10", risco: "moderado", total: 5 }
]} />
```

## 🧪 Testing

### Run Tests
```bash
npm test -- SGSOReportPage.test.tsx SGSOTrendChart.test.tsx
```

### Test Coverage
- ✅ 17 SGSOReportPage tests
- ✅ 12 SGSOTrendChart tests
- ✅ All passing

## 📁 Files

```
src/
├── pages/
│   ├── SGSOReportPage.tsx          # Main report component
│   └── SGSO.tsx                     # Updated with nav link
├── components/
│   └── sgso/
│       └── SGSOTrendChart.tsx       # Enhanced chart
├── tests/
│   ├── pages/
│   │   └── SGSOReportPage.test.tsx
│   └── components/
│       └── sgso/
│           └── SGSOTrendChart.test.tsx
└── App.tsx                          # Route added
```

## 🎨 Risk Level Colors

| Level | Portuguese | Color | Background |
|-------|-----------|-------|-----------|
| Critical | Crítico | `text-red-900` | `bg-red-100` |
| High | Alto | `text-orange-900` | `bg-orange-100` |
| Medium | Médio | `text-yellow-900` | `bg-yellow-100` |
| Low | Baixo | `text-green-900` | `bg-green-100` |

## 🔗 Navigation Flow

```
SGSO Page (/sgso)
    ↓
Module Actions Menu
    ↓
Click "Relatório PDF"
    ↓
Report Page (/sgso/report)
    ↓
Click "Exportar PDF"
    ↓
PDF Downloaded
```

## ⚙️ Configuration

### PDF Settings
```javascript
{
  margin: 0.5,
  filename: "relatorio-sgso-{vessel}-{date}.pdf",
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
}
```

## 🐛 Troubleshooting

### PDF not generating?
- Check browser console for errors
- Verify html2pdf.js is loaded
- Check network tab for toast notifications

### Chart not showing?
- Verify recharts is installed
- Check if data format is correct
- API fallback uses sample data

### Custom data not working?
- Verify data structure matches interface
- Check TypeScript types
- Ensure all required fields are present

## 📞 Support

For issues or questions:
1. Check implementation docs: `SGSO_PDF_REPORT_IMPLEMENTATION.md`
2. Review test files for usage examples
3. Verify dependencies are installed

## ✨ Features

- ✅ Professional PDF export
- ✅ Color-coded risk levels
- ✅ Trend visualization
- ✅ Sample data included
- ✅ Responsive design
- ✅ Toast notifications
- ✅ ANP compliant
- ✅ Audit-ready format

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: October 18, 2025
