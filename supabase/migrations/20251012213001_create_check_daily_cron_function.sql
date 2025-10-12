-- Create function to check if daily cron has executed recently
CREATE OR REPLACE FUNCTION check_daily_cron_execution()
RETURNS TABLE (
  status TEXT,
  message TEXT,
  last_execution TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_exec_time TIMESTAMPTZ;
  hours_since_exec NUMERIC;
BEGIN
  -- Get the last successful execution of send-assistant-report-daily
  SELECT executed_at INTO last_exec_time
  FROM cron_execution_logs
  WHERE function_name = 'send-assistant-report-daily'
    AND status = 'success'
  ORDER BY executed_at DESC
  LIMIT 1;

  -- If no execution found, return warning
  IF last_exec_time IS NULL THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      'No successful execution found for send-assistant-report-daily'::TEXT,
      NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Calculate hours since last execution
  hours_since_exec := EXTRACT(EPOCH FROM (NOW() - last_exec_time)) / 3600;

  -- Check if execution is overdue (more than 36 hours)
  IF hours_since_exec > 36 THEN
    RETURN QUERY SELECT 
      'warning'::TEXT,
      format('Last execution was %s hours ago at %s', 
        ROUND(hours_since_exec::NUMERIC, 2), 
        last_exec_time::TEXT
      )::TEXT,
      last_exec_time;
  ELSE
    RETURN QUERY SELECT 
      'ok'::TEXT,
      format('Last execution was %s hours ago at %s', 
        ROUND(hours_since_exec::NUMERIC, 2), 
        last_exec_time::TEXT
      )::TEXT,
      last_exec_time;
  END IF;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION check_daily_cron_execution() IS 
'Checks if send-assistant-report-daily has executed within the last 36 hours. Returns status=warning if overdue, ok otherwise.';
