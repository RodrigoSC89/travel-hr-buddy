-- ============================================================================
-- Jobs By Component Stats RPC Function
-- Description: Provides comprehensive BI analytics for maintenance jobs
--              grouped by component with execution time and status breakdown
-- Version: 1.0.0
-- Created: 2025-10-15
-- ============================================================================

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS public.jobs_by_component_stats();

-- Create RPC function for jobs by component statistics
CREATE OR REPLACE FUNCTION public.jobs_by_component_stats()
RETURNS TABLE (
  component_id UUID,
  component_name TEXT,
  total_jobs BIGINT,
  avg_execution_time_days NUMERIC,
  pending_jobs BIGINT,
  in_progress_jobs BIGINT,
  completed_jobs BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS component_id,
    c.component_name,
    COUNT(j.id) AS total_jobs,
    -- Calculate average execution time only for completed jobs with completed_date
    AVG(
      CASE 
        WHEN j.status = 'completed' AND j.completed_date IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (j.completed_date::TIMESTAMP - j.created_at)) / 86400.0
        ELSE NULL
      END
    )::NUMERIC(10,1) AS avg_execution_time_days,
    -- Count jobs by status
    COUNT(CASE WHEN j.status = 'pending' THEN 1 END) AS pending_jobs,
    COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) AS in_progress_jobs,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs
  FROM 
    public.mmi_components c
  LEFT JOIN 
    public.mmi_jobs j ON c.id = j.component_id
  GROUP BY 
    c.id, c.component_name
  ORDER BY 
    total_jobs DESC, 
    c.component_name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.jobs_by_component_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.jobs_by_component_stats() TO anon;

-- Add comment
COMMENT ON FUNCTION public.jobs_by_component_stats() IS 
  'Returns comprehensive BI analytics for maintenance jobs grouped by component including total counts, average execution time, and status breakdown';
