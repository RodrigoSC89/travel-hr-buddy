# BI Export PDF Component - Quick Reference

## 📁 Component Location
- **Main Component**: `src/components/bi/ExportPDF.tsx`
- **Index Export**: `src/components/bi/index.ts`
- **Tests**: `src/tests/bi-export-pdf.test.tsx`
- **Example Page**: `src/pages/BIExportExample.tsx`

## 🚀 Usage

### Basic Import
```typescript
import { ExportBIReport } from "@/components/bi";
```

### Component Props
```typescript
interface TrendData {
  month: string;
  total_jobs: number;
}

interface ExportBIReportProps {
  trend: TrendData[];
  forecast: string;
}
```

### Example Usage
```typescript
const trendData = [
  { month: "Abril", total_jobs: 15 },
  { month: "Maio", total_jobs: 18 },
  { month: "Junho", total_jobs: 22 },
];

const aiForecast = `
📈 Análise de Tendências:
• Crescimento médio de 15% nos últimos 6 meses

🔮 Previsão:
• Expectativa de 30-32 jobs finalizados
`;

<ExportBIReport trend={trendData} forecast={aiForecast} />
```

## 📋 Features

✅ **PDF Export**: One-click export to PDF using html2pdf.js  
✅ **Trend Data**: Displays last 6 months of job completion data  
✅ **AI Forecast**: Shows AI predictions and recommendations  
✅ **Auto-naming**: PDF files named with current date (e.g., `Relatorio-BI-10/15/2025.pdf`)  
✅ **Styled Output**: Professional formatting with emojis and proper spacing  

## 🎨 PDF Content Structure

The generated PDF includes:
1. **Header**: "📊 Relatório BI de Manutenção"
2. **Date**: Current date
3. **Trend Section**: List of monthly job completions
4. **Forecast Section**: AI predictions and recommendations

## 🧪 Testing

Run the component tests:
```bash
npm run test -- src/tests/bi-export-pdf.test.tsx
```

Test coverage:
- ✅ Renders export button
- ✅ Button has correct icon/text
- ✅ Calls html2pdf on click
- ✅ Handles empty trend data
- ✅ Handles empty forecast

## 📦 Dependencies

- `html2pdf.js` (already installed in package.json)
- `@/components/ui/button` (existing UI component)

## 🔧 Implementation Details

- **TypeScript**: Fully typed with TrendData interface
- **Code Style**: Double quotes, ESLint compliant
- **Build**: Successfully builds with no errors
- **Tests**: All 740 project tests pass (including 5 new tests)
