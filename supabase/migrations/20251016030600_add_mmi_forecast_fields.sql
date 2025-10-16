-- Add forecast-related fields to mmi_jobs table for email reporting
-- These fields support the MMI forecast email cron job

ALTER TABLE public.mmi_jobs 
  ADD COLUMN IF NOT EXISTS forecast TEXT,
  ADD COLUMN IF NOT EXISTS hours NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS responsible TEXT,
  ADD COLUMN IF NOT EXISTS forecast_date TIMESTAMPTZ DEFAULT NOW();

-- Create index for forecast_date to optimize queries
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_forecast_date ON public.mmi_jobs(forecast_date DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.mmi_jobs.forecast IS 'Maintenance forecast timing (e.g., "Em 72h", "Em 168h")';
COMMENT ON COLUMN public.mmi_jobs.hours IS 'Estimated hours for the maintenance job';
COMMENT ON COLUMN public.mmi_jobs.responsible IS 'Person responsible for the maintenance job';
COMMENT ON COLUMN public.mmi_jobs.forecast_date IS 'Date when the forecast was generated';
