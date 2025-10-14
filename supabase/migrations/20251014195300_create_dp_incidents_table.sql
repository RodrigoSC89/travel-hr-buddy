-- ===========================
-- DP INTELLIGENCE CENTER - IMCA Incidents Database
-- Dynamic Positioning Incidents tracking and analysis
-- ===========================

-- Create dp_incidents table for storing DP-related incidents from IMCA and other sources
CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  incident_date DATE NOT NULL,
  vessel TEXT,
  location TEXT,
  root_cause TEXT,
  class_dp TEXT,
  source TEXT NOT NULL,
  link TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_date ON public.dp_incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_source ON public.dp_incidents(source);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_class_dp ON public.dp_incidents(class_dp);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_tags ON public.dp_incidents USING GIN(tags);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read dp_incidents
CREATE POLICY "Allow authenticated users to read dp_incidents"
  ON public.dp_incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert/update dp_incidents (for API ingestion)
CREATE POLICY "Allow service role to manage dp_incidents"
  ON public.dp_incidents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.dp_incidents IS 'DP Intelligence Center - IMCA and industry DP incidents database for analysis and learning';

-- Add comments to columns
COMMENT ON COLUMN public.dp_incidents.id IS 'Unique incident identifier (e.g., imca-2025-014)';
COMMENT ON COLUMN public.dp_incidents.title IS 'Brief title of the incident';
COMMENT ON COLUMN public.dp_incidents.incident_date IS 'Date when the incident occurred';
COMMENT ON COLUMN public.dp_incidents.vessel IS 'Name or type of vessel involved';
COMMENT ON COLUMN public.dp_incidents.location IS 'Geographic location of the incident';
COMMENT ON COLUMN public.dp_incidents.root_cause IS 'Root cause analysis summary';
COMMENT ON COLUMN public.dp_incidents.class_dp IS 'DP Class of the vessel (e.g., DP Class 2, DP Class 3)';
COMMENT ON COLUMN public.dp_incidents.source IS 'Source of the incident report (IMCA, MTS, IMO, etc.)';
COMMENT ON COLUMN public.dp_incidents.link IS 'URL to the original incident report';
COMMENT ON COLUMN public.dp_incidents.summary IS 'Detailed summary of the incident';
COMMENT ON COLUMN public.dp_incidents.tags IS 'Array of tags for categorization and search (e.g., gyro, drive off, sensor)';
