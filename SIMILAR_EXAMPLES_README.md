# SimilarExamples Component - Complete API Documentation

## Overview

The `SimilarExamples` component provides a powerful UI for finding and displaying similar historical jobs using RAG (Retrieval-Augmented Generation) with vector embeddings. This helps users learn from past maintenance solutions and create better job requests.

## Features

- 🔍 **Semantic Search**: Finds similar jobs using OpenAI embeddings and Supabase vector search
- 📊 **Similarity Scores**: Displays percentage match for each result
- 💡 **AI Suggestions**: Shows historical AI recommendations
- 📋 **One-Click Copy**: Easy clipboard integration for suggestions
- 🎨 **Beautiful UI**: Card-based display with hover effects
- ⚡ **Loading States**: Clear visual feedback during searches
- 🛡️ **Error Handling**: Graceful degradation with mock data fallback

## Installation & Setup

### 1. Prerequisites

```bash
# Required packages (already in package.json)
- react
- @/components/ui/card
- @/components/ui/button
- lucide-react
- @/hooks/use-toast
```

### 2. Environment Variables

Add these to your `.env` file:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Database Setup

Ensure your Supabase database has:

#### Required RPC Function

```sql
-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_job_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  status text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    job_embeddings.id,
    job_embeddings.title,
    job_embeddings.description,
    job_embeddings.status,
    1 - (job_embeddings.embedding <=> query_embedding) as similarity,
    job_embeddings.metadata
  FROM job_embeddings
  WHERE 1 - (job_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY job_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Required Table Schema

```sql
-- Job embeddings table
CREATE TABLE job_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vector index for performance
CREATE INDEX ON job_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

## Usage Examples

### Basic Integration

```tsx
import SimilarExamples from '@/components/copilot/SimilarExamples';

function JobCreationForm() {
  const [jobDescription, setJobDescription] = useState('');
  
  return (
    <div>
      <textarea 
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Describe the maintenance issue..."
      />
      
      <SimilarExamples input={jobDescription} />
    </div>
  );
}
```

### Side-by-Side Layout

```tsx
function JobCreationPage() {
  const [description, setDescription] = useState('');
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Job Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
          />
          <Button>Submit</Button>
        </CardContent>
      </Card>
      
      {/* Right: Similar Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Similar Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <SimilarExamples input={description} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### With Custom Handler

```tsx
function AdvancedJobForm() {
  const [description, setDescription] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);
  
  return (
    <div>
      <Textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      {/* Custom wrapper to handle selection */}
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.suggestion) {
          setSelectedExample(target.dataset.suggestion);
          setDescription(target.dataset.suggestion);
        }
      }}>
        <SimilarExamples input={description} />
      </div>
    </div>
  );
}
```

## Component API

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `string` | Yes | The user's job description to search for similar examples |

### Return Value

The component renders the UI directly. No return value.

### Internal State

```tsx
interface JobExample {
  id: string;
  title: string;
  description?: string;
  status: string;
  similarity: number;
  metadata?: {
    component_id?: string;
    created_at?: string;
    ai_suggestion?: string;
    vessel?: string;
    category?: string;
  };
}
```

## Technical Details

### Architecture Flow

```
User Input (description)
    ↓
SimilarExamples Component
    ↓
querySimilarJobs() function
    ↓
createEmbedding() → OpenAI API
    ↓
Supabase RPC (match_job_embeddings)
    ↓
Vector Search (cosine similarity)
    ↓
Results with similarity scores
    ↓
Card Display UI
```

### Search Process

1. **Input Validation**: Checks if input is at least 10 characters
2. **Embedding Generation**: Creates 1536-dimensional vector using OpenAI
3. **Vector Search**: Queries Supabase with cosine similarity
4. **Threshold Filtering**: Returns only jobs above 78% similarity
5. **Result Ranking**: Sorted by similarity score (highest first)
6. **UI Rendering**: Displays in card format with metadata

### Performance

- **Search Time**: ~500ms - 2s (depending on API latency)
- **Results Limit**: Default 5 jobs (configurable in `querySimilarJobs`)
- **Embedding Cache**: Client-side, per session
- **Database Index**: IVFFlat for fast vector search

## Error Handling

### Graceful Degradation

The component includes fallback mechanisms:

1. **API Unavailable**: Shows mock data examples
2. **No Results**: Displays friendly "no examples found" message
3. **Network Error**: Toast notification + mock data
4. **Invalid Input**: Toast with validation message

### Example Error Scenarios

```tsx
// Scenario 1: Input too short
<SimilarExamples input="test" />
// Shows toast: "Por favor, forneça mais detalhes (mínimo 10 caracteres)"

// Scenario 2: API key missing
// Automatically falls back to mock data

// Scenario 3: Database error
// Shows mock examples + informative toast
```

## Customization

### Styling

The component uses Tailwind CSS and shadcn/ui components. Customize via:

```tsx
// Override card styling
<SimilarExamples input={description} />
// Then in CSS:
.similar-examples-card {
  @apply custom-styles;
}
```

### Similarity Threshold

Modify in `lib/ai/copilot/querySimilarJobs.ts`:

```typescript
const { data, error } = await supabase.rpc("match_job_embeddings", {
  query_embedding: queryEmbedding,
  match_threshold: 0.85, // Change from 0.78 to be more strict
  match_count: limit,
});
```

## Troubleshooting

### Common Issues

#### 1. "No examples found" always

**Solution**: Check database has job_embeddings data

```sql
SELECT COUNT(*) FROM job_embeddings;
```

#### 2. Slow performance

**Solutions**:
- Add vector index if missing
- Reduce `match_count` parameter
- Use connection pooling

#### 3. Mock data always shows

**Solutions**:
- Verify VITE_OPENAI_API_KEY is set
- Check API key permissions
- Verify Supabase RPC function exists

### Debug Mode

Enable logging:

```tsx
// In SimilarExamples.tsx
const fetchExamples = async () => {
  console.log('Input:', input);
  const result = await querySimilarJobs(input);
  console.log('Results:', result);
  // ...
};
```

## Best Practices

### 1. Input Quality

- Encourage detailed descriptions (>50 characters)
- Provide examples to users
- Use placeholder text with good examples

### 2. User Experience

- Show loading state immediately
- Provide feedback for all actions
- Use toasts for non-blocking notifications

### 3. Performance

- Debounce auto-search if implementing
- Cache results for same input
- Lazy load component if not immediately needed

### 4. Accessibility

- Add ARIA labels for screen readers
- Ensure keyboard navigation works
- Use semantic HTML

## Related Files

- `/src/components/copilot/SimilarExamples.tsx` - Main component
- `/lib/ai/copilot/querySimilarJobs.ts` - Search function
- `/lib/ai/openai/createEmbedding.ts` - Embedding generation
- `/src/pages/JobCreationWithSimilarExamples.tsx` - Demo page

## Support

For issues or questions:
- Check existing database schema
- Verify environment variables
- Review Supabase logs
- Test with mock data first

## Version History

- **v1.0.0** (2025-10-15): Initial release with RAG integration
