-- PATCH 441: Sensor Hub Enhancement
-- Create sensor_data_normalized table for storing normalized sensor readings

CREATE TABLE IF NOT EXISTS sensor_data_normalized (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'vibration', 'depth', 'pressure', 'motion', 'climate', 'water_quality')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  normalized_value NUMERIC, -- Value normalized to 0-100 scale
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location JSONB, -- {latitude, longitude}
  is_anomaly BOOLEAN DEFAULT FALSE,
  anomaly_score NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id ON sensor_data_normalized(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data_normalized(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_anomaly ON sensor_data_normalized(is_anomaly) WHERE is_anomaly = TRUE;
CREATE INDEX IF NOT EXISTS idx_sensor_data_type ON sensor_data_normalized(sensor_type);

-- Create sensor_alerts table for anomaly alerts
CREATE TABLE IF NOT EXISTS sensor_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('anomaly', 'threshold_exceeded', 'offline', 'calibration_needed')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  value NUMERIC,
  threshold NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor_id ON sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_timestamp ON sensor_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_unresolved ON sensor_alerts(resolved) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_severity ON sensor_alerts(severity);

-- Enable RLS
ALTER TABLE sensor_data_normalized ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies - Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read sensor data"
  ON sensor_data_normalized FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sensor data"
  ON sensor_data_normalized FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read alerts"
  ON sensor_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert alerts"
  ON sensor_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update alerts"
  ON sensor_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to normalize sensor values
CREATE OR REPLACE FUNCTION normalize_sensor_value(
  sensor_type TEXT,
  value NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  -- Normalize based on typical ranges for each sensor type
  CASE sensor_type
    WHEN 'temperature' THEN
      -- Assume range -50°C to 150°C
      RETURN GREATEST(0, LEAST(100, ((value + 50) / 200) * 100));
    WHEN 'vibration' THEN
      -- Assume range 0-50 Hz
      RETURN GREATEST(0, LEAST(100, (value / 50) * 100));
    WHEN 'depth' THEN
      -- Assume range 0-500m
      RETURN GREATEST(0, LEAST(100, (value / 500) * 100));
    WHEN 'pressure' THEN
      -- Assume range 0-350 bar
      RETURN GREATEST(0, LEAST(100, (value / 350) * 100));
    ELSE
      -- Default: assume 0-100 range
      RETURN GREATEST(0, LEAST(100, value));
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-normalize values on insert
CREATE OR REPLACE FUNCTION auto_normalize_sensor_data()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_value := normalize_sensor_value(NEW.sensor_type, NEW.value);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_normalize_sensor_data
  BEFORE INSERT ON sensor_data_normalized
  FOR EACH ROW
  EXECUTE FUNCTION auto_normalize_sensor_data();

-- Function to detect anomalies
CREATE OR REPLACE FUNCTION detect_sensor_anomaly(
  p_sensor_id TEXT,
  p_value NUMERIC,
  p_threshold NUMERIC DEFAULT 80
) RETURNS BOOLEAN AS $$
DECLARE
  avg_value NUMERIC;
  std_dev NUMERIC;
  z_score NUMERIC;
BEGIN
  -- Calculate statistics from last 100 readings
  SELECT AVG(value), STDDEV(value)
  INTO avg_value, std_dev
  FROM (
    SELECT value
    FROM sensor_data_normalized
    WHERE sensor_id = p_sensor_id
      AND timestamp > NOW() - INTERVAL '1 hour'
    ORDER BY timestamp DESC
    LIMIT 100
  ) recent_data;
  
  -- If not enough data, return false
  IF avg_value IS NULL OR std_dev IS NULL OR std_dev = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate z-score
  z_score := ABS((p_value - avg_value) / std_dev);
  
  -- Return true if z-score indicates anomaly (>3 standard deviations)
  RETURN z_score > 3;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE sensor_data_normalized IS 'PATCH 441 - Normalized sensor readings with anomaly detection';
COMMENT ON TABLE sensor_alerts IS 'PATCH 441 - Sensor anomaly alerts and notifications';
