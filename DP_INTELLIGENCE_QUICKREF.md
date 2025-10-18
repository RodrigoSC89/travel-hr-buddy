# DP Intelligence Admin Page - Quick Reference

## Quick Access
**URL:** `/admin/dp-intelligence`

## Component Location
```
src/pages/admin/DPIntelligencePage.tsx
```

## Key Functions

### fetchIncidents()
Retrieves all DP incidents from Supabase database, calculates severity, and displays them in the table.

```typescript
const { data, error } = await supabase
  .from("dp_incidents")
  .select("*")
  .order("date", { ascending: false });
```

### handleExplain(id)
Triggers AI analysis for a specific incident:
1. Finds the incident by ID
2. Calls `dp-intel-analyze` Edge Function
3. Updates database with analysis result
4. Refreshes the incident list

```typescript
const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
  body: { incident }
});
```

### determineSeverity(incident)
Calculates incident severity based on:
- **Crítico**: Contains "loss of position", "drive off", or "blackout"
- **Alto**: Contains "thruster failure", "reference loss", "pms" OR is DP Class 3
- **Médio**: Default fallback

## Database Schema

### New Columns Added
```sql
-- Stores AI analysis as JSON
gpt_analysis JSONB DEFAULT NULL

-- Automatically updated timestamp
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

### Migration File
```
supabase/migrations/20251017010000_add_gpt_analysis_to_dp_incidents.sql
```

## Table Columns

| Column | Description | Format |
|--------|-------------|--------|
| Título | Incident title | Text |
| Navio | Vessel name | Text or "-" |
| Data | Incident date | dd/MM/yyyy or "-" |
| Severidade | Auto-calculated severity | Crítico/Alto/Médio |
| IA | AI analysis result | JSON or "Não analisado" |
| Ações | Action button | "Explicar com IA" |

## API Integration

### Supabase Table
```typescript
supabase.from("dp_incidents")
```

### Edge Function
```typescript
supabase.functions.invoke("dp-intel-analyze", {
  body: { incident }
})
```

## Testing

**Test File:** `src/tests/pages/admin/dp-intelligence.test.tsx`

**Run Tests:**
```bash
npm test -- src/tests/pages/admin/dp-intelligence.test.tsx
```

**8 Test Cases:**
1. ✅ Renders page title and headers
2. ✅ Fetches and displays incidents
3. ✅ Shows "Não analisado" for unanalyzed incidents
4. ✅ Has "Explicar com IA" button
5. ✅ Calls API on button click
6. ✅ Formats dates correctly
7. ✅ Shows "-" for missing dates
8. ✅ Disables button during analysis

## Component Dependencies

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
```

## State Management

```typescript
const [incidents, setIncidents] = useState<Incident[]>([]);
const [loading, setLoading] = useState(false);
const [analyzingId, setAnalyzingId] = useState<string | null>(null);
```

## Loading States

- **Initial Load**: Shows spinner while fetching incidents
- **Analyzing**: Disables button and shows "Analisando..." text
- **Error**: Displays toast notification with error message
- **Success**: Shows success toast and refreshes data

## Error Handling

All async operations include try-catch blocks with user-friendly error messages via toast notifications:

```typescript
toast.error("Erro ao carregar incidentes", {
  description: error.message
});
```

## Build & Deploy

**Build Command:**
```bash
npm run build
```

**Build Time:** ~52 seconds  
**Bundle Size:** Part of main vendor bundle

## Route Configuration

**In:** `src/App.tsx`

```typescript
const DPIntelligenceAdmin = React.lazy(() => import("./pages/admin/DPIntelligencePage"));

<Route path="/admin/dp-intelligence" element={<DPIntelligenceAdmin />} />
```

## UI/UX Features

- ✅ Responsive table layout
- ✅ Loading spinners for async operations
- ✅ Disabled buttons during processing
- ✅ JSON formatted analysis display
- ✅ Consistent Nautilus One styling
- ✅ Brain icon in header
- ✅ Toast notifications for feedback

## Performance Considerations

- Lazy-loaded component (code splitting)
- Direct Supabase integration (no intermediate API layer)
- Efficient date formatting with fallbacks
- Minimal re-renders with targeted state updates

## Troubleshooting

### Issue: Incidents not loading
**Check:** Supabase connection and RLS policies

### Issue: AI analysis fails
**Check:** Edge function deployment and OpenAI API key

### Issue: Date format incorrect
**Check:** date-fns is installed and mock is correct in tests

### Issue: Button stays disabled
**Check:** analyzingId state is being cleared after API call

## Related Files

- Main component: `src/pages/admin/DPIntelligencePage.tsx`
- Tests: `src/tests/pages/admin/dp-intelligence.test.tsx`
- Migration: `supabase/migrations/20251017010000_add_gpt_analysis_to_dp_incidents.sql`
- Route config: `src/App.tsx`
- Documentation: `DP_INTELLIGENCE_ADMIN_PAGE_SUMMARY.md`
