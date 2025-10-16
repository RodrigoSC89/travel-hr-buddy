# Painel SGSO - Quick Reference

## 🚀 Quick Start

**Navigate to:** SGSO Page → "Painel SGSO" Tab

## 📁 File Locations

```
pages/api/admin/sgso.ts                      # API endpoint
src/components/sgso/PainelSGSO.tsx           # Main component
src/tests/components/sgso/PainelSGSO.test.tsx # Tests
```

## 🔌 API Endpoint

**URL:** `GET /api/admin/sgso`

**Response:**
```json
[{
  "embarcacao": "PSV Atlântico",
  "risco": "baixo" | "moderado" | "alto",
  "total": 2,
  "por_mes": { "Jan": 0, "Fev": 0, ... }
}]
```

## 🎨 Risk Color Codes

| Risk Level | Color | CSS Class |
|------------|-------|-----------|
| `baixo` (low) | 🟢 Green | `bg-green-100 text-green-800` |
| `moderado` (moderate) | 🟡 Yellow | `bg-yellow-100 text-yellow-800` |
| `alto` (high) | 🔴 Red | `bg-red-100 text-red-800` |

## 📊 Component Structure

```typescript
export function PainelSGSO() {
  const [dados, setDados] = useState<VesselData[]>([])
  
  // Fetch data on mount
  useEffect(() => {
    fetch("/api/admin/sgso").then(...)
  }, [])
  
  // Export to CSV
  const exportarCSV = () => {
    const csv = generateCSV(dados)
    saveAs(blob, "relatorio_sgso.csv")
  }
  
  return (
    <div>
      {/* Header with export button */}
      {/* Risk cards grid */}
      {/* Monthly comparison chart */}
    </div>
  )
}
```

## 💾 CSV Export Format

```csv
Embarcação,Risco,Total de Falhas
PSV Atlântico,baixo,2
OSV Pacífico,moderado,8
...
```

**Filename:** `relatorio_sgso.csv`

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test
npm run test -- src/tests/components/sgso/PainelSGSO.test.tsx
```

**Test Coverage:**
- ✅ Component rendering
- ✅ Data fetching
- ✅ Risk display
- ✅ CSV export
- ✅ Chart rendering

## 📦 Dependencies

```json
{
  "file-saver": "^2.0.5",
  "@types/file-saver": "^2.0.7"
}
```

**Usage:**
```typescript
import { saveAs } from "file-saver"
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Result: SGSO chunk ~123.86 kB (gzipped: 26.91 kB)
```

## 🎯 Key Features

1. **Risk Cards**: Display vessel risk levels with visual indicators
2. **CSV Export**: One-click download of operational risk report
3. **Monthly Chart**: Interactive bar chart showing failure trends
4. **Responsive**: Mobile-first design (1 col → 3 cols)
5. **Integration**: Seamlessly integrated into SGSO dashboard

## 🔍 Debugging

**Check API response:**
```bash
curl http://localhost:8080/api/admin/sgso
```

**View component state:**
- React DevTools → Components → PainelSGSO → hooks

**Common issues:**
- ⚠️ No data displayed? Check API endpoint is accessible
- ⚠️ CSV not downloading? Check file-saver is installed
- ⚠️ Chart not rendering? Verify recharts is imported

## 📱 Responsive Breakpoints

| Screen Size | Grid Columns | Behavior |
|------------|--------------|----------|
| < 768px (mobile) | 1 column | Cards stack vertically |
| ≥ 768px (tablet) | 3 columns | Cards in grid |
| ≥ 1024px (desktop) | 3 columns | Optimal spacing |

## 🚦 Status

- ✅ Implementation: COMPLETE
- ✅ Tests: PASSING (7/7)
- ✅ Build: SUCCESSFUL
- ✅ Documentation: COMPLETE

## 📞 Support

**Files to reference:**
- `PAINEL_SGSO_IMPLEMENTATION.md` - Full technical documentation
- `PAINEL_SGSO_VISUAL_GUIDE.md` - Visual design guide
- Test file - Usage examples

## 🔮 Future Enhancements

As noted in problem statement:
> 📧 A exportação programada por email mensal será o próximo passo via cron function

**Planned:**
- Scheduled monthly email reports
- Cron job for automated report generation
- Email delivery integration
