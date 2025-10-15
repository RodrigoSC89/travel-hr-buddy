# MMI Jobs Similar Function

## Overview

This Supabase Edge Function provides job similarity search using AI-powered semantic embeddings. It supports **dual-mode operation** for maximum flexibility:

1. **GET Mode**: Find jobs similar to an existing job by its ID
2. **POST Mode**: Perform semantic search using arbitrary text queries

Both modes use OpenAI's `text-embedding-ada-002` model for semantic understanding and PostgreSQL pgvector for efficient similarity search.

## Endpoints

### Mode 1: GET - Job Comparison

Find jobs similar to a specific job in the database.

```
GET /functions/v1/mmi-jobs-similar?jobId=<uuid>
```

#### Parameters

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| jobId     | UUID   | Yes      | The ID of the job to find similar to  |

#### Response

```json
{
  "success": true,
  "mode": "job_comparison",
  "job_id": "uuid",
  "job_title": "Job Title",
  "similar_jobs": [
    {
      "id": "uuid",
      "title": "Similar Job Title",
      "description": "Job description",
      "status": "active",
      "similarity": 0.89,
      "metadata": {},
      "created_at": "2025-10-15T00:00:00.000Z"
    }
  ],
  "count": 5,
  "match_threshold": 0.78
}
```

### Mode 2: POST - Semantic Search

Search for jobs using natural language queries without needing a specific job ID.

```
POST /functions/v1/mmi-jobs-similar
Content-Type: application/json
```

#### Request Body

```json
{
  "query": "hydraulic system maintenance",
  "match_threshold": 0.7,
  "match_count": 10
}
```

| Field           | Type   | Required | Default | Description                        |
|-----------------|--------|----------|---------|------------------------------------|
| query           | string | Yes      | -       | Search query text                  |
| match_threshold | number | No       | 0.7     | Similarity threshold (0.0 - 1.0)   |
| match_count     | number | No       | 10      | Maximum number of results to return|

#### Response

```json
{
  "success": true,
  "mode": "semantic_search",
  "query": "hydraulic system maintenance",
  "similar_jobs": [
    {
      "id": "uuid",
      "title": "Hydraulic Pump Repair",
      "description": "Maintenance work on hydraulic systems",
      "status": "active",
      "similarity": 0.92,
      "metadata": { "category": "hydraulics" },
      "created_at": "2025-10-15T00:00:00.000Z"
    }
  ],
  "count": 8,
  "match_threshold": 0.7
}
```

## Error Responses

### Error (400) - Missing Parameters

```json
{
  "error": "Missing jobId parameter"
}
```

or

```json
{
  "error": "Missing query parameter in request body"
}
```

### Error (404)

```json
{
  "error": "Job not found"
}
```

### Error (500)

```json
{
  "error": "Error message",
  "success": false
}
```

## Features

- **Dual-Mode Operation**: Support both job comparison (GET) and semantic search (POST)
- **Semantic Search**: Uses OpenAI embeddings (text-embedding-ada-002) to understand job context
- **Cosine Similarity**: Calculates similarity scores between 0 and 1
- **Configurable Parameters**: Adjustable match threshold and result count
- **Backward Compatible**: Existing GET endpoint continues to work without changes
- **CORS Enabled**: Allows cross-origin requests

## Use Cases

### GET Mode Use Cases
1. **Suggest Similar Issues**: Find jobs that had similar problems and suggest resolutions
2. **Pattern Recognition**: Identify recurring issues across similar jobs
3. **Risk Assessment**: Alert if a current job resembles one that became a critical failure

### POST Mode Use Cases
1. **Duplicate Detection**: Find potential duplicates before creating new work orders
2. **Smart Search**: Search maintenance history using natural language
3. **Knowledge Discovery**: Find relevant past work orders by describing the issue
4. **Predictive Maintenance**: Search for similar patterns to predict issues

## Example Usage

### Mode 1: GET - Using cURL

```bash
curl -X GET 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar?jobId=550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Mode 2: POST - Using cURL

```bash
curl -X POST 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "hydraulic system maintenance",
    "match_threshold": 0.7,
    "match_count": 10
  }'
```

### Using JavaScript/TypeScript

#### GET Mode - Find similar jobs by ID

```typescript
const response = await fetch(
  `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar?jobId=${jobId}`,
  {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  }
);

const data = await response.json();
console.log('Similar jobs:', data.similar_jobs);
```

#### POST Mode - Semantic search

```typescript
const response = await fetch(
  'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'hydraulic system maintenance',
      match_threshold: 0.7,
      match_count: 10
    })
  }
);

const data = await response.json();
console.log('Search results:', data.similar_jobs);
```

### Using TypeScript Service Layer

The repository includes a comprehensive service layer at `src/services/mmi/similaritySearch.ts` with:

#### Type-safe API Functions

```typescript
import { findSimilarJobsById, semanticSearchJobs } from '@/services/mmi/similaritySearch';

// GET mode
const jobComparison = await findSimilarJobsById('job-uuid');

// POST mode
const searchResults = await semanticSearchJobs({
  query: 'hydraulic system maintenance',
  match_threshold: 0.7,
  match_count: 10
});
```

#### React Hooks

```typescript
import { useSimilarJobsById, useSemanticSearch } from '@/services/mmi/similaritySearch';

function MyComponent() {
  // GET mode hook
  const { data, loading, error, similarJobs } = useSimilarJobsById(jobId);
  
  // POST mode hook
  const { data, loading, error, results } = useSemanticSearch(query);
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {similarJobs.map(job => <div key={job.id}>{job.title}</div>)}
    </div>
  );
}
```

#### Helper Functions

```typescript
import { 
  detectDuplicateJobs, 
  getJobSuggestions, 
  findRecurringIssues 
} from '@/services/mmi/similaritySearch';

// Find potential duplicates (90% threshold)
const duplicates = await detectDuplicateJobs('Engine overheating issue');

// Get suggestions (70% threshold)
const suggestions = await getJobSuggestions('Hydraulic pump problems');

// Find recurring issues by category
const recurring = await findRecurringIssues('Engine issues', 'engine');
```

## Environment Variables

The following environment variables must be configured in Supabase:

- `OPENAI_API_KEY` - OpenAI API key for embeddings generation
- `SUPABASE_URL` - Automatically provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided by Supabase

## Database Schema

The function relies on the `mmi_jobs` table with the following structure:

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  embedding VECTOR(1536),
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  metadata JSONB
);
```

## RPC Function

Uses the `match_mmi_jobs` PostgreSQL function for efficient similarity search:

```sql
match_mmi_jobs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
```

## Performance

- Uses ivfflat index for fast vector similarity search
- Cosine similarity operator (`<=>`) for efficient computation
- Returns only jobs above the similarity threshold

## Notes

- The function filters out the query job itself from results
- Similarity scores range from 0 to 1 (higher is more similar)
- Only jobs with existing embeddings are considered for matching
- The default threshold of 0.78 can be adjusted based on use case requirements
