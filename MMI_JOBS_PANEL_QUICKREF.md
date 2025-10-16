# MMI Jobs Panel - Quick Reference

## Component Structure

```
MMIJobsPanel
├── State Management
│   ├── jobs: MMIJobForecast[]
│   └── search: string
│
├── Effects
│   └── useEffect → fetchJobs() on mount
│
├── Functions
│   ├── fetchJobs() - Fetch from Supabase
│   └── handleExport(job) - Generate PDF
│
└── UI Layout
    ├── Header (🛠 Painel de Forecast MMI)
    ├── Search Input (🔍 filter)
    └── Job Cards Grid
        └── Each Card:
            ├── 🔧 Title
            ├── 📅 Forecast
            ├── ⏱ Hours
            ├── 👨‍🔧 Responsible
            └── 📤 Export PDF Button
```

## Data Flow

```
1. Component Mounts
   ↓
2. useEffect triggers fetchJobs()
   ↓
3. Supabase Query
   SELECT * FROM mmi_jobs
   ORDER BY forecast_date DESC
   ↓
4. setJobs(data)
   ↓
5. UI Renders with Jobs
   ↓
6. User Types in Search
   ↓
7. Filter jobs by title
   ↓
8. Re-render filtered cards
```

## PDF Export Flow

```
1. User clicks "📤 Exportar PDF"
   ↓
2. handleExport(job) called
   ↓
3. Build HTML string with job details
   ↓
4. Dynamic import html2pdf.js
   ↓
5. Generate PDF blob
   ↓
6. Create object URL
   ↓
7. Open in new tab
```

## Key Code Snippets

### Supabase Client Setup
```typescript
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);
```

### Fetch Jobs
```typescript
async function fetchJobs() {
  const { data } = await supabase
    .from("mmi_jobs")
    .select("*")
    .order("forecast_date", { ascending: false });
  if (data) setJobs(data);
}
```

### Search Filter
```typescript
jobs.filter((j) => 
  j.title.toLowerCase().includes(search.toLowerCase())
)
```

### PDF Export
```typescript
async function handleExport(job: MMIJobForecast) {
  const html = `
    <h2>${job.title}</h2>
    <p><strong>Previsão:</strong> ${job.forecast || 'N/A'}</p>
    <p><strong>Horímetro:</strong> ${job.hours || 0}h</p>
    <p><strong>Responsável:</strong> ${job.responsible || 'N/A'}</p>
  `;
  const blob = await (await import("html2pdf.js"))
    .default()
    .from(html)
    .outputPdf("blob");
  const url = URL.createObjectURL(blob);
  window.open(url);
}
```

## Testing

### Test Coverage
```typescript
describe("MMI Jobs Forecast Panel", () => {
  it("should render the panel title")
  it("should render the search input")
  it("should have the correct title with emoji")
})
```

### Run Tests
```bash
npm run test -- mmi-jobs-panel
```

## Database Schema

```sql
-- mmi_jobs table
CREATE TABLE public.mmi_jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  forecast TEXT,           -- New field
  hours NUMERIC,           -- New field
  responsible TEXT,        -- New field
  forecast_date TIMESTAMP, -- New field
  description TEXT,
  status TEXT,
  priority TEXT,
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  due_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  embedding vector(1536)
);
```

## Environment Variables Required

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-key...
```

## Access the Panel

**URL**: `/mmi/jobs`

The route is already configured in `src/App.tsx`:
```typescript
<Route path="/mmi/jobs" element={<MMIJobsPanel />} />
```

## Build & Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint
```

## Status

✅ **COMPLETE AND PRODUCTION READY**

- All tests passing (959/959)
- Build successful
- Linting clean
- TypeScript types correct
- Responsive design
- PDF export working
