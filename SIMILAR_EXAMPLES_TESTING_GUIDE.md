# SimilarExamples Component - Testing Guide

## Overview

This guide explains how to test the newly implemented SimilarExamples component for the MMI Copilot.

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8080/`

### 2. Navigate to the Demo Page

Open your browser to:
```
http://localhost:8080/mmi/job-creation-demo
```

## Demo Page Features

The demo page (`JobCreationWithSimilarExamples`) provides a complete integration example with:

### Left Panel - Job Creation Form
- **Title field**: Enter job title
- **Description field**: Enter detailed job description (minimum 10 characters)
- **Vessel field**: Enter vessel name
- **Component field**: Enter component/system name
- **Priority dropdown**: Select job priority (low, medium, high, critical)

### Right Panel - Similar Examples
- **Search button**: "🔍 Ver exemplos semelhantes"
- **Results display**: Cards showing similar historical jobs
- **Similarity scores**: Percentage match for each result
- **AI suggestions**: Historical recommendations
- **Copy button**: "📋 Usar como base" to copy suggestions

## Testing Steps

### Test 1: Basic Search

1. Click "📝 Preencher com exemplo" to auto-fill the form
2. Click "🔍 Ver exemplos semelhantes" in the right panel
3. Verify that results appear in cards
4. Check that each card shows:
   - Job title
   - Similarity percentage
   - Component ID
   - Creation date
   - Vessel name
   - Category
   - AI suggestion (in blue box)

### Test 2: Manual Input

1. Clear the form
2. Enter a custom job description (e.g., "Manutenção preventiva do motor principal")
3. Ensure description is at least 10 characters
4. Click the search button
5. Verify results are relevant to the input

### Test 3: Copy Functionality

1. After search results appear
2. Click "📋 Usar como base" on any result card
3. Verify toast notification appears: "Copiado!"
4. Paste (Ctrl+V) to verify clipboard content

### Test 4: Input Validation

1. Clear the description field
2. Try clicking the search button
3. Verify button is disabled
4. Enter less than 10 characters
5. Click search button
6. Verify toast shows: "Entrada insuficiente"

### Test 5: Loading State

1. Enter a valid description
2. Click search button
3. Verify button shows:
   - Spinning loader icon
   - "Buscando exemplos..." text
   - Disabled state

### Test 6: Error Handling (Mock Data Fallback)

If APIs are unavailable, the component will:
1. Show mock data examples
2. Display toast: "Usando dados de exemplo"
3. Present 2 sample job cards with realistic data

## Expected Results

### Successful API Call

```json
{
  "id": "uuid-here",
  "title": "Manutenção de Gerador Principal",
  "description": "Detailed description...",
  "status": "completed",
  "similarity": 0.85,
  "metadata": {
    "component_id": "GEN-001",
    "created_at": "2025-09-15T10:30:00Z",
    "ai_suggestion": "Realizar inspeção visual...",
    "vessel": "MV Atlantic",
    "category": "Preventiva"
  }
}
```

### Mock Data Fallback

If the API fails, you'll see:
- Toast notification about using example data
- 2 pre-configured job examples
- Same UI structure as real data

## Integration Examples

### Example 1: Simple Integration

```tsx
import SimilarExamples from '@/components/copilot/SimilarExamples';

function JobForm() {
  const [description, setDescription] = useState('');
  
  return (
    <div>
      <Textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the maintenance issue..."
      />
      <SimilarExamples input={description} />
    </div>
  );
}
```

### Example 2: Side-by-Side Layout

```tsx
import SimilarExamples from '@/components/copilot/SimilarExamples';

function JobCreation() {
  const [jobData, setJobData] = useState({ description: '' });
  
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Similar Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <SimilarExamples input={jobData.description} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## Troubleshooting

### Issue: Button Always Disabled

**Solution**: Ensure the description has at least 10 characters

### Issue: No Results Found

**Possible Causes**:
1. Database has no job_embeddings data
2. Similarity threshold too high (0.78)
3. Query text very different from existing jobs

**Solution**: Check database or use more common maintenance terms

### Issue: Always Shows Mock Data

**Possible Causes**:
1. `VITE_OPENAI_API_KEY` not configured
2. API key invalid or expired
3. Supabase RPC function missing

**Solution**: Verify environment variables in `.env`:
```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Issue: Build Errors

**Solution**: Ensure all dependencies are installed:
```bash
npm install
```

## Performance Notes

- **First Search**: ~500ms - 2s (includes embedding generation + vector search)
- **Subsequent Searches**: Similar, no client-side caching yet
- **Build Time**: ~50s for production build
- **Dev Server Start**: ~600ms

## Component Props

```tsx
interface SimilarExamplesProps {
  input: string;  // Required: Job description to search
}
```

## Component State

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

## API Dependencies

### OpenAI
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Purpose: Generate vector embeddings

### Supabase
- RPC Function: `match_job_embeddings`
- Table: `job_embeddings`
- Extension: `pgvector`
- Search Method: Cosine similarity

## Files Reference

- **Component**: `/src/components/copilot/SimilarExamples.tsx`
- **Demo Page**: `/src/pages/JobCreationWithSimilarExamples.tsx`
- **Search Function**: `/src/lib/ai/copilot/querySimilarJobs.ts`
- **Documentation**: `/SIMILAR_EXAMPLES_README.md`
- **Implementation Summary**: `/SIMILAR_EXAMPLES_IMPLEMENTATION_SUMMARY.md`

## Next Steps

After testing, you can:

1. **Integrate into existing forms**: Import and use in any job creation form
2. **Customize threshold**: Modify similarity threshold in `querySimilarJobs.ts`
3. **Adjust limit**: Change number of results returned (default: 5)
4. **Style customization**: Modify Tailwind classes in component
5. **Add features**: Implement filtering, sorting, or caching

## Support

For issues or questions:
1. Check environment variables are set
2. Verify database schema matches requirements
3. Review Supabase logs
4. Test with mock data first
5. Check browser console for errors

## Version

- **Component Version**: 1.0.0
- **Date**: October 15, 2025
- **Author**: Copilot AI
