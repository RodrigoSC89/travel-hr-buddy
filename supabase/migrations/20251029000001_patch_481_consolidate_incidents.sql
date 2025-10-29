-- PATCH 481: Consolidate incident-reports/ and incidents/
-- This migration consolidates duplicate incident tables and routes
-- Keeping incident_reports as the primary table

-- Add comments to mark incident_reports as the canonical incidents table
COMMENT ON TABLE public.incident_reports IS 'PATCH 481: Primary incidents table - consolidated from multiple incident tables';

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident_date ON public.incident_reports(incident_date);
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at ON public.incident_reports(created_at);

-- Ensure incident_reports has all necessary columns for consolidated functionality
DO $$ 
BEGIN
  -- Add ai_analysis column if it doesn't exist (for AI Incident Replay)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'incident_reports' 
    AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE public.incident_reports ADD COLUMN ai_analysis JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add replay_status column if it doesn't exist (for AI Incident Replay tracking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'incident_reports' 
    AND column_name = 'replay_status'
  ) THEN
    ALTER TABLE public.incident_reports ADD COLUMN replay_status TEXT DEFAULT 'not_replayed';
  END IF;

  -- Add last_replayed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'incident_reports' 
    AND column_name = 'last_replayed_at'
  ) THEN
    ALTER TABLE public.incident_reports ADD COLUMN last_replayed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create or replace view that unifies all incident sources for backward compatibility
CREATE OR REPLACE VIEW public.incidents_unified AS
SELECT 
  id,
  incident_number as code,
  title,
  description,
  category as type,
  severity,
  status,
  reported_by,
  assigned_to,
  incident_date as reported_at,
  resolved_at as closed_at,
  location,
  ai_analysis as metadata,
  created_at,
  updated_at,
  'incident_reports' as source_table
FROM public.incident_reports
WHERE id IS NOT NULL;

COMMENT ON VIEW public.incidents_unified IS 'PATCH 481: Unified view of all incidents - use this for queries that need all incident data';

-- Grant appropriate permissions
GRANT SELECT ON public.incidents_unified TO authenticated;
GRANT ALL ON public.incident_reports TO authenticated;
