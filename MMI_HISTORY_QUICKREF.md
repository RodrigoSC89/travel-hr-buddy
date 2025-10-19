# MMI History - Quick Reference

## Access Points

- **Admin Page**: `/admin/mmi/history`
- **Public Page**: `/mmi/history` (existing, uses HistoryPanel component)

## New Files Created

1. **`src/lib/pdf.ts`** - Reusable PDF export utility
2. **`pages/api/mmi/history.ts`** - API endpoint for fetching MMI records
3. **`src/pages/admin/mmi/MMIHistory.tsx`** - Admin MMI History page
4. **`MMI_HISTORY_IMPLEMENTATION.md`** - Complete documentation

## Key Features

### PDF Export Utility
```typescript
import { exportToPDF, formatPDFContent } from "@/lib/pdf";

// Simple export
await exportToPDF("<p>Content</p>", "filename.pdf");

// With formatted content
const content = formatPDFContent("Title", "<p>Body</p>", "<p>Footer</p>");
await exportToPDF(content, "report.pdf");
```

### API Endpoint
```typescript
// GET /api/mmi/history
// Returns: MMIRecord[]

interface MMIRecord {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
}
```

### Status Logic
```typescript
executado  → job.status === "completed"
atrasado   → job.due_date < now && job.status !== "completed"
pendente   → default (everything else)
```

## Usage

### 1. Navigate to the page
```
/admin/mmi/history
```

### 2. Filter records
- Dropdown with options: Todos, Executado, Pendente, Atrasado

### 3. Export PDF
- Click "📄 Exportar PDF" button on any record
- PDF downloads automatically with formatted content

## Status Colors

| Status    | Color  | Hex     |
|-----------|--------|---------|
| executado | Green  | #22c55e |
| pendente  | Yellow | #eab308 |
| atrasado  | Red    | #ef4444 |

## Database Schema

```
mmi_jobs
  ├── id
  ├── title, description
  ├── status, due_date, completed_date
  └── component_id
        ↓
    mmi_components
      ├── id, component_name
      └── system_id
            ↓
        mmi_systems
          ├── id, system_name
          └── vessel_id
                ↓
            vessels
              ├── id
              └── name
```

## Testing

```bash
# Run all tests
npm run test

# Run specific tests
npm run test src/tests/lib/pdf.test.ts
npm run test src/tests/pages/admin/mmi/MMIHistory.test.tsx

# Lint
npm run lint

# Build
npm run build
```

## Tech Stack

- React + TypeScript
- Shadcn UI + Tailwind CSS
- html2pdf.js (client-side PDF generation)
- Next.js API routes
- Supabase (database)
- date-fns (date formatting)
- sonner (toast notifications)

## Common Tasks

### Add new field to record
1. Update `MMIRecord` interface in `pages/api/mmi/history.ts`
2. Update query in API endpoint
3. Update display in `MMIHistory.tsx`
4. Update PDF content in `handleExportPDF`

### Change PDF styling
1. Modify `formatPDFContent` in `src/lib/pdf.ts`
2. Update inline styles in PDF content generation

### Add new filter
1. Update filter type in `MMIHistory.tsx`
2. Add option to Select dropdown
3. Update `filteredRecords` logic

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDFs not generating | Check html2pdf.js installation and browser support |
| No records showing | Verify API endpoint and Supabase connection |
| Status incorrect | Check job status and due_date in database |
| Build fails | Run `npm install` and verify TypeScript types |

## Dependencies

All required dependencies already in `package.json`:
- html2pdf.js: ^0.12.1
- sonner: ^1.7.4
- date-fns: ^3.6.0
- @supabase/supabase-js: ^2.57.4

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Summary

✅ **1 reusable utility** (pdf.ts)
✅ **1 API endpoint** (/api/mmi/history)
✅ **1 admin page** (/admin/mmi/history)
✅ **Full documentation** (MMI_HISTORY_IMPLEMENTATION.md)
✅ **Unit tests** (pdf.test.ts, MMIHistory.test.tsx)
✅ **Type safety** (TypeScript throughout)
✅ **Error handling** (try-catch, toast notifications)
✅ **Responsive design** (Tailwind CSS)

For complete details, see `MMI_HISTORY_IMPLEMENTATION.md`.
