-- Migration: Create maintenance_logs table
-- Description: Stores AI-powered predictive maintenance logs and alerts
-- Compliance: IMCA M109, M140, M254, ISM Code, NORMAM 101
-- Version: 1.0.0 (Patch 21)

-- Create maintenance_logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL CHECK (level IN ('Normal', 'Atenção', 'Crítico', 'Erro', 'Carregando')),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_timestamp ON maintenance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_level ON maintenance_logs(level);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read maintenance logs
CREATE POLICY "Allow authenticated users to read maintenance logs"
  ON maintenance_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to insert maintenance logs
CREATE POLICY "Allow authenticated users to insert maintenance logs"
  ON maintenance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE maintenance_logs IS 'AI-powered predictive maintenance logs for Nautilus One - compliant with IMCA M109, M140, M254, ISM Code, and NORMAM 101';
