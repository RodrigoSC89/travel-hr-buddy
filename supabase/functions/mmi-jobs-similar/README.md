# MMI Jobs Similar Function

## Overview

This Supabase Edge Function provides job similarity search using AI-powered semantic embeddings. It finds the most similar jobs based on title and description analysis using OpenAI's `text-embedding-ada-002` model.

## Endpoint

```
GET /functions/v1/mmi-jobs-similar?jobId=<uuid>
```

## Parameters

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| jobId     | UUID   | Yes      | The ID of the job to find similar to  |

## Response

### Success (200)

```json
{
  "success": true,
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
  "count": 5
}
```

### Error (400)

```json
{
  "error": "Missing jobId parameter"
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

- **Semantic Search**: Uses OpenAI embeddings (text-embedding-ada-002) to understand job context
- **Cosine Similarity**: Calculates similarity scores between 0 and 1
- **Configurable Threshold**: Default match threshold of 0.78 (78% similarity)
- **Top Results**: Returns up to 5 most similar jobs (excluding the query job itself)
- **CORS Enabled**: Allows cross-origin requests

## Use Cases

1. **Suggest Similar Issues**: Find jobs that had similar problems and suggest resolutions
2. **Pattern Recognition**: Identify recurring issues across similar jobs
3. **Risk Assessment**: Alert if a current job resembles one that became a critical failure
4. **Technical History**: Show historical technical data by semantic similarity

## Example Usage

### Using cURL

```bash
curl -X GET 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/mmi-jobs-similar?jobId=550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Using JavaScript/TypeScript

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
