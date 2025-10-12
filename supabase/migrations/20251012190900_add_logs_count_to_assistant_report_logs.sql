-- Add logs_count column to assistant_report_logs table
-- This field tracks the number of interactions included in the report
ALTER TABLE public.assistant_report_logs 
ADD COLUMN IF NOT EXISTS logs_count INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN public.assistant_report_logs.logs_count IS 'Number of assistant log interactions included in the report';
