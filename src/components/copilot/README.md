# Copilot Components

This directory contains AI-powered copilot components for intelligent job creation with historical context.

## Components

### JobFormWithExamples

A smart job creation form that combines:
- 🧾 Form fields for job details (component and description)
- 🤖 AI-powered job creation
- 🔍 Real-time similar examples lookup
- 📋 Auto-fill from historical data

**Usage:**

```tsx
import { JobFormWithExamples } from "@/components/copilot";

function MyPage() {
  return <JobFormWithExamples />;
}
```

**Features:**
- Component field (e.g., "603.0004.02")
- Description textarea for problem/action details
- Submit button to create the job
- Automatic similar examples display based on description

### SimilarExamples

Displays similar historical examples in real-time as the user types.

**Usage:**

```tsx
import { SimilarExamples } from "@/components/copilot";

function MyForm() {
  const [description, setDescription] = useState("");

  return (
    <div>
      <Textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <SimilarExamples 
        input={description}
        onSelect={(text) => setDescription(text)}
      />
    </div>
  );
}
```

**Props:**
- `input: string` - The search query (from user input)
- `onSelect: (text: string) => void` - Callback when user selects an example

**Features:**
- Debounced search (300ms)
- Minimum 3 characters to trigger search
- Shows similarity percentage
- Click to auto-fill
- Loading states
- Empty state handling

## Integration

The components are designed to work with the MMI (Maritime Maintenance Intelligence) system and can integrate with:

1. **Similarity Search API** - Replace the mock data in `SimilarExamples.tsx` with actual API calls
2. **Job Creation API** - Implement the actual job creation logic in `JobFormWithExamples.tsx`
3. **Workflow System** - Integrate with existing workflow APIs

## Architecture

```
JobFormWithExamples.tsx
├── Input (component field)
├── Textarea (description field)
├── Button (submit)
└── SimilarExamples
    ├── Search Logic (debounced)
    ├── API Call (mocked for now)
    └── Results Display (clickable cards)
```

## Future Enhancements

- [ ] Connect to real similarity search API
- [ ] Implement actual job creation endpoint
- [ ] Add component validation
- [ ] Add success/error toast notifications
- [ ] Add loading states on submit
- [ ] Add form validation
- [ ] Export/save job templates
- [ ] Add history/recent items

## Testing

Tests are located in `/src/tests/copilot-job-form.test.ts`

Run tests:
```bash
npm test -- src/tests/copilot-job-form.test.ts
```

## Dependencies

- React 18.3+
- UI Components from `@/components/ui`
- Lucide React icons
- TypeScript

## Related Components

- `src/components/mmi/MMICopilot.tsx` - AI copilot for maintenance suggestions
- `src/components/mmi/SimilarJobsExample.tsx` - Similar jobs search examples
