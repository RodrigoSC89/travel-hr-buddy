-- Create forecast_history table
CREATE TABLE IF NOT EXISTS forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forecast_history_source ON forecast_history(source);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_by ON forecast_history(created_by);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_at ON forecast_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read forecast history
CREATE POLICY "Allow authenticated users to read forecast history"
  ON forecast_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert forecast history
CREATE POLICY "Allow authenticated users to insert forecast history"
  ON forecast_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
