-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create function to match MMI jobs by embedding similarity
CREATE OR REPLACE FUNCTION public.match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  component_id text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_maintenance_jobs.id,
    mmi_maintenance_jobs.title,
    mmi_maintenance_jobs.description,
    mmi_maintenance_jobs.component_id,
    mmi_maintenance_jobs.created_at,
    1 - (mmi_maintenance_jobs.embedding <=> query_embedding) as similarity
  FROM mmi_maintenance_jobs
  WHERE mmi_maintenance_jobs.embedding IS NOT NULL
    AND 1 - (mmi_maintenance_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_maintenance_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get jobs trend by month
CREATE OR REPLACE FUNCTION public.jobs_trend_by_month()
RETURNS TABLE (
  month text,
  count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
    COUNT(*) as count
  FROM mmi_maintenance_jobs
  WHERE created_at >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', created_at)
  ORDER BY DATE_TRUNC('month', created_at) DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.match_mmi_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION public.jobs_trend_by_month TO authenticated;