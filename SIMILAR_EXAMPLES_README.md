# SimilarExamples Component - API Documentation

## Overview

The SimilarExamples component provides an intelligent interface for finding and reusing historical maintenance job data using RAG (Retrieval-Augmented Generation) with vector similarity search powered by OpenAI embeddings.

## Features

- 🔍 **Smart Search**: AI-powered vector embeddings to find similar maintenance jobs
- 📋 **Quick Reuse**: One-click button to populate forms with historical suggestions
- 🎯 **Relevant Results**: Displays similarity scores and detailed metadata for each match
- 🔄 **Fallback Support**: Gracefully handles API unavailability with mock data
- 🎨 **Beautiful UI**: Rich cards with badges, icons, and responsive design
- 📊 **Similarity Scores**: Visual percentage indicators with color-coding
- 🔔 **Toast Notifications**: User feedback for all interactions

## Installation

The component is already integrated into the Travel HR Buddy application. No additional installation is required.

## Component API

### SimilarExamples

```tsx
import SimilarExamples from "@/components/copilot/SimilarExamples";

<SimilarExamples
  input={string}
  onSelect={(suggestion: string) => void}
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `string` | Yes | The maintenance issue description to search for |
| `onSelect` | `(text: string) => void` | No | Callback function when user clicks "📋 Usar como base" |

## Usage Examples

### Basic Usage

```tsx
import { useState } from "react";
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
        placeholder="Describe the maintenance issue..."
      />
      
      <SimilarExamples 
        input={description}
        onSelect={handleSelectSuggestion}
      />
    </div>
  );
}
```

### Advanced Usage with Form

```tsx
import { useState } from "react";
import SimilarExamples from "@/components/copilot/SimilarExamples";
import { Card, CardContent } from "@/components/ui/card";

function JobCreationForm() {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    component: "",
    priority: "",
  });

  const handleSelectSuggestion = (suggestion: string) => {
    setJobData(prev => ({
      ...prev,
      description: suggestion
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <input 
            value={jobData.title}
            onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
          />
          <textarea 
            value={jobData.description}
            onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <SimilarExamples 
            input={jobData.description || jobData.title || jobData.component}
            onSelect={handleSelectSuggestion}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

## Backend API

### querySimilarJobs Function

The component uses the `querySimilarJobs` function to fetch similar jobs from the database.

```typescript
import { querySimilarJobs } from "@/lib/ai/copilot/querySimilarJobs";

const results = await querySimilarJobs(
  input: string,           // The maintenance issue description
  matchThreshold?: number, // Minimum similarity score (default: 0.7)
  matchCount?: number      // Maximum number of results (default: 5)
);
```

#### Parameters

- **input** (required): Description of the maintenance issue
- **matchThreshold** (optional): Minimum similarity score between 0 and 1 (default: 0.7 = 70%)
- **matchCount** (optional): Maximum number of results to return (default: 5)

#### Return Type

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

## How It Works

### 1. User Input
The component receives a maintenance issue description via the `input` prop.

### 2. Embedding Generation
When the user clicks "🔍 Ver exemplos semelhantes":
- The input text is converted to a 1536-dimensional vector embedding using OpenAI's `text-embedding-3-small` model
- This happens via the `generateEmbedding()` function

### 3. Vector Search
The embedding is used to query the database:
- Calls the `match_mmi_jobs` Supabase RPC function
- Uses cosine similarity to find the most similar historical jobs
- Returns results above the similarity threshold (default: 0.7)

### 4. Display Results
Shows matching jobs in card format with:
- Job title with wrench icon
- Creation date
- Component/Asset information
- Similarity percentage with color-coded badge
- AI suggestion/description in a highlighted box
- Status information

### 5. User Interaction
Users can:
- Click "📋 Usar como base" to populate their form with a selected suggestion
- See toast notifications for feedback
- View similarity scores to understand relevance

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

-- Create the vector similarity search function
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  component TEXT,
  asset_name TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMP,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_jobs.id,
    mmi_jobs.title,
    mmi_jobs.description,
    mmi_jobs.component,
    mmi_jobs.asset_name,
    mmi_jobs.status,
    mmi_jobs.priority,
    mmi_jobs.created_at,
    1 - (mmi_jobs.embedding <=> query_embedding) as similarity
  FROM mmi_jobs
  WHERE 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Configuration

### Environment Variables

Required for production use:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization

You can customize the similarity threshold and match count:

```tsx
// In querySimilarJobs.ts, modify these defaults:
const matchThreshold = 0.7;  // 70% minimum similarity
const matchCount = 5;        // Return top 5 results
```

## Error Handling

The component includes robust error handling:

1. **Empty Input**: Shows toast notification asking user to provide input
2. **No Results**: Shows toast notification when no similar cases are found
3. **Database Errors**: Logs error and returns mock data for development
4. **Missing OpenAI API Key**: Falls back to mock embeddings
5. **Network Issues**: Shows error toast and logs details

## Performance Considerations

- **Embeddings**: Cached when possible to reduce API calls
- **Vector Search**: Uses IVFFlat index for efficient similarity search
- **Results Limit**: Default to 5 results to minimize response time
- **Lazy Loading**: Examples only fetched when user clicks the button
- **Debouncing**: Consider adding debouncing for real-time search

## Styling

The component uses Tailwind CSS and shadcn/ui components:

- Cards with hover effects and shadows
- Color-coded similarity badges:
  - Green (≥85%): High similarity
  - Blue (≥75%): Good similarity
  - Orange (<75%): Moderate similarity
- Responsive design with proper spacing
- Icons from lucide-react for better UX

## Toast Notifications

The component provides user feedback through toast notifications:

- ✅ Success: "Exemplos encontrados" when results are loaded
- ℹ️ Info: "Nenhum resultado" when no matches found
- ⚠️ Warning: "Campo vazio" when input is empty
- ❌ Error: "Erro ao buscar" when an error occurs
- 📋 Success: "Copiado com sucesso" when suggestion is copied

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ⚠️ Internet Explorer: Not supported

## Demo Page

Access the full demo at: `/mmi/job-creation-demo`

The demo includes:
- Complete job creation form
- Live integration with SimilarExamples component
- Example data quick-fill
- Usage instructions
- Technical information display

## Troubleshooting

### No results returned

1. Check if embeddings are generated for historical jobs
2. Verify `match_mmi_jobs` function exists in database
3. Lower the `matchThreshold` parameter
4. Ensure OpenAI API key is configured

### Mock data always shown

1. Verify OpenAI API key is set correctly in `.env`
2. Check database connection
3. Review browser console for error messages
4. Verify Supabase credentials

### Slow response times

1. Ensure vector index is created on the `embedding` column:
   ```sql
   CREATE INDEX ON mmi_jobs USING ivfflat (embedding vector_cosine_ops);
   ```
2. Reduce `matchCount` parameter
3. Check OpenAI API rate limits
4. Monitor database performance

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

## License

This component is part of the Travel HR Buddy project.

## Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation in the `/docs` folder
- Review the test files for usage examples
- Consult the demo page at `/mmi/job-creation-demo`

## Related Documentation

- [SimilarExamples Implementation Summary](./SIMILAR_EXAMPLES_IMPLEMENTATION_SUMMARY.md)
- [SimilarExamples Testing Guide](./SIMILAR_EXAMPLES_TESTING_GUIDE.md)
- [Component README](./src/components/copilot/README.md)
