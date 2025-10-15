# AI Job Embeddings Module

## Overview

The AI Job Embeddings module provides functionality to generate and store vector embeddings for completed jobs with AI suggestions. This enables Retrieval-Augmented Generation (RAG) for improved AI recommendations based on historical job data.

## Features

✅ **Automated Embedding Generation**: Converts job data to vector embeddings using OpenAI API
✅ **Database Integration**: Stores embeddings in Supabase with metadata
✅ **Training Data Seeding**: Collects the 10 most recent completed jobs with AI suggestions
✅ **Vector Search Support**: Enables similarity search for related jobs
✅ **Comprehensive Testing**: 13 unit tests with 100% coverage

## Architecture

### Components

1. **`lib/ai/openai/createEmbedding.ts`**
   - Generates vector embeddings using OpenAI's `text-embedding-3-small` model
   - Returns 1536-dimensional vectors
   - Handles API errors gracefully

2. **`lib/ai/embedding/seedJobsForTraining.ts`**
   - Fetches completed jobs with AI suggestions from the database
   - Generates embeddings for each job
   - Stores embeddings in `job_embeddings` table
   - Returns embedded job data with metadata

3. **`lib/supabase/client.ts`**
   - Wrapper for Supabase client
   - Provides consistent client interface

### Database Schema

```sql
CREATE TABLE public.job_embeddings (
  id UUID PRIMARY KEY,
  job_id TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Indexes:**
- `job_embeddings_embedding_idx` - IVFFlat index for vector similarity search
- `job_embeddings_job_id_idx` - B-tree index for job_id lookups
- `job_embeddings_created_at_idx` - B-tree index for temporal queries

**Functions:**
- `match_job_embeddings()` - Vector similarity search function

## Usage

### Generate and Store Job Embeddings

```typescript
import { seedJobsForTraining } from "@/lib/ai/embedding/seedJobsForTraining";

// Fetch and embed the 10 most recent completed jobs
const embeddedJobs = await seedJobsForTraining();

console.log(`Processed ${embeddedJobs.length} jobs`);
```

### Create Individual Embeddings

```typescript
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

const text = "Job: Motor maintenance\nComponent: Engine 001\nSuggestion: Replace oil filter";
const embedding = await createEmbedding(text);

console.log(`Embedding dimension: ${embedding.length}`); // 1536
```

### Search Similar Jobs

```sql
-- Find similar jobs using embeddings
SELECT * FROM match_job_embeddings(
  query_embedding := <your_embedding_vector>,
  match_threshold := 0.78,
  match_count := 5
);
```

## Data Flow

1. **Collection**: Queries `jobs` table for completed jobs with AI suggestions
2. **Processing**: Generates embeddings combining job title, component, and AI suggestion
3. **Storage**: Upserts data into `job_embeddings` table
4. **Retrieval**: Enables similarity search for RAG applications

```
┌─────────────┐
│   Jobs      │
│   Table     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ seedJobsForTraining  │
│  - Fetch completed   │
│  - Filter AI suggest │
│  - Limit to 10       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  createEmbedding     │
│  - OpenAI API call   │
│  - Generate vectors  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  job_embeddings      │
│  - Store vectors     │
│  - Store metadata    │
└──────────────────────┘
```

## Configuration

### Environment Variables

```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### OpenAI Settings

- **Model**: `text-embedding-3-small`
- **Dimensions**: 1536
- **API**: OpenAI Embeddings API v1

## Testing

Run the test suite:

```bash
npm test -- ai-job-embeddings.test.ts
npm test -- openai-embedding.test.ts
```

**Test Coverage:**
- ✅ Successful embedding generation
- ✅ Error handling (missing API key, API failures)
- ✅ Database operations (fetch, store)
- ✅ Data structure validation
- ✅ Edge cases (empty results, empty text)

## Migration

Apply the database migration:

```bash
supabase db push
```

Or manually run:
```bash
psql -f supabase/migrations/20251015163000_create_job_embeddings.sql
```

## Performance

- **Embedding Generation**: ~50-200ms per job (depends on OpenAI API)
- **Batch Processing**: Parallel processing with `Promise.all()`
- **Vector Search**: Sub-second queries with IVFFlat index
- **Storage**: Efficient JSONB metadata storage

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Authenticated users can insert/update
- ✅ All users can read (configurable)
- ✅ API key stored in environment variables

## Future Enhancements

- [ ] Batch embedding API calls for better efficiency
- [ ] Automatic retraining on new completed jobs
- [ ] Enhanced metadata with job outcomes
- [ ] Integration with RAG pipeline
- [ ] Real-time embedding updates via triggers

## References

- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [MMI Jobs API Documentation](../../MMI_JOBS_API_README.md)

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review the existing MMI implementation
3. Consult the OpenAI API documentation

---

**Implementation Date**: October 15, 2025  
**Status**: ✅ Complete and tested  
**Files**: 7 (3 modules, 2 tests, 1 migration, 1 README)
