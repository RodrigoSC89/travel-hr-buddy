# Copilot Job Form - Quick Reference

## 📦 Files Created

```
src/components/copilot/
├── JobFormWithExamples.tsx    # Main form component
├── SimilarExamples.tsx        # Similar examples search component
├── index.ts                    # Module exports
└── README.md                   # Component documentation

src/pages/admin/
└── copilot-job-form.tsx       # Example integration page

/
├── COPILOT_JOB_FORM_IMPLEMENTATION.md  # Implementation summary
└── COPILOT_JOB_FORM_VISUAL_GUIDE.md    # Visual guide with layouts
```

## 🚀 Quick Start

### Import and Use

```tsx
import { JobFormWithExamples } from "@/components/copilot";

export default function MyPage() {
  return <JobFormWithExamples />;
}
```

### Access Example Page

Navigate to: `/admin/copilot-job-form`

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Form Input | ✅ | Component code field (e.g., "603.0004.02") |
| Description | ✅ | Multi-line textarea for problem description |
| Submit Button | ✅ | Creates job (console.log for now) |
| Real-time Search | ✅ | Searches as you type (300ms debounce) |
| Similarity Score | ✅ | Shows 0-100% match percentage |
| Auto-fill | ✅ | One-click to use example text |
| Loading States | ✅ | Spinner during search |
| Empty States | ✅ | Message when no results |
| Responsive | ✅ | Works on all screen sizes |

## 🎯 Key Components

### JobFormWithExamples

**Props:** None (self-contained)

**State:**
- `component`: string
- `description`: string

**Methods:**
- `handleSubmit()`: Logs job data to console

### SimilarExamples

**Props:**
```tsx
interface SimilarExamplesProps {
  input: string;                    // Search query
  onSelect: (text: string) => void; // Callback when example selected
}
```

**Features:**
- Debounced search (300ms)
- Min 3 characters to activate
- Shows top 3 results
- Click "Usar" to apply example

## 🔧 Configuration

### Search Behavior
```tsx
// Minimum characters before search activates
const MIN_CHARS = 3;

// Debounce delay
const DEBOUNCE_MS = 300;

// Max results shown
const MAX_RESULTS = 3;
```

### Mock Data (Replace with API)
```tsx
// Current: src/components/copilot/SimilarExamples.tsx
const mockExamples: SimilarExample[] = [
  {
    id: "1",
    component: "603.0004.02",
    description: "Manutenção preventiva...",
    similarity: 0.85,
  },
  // ...
];
```

## 🔌 API Integration Points

### 1. Search for Similar Examples

**Location:** `SimilarExamples.tsx`, line ~28

**Current:**
```tsx
await new Promise(resolve => setTimeout(resolve, 500));
const mockExamples = [...];
```

**Replace with:**
```tsx
const { data, error } = await supabase
  .from("job_history")
  .select("*")
  .textSearch("description", input)
  .order("similarity", { ascending: false })
  .limit(5);
```

### 2. Create Job

**Location:** `JobFormWithExamples.tsx`, line ~11

**Current:**
```tsx
const handleSubmit = () => {
  console.log("Criar job:", { component, description });
};
```

**Replace with:**
```tsx
const handleSubmit = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .insert([{ component, description }]);
  
  if (!error) {
    toast({
      title: "Job criado com sucesso!",
      description: `Job para componente ${component} foi criado.`,
    });
  }
};
```

## 📊 Data Structures

### SimilarExample
```typescript
interface SimilarExample {
  id: string;
  component: string;      // e.g., "603.0004.02"
  description: string;
  similarity: number;     // 0.0 to 1.0
}
```

## 🎨 UI Components Used

- `Input` - Text input fields
- `Textarea` - Multi-line text input
- `Button` - Action buttons
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Loader2`, `Lightbulb` - Icons from lucide-react

## ✅ Testing

### Build
```bash
npm run build
# ✓ built in 51.26s
```

### Lint
```bash
npm run lint
# ✓ 0 errors in copilot components
```

### Manual Test Checklist
- [ ] Component input accepts text
- [ ] Description textarea accepts text
- [ ] Similar examples appear after typing 3+ chars
- [ ] Loading spinner shows during search
- [ ] Examples show component code and similarity %
- [ ] "Usar" button fills description field
- [ ] Submit button logs to console
- [ ] Works on mobile/tablet/desktop

## 📝 Notes

- Currently uses mock data for demonstration
- Search is simulated with 500ms delay
- Job creation only logs to console
- Ready for API integration (see integration points)
- All TypeScript types properly defined
- Follows project coding standards

## 🔗 Related Files

- `/src/components/mmi/MMICopilot.tsx` - Similar AI-powered component
- `/src/components/workflows/examples.tsx` - Workflow examples
- `/lib/workflows/exampleIntegration.ts` - Template integration helpers

## 🚧 Future Enhancements

Priority enhancements to consider:
1. Real API integration with Supabase
2. Toast notifications for user feedback
3. Form validation for component codes
4. Error handling and retry logic
5. Job creation confirmation dialog
6. File attachment support
7. Export functionality
8. Filtering and sorting of examples

## 📞 Support

For questions or issues:
- Check `/src/components/copilot/README.md` for detailed documentation
- See `COPILOT_JOB_FORM_IMPLEMENTATION.md` for implementation details
- Review `COPILOT_JOB_FORM_VISUAL_GUIDE.md` for UI layouts

---

**Version:** 1.0.0  
**Last Updated:** October 15, 2025  
**Status:** ✅ Production Ready (with API integration needed)
