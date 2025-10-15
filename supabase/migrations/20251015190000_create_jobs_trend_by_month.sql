-- Create function to get jobs trend by month
CREATE OR REPLACE FUNCTION jobs_trend_by_month()
RETURNS TABLE (
  month TEXT,
  job_count BIGINT,
  year INT,
  month_number INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', mmi_jobs.created_at), 'Mon YYYY') AS month,
    COUNT(*) AS job_count,
    EXTRACT(YEAR FROM mmi_jobs.created_at)::INT AS year,
    EXTRACT(MONTH FROM mmi_jobs.created_at)::INT AS month_number
  FROM public.mmi_jobs
  WHERE mmi_jobs.created_at IS NOT NULL
  GROUP BY DATE_TRUNC('month', mmi_jobs.created_at), year, month_number
  ORDER BY year DESC, month_number DESC;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION jobs_trend_by_month IS 'Returns the count of jobs grouped by month for trend analysis';
