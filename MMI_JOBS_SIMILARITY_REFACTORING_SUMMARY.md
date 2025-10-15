# MMI Jobs Similarity Search - Refactoring Summary

## Overview

This document summarizes the refactoring of the MMI Jobs Similarity Search feature to support dual-mode operation, providing both existing job comparison (GET) and semantic text search (POST) capabilities while maintaining full backward compatibility.

## Problem Statement

The original implementation (from PR #561) only supported a GET endpoint for finding similar jobs to an existing job by its ID. This limited the API's flexibility for use cases requiring semantic search with arbitrary text queries, such as:

- Searching for "hydraulic system maintenance" without needing an existing job ID
- Finding all jobs related to specific equipment or issues using natural language
- Detecting potential duplicates before creating new work orders

## Solution

Refactored the Edge Function to support two distinct modes of operation:

### Mode 1: GET with jobId (Existing, Backward Compatible)
Find jobs similar to a specific job in the database:
```
GET /functions/v1/mmi-jobs-similar?jobId=<uuid>
```

### Mode 2: POST with query (New)
Semantic search using any text description:
```
POST /functions/v1/mmi-jobs-similar
Content-Type: application/json

{
  "query": "hydraulic system maintenance",
  "match_threshold": 0.7,
  "match_count": 10
}
```

Both modes use the same powerful backend: OpenAI embeddings (text-embedding-ada-002) + PostgreSQL pgvector with cosine similarity search.

## Key Features

### Enhanced API Flexibility
- **Dual-mode operation**: Support both GET and POST methods
- **Configurable parameters**: Adjustable similarity thresholds and result counts
- **Unified backend**: Both modes share the same embedding generation and search logic
- **Improved error handling**: Clear error messages for invalid inputs

### TypeScript Service Layer
Created a comprehensive service layer (`src/services/mmi/similaritySearch.ts`) with:

- **Type-safe API functions**: `findSimilarJobsById()` and `semanticSearchJobs()`
- **React hooks for easy integration**: `useSimilarJobsById()` and `useSemanticSearch()`
- **Helper functions for common workflows**:
  - `detectDuplicateJobs()` - Find potential duplicates (90% similarity threshold)
  - `getJobSuggestions()` - Get AI-powered suggestions (70% threshold)
  - `findRecurringIssues()` - Find recurring issues by category

### Example Components
Added practical React component examples (`src/components/mmi/SimilarJobsExample.tsx`) showing:

- How to use the hooks for GET and POST modes
- Direct service function usage patterns
- Reusable UI components for displaying results

## Changes Made

### Modified Files

1. **supabase/functions/mmi-jobs-similar/index.ts** (118 → 172 lines)
   - Added POST endpoint support
   - Configurable match_threshold and match_count parameters
   - Unified response structure with mode indicator
   - Enhanced error handling for both modes

2. **supabase/functions/mmi-jobs-similar/README.md** (157 → 280+ lines)
   - Documented both GET and POST endpoints
   - Added comprehensive usage examples
   - Included TypeScript service layer documentation
   - Added React hooks documentation

3. **src/tests/mmi-jobs-similar.test.ts** (139 → 169 lines)
   - Added 3 new tests for POST mode
   - Added test for configurable thresholds
   - Total: 10 tests passing

### New Files

4. **src/services/mmi/similaritySearch.ts** (228 lines)
   - Type definitions (SimilarJob, JobComparisonResponse, SemanticSearchResponse)
   - API functions (findSimilarJobsById, semanticSearchJobs)
   - React hooks (useSimilarJobsById, useSemanticSearch)
   - Helper functions (detectDuplicateJobs, getJobSuggestions, findRecurringIssues)

5. **src/components/mmi/SimilarJobsExample.tsx** (221 lines)
   - SimilarJobsByIdExample - GET mode demonstration
   - SemanticSearchExample - POST mode demonstration
   - DuplicateDetectionExample - Helper function usage
   - SimilarJobsList - Reusable display component

## Usage Examples

### Using React Hooks (Recommended)

#### GET Mode - Find similar jobs by ID:
```typescript
import { useSimilarJobsById } from '@/services/mmi/similaritySearch';

function JobDetails({ jobId }) {
  const { data, loading, error, similarJobs } = useSimilarJobsById(jobId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>Similar Jobs to "{data.job_title}"</h3>
      {similarJobs.map(job => (
        <div key={job.id}>
          {job.title} - {Math.round(job.similarity * 100)}% match
        </div>
      ))}
    </div>
  );
}
```

#### POST Mode - Semantic search:
```typescript
import { useSemanticSearch } from '@/services/mmi/similaritySearch';

function SearchJobs() {
  const [query, setQuery] = useState('');
  const { data, loading, error, results } = useSemanticSearch(query);
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs..."
      />
      {results.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Using API Functions Directly

```typescript
import { 
  findSimilarJobsById, 
  semanticSearchJobs,
  detectDuplicateJobs 
} from '@/services/mmi/similaritySearch';

// GET mode
const similarJobs = await findSimilarJobsById('job-uuid');

// POST mode
const searchResults = await semanticSearchJobs({
  query: 'hydraulic system maintenance',
  match_threshold: 0.7,
  match_count: 10
});

// Helper function
const duplicates = await detectDuplicateJobs('Engine overheating issue');
```

## Testing

### Test Coverage
- **Total Tests**: 10 (all passing)
- **Coverage Areas**:
  - Job structure validation
  - GET mode parameter validation
  - POST mode parameter validation
  - GET mode response structure
  - POST mode response structure
  - Error handling for both modes
  - Similarity threshold validation
  - Metadata filtering
  - Cosine similarity ordering
  - Configurable thresholds

### Running Tests
```bash
npm test src/tests/mmi-jobs-similar.test.ts
```

## Backward Compatibility

✅ **Fully backward compatible**: All existing GET requests continue to work without any changes
✅ **No breaking changes**: Response structure for GET mode remains the same with added optional fields
✅ **Enhanced responses**: Added `mode` and `match_threshold` fields to responses for clarity

## Benefits

1. **Increased Flexibility**: Support for arbitrary text queries without needing existing job IDs
2. **Better User Experience**: Users can search using natural language descriptions
3. **Duplicate Detection**: Proactively find potential duplicates before creating new jobs
4. **Pattern Recognition**: Discover recurring issues across the fleet
5. **Developer Friendly**: Type-safe TypeScript service layer with React hooks
6. **Well Documented**: Comprehensive examples and documentation
7. **Tested**: Full test coverage for both modes of operation

## Performance Considerations

- Both modes use the same OpenAI embedding generation
- Same pgvector cosine similarity search backend
- Configurable thresholds allow trade-off between precision and recall
- Results are filtered and sorted by similarity score

## Future Enhancements

Potential improvements identified for future work:
1. Caching of embeddings for frequently searched queries
2. Batch similarity search for multiple jobs at once
3. Real-time similarity updates when new jobs are added
4. Advanced filtering by metadata (status, category, severity)
5. Similarity threshold recommendations based on use case
6. Integration with notification system for critical similarities

## Implementation Date

**Date**: October 15, 2025  
**Status**: ✅ Complete and tested  
**Test Coverage**: 100% maintained (308 total tests passing)

## Related Documentation

- Original Implementation: `MMI_JOB_SIMILARITY_IMPLEMENTATION.md`
- Complete Guide: `MMI_JOB_SIMILARITY_COMPLETE.md`
- Edge Function README: `supabase/functions/mmi-jobs-similar/README.md`
- Service Layer: `src/services/mmi/similaritySearch.ts`
- Example Components: `src/components/mmi/SimilarJobsExample.tsx`

## Technical Details

### API Endpoints

**GET Mode**:
- Endpoint: `/functions/v1/mmi-jobs-similar?jobId=<uuid>`
- Parameters: `jobId` (required)
- Response: JobComparisonResponse

**POST Mode**:
- Endpoint: `/functions/v1/mmi-jobs-similar`
- Body: `{ query, match_threshold?, match_count? }`
- Response: SemanticSearchResponse

### Type Definitions

```typescript
interface SimilarJob {
  id: string;
  title: string;
  description?: string;
  status: string;
  similarity: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface JobComparisonResponse {
  success: boolean;
  mode: "job_comparison";
  job_id: string;
  job_title: string;
  similar_jobs: SimilarJob[];
  count: number;
  match_threshold: number;
}

interface SemanticSearchResponse {
  success: boolean;
  mode: "semantic_search";
  query: string;
  similar_jobs: SimilarJob[];
  count: number;
  match_threshold: number;
}
```

## Conclusion

This refactoring successfully enhances the MMI Jobs Similarity Search feature with dual-mode operation while maintaining full backward compatibility. The addition of a TypeScript service layer with React hooks and example components makes it easier for developers to integrate this powerful feature into their applications. The comprehensive test coverage ensures reliability and maintainability going forward.
