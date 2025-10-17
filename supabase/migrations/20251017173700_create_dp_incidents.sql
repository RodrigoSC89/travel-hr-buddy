-- Create dp_incidents table for tracking DP (Dynamic Positioning) incidents
CREATE TABLE IF NOT EXISTS dp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Alta', 'Média', 'Baixa')),
  title TEXT,
  description TEXT,
  root_cause TEXT,
  location TEXT,
  class_dp TEXT,
  status TEXT DEFAULT 'pending',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE dp_incidents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all incidents
CREATE POLICY "Allow authenticated users to read dp_incidents"
  ON dp_incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert incidents
CREATE POLICY "Allow authenticated users to insert dp_incidents"
  ON dp_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update incidents
CREATE POLICY "Allow authenticated users to update dp_incidents"
  ON dp_incidents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_vessel ON dp_incidents(vessel);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_incident_date ON dp_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_severity ON dp_incidents(severity);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dp_incidents_updated_at
  BEFORE UPDATE ON dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_dp_incidents_updated_at();

-- Insert sample data
INSERT INTO dp_incidents (vessel, incident_date, severity, title, description, root_cause, location, class_dp, status, tags)
VALUES
  ('DP Shuttle Tanker X', '2025-09-12'::timestamp, 'Alta', 'Loss of Position Due to Gyro Drift', 'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops.', 'Sensor drift not compensated', 'Campos Basin', 'DP Class 2', 'pending', ARRAY['gyro', 'drive off', 'sensor', 'position loss']),
  ('DP DSV Subsea Alpha', '2025-08-05'::timestamp, 'Alta', 'Thruster Control Software Failure During ROV Ops', 'During critical ROV launch, the vessel experienced a momentary loss of thruster control.', 'Unexpected software reboot', 'North Sea', 'DP Class 3', 'analyzed', ARRAY['thruster', 'software', 'rov', 'reboot']),
  ('DP Drillship Beta', '2025-07-18'::timestamp, 'Alta', 'Reference System Failure in Heavy Weather', 'During heavy weather operations, the vessel lost multiple DGPS references simultaneously.', 'Multiple DGPS reference loss', 'Gulf of Mexico', 'DP Class 3', 'pending', ARRAY['dgps', 'reference system', 'weather', 'acoustic']),
  ('DP Construction Vessel Gamma', '2024-12-03'::timestamp, 'Média', 'Power Management System Malfunction', 'The Power Management System experienced a configuration error that resulted in unnecessary load shedding.', 'PMS configuration error', 'Santos Basin', 'DP Class 2', 'analyzed', ARRAY['pms', 'power', 'load shedding', 'configuration']),
  ('DP Platform Supply Delta', '2025-10-01'::timestamp, 'Baixa', 'Minor Thruster Performance Degradation', 'Routine monitoring detected reduced efficiency in one bow thruster.', 'Wear and tear on thruster blades', 'Santos Basin', 'DP Class 1', 'pending', ARRAY['thruster', 'maintenance', 'performance']),
  ('DP Shuttle Tanker X', '2025-06-15'::timestamp, 'Média', 'Wind Sensor Calibration Error', 'Wind sensor providing incorrect readings affecting DP calculations.', 'Sensor calibration drift', 'Campos Basin', 'DP Class 2', 'analyzed', ARRAY['sensor', 'wind', 'calibration']);
