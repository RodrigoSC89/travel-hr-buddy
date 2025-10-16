-- Create forecast_history table for storing AI-generated job forecasts
-- This table enables tracking of forecast history in the BI dashboard

CREATE TABLE IF NOT EXISTS forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  forecast TEXT,
  source TEXT DEFAULT 'AI',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trend_data JSONB
);

-- Add index for faster queries ordered by created_at
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_at ON forecast_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read forecasts
CREATE POLICY "Allow authenticated users to read forecasts"
  ON forecast_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert forecasts
CREATE POLICY "Allow authenticated users to insert forecasts"
  ON forecast_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE forecast_history IS 'Stores historical AI-generated job forecasts for BI dashboard tracking';
