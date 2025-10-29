-- PATCH 483: Ativar satellite/ – Rastreamento Real
-- Enable real satellite tracking with external API integration

-- Create or update satellite_positions table
CREATE TABLE IF NOT EXISTS public.satellite_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  satellite_name TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  altitude_km DECIMAL(10,2) NOT NULL,
  velocity_kmh DECIMAL(10,2),
  orbital_period_minutes DECIMAL(10,2),
  status TEXT CHECK (status IN ('active', 'inactive', 'deorbited', 'unknown')) DEFAULT 'active',
  coverage_area JSONB,
  tle_line1 TEXT,
  tle_line2 TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_satellite_positions_satellite_id ON public.satellite_positions(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_last_updated ON public.satellite_positions(last_updated);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_status ON public.satellite_positions(status);

-- Create table for satellite tracking history
CREATE TABLE IF NOT EXISTS public.satellite_tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  position_snapshot JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_satellite_tracking_history_satellite_id ON public.satellite_tracking_history(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_tracking_history_recorded_at ON public.satellite_tracking_history(recorded_at);

-- Create table for satellite API logs
CREATE TABLE IF NOT EXISTS public.satellite_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_endpoint TEXT NOT NULL,
  request_params JSONB,
  response_status INTEGER,
  satellites_fetched INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_satellite_api_logs_created_at ON public.satellite_api_logs(created_at);

-- Add comments
COMMENT ON TABLE public.satellite_positions IS 'PATCH 483: Real-time satellite position tracking with TLE data';
COMMENT ON TABLE public.satellite_tracking_history IS 'PATCH 483: Historical satellite position data';
COMMENT ON TABLE public.satellite_api_logs IS 'PATCH 483: API call logs for satellite data fetching';

-- Grant permissions
GRANT ALL ON public.satellite_positions TO authenticated;
GRANT ALL ON public.satellite_tracking_history TO authenticated;
GRANT ALL ON public.satellite_api_logs TO authenticated;

-- Function to clean old tracking history (keep last 30 days)
CREATE OR REPLACE FUNCTION clean_old_satellite_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.satellite_tracking_history 
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
