-- Fix missing columns causing database errors

-- 1. Add incident_date to incident_reports (if not exists)
-- The table has 'reported_at' but code references 'incident_date'
ALTER TABLE public.incident_reports 
ADD COLUMN IF NOT EXISTS incident_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing rows to use reported_at value
UPDATE public.incident_reports 
SET incident_date = COALESCE(reported_at, created_at, now()) 
WHERE incident_date IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident_date 
ON public.incident_reports(incident_date DESC);

-- 2. Add status column to dp_incidents
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'open', 'analyzed', 'resolved', 'closed'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_status 
ON public.dp_incidents(status);

-- Add comment for documentation
COMMENT ON COLUMN public.incident_reports.incident_date IS 'Date when the incident occurred';
COMMENT ON COLUMN public.dp_incidents.status IS 'Analysis status: pending, open, analyzed, resolved, closed';