-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create mmi_jobs table for storing maintenance jobs with AI embeddings
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'awaiting_parts')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    component_name TEXT,
    asset_name TEXT,
    vessel TEXT,
    suggestion_ia TEXT,
    can_postpone BOOLEAN DEFAULT true,
    
    -- Vector embedding for similarity search (OpenAI ada-002 uses 1536 dimensions)
    embedding vector(1536),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read jobs
CREATE POLICY "Users can view mmi_jobs"
    ON public.mmi_jobs
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create jobs
CREATE POLICY "Users can create mmi_jobs"
    ON public.mmi_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update jobs
CREATE POLICY "Users can update mmi_jobs"
    ON public.mmi_jobs
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow users to delete jobs
CREATE POLICY "Users can delete mmi_jobs"
    ON public.mmi_jobs
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_jobs_updated_at
    BEFORE UPDATE ON public.mmi_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_mmi_jobs_created_at ON public.mmi_jobs(created_at DESC);
CREATE INDEX idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX idx_mmi_jobs_priority ON public.mmi_jobs(priority);
CREATE INDEX idx_mmi_jobs_due_date ON public.mmi_jobs(due_date);

-- Create vector similarity index for fast nearest neighbor search
CREATE INDEX idx_mmi_jobs_embedding ON public.mmi_jobs 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Create the match_mmi_jobs function for semantic similarity search
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  similarity float
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.description,
    1 - (j.embedding <=> query_embedding) as similarity
  FROM mmi_jobs j
  WHERE j.embedding IS NOT NULL
    AND (j.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION match_mmi_jobs IS 'Find similar MMI jobs using vector similarity search with pgvector. Uses cosine distance for semantic matching.';
