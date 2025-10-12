-- Create function to check if daily cron jobs have executed within expected timeframe
-- This function is called by monitor-cron-health to detect missing executions

CREATE OR REPLACE FUNCTION check_daily_cron_execution(
  p_function_name TEXT DEFAULT 'send-daily-assistant-report',
  p_hours_threshold INTEGER DEFAULT 36
)
RETURNS TABLE(
  status TEXT,
  message TEXT,
  last_execution TIMESTAMPTZ,
  hours_since_last_execution NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_execution TIMESTAMPTZ;
  v_hours_since NUMERIC;
BEGIN
  -- Get the most recent successful execution
  SELECT executed_at INTO v_last_execution
  FROM cron_execution_logs
  WHERE function_name = p_function_name
    AND status = 'success'
  ORDER BY executed_at DESC
  LIMIT 1;

  -- If no execution found, return warning
  IF v_last_execution IS NULL THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      format('No successful execution found for %s', p_function_name)::TEXT,
      NULL::TIMESTAMPTZ,
      NULL::NUMERIC;
    RETURN;
  END IF;

  -- Calculate hours since last execution
  v_hours_since := EXTRACT(EPOCH FROM (NOW() - v_last_execution)) / 3600;

  -- Check if execution is overdue
  IF v_hours_since > p_hours_threshold THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      format(
        'Function %s has not executed successfully in %.1f hours (threshold: %s hours)',
        p_function_name,
        v_hours_since,
        p_hours_threshold
      )::TEXT,
      v_last_execution,
      v_hours_since;
  ELSE
    RETURN QUERY SELECT 
      'ok'::TEXT,
      format(
        'Function %s executed successfully %.1f hours ago',
        p_function_name,
        v_hours_since
      )::TEXT,
      v_last_execution,
      v_hours_since;
  END IF;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION check_daily_cron_execution IS 
  'Checks if a daily cron job has executed within the expected timeframe. Returns warning if execution is overdue.';

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION check_daily_cron_execution TO service_role;
