# AI Job Embeddings - Implementation Summary

## Overview

This implementation provides functionality to seed job embeddings for AI training purposes. It fetches completed jobs with AI suggestions, generates embeddings, and stores them in a dedicated table for future ML/AI analysis.

## Files Created

### 1. Core Implementation

#### `/src/lib/ai/embedding/seedJobsForTraining.ts`
The main function that:
- Fetches the 10 most recent completed jobs with AI suggestions
- Generates embeddings for each job using OpenAI
- Stores the embeddings in the `job_embeddings` table

#### `/src/lib/ai/openai/createEmbedding.ts`
A wrapper function that:
- Re-exports the existing `generateEmbedding` function from `@/services/mmi/embeddingService`
- Provides a consistent interface for creating embeddings

#### `/src/lib/supabase/client.ts`
A helper function that:
- Re-exports the Supabase client from `@/integrations/supabase/client`
- Provides a consistent interface for database operations

### 2. Database Migration

#### `/supabase/migrations/20251015170000_create_job_embeddings.sql`
SQL migration that:
- Enables the `pgvector` extension
- Creates the `job_embeddings` table with:
  - `job_id` (UUID, primary key)
  - `embedding` (VECTOR(1536))
  - `metadata` (JSONB)
- Creates indexes for performance
- Enables Row Level Security (RLS)
- Sets up access policies

### 3. Tests

#### `/src/tests/seedJobsForTraining.test.ts`
Comprehensive unit tests that verify:
- Jobs are fetched correctly
- Embeddings are generated with correct dimensions
- Metadata is preserved
- Data is structured correctly

## Database Schema

```sql
CREATE TABLE job_embeddings (
  job_id UUID PRIMARY KEY,
  embedding VECTOR(1536),
  metadata JSONB
);
```

### Table Structure
- **job_id**: Unique identifier referencing the original job
- **embedding**: 1536-dimensional vector from OpenAI's text-embedding-3-small model
- **metadata**: JSON object containing:
  - `component_id`: The component associated with the job
  - `title`: The job title
  - `created_at`: When the job was created

## Usage

```typescript
import { seedJobsForTraining } from '@/lib/ai/embedding/seedJobsForTraining';

// Seed the database with job embeddings
const embeddedJobs = await seedJobsForTraining();

console.log(`Successfully seeded ${embeddedJobs.length} job embeddings`);
```

## Requirements

1. **Database Setup**: Run the migration to create the `job_embeddings` table:
   ```sql
   -- Run this in Supabase SQL editor or via CLI
   psql < supabase/migrations/20251015170000_create_job_embeddings.sql
   ```

2. **OpenAI API Key**: Configure `VITE_OPENAI_API_KEY` in your environment

3. **Jobs Table**: Ensure you have a `jobs` table with the following columns:
   - `id` (UUID)
   - `title` (TEXT)
   - `component_id` (TEXT)
   - `status` (TEXT)
   - `ai_suggestion` (TEXT)
   - `created_at` (TIMESTAMP)

## Testing

Run the tests to verify the implementation:

```bash
npm test -- src/tests/seedJobsForTraining.test.ts
```

## How It Works

1. **Fetch Jobs**: Queries the `jobs` table for the 10 most recent completed jobs that have AI suggestions
2. **Generate Embeddings**: For each job, creates a text representation combining:
   - Job title
   - Component ID
   - AI suggestion
3. **Store Embeddings**: Upserts each embedding into the `job_embeddings` table with metadata
4. **Return Results**: Returns an array of embedded jobs with their IDs, embeddings, and metadata

## Benefits

- **AI Training**: Provides a corpus of completed jobs with embeddings for training future AI models
- **Similarity Search**: Enables finding similar jobs based on semantic meaning
- **Historical Context**: Preserves metadata about each job for analysis
- **Incremental Updates**: Uses upsert to allow re-running without duplicates

## Notes

- The embedding model used is `text-embedding-3-small` with 1536 dimensions
- If OpenAI API is not available, the system falls back to mock embeddings for development
- The function can be run multiple times safely (upserts prevent duplicates)
- Fetches only the 10 most recent jobs to limit API calls and processing time

## Future Enhancements

Possible improvements:
- Add pagination to process more than 10 jobs
- Implement batch processing for large datasets
- Add filtering options (by date range, component, etc.)
- Create a similarity search function using the stored embeddings
- Add monitoring/logging for tracking embedding generation
