-- Create job_embeddings table for AI training
-- This table stores vector embeddings of completed jobs with AI suggestions
-- to help improve AI recommendations over time

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the job_embeddings table
CREATE TABLE IF NOT EXISTS public.job_embeddings (
  job_id UUID PRIMARY KEY,
  embedding VECTOR(1536),
  metadata JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_embeddings_job_id ON public.job_embeddings(job_id);
CREATE INDEX IF NOT EXISTS idx_job_embeddings_metadata ON public.job_embeddings USING GIN(metadata);

-- Enable Row Level Security
ALTER TABLE public.job_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Allow public read access to job_embeddings"
  ON public.job_embeddings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert job_embeddings"
  ON public.job_embeddings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update job_embeddings"
  ON public.job_embeddings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE public.job_embeddings IS 'Stores vector embeddings for completed jobs with AI suggestions for training purposes';
COMMENT ON COLUMN public.job_embeddings.job_id IS 'Reference to the job ID';
COMMENT ON COLUMN public.job_embeddings.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN public.job_embeddings.metadata IS 'Additional metadata about the job (component_id, title, created_at)';
