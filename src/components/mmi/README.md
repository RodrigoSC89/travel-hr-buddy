# MMI Report Template - Relatório Inteligente de Manutenção

## 📄 Overview

The MMI (Manutenção com IA - Maintenance with AI) Report Template is a comprehensive PDF generation system for intelligent maintenance reporting. This component generates professional, styled PDF reports with maintenance job information and AI-powered suggestions.

## ✨ Features

- ✅ **Intelligent PDF Generation**: Uses `html2pdf.js` for high-quality PDF output
- ✅ **Maintenance Job Tracking**: Complete list of maintenance jobs with status and priority
- ✅ **AI Suggestions**: Embedded AI recommendations for each job
- ✅ **Professional Styling**: Modern, clean design with color-coded badges
- ✅ **Portuguese Localization**: All text in Brazilian Portuguese (pt-BR)
- ✅ **One-Click Export**: Simple function call to generate and download reports
- ✅ **Customizable**: Easy to integrate with existing maintenance management systems

## 📦 Components

### 1. `ReportPDF.tsx`

Core component containing the PDF generation logic.

**Exports:**
- `generateMaintenanceReport(jobs: MaintenanceJob[])`: Main function to generate PDF reports
- `MaintenanceJob`: TypeScript interface for job data structure

**Usage:**
```typescript
import { generateMaintenanceReport, MaintenanceJob } from '@/components/mmi';

const jobs: MaintenanceJob[] = [
  {
    id: '1',
    title: 'Inspeção do Motor Principal',
    component_id: 'ENG-001',
    status: 'scheduled',
    due_date: '2025-10-20',
    priority: 'high',
    ai_suggestion: 'Recomenda-se realizar inspeção preventiva antes do prazo.'
  }
];

// Generate and download PDF
generateMaintenanceReport(jobs);
```

### 2. `MMIReportDemo.tsx`

Demo component showcasing the MMI Report functionality with sample data.

**Features:**
- Pre-populated with mock maintenance jobs
- Visual statistics dashboard
- One-click report generation button
- Toast notifications for user feedback

**Usage:**
```typescript
import { MMIReportDemo } from '@/components/mmi';

function MaintenancePage() {
  return <MMIReportDemo />;
}
```

## 🎨 Report Structure

The generated PDF includes:

1. **Header Section**
   - Title: "Relatório Inteligente de Manutenção"
   - Subtitle: "Sistema MMI (Manutenção com IA)"

2. **Report Information**
   - Generation date and time
   - Total number of jobs

3. **Jobs Section**
   For each maintenance job:
   - Job title with emoji indicator (🔧)
   - Component ID
   - Status badge (color-coded)
   - Priority badge (color-coded)
   - Due date
   - AI suggestion (if available) with special styling

4. **Footer**
   - System attribution
   - Company branding

## 🎯 Status Types

| Status | Label | Color |
|--------|-------|-------|
| `scheduled` | Agendado | Blue |
| `in_progress` | Em Progresso | Yellow |
| `completed` | Concluído | Green |
| `overdue` | Atrasado | Red |
| `cancelled` | Cancelado | Gray |

## 🎯 Priority Types

| Priority | Label | Color |
|----------|-------|-------|
| `critical` | Crítica | Red |
| `high` | Alta | Orange |
| `medium` | Média | Yellow |
| `low` | Baixa | Green |
| `normal` | Normal | Blue |

## 🔧 Integration with Maintenance Management

To integrate with the existing `maintenance-management.tsx` component:

```typescript
import { generateMaintenanceReport, MaintenanceJob } from '@/components/mmi';

// In your maintenance management component:
const handleExportReport = () => {
  // Transform your MaintenanceRecord[] to MaintenanceJob[]
  const jobs: MaintenanceJob[] = maintenanceRecords.map(record => ({
    id: record.id,
    title: record.title,
    component_id: record.vessel_name, // or appropriate component field
    status: record.status,
    due_date: record.scheduled_date,
    priority: record.priority,
    ai_suggestion: 'AI suggestion based on record data' // Add AI logic here
  }));
  
  generateMaintenanceReport(jobs);
};

// Add export button:
<Button onClick={handleExportReport}>
  <FileText className="h-4 w-4 mr-2" />
  Exportar Relatório
</Button>
```

## 📋 MaintenanceJob Interface

```typescript
interface MaintenanceJob {
  id: string;                    // Unique job identifier
  title: string;                 // Job title/description
  component_id: string;          // Component or vessel identifier
  status: string;                // Current status (scheduled, in_progress, etc.)
  due_date?: string;             // Due date (ISO format or any date string)
  priority?: string;             // Priority level (critical, high, medium, low, normal)
  ai_suggestion?: string;        // AI-generated suggestion or recommendation
}
```

## 🚀 Quick Start

1. Import the components:
```typescript
import { generateMaintenanceReport, MMIReportDemo } from '@/components/mmi';
```

2. Use the demo component to test:
```typescript
<MMIReportDemo />
```

3. Or generate reports programmatically:
```typescript
generateMaintenanceReport(yourJobsArray);
```

## 🎉 Features Completed

- [x] PDF generation with html2pdf.js
- [x] Maintenance job listing
- [x] Status and priority visualization
- [x] Due date tracking
- [x] AI suggestion integration
- [x] Professional styling and formatting
- [x] Portuguese localization
- [x] One-click export functionality
- [x] Demo component for testing
- [x] TypeScript type definitions
- [x] Integration-ready architecture

## 🔗 Dependencies

- `html2pdf.js` - PDF generation library (already installed in project)
- React UI components from shadcn/ui
- Lucide icons

## 📝 Notes

- The PDF generation is client-side, no server required
- Reports are automatically named with the current date: `Relatorio-MMI-DD-MM-YYYY.pdf`
- The styling matches the existing design system used in the project
- All text is in Brazilian Portuguese for consistency

## 🎯 Ready for Integration

This component is ready to be integrated with the maintenance management panel. Simply add an "Exportar relatório" button that calls `generateMaintenanceReport()` with your maintenance data.
