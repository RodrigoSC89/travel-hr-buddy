-- PATCH 630: External Weather Data Integration
-- Store weather data from external APIs (OpenWeather, etc.)

CREATE TABLE IF NOT EXISTS external_weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lon DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  temperature DECIMAL(5, 2),
  temperature_unit TEXT DEFAULT 'C',
  humidity INTEGER,
  pressure INTEGER,
  wind_speed DECIMAL(5, 2),
  wind_direction INTEGER,
  weather_condition TEXT,
  weather_description TEXT,
  visibility INTEGER,
  cloud_coverage INTEGER,
  precipitation DECIMAL(5, 2),
  api_source TEXT DEFAULT 'openweather',
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_weather_location ON external_weather_data(location_lat, location_lon);
CREATE INDEX IF NOT EXISTS idx_weather_fetched_at ON external_weather_data(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_location_name ON external_weather_data(location_name);

-- Enable RLS
ALTER TABLE external_weather_data ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read weather data
CREATE POLICY "Users can read weather data"
  ON external_weather_data FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for service role to insert weather data
CREATE POLICY "Service can insert weather data"
  ON external_weather_data FOR INSERT
  WITH CHECK (true);

-- Function to clean old weather data (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_weather_data()
RETURNS void AS $$
BEGIN
  DELETE FROM external_weather_data
  WHERE fetched_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE external_weather_data IS 'PATCH 630: External weather API data storage for maritime operations';
