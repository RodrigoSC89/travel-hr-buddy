-- Create maintenance_logs table for AI Maintenance Orchestrator
-- Stores predictive maintenance analysis results with audit trail
-- Aligned with IMCA M109, M140, M254, ISM Code, and NORMAM 101

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL CHECK (level IN ('Normal', 'Atenção', 'Crítico')),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_timestamp ON maintenance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_level ON maintenance_logs(level);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
CREATE POLICY "Authenticated users can read maintenance logs"
  ON maintenance_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert maintenance logs"
  ON maintenance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE maintenance_logs IS 'AI-powered predictive maintenance analysis logs for Nautilus One';
