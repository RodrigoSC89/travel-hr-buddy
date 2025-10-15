# MMI Jobs Similar Function

## Overview

This Supabase Edge Function provides job similarity search using AI-powered semantic embeddings. It finds the most similar jobs based on title and description analysis using OpenAI's `text-embedding-ada-002` model.

The function supports two modes:
1. **GET with jobId**: Find jobs similar to an existing job in the database
2. **POST with query**: Find jobs similar to a free-form text query (semantic search)

## Endpoints

### GET - Find Similar Jobs by Job ID

```
GET /functions/v1/mmi-jobs-similar?jobId=<uuid>
```

#### Parameters

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| jobId     | UUID   | Yes      | The ID of the job to find similar to  |

#### Response (200)

```json
{
  "success": true,
  "job_id": "uuid",
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
  "count": 5
}
```

### POST - Semantic Search with Text Query

```
POST /functions/v1/mmi-jobs-similar
Content-Type: application/json

{
  "query": "hydraulic system maintenance",
  "match_threshold": 0.7,
  "match_count": 10
}
```

#### Request Body

| Parameter       | Type   | Required | Default | Description                                    |
|----------------|--------|----------|---------|------------------------------------------------|
| query          | string | Yes      | -       | Text query for semantic search                 |
| match_threshold| float  | No       | 0.78    | Minimum similarity score (0-1)                 |
| match_count    | int    | No       | 5       | Maximum number of results to return            |

#### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Manutenção preventiva do sistema hidráulico",
      "description": "Job description",
      "status": "active",
      "similarity": 0.92,
      "metadata": {},
      "created_at": "2025-10-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "query": "hydraulic system maintenance",
    "results_count": 5,
    "timestamp": "2025-10-15T00:00:00.000Z"
  }
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
  "error": "Missing or invalid 'query' parameter in request body"
}
```

### Error (404) - Job Not Found

```json
{
  "error": "Job not found"
}
```

### Error (405) - Method Not Allowed

```json
{
  "error": "Method not allowed. Use GET or POST"
}
```

### Error (500) - Server Error

```json
{
  "error": "Error message",
  "success": false
}
```

## Features

- **Dual Mode Operation**: 
  - GET endpoint for finding similar jobs to existing ones
  - POST endpoint for semantic search with any text query
- **Semantic Search**: Uses OpenAI embeddings (text-embedding-ada-002) to understand job context
- **Cosine Similarity**: Calculates similarity scores between 0 and 1
- **Configurable Parameters**: 
  - Adjustable match threshold (default: 0.78 / 78% similarity)
  - Customizable result count (default: 5 results)
- **CORS Enabled**: Allows cross-origin requests

## Use Cases

### 1. Find Similar Existing Jobs (GET)
When reviewing a job, find other similar jobs in your history:
```
"What other jobs are like this one?"
```

### 2. Semantic Search (POST)
Search for jobs using natural language descriptions:
```
"Find maintenance work related to hydraulic systems"
"Show me all electrical panel issues"
```

### 3. Pattern Recognition
Identify recurring issues across similar jobs by querying:
```
"engine overheating problems"
```

### 4. Risk Assessment
Alert if a current description resembles previous critical failures:
```
"cooling system failure emergency"
```

### 5. Technical History
Show historical technical data by semantic similarity:
```
"pump replacement procedures"
```

## Example Usage

### GET Request - Using cURL

```bash
curl -X GET 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar?jobId=550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### POST Request - Using cURL

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

### GET Request - Using JavaScript/TypeScript

```typescript
// Find similar jobs to an existing job
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

### POST Request - Using JavaScript/TypeScript

```typescript
// Semantic search with a text query
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
console.log('Search results:', data.data);
console.log('Found', data.meta.results_count, 'matching jobs');
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
