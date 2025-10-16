-- Create ai_jobs_forecasts table for storing AI-generated job forecasts
CREATE TABLE IF NOT EXISTS ai_jobs_forecasts (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT,
  forecast TEXT,
  source TEXT DEFAULT 'AI',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trend_data JSONB
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_jobs_forecasts_created_at ON ai_jobs_forecasts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_jobs_forecasts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read forecasts
CREATE POLICY "Allow authenticated users to read forecasts"
  ON ai_jobs_forecasts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert forecasts
CREATE POLICY "Allow authenticated users to insert forecasts"
  ON ai_jobs_forecasts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
