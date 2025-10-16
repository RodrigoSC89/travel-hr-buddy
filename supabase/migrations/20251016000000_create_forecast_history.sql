-- Create forecast_history table for storing AI-generated forecast predictions
CREATE TABLE IF NOT EXISTS forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast filtering on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_forecast_history_source ON forecast_history(source);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_by ON forecast_history(created_by);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_at ON forecast_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to forecast history
CREATE POLICY "Allow public read access to forecast history"
  ON forecast_history
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert forecast history
CREATE POLICY "Allow authenticated users to insert forecast history"
  ON forecast_history
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
