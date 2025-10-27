-- PATCH 320: Weather Dashboard v1
-- Objective: Complete weather dashboard with real API data and maritime-specific features

-- ============================================
-- Weather Logs Table (Historical Weather Data)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  location jsonb NOT NULL, -- {lat, lng}
  
  -- Weather Conditions
  temperature numeric, -- Celsius
  feels_like numeric,
  temp_min numeric,
  temp_max numeric,
  pressure numeric, -- hPa
  humidity numeric, -- Percentage
  visibility numeric, -- Meters
  
  -- Wind
  wind_speed numeric, -- m/s
  wind_direction numeric, -- Degrees
  wind_gust numeric, -- m/s
  
  -- Clouds and Precipitation
  clouds_percentage numeric,
  rain_1h numeric,
  rain_3h numeric,
  snow_1h numeric,
  snow_3h numeric,
  
  -- Sea State (Maritime specific)
  wave_height numeric, -- Meters
  wave_direction numeric, -- Degrees
  wave_period numeric, -- Seconds
  sea_state text CHECK (sea_state IN ('calm', 'slight', 'moderate', 'rough', 'very_rough', 'high', 'very_high', 'phenomenal')),
  swell_height numeric,
  swell_direction numeric,
  swell_period numeric,
  
  -- Weather Description
  weather_main text, -- Main weather condition
  weather_description text, -- Detailed description
  weather_icon text, -- Weather icon code
  
  -- Timestamps
  observation_time timestamptz NOT NULL,
  sunrise timestamptz,
  sunset timestamptz,
  
  -- Data Source
  data_source text DEFAULT 'openweather' CHECK (data_source IN ('openweather', 'noaa', 'manual', 'buoy', 'other')),
  api_response jsonb, -- Full API response for reference
  
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- Weather Predictions Table (Forecasts)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  location_name text NOT NULL,
  location jsonb NOT NULL, -- {lat, lng}
  
  -- Forecast Details
  forecast_time timestamptz NOT NULL,
  forecast_range text CHECK (forecast_range IN ('short', 'medium', 'long')), -- short: 1-3 days, medium: 4-7 days, long: 8+ days
  
  -- Weather Conditions (same structure as logs)
  temperature numeric,
  feels_like numeric,
  temp_min numeric,
  temp_max numeric,
  pressure numeric,
  humidity numeric,
  visibility numeric,
  
  -- Wind
  wind_speed numeric,
  wind_direction numeric,
  wind_gust numeric,
  
  -- Clouds and Precipitation
  clouds_percentage numeric,
  rain_probability numeric, -- Percentage
  rain_volume numeric, -- mm
  snow_probability numeric,
  snow_volume numeric,
  
  -- Sea State Prediction
  wave_height numeric,
  wave_direction numeric,
  sea_state text,
  
  -- Weather Description
  weather_main text,
  weather_description text,
  weather_icon text,
  
  -- Confidence
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Data Source
  data_source text DEFAULT 'openweather',
  api_response jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- Weather Events Table (Critical Conditions)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Details
  event_type text NOT NULL CHECK (event_type IN (
    'storm', 'tropical_storm', 'hurricane', 'typhoon', 
    'high_winds', 'high_waves', 'fog', 'ice', 
    'lightning', 'tornado', 'waterspout', 'squall', 'other'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'severe', 'extreme')),
  
  title text NOT NULL,
  description text NOT NULL,
  
  -- Location
  affected_area jsonb NOT NULL, -- Array of coordinates or polygon
  affected_vessels uuid[], -- Array of vessel IDs
  
  -- Timing
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_hours numeric,
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('watch', 'warning', 'active', 'expired', 'cancelled')),
  
  -- Actions
  recommended_actions text[],
  safety_instructions text,
  
  -- Notifications
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  
  -- Data Source
  data_source text DEFAULT 'openweather',
  external_id text, -- ID from external weather service
  api_response jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- Weather Stations Table (Reference Data)
-- ============================================
CREATE TABLE IF NOT EXISTS weather_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id text UNIQUE NOT NULL,
  station_name text NOT NULL,
  station_type text CHECK (station_type IN ('buoy', 'ship', 'land', 'satellite', 'other')),
  
  -- Location
  location jsonb NOT NULL,
  location_name text,
  country text,
  
  -- Status
  is_active boolean DEFAULT true,
  last_report_time timestamptz,
  
  -- Capabilities
  measures_temperature boolean DEFAULT true,
  measures_wind boolean DEFAULT true,
  measures_waves boolean DEFAULT false,
  measures_pressure boolean DEFAULT true,
  measures_precipitation boolean DEFAULT true,
  
  -- Metadata
  operator text,
  installation_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- Indexes
-- ============================================

-- Weather Logs indexes
CREATE INDEX IF NOT EXISTS idx_weather_logs_vessel ON weather_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_weather_logs_location ON weather_logs USING gin(location);
CREATE INDEX IF NOT EXISTS idx_weather_logs_observation_time ON weather_logs(observation_time DESC);
CREATE INDEX IF NOT EXISTS idx_weather_logs_created_at ON weather_logs(created_at DESC);

-- Weather Predictions indexes
CREATE INDEX IF NOT EXISTS idx_weather_predictions_vessel ON weather_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_weather_predictions_location ON weather_predictions USING gin(location);
CREATE INDEX IF NOT EXISTS idx_weather_predictions_forecast_time ON weather_predictions(forecast_time);
CREATE INDEX IF NOT EXISTS idx_weather_predictions_range ON weather_predictions(forecast_range);

-- Weather Events indexes
CREATE INDEX IF NOT EXISTS idx_weather_events_type ON weather_events(event_type);
CREATE INDEX IF NOT EXISTS idx_weather_events_severity ON weather_events(severity);
CREATE INDEX IF NOT EXISTS idx_weather_events_status ON weather_events(status);
CREATE INDEX IF NOT EXISTS idx_weather_events_start_time ON weather_events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_weather_events_vessels ON weather_events USING gin(affected_vessels);

-- Weather Stations indexes
CREATE INDEX IF NOT EXISTS idx_weather_stations_type ON weather_stations(station_type);
CREATE INDEX IF NOT EXISTS idx_weather_stations_active ON weather_stations(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_stations_location ON weather_stations USING gin(location);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE weather_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations ENABLE ROW LEVEL SECURITY;

-- Weather Logs policies
CREATE POLICY "Authenticated users can read weather_logs"
  ON weather_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert weather_logs"
  ON weather_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather_logs"
  ON weather_logs FOR UPDATE TO authenticated USING (true);

-- Weather Predictions policies
CREATE POLICY "Authenticated users can read weather_predictions"
  ON weather_predictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert weather_predictions"
  ON weather_predictions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather_predictions"
  ON weather_predictions FOR UPDATE TO authenticated USING (true);

-- Weather Events policies
CREATE POLICY "Authenticated users can read weather_events"
  ON weather_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert weather_events"
  ON weather_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather_events"
  ON weather_events FOR UPDATE TO authenticated USING (true);

-- Weather Stations policies
CREATE POLICY "Authenticated users can read weather_stations"
  ON weather_stations FOR SELECT TO authenticated USING (true);

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER update_weather_predictions_timestamp
  BEFORE UPDATE ON weather_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_events_timestamp
  BEFORE UPDATE ON weather_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_stations_timestamp
  BEFORE UPDATE ON weather_stations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Functions
-- ============================================

-- Function to get current weather for location
CREATE OR REPLACE FUNCTION get_current_weather(
  p_lat numeric,
  p_lng numeric,
  p_vessel_id uuid DEFAULT NULL
)
RETURNS TABLE (
  temperature numeric,
  weather_description text,
  wind_speed numeric,
  humidity numeric,
  sea_state text,
  observation_time timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.temperature,
    wl.weather_description,
    wl.wind_speed,
    wl.humidity,
    wl.sea_state,
    wl.observation_time
  FROM weather_logs wl
  WHERE (p_vessel_id IS NULL OR wl.vessel_id = p_vessel_id)
    AND wl.observation_time >= now() - interval '1 hour'
  ORDER BY wl.observation_time DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get weather forecast
CREATE OR REPLACE FUNCTION get_weather_forecast(
  p_lat numeric,
  p_lng numeric,
  p_days integer DEFAULT 7
)
RETURNS TABLE (
  forecast_time timestamptz,
  temperature numeric,
  weather_description text,
  wind_speed numeric,
  rain_probability numeric,
  sea_state text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.forecast_time,
    wp.temperature,
    wp.weather_description,
    wp.wind_speed,
    wp.rain_probability,
    wp.sea_state
  FROM weather_predictions wp
  WHERE wp.forecast_time BETWEEN now() AND now() + (p_days || ' days')::interval
  ORDER BY wp.forecast_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get active weather events
CREATE OR REPLACE FUNCTION get_active_weather_events(
  p_severity text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  event_type text,
  severity text,
  title text,
  description text,
  start_time timestamptz,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    we.id,
    we.event_type,
    we.severity,
    we.title,
    we.description,
    we.start_time,
    we.status
  FROM weather_events we
  WHERE we.status IN ('watch', 'warning', 'active')
    AND (p_severity IS NULL OR we.severity = p_severity)
    AND (we.end_time IS NULL OR we.end_time > now())
  ORDER BY we.severity DESC, we.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check critical weather conditions
CREATE OR REPLACE FUNCTION check_critical_weather_conditions()
RETURNS TABLE (
  vessel_id uuid,
  vessel_name text,
  location_name text,
  condition_type text,
  severity text,
  details text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vessel_id,
    v.name as vessel_name,
    wl.location_name,
    CASE 
      WHEN wl.wind_speed > 20 THEN 'high_wind'
      WHEN wl.wave_height > 4 THEN 'high_waves'
      WHEN wl.visibility < 1000 THEN 'low_visibility'
      ELSE 'other'
    END as condition_type,
    CASE 
      WHEN wl.wind_speed > 25 OR wl.wave_height > 6 THEN 'severe'
      WHEN wl.wind_speed > 20 OR wl.wave_height > 4 THEN 'high'
      ELSE 'moderate'
    END as severity,
    format('Wind: %s m/s, Waves: %s m, Visibility: %s m', 
      wl.wind_speed, wl.wave_height, wl.visibility) as details
  FROM vessels v
  INNER JOIN weather_logs wl ON v.id = wl.vessel_id
  WHERE wl.observation_time >= now() - interval '1 hour'
    AND (wl.wind_speed > 15 OR wl.wave_height > 3 OR wl.visibility < 2000)
  ORDER BY severity DESC, wl.wind_speed DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for latest weather conditions
CREATE OR REPLACE VIEW latest_weather_conditions AS
SELECT DISTINCT ON (vessel_id)
  vessel_id,
  location_name,
  temperature,
  weather_description,
  wind_speed,
  wind_direction,
  wave_height,
  sea_state,
  observation_time
FROM weather_logs
ORDER BY vessel_id, observation_time DESC;

-- View for critical weather events
CREATE OR REPLACE VIEW critical_weather_events AS
SELECT 
  id,
  event_type,
  severity,
  title,
  description,
  start_time,
  end_time,
  status,
  acknowledged
FROM weather_events
WHERE severity IN ('high', 'severe', 'extreme')
  AND status IN ('watch', 'warning', 'active')
  AND (end_time IS NULL OR end_time > now())
ORDER BY severity DESC, start_time DESC;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE weather_logs IS 'Historical weather observation data';
COMMENT ON TABLE weather_predictions IS 'Weather forecasts and predictions';
COMMENT ON TABLE weather_events IS 'Critical weather events and alerts';
COMMENT ON TABLE weather_stations IS 'Reference data for weather monitoring stations';
