# 📋 MMI Report Template - Quick Reference

## Installation

Already installed! The component uses existing dependencies:
- ✅ `html2pdf.js` (already in package.json)
- ✅ React & TypeScript
- ✅ shadcn/ui components

## Usage (Copy & Paste)

### Basic Usage

```typescript
import { generateMaintenanceReport, MaintenanceJob } from "@/components/mmi";

const jobs: MaintenanceJob[] = [
  {
    id: "1",
    title: "Inspeção do Motor Principal",
    component_id: "ENG-001",
    status: "scheduled",
    due_date: "2025-10-20",
    priority: "high",
    ai_suggestion: "Realizar inspeção preventiva antes do prazo."
  }
];

generateMaintenanceReport(jobs);
```

### Demo Component

```typescript
import { MMIReportDemo } from "@/components/mmi";

function MyPage() {
  return <MMIReportDemo />;
}
```

### Integration with Existing Maintenance System

```typescript
import { generateMaintenanceReport, MaintenanceJob } from "@/components/mmi";

const handleExportReport = () => {
  const jobs: MaintenanceJob[] = maintenanceRecords.map(record => ({
    id: record.id,
    title: record.title,
    component_id: record.vessel_name,
    status: record.status,
    due_date: record.scheduled_date,
    priority: record.priority,
    ai_suggestion: `AI: ${generateSuggestion(record)}`
  }));
  
  generateMaintenanceReport(jobs);
};
```

## MaintenanceJob Interface

```typescript
interface MaintenanceJob {
  id: string;                    // Required: Unique identifier
  title: string;                 // Required: Job title
  component_id: string;          // Required: Component/vessel ID
  status: string;                // Required: scheduled, in_progress, completed, overdue, cancelled
  due_date?: string;             // Optional: Due date (any format)
  priority?: string;             // Optional: critical, high, medium, low, normal
  ai_suggestion?: string;        // Optional: AI recommendation
}
```

## Status Values

```typescript
"scheduled"     // 🔵 Agendado
"in_progress"   // 🟡 Em Progresso
"completed"     // 🟢 Concluído
"overdue"       // 🔴 Atrasado
"cancelled"     // ⚪ Cancelado
```

## Priority Values

```typescript
"critical"      // 🔴 Crítica
"high"          // 🟠 Alta
"medium"        // 🟡 Média
"low"           // 🟢 Baixa
"normal"        // 🔵 Normal
```

## Add Export Button

```typescript
<Button onClick={() => generateMaintenanceReport(jobs)}>
  <FileText className="h-4 w-4 mr-2" />
  Exportar Relatório PDF
</Button>
```

## File Locations

```
src/components/mmi/
├── ReportPDF.tsx          # Core logic
├── MMIReportDemo.tsx      # Demo component
├── index.ts               # Exports
└── README.md             # Full docs

src/pages/
└── MMIReport.tsx         # Demo page

docs/
├── INTEGRATION_GUIDE_MMI.md        # Integration guide
├── MMI_VISUAL_GUIDE.md            # Visual docs
└── MMI_IMPLEMENTATION_COMPLETE.md  # Summary
```

## PDF Output

**Filename**: `Relatorio-MMI-DD-MM-YYYY.pdf`

**Format**: A4 Portrait, High Quality (0.98)

**Includes**:
- Header with title and date
- Summary (total jobs)
- Job cards with all details
- Color-coded badges
- AI suggestions
- Professional footer

## Common Patterns

### Get AI Suggestion from Record

```typescript
const generateAISuggestion = (record: MaintenanceRecord): string => {
  if (record.status === "overdue") {
    return "⚠️ Manutenção atrasada! Ação urgente necessária.";
  }
  if (record.priority === "critical") {
    return "🚨 Prioridade crítica. Atenção imediata recomendada.";
  }
  return "Acompanhamento regular conforme planejado.";
};
```

### Filter Before Export

```typescript
const jobs: MaintenanceJob[] = maintenanceRecords
  .filter(r => r.status !== "cancelled")
  .map(r => ({...}));
```

### Add Toast Notification

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

const handleExport = () => {
  generateMaintenanceReport(jobs);
  toast({
    title: "📄 Relatório Gerado",
    description: `${jobs.length} jobs exportados.`
  });
};
```

## Testing

```bash
# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev
```

## Support

- Full docs: `src/components/mmi/README.md`
- Integration: `INTEGRATION_GUIDE_MMI.md`
- Visual guide: `MMI_VISUAL_GUIDE.md`
- Summary: `MMI_IMPLEMENTATION_COMPLETE.md`

## Quick Demo

To see it in action:
1. Navigate to `/mmi-report` page
2. Or use `<MMIReportDemo />` component
3. Click "Exportar Relatório PDF"
4. Check downloaded PDF

## Pro Tips

✅ **Best Practice**: Transform data before exporting
✅ **Performance**: Works well with 100+ jobs
✅ **Customization**: Edit `ReportPDF.tsx` for custom styles
✅ **AI Logic**: Add sophisticated AI in transformation step
✅ **Error Handling**: Wrap in try-catch for production use

---

**Status**: ✅ Production Ready

**Dependencies**: ✅ Already Installed

**Integration**: ✅ 3 Lines of Code

**Documentation**: ✅ Comprehensive
