-- Create job_embeddings table for storing AI job training data
-- This table stores vector embeddings of completed jobs for RAG (Retrieval-Augmented Generation)

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create job_embeddings table
CREATE TABLE IF NOT EXISTS public.job_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS job_embeddings_embedding_idx ON public.job_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for job_id lookups
CREATE INDEX IF NOT EXISTS job_embeddings_job_id_idx ON public.job_embeddings(job_id);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS job_embeddings_created_at_idx ON public.job_embeddings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.job_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all job_embeddings" 
  ON public.job_embeddings FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert job_embeddings" 
  ON public.job_embeddings FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update job_embeddings" 
  ON public.job_embeddings FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_job_embeddings_updated_at
  BEFORE UPDATE ON public.job_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to match similar jobs using embeddings
CREATE OR REPLACE FUNCTION match_job_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  job_id TEXT,
  metadata JSONB,
  similarity float,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    job_embeddings.id,
    job_embeddings.job_id,
    job_embeddings.metadata,
    1 - (job_embeddings.embedding <=> query_embedding) as similarity,
    job_embeddings.created_at
  FROM public.job_embeddings
  WHERE job_embeddings.embedding IS NOT NULL
    AND 1 - (job_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY job_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment to table
COMMENT ON TABLE public.job_embeddings IS 'Stores vector embeddings of completed jobs with AI suggestions for RAG (Retrieval-Augmented Generation)';
