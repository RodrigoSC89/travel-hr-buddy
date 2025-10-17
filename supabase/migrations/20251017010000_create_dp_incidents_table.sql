-- Create dp_incidents table for Dynamic Positioning incident tracking
-- This table stores DP incidents from IMCA reports and other sources with AI analysis

CREATE TABLE IF NOT EXISTS dp_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  source text, -- example: "IMCA M220", "Operação Real"
  incident_date date,
  severity text, -- ex: "Alta", "Média", "Baixa"
  vessel text,
  gpt_analysis jsonb, -- Store AI response
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add index for faster querying by date
CREATE INDEX IF NOT EXISTS idx_dp_incidents_incident_date ON dp_incidents(incident_date DESC);

-- Add index for severity filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_severity ON dp_incidents(severity);

-- Add index for vessel filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_vessel ON dp_incidents(vessel);

-- Enable Row Level Security (RLS)
ALTER TABLE dp_incidents ENABLE ROW LEVEL Security;

-- Create policy to allow authenticated users to read incidents
CREATE POLICY "Allow authenticated users to read dp_incidents"
  ON dp_incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert incidents
CREATE POLICY "Allow authenticated users to insert dp_incidents"
  ON dp_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update incidents
CREATE POLICY "Allow authenticated users to update dp_incidents"
  ON dp_incidents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER trigger_update_dp_incidents_updated_at
  BEFORE UPDATE ON dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_dp_incidents_updated_at();

-- Add comment to the table
COMMENT ON TABLE dp_incidents IS 'Stores Dynamic Positioning incidents with AI-powered analysis from IMCA reports and operational data';
