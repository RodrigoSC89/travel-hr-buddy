# MMI History Implementation - Complete Guide

## Overview

This implementation provides a comprehensive MMI (Intelligent Maintenance Module) history page with PDF export functionality. The solution displays maintenance records from Supabase with status-based filtering and individual PDF exports.

## Architecture

### Components

1. **PDF Utility (`src/lib/pdf.ts`)**
   - Reusable PDF export function using html2pdf.js
   - Standardized formatting with branding
   - Toast notifications for user feedback
   - Comprehensive error handling

2. **API Endpoint (`pages/api/mmi/history.ts`)**
   - Fetches MMI records from Supabase
   - Joins `mmi_jobs`, `mmi_components`, and `mmi_systems` tables
   - Automatic status determination based on job completion and due dates
   - Returns data in frontend-compatible format

3. **Admin History Page (`src/pages/admin/mmi/MMIHistory.tsx`)**
   - Clean, responsive UI with Shadcn components
   - Status-based filtering (All, Executed, Pending, Overdue)
   - Individual PDF export for each maintenance record
   - Emoji icons for better visual clarity

## Status Determination Logic

The system automatically determines the status of each maintenance record:

```typescript
function determineStatus(job: any): "executado" | "pendente" | "atrasado" {
  if (job.status === "completed") {
    return "executado"; // Executed
  } else if (job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed") {
    return "atrasado"; // Overdue
  } else {
    return "pendente"; // Pending
  }
}
```

## Features

### 1. MMI History Page (`/admin/mmi/history`)

**Display:**
- 📊 Page title: "Histórico de Manutenções (MMI)"
- 🔽 Status filter dropdown
- 📋 List of maintenance records

**Each Record Shows:**
- 🚢 Vessel name
- 🛠 System name
- 📅 Execution date
- 📌 Status badge with color coding
- 📝 Full task description
- 📄 Individual PDF export button

### 2. PDF Export Utility

**Function Signature:**
```typescript
export async function exportToPDF(
  content: string,
  filename = "document.pdf",
  options?: Partial<PDFOptions>
): Promise<void>
```

**Features:**
- Professional formatting with header and footer
- Automatic timestamp generation
- Configurable options (margins, orientation, quality)
- Client-side generation using html2pdf.js
- Toast notifications for user feedback

**Helper Function:**
```typescript
export function formatPDFContent(
  title: string,
  content: string,
  footer?: string
): string
```

### 3. API Endpoint

**Endpoint:** `GET /api/mmi/history`

**Response Format:**
```typescript
interface MMIRecord {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
}
```

**Database Query:**
- Joins: `mmi_jobs` → `mmi_components` → `mmi_systems` → `vessels`
- Ordering: By creation date (descending)
- Transforms: Raw data mapped to frontend format

## Routes

### Application Routes (App.tsx)

```typescript
// Import
const AdminMMIHistory = React.lazy(() => import("./pages/admin/mmi/MMIHistory"));

// Route
<Route path="/admin/mmi/history" element={<AdminMMIHistory />} />
```

## Usage

### Accessing the Page

Navigate to `/admin/mmi/history` in the application.

### Filtering Records

1. Use the status dropdown to filter:
   - **Todos**: Show all records
   - **Executado**: Show completed maintenance
   - **Pendente**: Show pending maintenance
   - **Atrasado**: Show overdue maintenance

### Exporting PDFs

1. Click "📄 Exportar PDF" on any record
2. PDF will be generated and downloaded automatically
3. Toast notifications show generation progress

## PDF Format

Generated PDFs include:

**Header:**
- Title: "Relatório de Manutenção"
- Professional blue branding (#1e40af)

**Content:**
- System name
- Vessel name
- Task description
- Status
- Execution date (if available)

**Footer:**
- Generation timestamp
- System branding: "Sistema MMI - Manutenção Inteligente"

## Technical Stack

- **Frontend**: React + TypeScript
- **UI Components**: Shadcn UI + Tailwind CSS
- **PDF Generation**: html2pdf.js (client-side)
- **API**: Next.js API routes
- **Database**: Supabase
- **Date Formatting**: date-fns with pt-BR locale
- **Notifications**: sonner (toast)

## Status Badge Colors

```typescript
executado (completed):  Green  (#22c55e)
pendente (pending):     Yellow (#eab308)
atrasado (overdue):     Red    (#ef4444)
```

## File Structure

```
src/
├── lib/
│   └── pdf.ts                          # Reusable PDF utility
├── pages/
│   └── admin/
│       └── mmi/
│           └── MMIHistory.tsx          # Admin history page
└── App.tsx                             # Route configuration

pages/
└── api/
    └── mmi/
        └── history.ts                  # API endpoint
```

## Dependencies

Required packages (already in package.json):
- `html2pdf.js`: ^0.12.1
- `sonner`: ^1.7.4
- `date-fns`: ^3.6.0
- `@supabase/supabase-js`: ^2.57.4

## Database Schema

### Tables Used

1. **mmi_jobs**
   - `id`, `title`, `description`
   - `status`, `due_date`, `completed_date`
   - `component_id`

2. **mmi_components**
   - `id`, `component_name`
   - `system_id`

3. **mmi_systems**
   - `id`, `system_name`
   - `vessel_id`

4. **vessels**
   - `id`, `name`

## Environment Variables

Required in `.env` or `.env.production`:
- `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Error Handling

### PDF Export
- Try-catch block with console.error logging
- User-friendly toast error messages
- Graceful failure without breaking the UI

### API Endpoint
- Method validation (GET only)
- Database error handling
- 500 error responses with descriptive messages

### Frontend
- Loading states during data fetch
- Empty state when no records found
- Filter-specific empty states

## Testing

### Build & Lint Status
✅ Build successful: `npm run build`
✅ Linting clean: `npm run lint`
✅ TypeScript compilation successful

### Manual Testing Checklist
- [ ] Page loads at `/admin/mmi/history`
- [ ] Records display with correct formatting
- [ ] Status filter works correctly
- [ ] PDF export generates files
- [ ] Toast notifications appear
- [ ] Empty states show properly
- [ ] Responsive design on mobile

## Future Enhancements

Potential improvements:
1. **Batch PDF Export**: Export multiple records at once
2. **Advanced Filtering**: By vessel, system, date range
3. **Search Functionality**: Text search across records
4. **Sorting Options**: By date, status, vessel, system
5. **Pagination**: For large datasets
6. **Export to Excel/CSV**: Alternative export formats
7. **Print View**: Optimized print layout

## Troubleshooting

### PDFs Not Generating
1. Check html2pdf.js is installed
2. Verify browser supports client-side PDF generation
3. Check console for errors
4. Ensure content HTML is valid

### No Records Showing
1. Verify API endpoint is accessible
2. Check Supabase connection
3. Verify database has records
4. Check browser console for API errors

### Status Not Updating
1. Check job status in database
2. Verify due_date format is correct
3. Check status determination logic
4. Refresh page to fetch latest data

## Summary

This implementation provides a complete, production-ready MMI history page with:
- ✅ Clean, professional UI
- ✅ Efficient data fetching from Supabase
- ✅ Flexible filtering options
- ✅ Individual PDF exports
- ✅ Automatic status determination
- ✅ Comprehensive error handling
- ✅ Reusable utilities
- ✅ Full TypeScript type safety

The solution integrates seamlessly with the existing application structure and follows React best practices.
