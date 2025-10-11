-- Create RPC function to get restore count by day for dashboard metrics
CREATE OR REPLACE FUNCTION public.get_restore_count_by_day()
RETURNS TABLE(day date, count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    date_trunc('day', restored_at)::date as day,
    count(*) as count
  FROM public.document_restore_logs
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT 15
$$;
