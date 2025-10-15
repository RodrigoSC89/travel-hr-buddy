# MMI Jobs Similar - API Endpoint

## Overview

This Supabase Edge Function provides an AI-powered semantic search endpoint for finding similar maintenance jobs (MMI Jobs) using OpenAI embeddings and pgvector for vector similarity search.

## Endpoint

`POST /mmi-jobs-similar`

## Features

- **Semantic Search**: Uses OpenAI's `text-embedding-ada-002` model to generate embeddings
- **Vector Similarity**: Leverages pgvector for efficient cosine similarity search
- **Configurable Matching**: Adjustable threshold and result count
- **CORS Enabled**: Supports cross-origin requests

## Request

### Method
`POST`

### Headers
- `Content-Type: application/json`

### Body Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Text description to search for similar jobs |
| `match_threshold` | float | No | 0.7 | Minimum similarity threshold (0-1) |
| `match_count` | int | No | 10 | Maximum number of results to return |

### Example Request

```json
{
  "query": "hydraulic system preventive maintenance",
  "match_threshold": 0.7,
  "match_count": 5
}
```

## Response

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Manutenção preventiva do sistema hidráulico",
      "description": "Realizar manutenção preventiva completa...",
      "similarity": 0.92
    }
  ],
  "meta": {
    "query": "hydraulic system preventive maintenance",
    "match_threshold": 0.7,
    "match_count": 5,
    "results_count": 3,
    "timestamp": "2025-10-15T00:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Query text is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to generate embedding"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/mmi-jobs-similar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    query: 'valve inspection and safety check',
    match_threshold: 0.75,
    match_count: 10
  })
});

const result = await response.json();
console.log(result.data);
```

### cURL

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/mmi-jobs-similar' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "query": "motor oil filter replacement",
    "match_threshold": 0.7,
    "match_count": 5
  }'
```

## Technical Details

### Embedding Generation
- Model: `text-embedding-ada-002` (OpenAI)
- Dimensions: 1536
- Method: Cosine similarity

### Database Function
The endpoint uses the `match_mmi_jobs` PostgreSQL function:

```sql
match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
```

### Performance
- Vector index: IVFFlat with cosine distance
- Optimal for datasets with 100-1M+ records
- Average response time: < 500ms

## Integration with Frontend

The API can be integrated with the existing MMI Jobs Panel:

```typescript
import { supabase } from '@/lib/supabase';

async function findSimilarJobs(query: string) {
  const { data, error } = await supabase.functions.invoke('mmi-jobs-similar', {
    body: {
      query,
      match_threshold: 0.7,
      match_count: 10
    }
  });
  
  if (error) throw error;
  return data;
}
```

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `OPENAI_API_KEY`: OpenAI API key for embedding generation

## Deployment

The function is automatically deployed with Supabase CLI:

```bash
supabase functions deploy mmi-jobs-similar
```

## Rate Limiting

Consider implementing rate limiting based on your OpenAI API usage limits:
- OpenAI embeddings: ~3000 requests/minute
- Supabase functions: Based on your plan

## Security Notes

- Uses CORS headers for cross-origin requests
- Requires authentication via Supabase
- OpenAI API key is kept server-side
- RLS policies apply to database queries

## Future Enhancements

- [ ] Caching layer for common queries
- [ ] Batch embedding generation
- [ ] Multi-language support
- [ ] Integration with AI Copilot for automatic suggestions
- [ ] Historical learning from job outcomes
