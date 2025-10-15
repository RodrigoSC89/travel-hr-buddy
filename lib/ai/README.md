# AI Copilot RAG Query Module

## Overview

The AI Copilot RAG (Retrieval-Augmented Generation) Query module provides semantic search capabilities for historical job data using OpenAI embeddings and PostgreSQL vector similarity search. This enables the Copilot to learn from past maintenance patterns and provide context-aware suggestions.

## Features

- 🔍 **Semantic Search**: Find similar historical jobs using vector embeddings
- 🧠 **Context-Aware**: Use historical data to inform new maintenance suggestions
- 📈 **Pattern Learning**: Learn technical patterns specific to each vessel/situation
- ⚡ **Fast Queries**: Optimized vector similarity search with pgvector
- 🎯 **High Accuracy**: Configurable similarity threshold (default: 0.78)
- 🔒 **Type-Safe**: Full TypeScript support with proper type definitions

## File Structure

```
lib/
├── ai/
│   ├── copilot/
│   │   └── querySimilarJobs.ts      # Main RAG query function
│   └── openai/
│       └── createEmbedding.ts       # OpenAI embedding generation
└── supabase/
    └── client.ts                     # Supabase client helper
```

## Core Functions

### querySimilarJobs

Query similar jobs using RAG (Retrieval-Augmented Generation).

```typescript
async function querySimilarJobs(
  userInput: string, 
  limit?: number
): Promise<SimilarJob[]>
```

**Parameters:**
- `userInput` (string): The user's query or job description
- `limit` (number, optional): Maximum number of results to return (default: 5)

**Returns:**
- Promise resolving to an array of similar jobs with similarity scores

**Example:**
```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';

const similarJobs = await querySimilarJobs(
  "Gerador apresentando ruído anormal",
  5
);

console.log(similarJobs);
// [
//   {
//     id: "550e8400-e29b-41d4-a716-446655440001",
//     title: "Falha no gerador STBD",
//     description: "Gerador STBD apresentando ruído incomum...",
//     status: "completed",
//     similarity: 0.89,
//     metadata: { component: "Gerador Diesel", vessel: "Navio Atlantic Star" },
//     created_at: "2024-04-15T00:00:00Z"
//   },
//   ...
// ]
```

### createEmbedding

Generate vector embeddings for text using OpenAI's API.

```typescript
async function createEmbedding(text: string): Promise<number[]>
```

**Parameters:**
- `text` (string): The text to create an embedding for

**Returns:**
- Promise resolving to a 1536-dimensional vector array

**Example:**
```typescript
import { createEmbedding } from '@/lib/ai/openai/createEmbedding';

const embedding = await createEmbedding("Motor apresentando vibração");
console.log(embedding.length); // 1536
```

## Database Setup

### Required PostgreSQL Extension

The module requires the `pgvector` extension for vector similarity search:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### RPC Function

The `match_job_embeddings` function performs vector similarity search:

```sql
CREATE OR REPLACE FUNCTION match_job_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
```

**Parameters:**
- `query_embedding`: 1536-dimensional vector from OpenAI
- `match_threshold`: Minimum similarity score (0-1, default: 0.78)
- `match_count`: Maximum number of results (default: 5)

## Configuration

### Environment Variables

Required environment variables:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Similarity Threshold

The default similarity threshold is **0.78** (78% similarity). This can be adjusted in the RPC function call for different use cases:

- **0.90+**: Very high similarity (near-duplicates)
- **0.78**: High similarity (recommended default)
- **0.60**: Moderate similarity (broader matches)
- **0.40**: Low similarity (very broad matches)

## Usage Examples

### Example 1: Basic Query

```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';

async function findSimilarMaintenance() {
  try {
    const results = await querySimilarJobs(
      "Bomba hidráulica com vazamento",
      5
    );
    
    console.log(`Found ${results.length} similar jobs`);
    results.forEach(job => {
      console.log(`- ${job.title} (${(job.similarity * 100).toFixed(0)}% similar)`);
    });
  } catch (error) {
    console.error("Error querying similar jobs:", error);
  }
}
```

### Example 2: Integration with Copilot

```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';
import OpenAI from 'openai';

async function getCopilotSuggestion(userInput: string) {
  // Get similar historical jobs
  const similarJobs = await querySimilarJobs(userInput, 3);
  
  // Use as context for AI suggestion
  const context = similarJobs.map(job => 
    `Job: ${job.title}\nAction: ${job.description}\nOutcome: ${job.status}`
  ).join('\n\n');
  
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: "You are a maritime maintenance expert. Use the historical context to provide suggestions." 
      },
      { 
        role: "user", 
        content: `Context from similar jobs:\n${context}\n\nUser query: ${userInput}` 
      }
    ],
  });
  
  return response.choices[0].message.content;
}
```

### Example 3: React Component

```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';
import { useState } from 'react';

function SimilarJobsSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const jobs = await querySimilarJobs(query, 5);
      setResults(jobs);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe the maintenance issue..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Find Similar Jobs'}
      </button>

      {results.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <span>Similarity: {(job.similarity * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Custom Limit

```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';

// Get top 10 most similar jobs
const topTen = await querySimilarJobs("Falha elétrica", 10);

// Get only the best match
const bestMatch = await querySimilarJobs("Sensor temperatura", 1);

// Use default limit of 5
const defaultResults = await querySimilarJobs("Manutenção preventiva");
```

## How It Works

1. **User Input**: User provides a description of their maintenance issue
2. **Embedding Creation**: Convert text to 1536-dimensional vector using OpenAI
3. **Vector Search**: Query PostgreSQL with pgvector for similar embeddings
4. **Ranking**: Results sorted by cosine similarity score
5. **Filtering**: Only return results above the similarity threshold (0.78)
6. **Context**: Use results to inform AI-powered suggestions

## Benefits

- ✨ **Semantic Understanding**: Goes beyond keyword matching to understand meaning
- 🧠 **Learning from History**: Leverages past successful resolutions
- 📈 **Pattern Recognition**: Identifies recurring issues and solutions
- ⚡ **Fast Performance**: Optimized vector search with PostgreSQL indexing
- 🎯 **High Relevance**: Configurable threshold ensures quality results
- 🔒 **Type Safety**: Full TypeScript support prevents errors
- 📊 **Scalable**: Handles large historical datasets efficiently

## Testing

The module includes comprehensive test coverage:

```typescript
// Run tests
npm test src/tests/query-similar-jobs.test.ts
```

Test coverage includes:
- Function signature validation
- Return structure verification
- Similarity threshold validation
- Parameter handling
- Error scenarios
- RAG capabilities

## Troubleshooting

### Error: "OpenAI API key not configured"

Ensure `VITE_OPENAI_API_KEY` is set in your `.env` file.

### Error: "Error fetching similar examples"

Check that:
1. Supabase is properly configured
2. The `match_job_embeddings` RPC function exists
3. The `mmi_jobs` table has embedding data
4. Network connectivity is available

### Low Similarity Scores

If all results have low similarity scores:
1. Lower the `match_threshold` parameter
2. Check that embeddings are properly generated for historical jobs
3. Verify the quality of historical job descriptions

## Integration Points

This module integrates with:

- **MMI Copilot API**: `/src/services/mmi/copilotApi.ts`
- **Embedding Service**: `/src/services/mmi/embeddingService.ts`
- **Workflow Copilot**: `/src/services/workflow-copilot.ts`
- **Nautilus Copilot Advanced**: `/src/components/ai/nautilus-copilot-advanced.tsx`

## Migration

The database migration is located at:
```
supabase/migrations/20251015163000_create_match_job_embeddings.sql
```

Apply it with:
```bash
supabase migration up
```

## Contributing

To extend this module:

1. Add new AI capabilities in `/lib/ai/`
2. Ensure TypeScript types are properly defined
3. Add comprehensive tests
4. Update this README with new features
5. Follow existing code patterns and conventions

## License

This module is part of the Nautilus Travel HR Buddy project.
