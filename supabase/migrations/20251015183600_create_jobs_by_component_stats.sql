-- ============================================================================
-- Jobs By Component Stats RPC Function
-- Description: Analytics function to get job counts and average execution time by component
-- Created: 2025-10-15
-- ============================================================================

CREATE OR REPLACE FUNCTION jobs_by_component_stats()
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS component_id,
    c.component_name,
    COUNT(j.id) AS total_jobs,
    -- Calculate average time from created_at to completed_date (in days)
    -- Only for completed jobs where completed_date is set
    AVG(
      CASE 
        WHEN j.status = 'completed' AND j.completed_date IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (j.completed_date::timestamp - j.created_at)) / 86400
        ELSE NULL
      END
    ) AS avg_execution_time_days,
    COUNT(CASE WHEN j.status = 'pending' THEN 1 END) AS pending_jobs,
    COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) AS in_progress_jobs,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs
  FROM public.mmi_components c
  LEFT JOIN public.mmi_jobs j ON c.id = j.component_id
  GROUP BY c.id, c.component_name
  ORDER BY total_jobs DESC, c.component_name ASC;
END;
$$;

-- Add comment to describe the function
COMMENT ON FUNCTION jobs_by_component_stats() IS 'Returns job statistics grouped by component including total count and average execution time';
