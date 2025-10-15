# Copilot Components

## Overview

This module contains AI-powered components for intelligent job creation and maintenance assistance. The main components are:

- **SimilarExamples**: An intelligent interface for finding and reusing historical maintenance job data using vector similarity search
- **JobFormWithExamples**: A complete job creation form that integrates with SimilarExamples for AI-powered suggestions
- **CopilotJobFormExample**: A full-featured demo page showcasing all capabilities
- **CopilotJobForm Page**: A simple demo page accessible at `/copilot/job-form`

All components use vector similarity search powered by OpenAI embeddings to find similar maintenance cases based on user input.

## Demo Pages

You can see these components in action at:
- `/copilot/job-form` - Simple, clean demo of JobFormWithExamples

## Features

- 🔍 **Smart Search**: Uses AI-powered vector embeddings to find similar maintenance jobs
- 📋 **Quick Reuse**: One-click "Use as base" button to populate forms with historical suggestions
- 🎯 **Relevant Results**: Displays similarity scores and detailed metadata for each match
- 🔄 **Fallback Support**: Gracefully handles API unavailability with mock data

## Component Structure

### Files Created

```
src/
├── components/
│   └── copilot/
│       ├── SimilarExamples.tsx              # Similar examples finder component
│       ├── JobFormWithExamples.tsx          # Job creation form with AI suggestions
│       ├── CopilotJobFormExample.tsx        # Full-featured demo page
│       └── index.ts                         # Component exports
├── pages/
│   └── CopilotJobForm.tsx                   # Simple demo page at /copilot/job-form
├── lib/
│   └── ai/
│       └── copilot/
│           └── querySimilarJobs.ts          # Query service
└── tests/
    └── components/
        └── JobFormWithExamples.test.tsx     # Unit tests
```

## Usage

### JobFormWithExamples - Complete Form

The easiest way to use the copilot components is with the `JobFormWithExamples` component, which includes the form and similar examples integration:

```tsx
import { JobFormWithExamples } from "@/components/copilot";

function MaintenancePage() {
  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    // Call your API to save the job
  };

  return <JobFormWithExamples onSubmit={handleJobSubmit} />;
}
```

### SimilarExamples - Standalone Usage

You can also use the `SimilarExamples` component independently:

```tsx
import SimilarExamples from "@/components/copilot/SimilarExamples";

function MaintenanceForm() {
  const [description, setDescription] = useState("");

  const handleSelectSuggestion = (suggestion: string) => {
    setDescription(suggestion);
  };

  return (
    <div>
      <textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <SimilarExamples 
        input={description}
        onSelect={handleSelectSuggestion}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `string` | Yes | The maintenance issue description to search for |
| `onSelect` | `(text: string) => void` | No | Callback function when user clicks "Use as base" |

## How It Works

1. **User Input**: The component receives a maintenance issue description via the `input` prop
2. **Embedding Generation**: When the user clicks "Ver exemplos semelhantes" (View similar examples):
   - The input text is converted to a vector embedding using OpenAI's text-embedding-3-small model
3. **Vector Search**: The embedding is used to query the database:
   - Calls the `match_mmi_jobs` Supabase function
   - Uses cosine similarity to find the most similar historical jobs
   - Returns results above the similarity threshold (default: 0.7)
4. **Display Results**: Shows matching jobs in card format with:
   - Job title
   - Component/Asset information
   - Creation date
   - AI suggestion/description
5. **Reuse Data**: Users can click "📋 Usar como base" to populate their form with a selected suggestion

## Database Schema

The component relies on the `mmi_jobs` table with vector embeddings:

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  component TEXT,
  asset_name TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMP,
  embedding vector(1536)  -- OpenAI embedding
);
```

## API Reference

### querySimilarJobs

```typescript
querySimilarJobs(
  input: string,
  matchThreshold?: number,  // Default: 0.7
  matchCount?: number       // Default: 5
): Promise<SimilarJobResult[]>
```

**Parameters:**
- `input`: Description of the maintenance issue
- `matchThreshold`: Minimum similarity score (0-1) to return results
- `matchCount`: Maximum number of results to return

**Returns:**
An array of `SimilarJobResult` objects:

```typescript
interface SimilarJobResult {
  id: string;
  metadata: {
    title: string;
    component_id: string;
    created_at: string;
    ai_suggestion?: string;
    description?: string;
    status?: string;
    priority?: string;
    similarity?: number;
  };
  similarity: number;
}
```

## Error Handling

The component includes robust error handling:

1. **Database Errors**: Returns mock data for development/testing
2. **Missing OpenAI API Key**: Falls back to mock embeddings
3. **Network Issues**: Logs errors and shows graceful degradation
4. **Missing Fields**: Provides sensible defaults ("Sem título", "N/A", etc.)

## Testing

Run the test suite:

```bash
npm test similar-jobs-query.test.ts
```

Test coverage includes:
- ✅ Successful query with multiple results
- ✅ Custom threshold and count parameters
- ✅ Error handling with mock data fallback
- ✅ Empty results handling
- ✅ Data transformation
- ✅ Missing optional fields

## Configuration

### Environment Variables

Required for production use:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Function

Ensure the `match_mmi_jobs` function exists in your Supabase project:

```sql
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  component TEXT,
  asset_name TEXT,
  status TEXT,
  priority TEXT,
  similarity float
)
```

## Performance Considerations

- **Embeddings**: Cached when possible to reduce API calls
- **Vector Search**: Uses IVFFlat index for efficient similarity search
- **Results Limit**: Default to 5 results to minimize response time
- **Lazy Loading**: Examples only fetched when user clicks the button

## Future Enhancements

Potential improvements:
- [ ] Add pagination for results
- [ ] Include confidence scores in the UI
- [ ] Add filtering by component/vessel
- [ ] Support for multiple languages
- [ ] Real-time search as user types (debounced)
- [ ] Export similar examples to PDF

## Integration Example

### With MMI Copilot

```tsx
import MMICopilot from "@/components/mmi/MMICopilot";
import SimilarExamples from "@/components/copilot/SimilarExamples";

function MaintenanceAssistant() {
  const [prompt, setPrompt] = useState("");
  
  return (
    <div className="space-y-4">
      <MMICopilot />
      
      <SimilarExamples 
        input={prompt}
        onSelect={(suggestion) => {
          setPrompt(suggestion);
          // Optionally trigger AI suggestion automatically
        }}
      />
    </div>
  );
}
```

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ⚠️ Internet Explorer: Not supported

## Troubleshooting

### No results returned

1. Check if embeddings are generated for historical jobs
2. Verify `match_mmi_jobs` function exists in database
3. Lower the `matchThreshold` parameter

### Mock data always shown

1. Verify OpenAI API key is set correctly
2. Check database connection
3. Review browser console for error messages

### Slow response times

1. Ensure vector index is created on the `embedding` column
2. Reduce `matchCount` parameter
3. Check OpenAI API rate limits

## License

This component is part of the Travel HR Buddy project.

## Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation in the `/docs` folder
- Review the test files for usage examples
