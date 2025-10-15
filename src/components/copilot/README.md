# Copilot Job Form Components

This module provides AI-powered job creation components with real-time example suggestions based on historical data.

## Components

### JobFormWithExamples

Main component that combines a job creation form with AI-powered similar example suggestions.

**Features:**
- 🧾 Form for creating jobs with component code and description
- 🔍 Real-time similar example search based on description input
- 📋 Auto-fill functionality from historical examples
- ✅ Simple job creation workflow

**Usage:**

```tsx
import { JobFormWithExamples } from '@/components/copilot';

export default function JobCreationPage() {
  return (
    <div className="container mx-auto p-6">
      <JobFormWithExamples />
    </div>
  );
}
```

### SimilarExamples

Component that displays similar historical examples based on input text.

**Features:**
- Searches for similar examples using text matching
- Shows similarity percentage for each result
- Allows one-click application of example text
- Real-time search with debouncing

**Usage:**

```tsx
import { SimilarExamples } from '@/components/copilot';

export default function MyComponent() {
  const [description, setDescription] = useState('');

  return (
    <SimilarExamples 
      input={description} 
      onSelect={(text) => setDescription(text)} 
    />
  );
}
```

## Integration Notes

### API Integration

The current implementation uses mock data for demonstration purposes. To integrate with a real API:

1. Replace the mock example search in `SimilarExamples.tsx` with an API call:

```tsx
const { data } = await supabase
  .from('job_history')
  .select('*')
  .textSearch('description', input)
  .order('similarity', { ascending: false })
  .limit(5);
```

2. Update the `handleSubmit` function in `JobFormWithExamples.tsx` to call your job creation API:

```tsx
const handleSubmit = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ component, description }]);
  
  if (!error) {
    toast({
      title: "Job criado com sucesso!",
      description: `Job para componente ${component} foi criado.`,
    });
  }
};
```

## Component Structure

```
src/components/copilot/
├── JobFormWithExamples.tsx  # Main form component
├── SimilarExamples.tsx      # Similar examples display component
├── index.ts                 # Exports
└── README.md                # This file
```

## Example Data Structure

### SimilarExample Interface

```typescript
interface SimilarExample {
  id: string;              // Unique identifier
  component: string;       // Component code (e.g., "603.0004.02")
  description: string;     // Job description
  similarity: number;      // Similarity score (0-1)
}
```

## Styling

Components use the existing UI component library:
- `@/components/ui/input` - Text input fields
- `@/components/ui/textarea` - Multi-line text input
- `@/components/ui/button` - Action buttons
- `@/components/ui/card` - Card containers
- `lucide-react` - Icons

## Future Enhancements

- [ ] Add loading states during job creation
- [ ] Implement error handling with toast notifications
- [ ] Add validation for component codes
- [ ] Integrate with actual job history database
- [ ] Add filtering options for examples (by date, component type, etc.)
- [ ] Implement AI-powered suggestions using OpenAI or similar
- [ ] Add job creation confirmation dialog
- [ ] Support for file attachments
