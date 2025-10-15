-- ============================================================================
-- Create jobs_by_component_stats RPC Function
-- Description: Returns statistics about completed jobs by component
-- Created: 2025-10-15
-- ============================================================================

-- Add completed_at column to mmi_jobs table if it doesn't exist
-- This allows precise tracking of completion timestamp for duration calculations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mmi_jobs' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.mmi_jobs 
    ADD COLUMN completed_at TIMESTAMPTZ;
    
    -- Create index for performance on completed_at queries
    CREATE INDEX IF NOT EXISTS idx_mmi_jobs_completed_at 
    ON public.mmi_jobs(completed_at);
    
    RAISE NOTICE 'Added completed_at column to mmi_jobs table';
  END IF;
END $$;

-- Create the jobs_by_component_stats RPC function
CREATE OR REPLACE FUNCTION public.jobs_by_component_stats()
RETURNS TABLE (
  component_id text,
  count int,
  avg_duration numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    component_id::text,
    count(*)::int as count,
    avg(extract(epoch from completed_at - created_at)/3600) as avg_duration
  FROM public.mmi_jobs
  WHERE status = 'completed' 
    AND completed_at IS NOT NULL
    AND created_at IS NOT NULL
  GROUP BY component_id
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.jobs_by_component_stats IS 'Returns statistics about completed jobs by component: component_id, count of completed jobs, and average duration in hours';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.jobs_by_component_stats TO authenticated, anon;
