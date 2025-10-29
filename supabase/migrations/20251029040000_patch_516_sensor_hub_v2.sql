-- PATCH 516: Sensor Hub Avançado v2
-- Sensor readings and configuration tables for advanced sensor monitoring

-- Sensor configuration table
CREATE TABLE IF NOT EXISTS sensor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT UNIQUE NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('oceanic', 'structural', 'ai', 'navigation')),
  unit TEXT NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  anomaly_threshold NUMERIC,
  alert_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sensor readings table with partitioning for performance
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensor_config(sensor_id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_status ON sensor_readings(status);
CREATE INDEX IF NOT EXISTS idx_sensor_config_type ON sensor_config(sensor_type);

-- Sensor alerts table
CREATE TABLE IF NOT EXISTS sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL REFERENCES sensor_config(sensor_id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold', 'anomaly', 'offline', 'quality')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  value NUMERIC,
  threshold NUMERIC,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor_id ON sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_severity ON sensor_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_resolved ON sensor_alerts(resolved);

-- Insert sample sensor configurations
INSERT INTO sensor_config (sensor_id, sensor_name, sensor_type, unit, min_value, max_value, anomaly_threshold) VALUES
  ('ocean_temp_01', 'Ocean Temperature Sensor 1', 'oceanic', '°C', -5, 40, 30),
  ('ocean_depth_01', 'Depth Sensor 1', 'oceanic', 'm', 0, 1000, 800),
  ('struct_vib_01', 'Structural Vibration Sensor 1', 'structural', 'Hz', 0, 100, 75),
  ('ai_proc_01', 'AI Processing Load', 'ai', '%', 0, 100, 85),
  ('nav_gps_01', 'GPS Navigation Accuracy', 'navigation', 'm', 0, 50, 10)
ON CONFLICT (sensor_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE sensor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sensor_config
CREATE POLICY "Allow public read access to sensor_config" ON sensor_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage sensor_config" ON sensor_config FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for sensor_readings
CREATE POLICY "Allow public read access to sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert sensor_readings" ON sensor_readings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for sensor_alerts
CREATE POLICY "Allow public read access to sensor_alerts" ON sensor_alerts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage sensor_alerts" ON sensor_alerts FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sensor_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensor_config_updated_at
  BEFORE UPDATE ON sensor_config
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();
