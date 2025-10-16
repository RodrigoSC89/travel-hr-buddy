-- Create forecast_history table for storing forecast data
CREATE TABLE IF NOT EXISTS public.forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forecast_history_source ON public.forecast_history(source);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_by ON public.forecast_history(created_by);
CREATE INDEX IF NOT EXISTS idx_forecast_history_created_at ON public.forecast_history(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.forecast_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all forecasts
CREATE POLICY "Allow authenticated users to read forecast_history"
  ON public.forecast_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert forecasts
CREATE POLICY "Allow authenticated users to insert forecast_history"
  ON public.forecast_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
