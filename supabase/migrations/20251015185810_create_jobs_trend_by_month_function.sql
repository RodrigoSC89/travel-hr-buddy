-- Create RPC function to get job trend by month
-- This function returns completed jobs grouped by month for the last 6 months
CREATE OR REPLACE FUNCTION public.jobs_trend_by_month()
RETURNS TABLE (
  month text,
  total_jobs int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', completed_at), 'YYYY-MM') as month,
    count(*)::int as total_jobs
  FROM public.jobs
  WHERE status = 'completed'
    AND completed_at >= now() - interval '6 months'
  GROUP BY 1
  ORDER BY 1
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.jobs_trend_by_month IS 'Returns completed jobs grouped by month for the last 6 months. Ideal for trend charts (line or bar charts).';
