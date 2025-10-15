-- Create match_job_embeddings function as an alias to match_mmi_jobs
-- This provides a more generic interface for RAG queries

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
COMMENT ON FUNCTION match_job_embeddings IS 'Find similar jobs based on embedding cosine similarity using RAG (Retrieval-Augmented Generation)';
