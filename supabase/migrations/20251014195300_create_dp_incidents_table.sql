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

-- Insert sample incidents for testing
INSERT INTO public.dp_incidents (id, title, incident_date, vessel, location, root_cause, class_dp, source, link, summary, tags) VALUES
('imca-2025-014', 'Loss of Position Due to Gyro Drift', '2025-09-12', 'DP Shuttle Tanker X', 'Campos Basin', 'Sensor drift not compensated', 'DP Class 2', 'IMCA Safety Flash 42/25', 'https://www.imca-int.com/safety-events/42-25/', 'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops. Thrusters responded late to positional errors. Operator initiated manual correction but system had exceeded excursion limits.', ARRAY['gyro', 'drive off', 'sensor', 'position loss']),
('imca-2025-009', 'Thruster Control Software Failure During ROV Ops', '2025-08-05', 'DP DSV Subsea Alpha', 'North Sea', 'Unexpected software reboot', 'DP Class 3', 'IMCA SF 37/25', 'https://www.imca-int.com/safety-events/37-25/', 'During critical ROV launch, the vessel experienced a momentary loss of thruster control due to unexpected software reboot. Position held, but manual override was required.', ARRAY['thruster', 'software', 'rov', 'reboot']),
('imca-2025-006', 'Reference System Failure in Heavy Weather', '2025-07-18', 'DP Drillship Beta', 'Gulf of Mexico', 'Multiple DGPS reference loss', 'DP Class 3', 'IMCA SF 31/25', 'https://www.imca-int.com/safety-events/31-25/', 'During heavy weather operations, the vessel lost multiple DGPS references simultaneously. Redundant system switched to acoustic positioning, but with degraded accuracy. Operations were suspended until conditions improved.', ARRAY['dgps', 'reference system', 'weather', 'acoustic']),
('imca-2024-089', 'Power Management System Malfunction', '2024-12-03', 'DP Construction Vessel Gamma', 'Santos Basin', 'PMS configuration error', 'DP Class 2', 'IMCA SF 89/24', 'https://www.imca-int.com/safety-events/89-24/', 'The Power Management System experienced a configuration error that resulted in unnecessary load shedding. While DP was maintained, several non-critical systems were powered down temporarily causing operational delays.', ARRAY['pms', 'power', 'load shedding', 'configuration']),
('imca-2024-076', 'Wind Sensor Calibration Issue', '2024-10-22', 'DP Pipelay Vessel Delta', 'West Africa', 'Incorrect wind sensor calibration', 'DP Class 2', 'IMCA SF 76/24', 'https://www.imca-int.com/safety-events/76-24/', 'During pipelaying operations, it was discovered that the wind sensor had been incorrectly calibrated after maintenance. This led to sub-optimal thruster allocation and increased fuel consumption before being detected.', ARRAY['wind sensor', 'calibration', 'thruster allocation'])
ON CONFLICT (id) DO NOTHING;
