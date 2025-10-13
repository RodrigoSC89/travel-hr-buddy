-- Update SQL function to check cron execution using cron_execution_logs table
-- This function checks if send-assistant-report-daily has executed within the last 36 hours

CREATE OR REPLACE FUNCTION public.check_daily_cron_execution()
RETURNS TABLE(status TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_execution_time TIMESTAMP WITH TIME ZONE;
  hours_since_execution NUMERIC;
BEGIN
  -- Get the most recent successful execution from cron_execution_logs
  SELECT MAX(executed_at) INTO last_execution_time
  FROM public.cron_execution_logs
  WHERE function_name = 'send-daily-assistant-report'
    AND status = 'success';

  -- If no executions found at all
  IF last_execution_time IS NULL THEN
    RETURN QUERY SELECT 
      'warning'::TEXT as status,
      'Nenhuma execução do cron encontrada no histórico'::TEXT as message;
    RETURN;
  END IF;

  -- Calculate hours since last execution
  hours_since_execution := EXTRACT(EPOCH FROM (NOW() - last_execution_time)) / 3600;

  -- Check if last execution was more than 36 hours ago
  IF hours_since_execution > 36 THEN
    RETURN QUERY SELECT 
      'warning'::TEXT as status,
      format('Última execução há %s horas. Última execução: %s', 
        ROUND(hours_since_execution, 1),
        to_char(last_execution_time, 'DD/MM/YYYY HH24:MI:SS')
      )::TEXT as message;
  ELSE
    RETURN QUERY SELECT 
      'ok'::TEXT as status,
      format('Cron executado normalmente. Última execução há %s horas', 
        ROUND(hours_since_execution, 1)
      )::TEXT as message;
  END IF;

  RETURN;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.check_daily_cron_execution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_daily_cron_execution() TO service_role;

-- Add comment explaining the function
COMMENT ON FUNCTION public.check_daily_cron_execution() IS 
  'Checks if the daily assistant report cron (send-daily-assistant-report) has executed successfully in the last 36 hours. Returns status ''ok'' or ''warning'' with a descriptive message.';
