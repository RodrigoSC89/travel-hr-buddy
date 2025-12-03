# Bundle Optimization Guide

## Implemented Optimizations

### 1. Lazy Loading for Heavy Libraries

| Library | Size | Location | Status |
|---------|------|----------|--------|
| mapbox-gl | ~350KB | `loadMapboxGL()` | ✅ Implemented |
| jsPDF + autoTable | ~300KB | `usePDFExport()` | ✅ Implemented |
| xlsx | ~400KB | `useXLSXExport()` | ✅ Implemented |
| tesseract.js | ~500KB | `useOCR()` | ✅ Implemented |
| three.js | ~500KB | `loadThree()` | ✅ Ready |
| firebase | ~300KB | `loadFirebase()` | ✅ Ready |
| tensorflow | ~800KB | `loadTensorFlow()` | ✅ Ready |
| onnxruntime-web | ~400KB | `loadONNX()` | ✅ Ready |

**Total Potential Savings: ~3.5MB in initial bundle**

### 2. Files Already Migrated

#### Maps (lazy mapbox-gl):
- ✅ `src/components/fleet/vessel-tracking-map.tsx`
- ✅ `src/components/logistics/DeliveryMap.tsx`
- ✅ `src/modules/satellite-tracker/components/SatelliteMap.tsx`

#### PDF Export (lazy jsPDF):
- ✅ `src/components/auditorias/ListaAuditoriasIMCA.tsx`
- ✅ `src/pages/admin/analytics.tsx`
- ✅ `src/pages/admin/dashboard.tsx`
- ✅ `src/pages/ExecutiveReport.tsx`
- ✅ `src/components/unified-logs-panel.tsx`
- ✅ `src/lib/reports/pdf-generator.ts`
- ✅ `src/lib/logger/exportToPDF.ts`
- ✅ `src/modules/analytics/services/export-service.ts`
- ✅ `src/lib/sgso-report.ts`
- ✅ `src/modules/compliance/ism-audit/export-service.ts`
- ✅ `src/modules/compliance/sgso/services/generateSgsoReportPDF.ts`
- ✅ `src/modules/hr/training-academy/services/generateCertificatePDF.ts`
- ✅ `src/components/performance/performance-monitor.tsx`
- ✅ `src/components/sgso/sgso-audit-editor.tsx`
- ✅ `src/modules/document-hub/templates/services/templateSystemService.ts`
- ✅ `src/modules/hr/peo-dp/peodp_report.ts`
- ✅ `src/modules/incident-reports/components/IncidentDetailDialog.tsx`
- ✅ `src/modules/project-timeline/components/ExportActions.tsx`
- ✅ `src/modules/mission-control/components/MissionControlConsolidation.tsx`
- ✅ `src/modules/travel/TravelManagement.tsx`
- ✅ `src/pages/admin/assistant-logs.tsx`
- ✅ `src/pages/admin/checklists.tsx`
- ✅ `src/pages/admin/documents-ai.tsx`

#### OCR (lazy tesseract):
- ✅ `src/services/ocr-service.ts`

#### PDF Export (replaces direct jsPDF imports)
```tsx
// Before (BAD - loads 300KB immediately)
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// After (GOOD - loads only when export is triggered)
import { usePDFExport } from "@/hooks/use-pdf-export";

const MyComponent = () => {
  const { exportTableToPDF, isLoading } = usePDFExport();
  
  const handleExport = () => {
    exportTableToPDF({
      head: [["Name", "Value"]],
      body: data.map(d => [d.name, d.value])
    }, { filename: "report.pdf", title: "My Report" });
  };
  
  return <Button onClick={handleExport} disabled={isLoading}>Export PDF</Button>;
};
```

#### Excel Export (replaces direct xlsx imports)
```tsx
// Before (BAD)
import * as XLSX from "xlsx";

// After (GOOD)
import { useXLSXExport } from "@/hooks/use-xlsx-export";

const MyComponent = () => {
  const { exportToXLSX, isLoading } = useXLSXExport();
  
  return <Button onClick={() => exportToXLSX(data)}>Export Excel</Button>;
};
```

#### OCR (replaces direct tesseract imports)
```tsx
// Before (BAD)
import Tesseract from "tesseract.js";

// After (GOOD)
import { useOCR } from "@/hooks/use-ocr";

const MyComponent = () => {
  const { recognize, isLoading, progress, result } = useOCR();
  
  const handleOCR = async (file: File) => {
    const result = await recognize(file);
    console.log(result?.text);
  };
};
```

#### Maps (replaces direct mapbox-gl imports)
```tsx
// Before (BAD)
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// After (GOOD)
import { loadMapboxGL } from "@/lib/performance/heavy-libs-loader";

useEffect(() => {
  const init = async () => {
    const mapboxgl = await loadMapboxGL();
    // Use mapboxgl...
  };
  init();
}, []);
```

### 3. Files Pending Migration

The following files still have direct imports and should be migrated:

**jsPDF (39 files):**
- src/components/auditorias/ListaAuditoriasIMCA.tsx
- src/components/fuel/fuel-optimizer.tsx
- src/components/performance/performance-monitor.tsx
- src/pages/admin/analytics.tsx
- ... (see full list in search results)

**Tesseract (4 files):**
- src/ai/vision/copilotVision.ts
- src/lib/ocr/pdfToISMChecklist.ts
- src/services/aiDocumentService.ts
- src/services/ocr-service.ts

### 4. Route-Level Code Splitting

The app already uses React.lazy() for route components in App.tsx.
This is good and should be maintained.

### 5. Further Optimization Opportunities

1. **Remove duplicate charting libraries:**
   - Currently using both `chart.js` AND `recharts`
   - Recommendation: Standardize on `recharts` (more React-native)

2. **Consider removing if not critical:**
   - `@tensorflow/tfjs` (~800KB) - Only if AI vision is essential
   - `onnxruntime-web` (~400KB) - Only if ONNX models are used
   - `tesseract.js` (~500KB) - Only if OCR is critical

3. **Image optimization:**
   - Use WebP format for images
   - Implement proper lazy loading for images

### 6. Monitoring Bundle Size

Run these commands to analyze bundle:
```bash
npm run build -- --mode=analyze
npx vite-bundle-visualizer
```

## Summary

| Optimization | Savings | Implemented |
|--------------|---------|-------------|
| Lazy load mapbox-gl | ~350KB | ✅ |
| Lazy load jsPDF | ~300KB | ✅ Hook created |
| Lazy load xlsx | ~400KB | ✅ Hook created |
| Lazy load tesseract | ~500KB | ✅ Hook created |
| Lazy load three.js | ~500KB | ✅ Loader ready |
| Lazy load firebase | ~300KB | ✅ Loader ready |
| Lazy load tensorflow | ~800KB | ✅ Loader ready |
| Route code splitting | Variable | ✅ Already done |
| **Total Potential** | **~3.5MB** | |
