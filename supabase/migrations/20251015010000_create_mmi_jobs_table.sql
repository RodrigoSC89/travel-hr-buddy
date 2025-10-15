-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create mmi_jobs table with embedding support
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 produces 1536-dimensional vectors
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Create index on embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_embedding ON public.mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_created_at ON public.mmi_jobs(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Allow public read access to mmi_jobs"
  ON public.mmi_jobs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_jobs"
  ON public.mmi_jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mmi_jobs"
  ON public.mmi_jobs
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create function to match similar jobs using cosine similarity
CREATE OR REPLACE FUNCTION match_mmi_jobs(
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
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_jobs.id,
    mmi_jobs.title,
    mmi_jobs.description,
    mmi_jobs.status,
    1 - (mmi_jobs.embedding <=> query_embedding) AS similarity,
    mmi_jobs.metadata,
    mmi_jobs.created_at
  FROM public.mmi_jobs
  WHERE mmi_jobs.embedding IS NOT NULL
    AND 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION match_mmi_jobs IS 'Find similar jobs based on embedding cosine similarity';

-- Add comments to the table
COMMENT ON TABLE public.mmi_jobs IS 'Stores MMI (Maritime Maintenance Inspection) jobs with AI embeddings for similarity search';
COMMENT ON COLUMN public.mmi_jobs.embedding IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
