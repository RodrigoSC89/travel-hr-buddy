-- Create forecast_history table for storing AI-generated forecast predictions
CREATE TABLE IF NOT EXISTS public.forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster filtering
CREATE INDEX idx_forecast_history_source ON public.forecast_history(source);
CREATE INDEX idx_forecast_history_created_by ON public.forecast_history(created_by);
CREATE INDEX idx_forecast_history_created_at ON public.forecast_history(created_at DESC);

-- Add comment to the table
COMMENT ON TABLE public.forecast_history IS 'Stores historical AI-generated forecast predictions with metadata';
COMMENT ON COLUMN public.forecast_history.forecast_summary IS 'The AI-generated forecast text';
COMMENT ON COLUMN public.forecast_history.source IS 'Source of the forecast data (e.g., jobs-trend, manual)';
COMMENT ON COLUMN public.forecast_history.created_by IS 'User or system that created the forecast';
COMMENT ON COLUMN public.forecast_history.created_at IS 'Timestamp when the forecast was created';

-- Enable Row Level Security
ALTER TABLE public.forecast_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all forecasts
CREATE POLICY "Anyone can read forecast_history"
  ON public.forecast_history
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to insert forecasts
CREATE POLICY "Authenticated users can insert forecast_history"
  ON public.forecast_history
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
