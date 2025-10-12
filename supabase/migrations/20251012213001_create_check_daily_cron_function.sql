-- Create function to check if daily cron execution is healthy
-- Returns status 'warning' if last execution was more than 36 hours ago, 'ok' otherwise

create or replace function check_daily_cron_execution()
returns table(status text, message text)
language sql
as $$
  select
    case
      when max(executed_at) < now() - interval '36 hours'
        then 'warning'
      else 'ok'
    end as status,
    'Última execução: ' || max(executed_at) as message
  from cron_execution_logs
  where function_name = 'send-assistant-report-daily';
$$;
