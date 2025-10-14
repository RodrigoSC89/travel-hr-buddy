-- ===========================
-- DP Intelligence Center - IMCA Safety Flash Integration
-- Table for storing DP incident data
-- ===========================

-- Create dp_incidents table
CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  vessel TEXT,
  location TEXT,
  root_cause TEXT,
  class_dp TEXT,
  source TEXT,
  link TEXT,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON public.dp_incidents
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow insert for authenticated users (for future data ingestion)
CREATE POLICY "Allow insert for authenticated users"
ON public.dp_incidents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_date ON public.dp_incidents(date DESC);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_class ON public.dp_incidents(class_dp);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_tags ON public.dp_incidents USING GIN(tags);

-- Insert sample data based on IMCA Safety Flashes
INSERT INTO public.dp_incidents (id, title, date, vessel, location, root_cause, class_dp, source, link, summary, tags) VALUES
('imca-2025-001', 'Drive Off During Drilling Operations', '2025-01-15', 'OSV Atlantic Explorer', 'North Sea', 'Loss of position reference due to DGPS failure', 'DP-2', 'IMCA M190', 'https://www.imca-int.com/safety-flash-2025-001', 'Vessel experienced drive off during drilling operations due to simultaneous failure of primary and secondary position reference systems. Immediate emergency disconnect protocol was activated.', ARRAY['drive-off', 'position-reference', 'dgps', 'drilling']),
('imca-2025-002', 'Thruster Blackout Event', '2025-02-03', 'DP Vessel Northern Star', 'Gulf of Mexico', 'PMS system fault causing loss of thrust allocation', 'DP-3', 'IMCA M103', 'https://www.imca-int.com/safety-flash-2025-002', 'Complete thruster system blackout during ROV operations. Root cause identified as software bug in thrust allocation algorithm affecting redundancy management.', ARRAY['thruster-failure', 'blackout', 'pms', 'software']),
('imca-2025-003', 'DP Trials Failure - Redundancy Test', '2025-02-20', 'Platform Supply Vessel Pacific Dawn', 'Singapore', 'Inadequate testing of backup power system', 'DP-2', 'IMCA M117', 'https://www.imca-int.com/safety-flash-2025-003', 'Annual DP trials revealed that backup generator failed to engage during simulated power loss scenario. Investigation showed maintenance gap in backup systems.', ARRAY['dp-trials', 'redundancy', 'power-system', 'testing']),
('imca-2025-004', 'Human Error - Manual Control Override', '2025-03-10', 'Construction Vessel South Atlantic', 'Brazil Basin', 'Operator override without proper procedure', 'DP-2', 'IMCA M166', 'https://www.imca-int.com/safety-flash-2025-004', 'DPO manually disabled automatic position keeping to adjust vessel position. Lack of communication with bridge resulted in position excursion beyond operating limits.', ARRAY['human-error', 'manual-override', 'communication', 'procedures']),
('imca-2025-005', 'Environmental Sensor Failure', '2025-03-25', 'Dive Support Vessel Mediterranean Queen', 'Mediterranean Sea', 'Wind sensor malfunction providing incorrect data', 'DP-3', 'PEO-DP Section 4', 'https://www.imca-int.com/safety-flash-2025-005', 'DP system received erroneous wind speed and direction data leading to incorrect thrust compensation. Vessel maintained position but consumed excessive power.', ARRAY['sensor-failure', 'environmental', 'wind-sensor', 'efficiency']),
('imca-2025-006', 'Loss of Position Reference - Multiple Systems', '2025-04-12', 'Heavy Lift Vessel Arctic Titan', 'Norwegian Sea', 'Severe weather affecting DGPS and Artemis systems', 'DP-2', 'IMO MSC.1/Circ.1580', 'https://www.imca-int.com/safety-flash-2025-006', 'During 48-knot wind conditions, vessel lost both DGPS and laser position references due to atmospheric interference. Vessel safely moved to fallback position using remaining references.', ARRAY['weather', 'position-reference', 'dgps', 'artemis']),
('imca-2025-007', 'Software Update Causing DP Malfunction', '2025-05-08', 'Cable Lay Vessel Atlantic Cable', 'Atlantic Ocean', 'Untested software patch introduced control lag', 'DP-3', 'IMCA M190', 'https://www.imca-int.com/safety-flash-2025-007', 'Routine DP software update resulted in 2-second control lag in position keeping. Update was rolled back and full system test protocol was revised.', ARRAY['software-update', 'testing', 'control-system', 'procedures']),
('imca-2025-008', 'Communication Loss Between DP and Bridge', '2025-06-15', 'Supply Vessel Western Horizon', 'West Africa', 'Network switch failure isolating DP console', 'DP-2', 'IMCA M103', 'https://www.imca-int.com/safety-flash-2025-008', 'DP operator console lost communication with main bridge systems due to network switch failure. Vessel maintained position using local DP controls but bridge had no visibility.', ARRAY['communication', 'network', 'redundancy', 'procedures']),
('imca-2025-009', 'Incorrect FMEA Analysis - Undiscovered Single Point Failure', '2025-07-01', 'Construction Vessel Indian Ocean Pioneer', 'Indian Ocean', 'Common mode failure not identified in FMEA', 'DP-3', 'PEO-DP Section 6', 'https://www.imca-int.com/safety-flash-2025-009', 'DP FMEA failed to identify common hydraulic power supply feeding multiple thruster systems. Loss of this component resulted in loss of redundancy.', ARRAY['fmea', 'single-point-failure', 'hydraulic', 'analysis']);

COMMENT ON TABLE public.dp_incidents IS 'DP incident database from IMCA safety flashes and industry sources for AI-powered analysis and learning';
